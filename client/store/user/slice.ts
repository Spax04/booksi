import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';
import {reducers} from './reducers';
import { IRootState } from './types';
import {STORE_SLICES, PERSIST_KEYS} from '../../utils/enums'


const initialState: IRootState = {
    user: {} as IRootState['user'],
};

export const slice = createSlice({
    name: STORE_SLICES.USER,
    initialState,
    reducers
});

const userActions = slice.actions;

const userPersistConfig = {
    key: PERSIST_KEYS.USER,
    storage: AsyncStorage,
    whitelist: ['user']
};

export {
    userActions
}

export default persistReducer(userPersistConfig, slice.reducer);