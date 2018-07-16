import { combineReducers } from 'redux';
import auth from './auth';
import teams from './teams';
import dashboard from './dashboard';
import items from './items';

const rootReducer = combineReducers({
  auth: auth,
  teams: teams,
  dashboard: dashboard,
  items: items,
});

export default rootReducer;
