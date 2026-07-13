import { IRootState } from "./types";

const reducers = {
    clearAll : (state: IRootState) =>{
        return{...state, authenticateUser: {} as IRootState['authenticateUser'], tokenDetails: {} as IRootState['tokenDetails']}
    },

    setAuthenticateUser: (state: IRootState, action: {payload: IRootState['authenticateUser']}) =>{
        return{...state, authenticateUser: action.payload}
    },
    setTokenDetails: (state: IRootState, action: {payload: IRootState['tokenDetails']}) =>{
        return{...state, tokenDetails: action.payload}
    }
}


export {
    reducers,
};