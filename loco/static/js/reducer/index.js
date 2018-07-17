import { combineReducers } from 'redux';
import auth from './auth';
import teams from './teams';
import dashboard from './dashboard';
import items from './items';
import merchants from './merchants';

const rootReducer = combineReducers({
  auth: auth,
  teams: teams,
  dashboard: dashboard,
  items: items,
  merchants: merchants,
});

export default rootReducer;
