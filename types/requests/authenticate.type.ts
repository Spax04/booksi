export type TLoginRequest = {
  email: string,
  password: string,
  isHashPassword?: boolean,
  isRedirect?: boolean
  isRegistered?: boolean
  redirectTo?: string
};

export type TRegisterRequest = {
  email: string,
  password: string,
};

export type TResetPass = {
  resetToken: string;
  password: string;
};
