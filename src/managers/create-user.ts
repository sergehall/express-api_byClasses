import uuid4 from "uuid4";
import add from "date-fns/add";

export class NewUserObj {
  constructor(
    private id: string,
    private login: string,
    private email: string,
    private passwordSalt: string,
    private passwordHash: string,
    private ip: string | null) {
  }

  create() {
    const currentTime = new Date().toISOString()
    const confirmationCode = uuid4().toString()
    const expirationDate = add(new Date(),
      {
        hours: 1,
        minutes: 5
      }).toISOString()

    return {
      accountData: {
        id: this.id,
        login: this.login,
        email: this.email,
        passwordSalt: this.passwordSalt,
        passwordHash: this.passwordSalt,
        createdAt: currentTime
      },
      emailConfirmation: {
        confirmationCode: confirmationCode,
        expirationDate: expirationDate,
        isConfirmed: false,
        sentEmail: [{sendTime: currentTime}]
      },
      registrationData: [{
        ip: this.ip,
        createdAt: currentTime
      }]
    }
  }
}