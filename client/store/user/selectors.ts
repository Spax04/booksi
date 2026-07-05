import { RootState } from "../index";

const getUser = (state: RootState) => state.userReducer.user;


export {
    getUser,
}