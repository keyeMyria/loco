import {parseSolrResponse} from './utils.js'

export const GET_ITEMS_START = 'dashboard/get_items_start';
export const GET_ITEMS_FAILURE = 'dashboard/get_items_failure';
export const GET_ITEMS_SUCCESS = 'dashboard/get_items_success';

export const SET_ITEM_DETAILS_START = 'dashboard/set_item_details_start';
export const SET_ITEM_DETAILS_FAILURE = 'dashboard/set_item_details_failure';
export const SET_ITEM_DETAILS_SUCCESS = 'dashboard/set_item_details_success';

export const CREATE_ITEM_START = 'dashboard/create_item_start';
export const CREATE_ITEM_FAILURE = 'dashboard/create_item_failure';
export const CREATE_ITEM_SUCCESS = 'dashboard/create_item_success';
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
        case SET_ITEM_DETAILS_START:
            return { ...state, inProgress: true, error: "", itemsData: []};
        case SET_ITEM_DETAILS_SUCCESS:
            var itemsData = JSON.parse(action.result);
            itemsData = parseSolrResponse(itemsData);
            return { ...state, inProgress: false, error: "", itemsData: itemsData};
        case SET_ITEM_DETAILS_FAILURE:
            return { ...state, inProgress: false, error: "Get Items Failed.", itemsData: []};
        case CREATE_ITEM_START:
            return { ...state, createItemItemProgress: true, createItemError: ""};
        case CREATE_ITEM_SUCCESS:
            var itemsData = JSON.parse(action.result);
            itemsData = parseSolrResponse(itemsData);
            return { ...state, createItemItemProgress: false, createItemError: ""};
        case CREATE_ITEM_FAILURE:
            return { ...state, createItemItemProgress: false, createItemError: "Create Item Failed."};
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

export function setItemDetails(itemId) {
    return {
        types: [SET_ITEM_DETAILS_START, SET_ITEM_DETAILS_SUCCESS, SET_ITEM_DETAILS_FAILURE],
        promise: (client) => client.local.put('/crm/items/' + itemId, 
        {
            data: {

            }
        })
    }
}

export function createItem(team_id, data) {
    return {
        types: [CREATE_ITEM_START, CREATE_ITEM_SUCCESS, CREATE_ITEM_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/items/', 
        {
            data: {
                name: data.name,
                price: data.price,
                serial_number: data.serial_number
            }
        })
    }
}

