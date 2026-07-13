import {TPersonnel} from '../common.type';
import { IBaseResponse } from './common.type';

export type TLoginRes = IBaseResponse & {
  msg: string,
  success: boolean
  data: {
    authToken: string
    personnel: TPersonnel,
    user: {
      name: string,
    }
  }
};