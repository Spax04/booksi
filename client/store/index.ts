import {configureStore} from '@reduxjs/toolkit'
import {persistStore} from 'redux-persist'

import documentReducer from './documents/slice'
import credentialReducer from './credentials/slice'
import userReducer from './user/slice'

const store = configureStore({
    reducer:{
        documentReducer,
        credentialReducer,
        userReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
})

const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export {
    store,
    persistor
}