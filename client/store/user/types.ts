export interface IRootState {
    user: IUser;
}

export interface IUser {
  email: string;
  name: string;
  id: number;
}
