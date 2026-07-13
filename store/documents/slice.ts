import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer} from 'redux-persist';
import {reducers} from './reducers';
import { IRootState,IDocumentObject } from './types';
import {STORE_SLICES, PERSIST_KEYS} from '../../lib/utils/enums'


const initialState: IRootState = {
    uploadedDocuments: [] as IRootState['uploadedDocuments'],
};

export const slice = createSlice({
    name: STORE_SLICES.DOCUMENTS,
    initialState,
    reducers
});

const documentsActions = slice.actions;

const documentsPersistConfig = {
    key: PERSIST_KEYS.DOCUMENTS,
    storage: AsyncStorage,
    whitelist: ['uploadedDocuments']
};

export {
    documentsActions
}

export default persistReducer(documentsPersistConfig, slice.reducer);