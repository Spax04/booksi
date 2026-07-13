import { RootState } from "../index";

const getAuthenticateUser = (state: RootState) => state.authReducer.authenticateUser;
const getTokenDetails = (state: RootState) => state.authReducer.tokenDetails;


export {
    getAuthenticateUser,
    getTokenDetails
}