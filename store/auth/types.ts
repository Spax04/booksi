export interface IRootState {
// Todo add types
  authenticateUser: {
    _id: string;
    external_id: string;
    authToken: string;
    personnel: TPersonnel & {
      external_id?: string;
    };
  };
  tokenDetails: {
    external_id: string;
    email: string;
    expiration: string;
  };
  navigateToDefaultPath: { isNavigate: boolean };
} 

export type TPersonnel = {
  _id: string;
  external_id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type TTokenDetails = {
  email: string;
  expiration: string;
  userName: string;
  subscription: {
    plan: string;
  };
};
