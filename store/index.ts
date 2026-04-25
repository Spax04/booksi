import {configureStore} from '@reduxjs/toolkit'
import {persistStore} from 'redux-persist'

import documentReducer from './documents/slice'
import credentialReducer from './credentials/slice'

const store = configureStore({
    reducer:{
        documentReducer,
        credentialReducer
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