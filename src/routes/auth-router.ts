import {Router, Request, Response} from "express";
import {ioc} from "../IoCContainer";
import requestIp from 'request-ip';
import {
  bodyCode,
  bodyEmail,
  bodyLogin,
  bodyLoginUsersAccount,
  bodyNewPassword,
  bodyPassword,
  bodyPasswordUsersAccount,
  inputValidatorMiddleware, recoveryCode
} from "../middlewares/input-validator-middleware";
import {PayloadType} from "../types/all_types";
import {MyModelDevicesSchema} from "../mongoose/DevicesSchemaModel";


export const authRouter = Router({})

authRouter.post('/login',
  bodyLoginUsersAccount,
  bodyPasswordUsersAccount,
  inputValidatorMiddleware,
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpLog,
  ioc.auth.checkCredentialsLoginPass,
  async (req: Request, res: Response) => {
    try {
      const clientIp = requestIp.getClientIp(req);
      const title = req.header('user-agent');
      const userId = (req.headers.userId) ? `${req.headers.userId}` : '';

      const accessToken = await ioc.jwtService.createUsersAccountJWT(userId)
      const refreshToken = await ioc.jwtService.createUsersAccountRefreshJWT(userId)
      const payload: PayloadType = ioc.jwtService.jwt_decode(refreshToken);

      await MyModelDevicesSchema.findOneAndUpdate(
        {title: title, ip: clientIp,},
        {
          userId: payload.userId,
          ip: clientIp,
          title: title,
          lastActiveDate: new Date(payload.iat * 1000).toISOString(),
          expirationDate: new Date(payload.exp * 1000).toISOString(),
          deviceId: payload.deviceId
        },
        {upsert: true})
      res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: true})
      return res.status(200).send({
        "accessToken": accessToken
      })

    } catch (e) {
      console.log(e)
      return res.status(500)
    }
  })

authRouter.post('/password-recovery',
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpRegEmailRes,
  bodyEmail, inputValidatorMiddleware,
  async (req: Request, res: Response) => {
    const email = req.body.email
    const user = await ioc.usersAccountService.findByEmail(email)
    if (!user) {
      const result = await ioc.usersAccountService.sentRecoveryCodeByEmailUserNotExist(email)
      console.log(`Resend password-recovery to email:  ${result?.email}`)
      return res.sendStatus(204)
    }
    const result = await ioc.usersAccountService.sentRecoveryCodeByEmailUserExist(user)
    console.log(`Resend password-recovery to email:  ${result?.accountData.email}`)
    return res.sendStatus(204)
  })

authRouter.post('/new-password',
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpNewPasswordReq,
  bodyNewPassword,
  recoveryCode,
  inputValidatorMiddleware,
  async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword
    const recoveryCode = req.body.recoveryCode

    const user = await ioc.usersAccountService.findByConfirmationCode(recoveryCode)
    if (!user) {
      return res.status(400).send(
        {
          errorsMessages: [{
            message: "incorrect recoveryCode",
            field: "recoveryCode"
          }]
        })
    }
    await ioc.usersAccountService.createNewPassword(newPassword, user)

    return res.sendStatus(204)

  })

authRouter.post('/refresh-token',
  ioc.jwtService.checkRefreshTokenInBlackListAndVerify,
  async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken
      const payload: PayloadType = ioc.jwtService.jwt_decode(refreshToken)
      const clientIp = requestIp.getClientIp(req);
      const title = req.header('user-agent');
      await ioc.blackListRefreshTokenJWTRepository.addRefreshTokenAndUserId(refreshToken)

      const newAccessToken = await ioc.jwtService.updateUsersAccountAccessJWT(payload)
      const newRefreshToken = await ioc.jwtService.updateUsersAccountRefreshJWT(payload)

      const newPayload: PayloadType = ioc.jwtService.jwt_decode(newRefreshToken)
      await MyModelDevicesSchema.findOneAndUpdate(
        {userId: payload.userId, deviceId: payload.deviceId},
        {
          $set: {
            userId: payload.userId,
            ip: clientIp,
            title: title,
            lastActiveDate: new Date(newPayload.iat * 1000).toISOString(),
            expirationDate: new Date(newPayload.exp * 1000).toISOString(),
            deviceId: payload.deviceId
          }
        },
        {upsert: true})

      res.cookie("refreshToken", newRefreshToken, {httpOnly: true, secure: true})
      res.status(200).send({accessToken: newAccessToken})
      return

    } catch (e) {
      console.log(e)
      return res.status(401).send({error: e})
    }

  })

authRouter.post('/registration-confirmation',
  ioc.auth.checkIpInBlackList,
  bodyCode, inputValidatorMiddleware,
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpRegConf,
  async (req: Request, res: Response) => {
    const clientIp = requestIp.getClientIp(req);
    const countItWithIsConnectedFalse = await ioc.usersAccountService.checkHowManyTimesUserLoginLastHourSentEmail(clientIp)
    if (countItWithIsConnectedFalse > 5) {
      res.status(429).send('More than 5 emails sent.')
      return
    }
    const result = await ioc.usersAccountService.confirmByCodeInParams(req.body.code)
    if (result === null) {
      res.status(400).send({
        "errorsMessages": [
          {
            message: "That code is not correct or account already confirmed",
            field: "code"
          }
        ]
      })
      return
    }
    res.sendStatus(204)
    return
  });

authRouter.post('/registration',
  ioc.auth.checkIpInBlackList,
  ioc.auth.checkoutContentType,
  bodyLogin, bodyPassword, bodyEmail, inputValidatorMiddleware,
  ioc.auth.checkUserAccountNotExists,
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpReg,
  async (req: Request, res: Response) => {
    const clientIp = requestIp.getClientIp(req);
    const countItWithIsConnectedFalse = await ioc.usersAccountService.checkHowManyTimesUserLoginLastHourSentEmail(clientIp)
    if (countItWithIsConnectedFalse > 5) {
      res.status(403).send('5 emails were sent to confirm the code.')
      return
    }
    const user = await ioc.usersAccountService.createUserRegistration(req.body.login, req.body.email, req.body.password, clientIp);
    if (user) {
      res.sendStatus(204);
      return
    }
    res.status(400).send({
      "errorsMessages": [
        {
          message: "Error with authRouter.post('/registration'......",
          field: "some"
        }
      ]
    });
    return
  });

authRouter.post('/registration-email-resending',
  bodyEmail, inputValidatorMiddleware,
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpRegEmailRes,
  async (req: Request, res: Response) => {
    const email: string = req.body.email
    const userResult = await ioc.usersAccountService.updateAndSentConfirmationCodeByEmail(email)
    if (userResult === null) {
      res.status(400).send({
        "errorsMessages": [
          {
            "message": "Check the entered email or isConfirmed already true.",
            "field": "email"
          }
        ]
      });
      return
    }
    console.log(`Resend code to email:  ${userResult?.accountData?.email}`);
    res.sendStatus(204)
    return
  });

authRouter.post('/logout',
  ioc.jwtService.checkRefreshTokenInBlackListAndVerify,
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    const payload: PayloadType = ioc.jwtService.jwt_decode(refreshToken);
    await ioc.blackListRefreshTokenJWTRepository.addRefreshTokenAndUserId(refreshToken)
    const result = await ioc.securityDevicesService.deleteDeviceByDeviceIdAfterLogout(payload)
    if (result === "204") {
      return res.sendStatus(204)
    }
    return res.send({result: result})
  })

authRouter.get("/me",
  ioc.auth.authentication,
  async (req: Request, res: Response) => {
    const user = req.user
    if (user) {
      return res.status(200).send({
        email: user.accountData.email,
        login: user.accountData.login,
        userId: user.accountData.id

      })
    }
    return res.sendStatus(401)
  })

// just for me

authRouter.get('/resend-registration-email',
  ioc.checkHowManyTimesUserLoginLast10sec.withSameIpRegEmailRes,
  async (req: Request, res: Response) => {
    const parseQueryData = await ioc.parseQuery.parse(req)
    const code = parseQueryData.code
    if (code === null) {
      res.status(400).send("Query param is empty")
      return
    }
    const user = await ioc.usersAccountService.findByConfirmationCode(code)
    if (user === null || !user.accountData.email) {
      res.status(400).send("Bad code or isConfirmed is true.")
      return
    }
    const result = await ioc.usersAccountService.updateAndSentConfirmationCodeByEmail(user.accountData.email)
    res.send(`Resend code to email:  ${result?.accountData?.email}`)
  })

authRouter.get('/confirm-registration',
  async (req: Request, res: Response) => {
    const parseQueryData = await ioc.parseQuery.parse(req)
    const code = parseQueryData.code
    if (code === null) {
      res.sendStatus(400)
      return
    }
    const result = await ioc.usersAccountService.confirmByCodeInParams(code)
    if (result && result.emailConfirmation.isConfirmed) {
      res.status(201).send("Email confirmed by query ?code=...");
      return
    } else {
      res.sendStatus(400)
      return
    }
  })

authRouter.post('/confirm-email',
  async (req: Request, res: Response) => {
    const result = await ioc.usersAccountService.confirmByEmail(req.body.confirmationCode, req.body.email)
    if (result !== null) {
      res.status(201).send("Email confirmed by email and confirmationCode.");
    } else {
      res.sendStatus(400)
    }
  })

authRouter.get('/confirm-code/:code',
  async (req: Request, res: Response) => {
    const result = await ioc.usersAccountService.confirmByCodeInParams(req.params.code)
    if (result && result.emailConfirmation.isConfirmed) {
      res.status(201).send("Email confirmed by params confirmationCode.");
    } else {
      res.sendStatus(400)
    }
  })

authRouter.delete('/logoutRottenCreatedAt',
  async (req: Request, res: Response) => {
    const result = await ioc.usersAccountService.deleteUserWithRottenCreatedAt()
    res.send(`Total, did not confirm registration user were deleted = ${result}`)
  })
