import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';
import {reducers} from './reducers';
import { IRootState } from './types';
import {STORE_SLICES, PERSIST_KEYS} from '../../lib/utils/enums'


const initialState: IRootState = {
    GEMINI_API_KEY: '',
};

export const slice = createSlice({
    name: STORE_SLICES.CREDENTIALS,
    initialState,
    reducers
});

const credentialsActions = slice.actions;

const credentialsPersistConfig = {
    key: PERSIST_KEYS.CREDENTIALS,
    storage: AsyncStorage,
    whitelist: ['GEMINI_API_KEY']
};

export {
    credentialsActions
}

export default persistReducer(credentialsPersistConfig, slice.reducer);