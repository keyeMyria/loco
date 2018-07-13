import {parseSolrResponse} from './utils.js'

export const GET_ITEMS_START = 'dashboard/get_items_start';
export const GET_ITEMS_FAILURE = 'dashboard/get_items_failure';
export const GET_ITEMS_SUCCESS = 'dashboard/get_items_success';
export const INIT_TEAM_ID = 'dashboard/init_team_id'

const INITIAL_STATE = {
    team_id: ""
};

export default function dashboard(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case GET_ITEMS_START:
            return { ...state, inProgress: true, error: "", itemsData: []};
        case GET_ITEMS_SUCCESS:
            var itemsData = JSON.parse(action.result);
            itemsData = parseSolrResponse(itemsData);
            return { ...state, inProgress: false, error: "", itemsData: itemsData};
        case GET_ITEMS_FAILURE:
            return { ...state, inProgress: false, error: "Get Items Failed.", itemsData: []};
        case INIT_TEAM_ID:
            state.team_id = action.team_id;
            return {...state, team_id: action.team_id}
        default:
            return state;
    }
}

export function getItems(team_id) {
	return {
		types: [GET_ITEMS_START, GET_ITEMS_SUCCESS, GET_ITEMS_FAILURE],
		promise: (client) => client.local.get('http://anuvad.io:8983/solr/item/select?q=*:*&fq=team_id:' + team_id)
	}
}

export function initTeamId(team_id) {
    return {
        type: INIT_TEAM_ID,
        team_id: team_id
    }
}
