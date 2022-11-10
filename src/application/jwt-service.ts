import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken'
import {ioc} from "../IoCContainer";
import uuid4 from "uuid4";
import {PayloadType} from "../types/types";
import jwt_decode from "jwt-decode";

const ck = require('ckey')

export class JWTService {

  async createUsersAccountJWT(userId: string) {
    const deviceId = uuid4().toString();
    return jwt.sign(
      {userId: userId, deviceId}, ck.ACCESS_SECRET_KEY,
      {expiresIn: 300}
    )
  }

  async createUsersAccountRefreshJWT(userId: string) {
    const deviceId = uuid4().toString();
    return jwt.sign(
      {userId: userId, deviceId}, ck.REFRESH_SECRET_KEY,
      {expiresIn: 600 }
    )
  } 

  async updateUsersAccountAccessJWT(payload: PayloadType) {
    return jwt.sign(
      {
        userId: payload.userId,
        deviceId: payload.deviceId
      }, ck.ACCESS_SECRET_KEY,
      {expiresIn: 300}
    )
  }

  async updateUsersAccountRefreshJWT(payload: PayloadType) {
    return jwt.sign(
      {
        userId: payload.userId,
        deviceId: payload.deviceId
      }, ck.REFRESH_SECRET_KEY,
      {expiresIn: 600})
  }

  async verifyRefreshJWT(token: string) {
    try {
      const result: any = jwt.verify(token, ck.REFRESH_SECRET_KEY)
      return result.userId
    } catch (e) {
      return null
    }
  }

  async verifyAccessJWT(token: string) {
    try {
      const result: any = jwt.verify(token, ck.ACCESS_SECRET_KEY)
      return result.userId
    } catch (err) {
      return null
    }
  }

  async checkRefreshTokenInBlackListAndVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken
      const tokenInBlackList = await ioc.blackListRefreshTokenJWTRepository.findByRefreshTokenAndUserId(refreshToken)
      const userId: string | null = await ioc.jwtService.verifyRefreshJWT(refreshToken);
      if (tokenInBlackList || !userId) {
        return res.sendStatus(401)
      }
      next()
      return
    } catch (e) {
      console.log(e, "RefreshToken expired or incorrect")
      return res.sendStatus(401)
    }
  }

  jwt_decode(token: string): PayloadType {
    return jwt_decode(token)
  }
}

