import { combineReducers } from 'redux';
import auth from './auth';
import teams from './teams';
import dashboard from './dashboard';

const rootReducer = combineReducers({
  auth: auth,
  teams: teams,
  dashboard: dashboard,
});

export default rootReducer;
