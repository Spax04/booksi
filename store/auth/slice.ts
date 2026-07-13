import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';
import {reducers} from './reducers';
import { IRootState } from './types';
import {STORE_SLICES, PERSIST_KEYS} from '../../lib/utils/enums'


const initialState: IRootState = {
    authenticateUser: {} as IRootState['authenticateUser'],
    tokenDetails: {} as IRootState['tokenDetails'],
    navigateToDefaultPath: {
        isNavigate: false
    }
};

export const slice = createSlice({
    name: STORE_SLICES.AUTH,
    initialState,
    reducers
});

const authActions = slice.actions;

const authPersistConfig = {
    key: PERSIST_KEYS.AUTH,
    storage: AsyncStorage,
    whitelist: ['authenticateUser', 'tokenDetails']
};

export {
    authActions
}

export default persistReducer(authPersistConfig, slice.reducer);