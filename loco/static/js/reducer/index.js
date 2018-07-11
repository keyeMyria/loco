import { combineReducers } from 'redux';
import auth from './auth';
import teams from './teams';

const rootReducer = combineReducers({
  auth: auth,
  teams: teams,
});

export default rootReducer;
