import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import authReducer from './reducers/authReducer';
import languageReducer from './reducers/languageReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  language: languageReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'language'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export default store;