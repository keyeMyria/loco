import { combineReducers } from 'redux';
import auth from './auth';
import dashboard from './dashboard';

const rootReducer = combineReducers({
  auth: auth,
  dashboard: dashboard,
});

export default rootReducer;
