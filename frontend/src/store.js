import { combineReducers, configureStore } from '@reduxjs/toolkit';
import visibilityReducer from './reducers/visibilityReducer';
import authReducer from './reducers/authReducer';

const rootReducer = combineReducers({
  visibility: visibilityReducer,
  auth: authReducer
});

const store = configureStore({
  reducer: rootReducer
});

export default store;
