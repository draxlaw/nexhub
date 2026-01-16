import { IUser } from '../../models/User.model';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

declare module 'express-mongo-sanitize' {
  function sanitize(options?: any): any;
  export default sanitize;
}
