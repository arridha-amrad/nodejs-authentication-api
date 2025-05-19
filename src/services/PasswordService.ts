import { hash, verify } from 'argon2';

export default class PasswordService {
  async hash(text: string) {
    return hash(text);
  }

  async verify(password: string, text: string) {
    return verify(password, text);
  }
}
