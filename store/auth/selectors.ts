import { RootState } from "../index";

const getUser = (state: RootState) => state.authReducer.authenticateUser;
const getTokenDetails = (state: RootState) => state.authReducer.tokenDetails;


export {
    getUser,
    getTokenDetails
}