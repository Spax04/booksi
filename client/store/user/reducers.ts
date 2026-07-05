import { IRootState } from "./types";

const reducers = {
    clearAll : (state: IRootState) =>{
        return{...state, user: {} as IRootState['user']}
    }
}


export {
    reducers,
};