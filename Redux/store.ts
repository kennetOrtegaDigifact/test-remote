import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import userReducer from './userReducer'

const persistUserConfig = {
  key: 'user',
  blacklist: ['navigation', 'ui', 'router'],
  storage: AsyncStorage
}

const userPersistedReducer = persistReducer(persistUserConfig, userReducer)

export const store = configureStore({
  reducer: {
    userDB: userPersistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    })
})

export type ReduxState = ReturnType<typeof store.getState>

export const persistor = persistStore(store)
