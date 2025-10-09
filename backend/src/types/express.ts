import { Request } from 'express';
import { IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
