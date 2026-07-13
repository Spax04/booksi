
export type TUpdateUserReq = {
  email: string,
  userData: {
    name: string,
  }
};

export type TSendFeedbackReq = {
  message: string;
  rating: number | string;
  email: string;
  userName: string;
};
