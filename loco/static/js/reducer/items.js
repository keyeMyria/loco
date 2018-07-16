import {debounce} from './utils.js'

export const GET_ITEMS_INIT = 'dashboard/get_items_init';
export const GET_ITEMS_START = 'dashboard/get_items_start';
export const GET_ITEMS_PREV_CACHED = 'dashboard/get_items_prev_cached';
export const GET_ITEMS_NEXT_CACHED = 'dashboard/get_items_next_cached';
export const GET_ITEMS_FAILURE = 'dashboard/get_items_failure';
export const GET_ITEMS_SUCCESS = 'dashboard/get_items_success';
export const CREATE_ITEM_START = 'dashboard/create_item_start';
export const CREATE_ITEM_FAILURE = 'dashboard/create_item_failure';
export const CREATE_ITEM_SUCCESS = 'dashboard/create_item_success';
export const UPDATE_QUERY = 'dashboard/update_query';

const INITIAL_STATE = {
    inProgress: true,
    start: -1,
    end: 0,
    limit: 10,
    totalCount: 0,
    currentCount: 0,
    hasMoreItems: true,
    data: [],
    getTime: '',
    error: '',
    query: '',
    csvURL: ''
};

export default function items(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case GET_ITEMS_INIT:
            return { ...state, start: -1, data:[], inProgress: true, csvURL: ''};
        case GET_ITEMS_START:
            return { ...state, inProgress: true, error: ""};
        case GET_ITEMS_SUCCESS:
            var result = JSON.parse(action.result);
            var start = state.start + state.limit;
            if (state.start == -1) {
                start = 0;
            }

            if (!result.data) {
                result.data = []
            }

            var newData = state.data.concat(result.data);
            var hasMoreItems = true
            if (result.data.length < state.limit) {
                hasMoreItems = false;
            }

            return { ...state, inProgress: false, error: "",
                    data: newData,
                    totalCount: result.count,
                    currentCount: newData.length,
                    start: start,
                    end: start + result.data.length,
                    hasMoreItems: hasMoreItems,
                    csvURL: result.csv
                };
        case GET_ITEMS_NEXT_CACHED:
            var start = state.start + state.limit;
            var end = start + state.limit;
            if (end > state.currentCount) {
                end = state.currentCount;
            }

            return {...state, start:start, end:end}
        case GET_ITEMS_PREV_CACHED:
            var end = state.start; 
            var start = state.start - state.limit;
            return {...state, start:start, end:end}
        case GET_ITEMS_FAILURE:
            return { ...state, inProgress: false, error: "Get Items Failed.", itemsData: []};
        case UPDATE_QUERY:
            return { ...state, query: action.query};
        case CREATE_ITEM_START:
            return { ...state, createItemItemProgress: true, createItemError: ""};
        case CREATE_ITEM_SUCCESS:
            var itemsData = JSON.parse(action.result);
            itemsData = parseSolrResponse(itemsData);
            return { ...state, createItemItemProgress: false, createItemError: ""};
        case CREATE_ITEM_FAILURE:
            return { ...state, createItemItemProgress: false, createItemError: "Create Item Failed."};
        default:
            return state;
    }
}

function getItemsInitInternal(team_id, limit, query) {
    var url = '/teams/'+team_id+'/items/search/?start=0&limit='+limit;
    if (query) {
        url = url + "&query=" + query;
    }

    return {
        types: [GET_ITEMS_INIT, GET_ITEMS_SUCCESS, GET_ITEMS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getItemsInit () {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.items.limit;
        var query = state.items.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getItemsInitInternal(team_id, limit, query));
    }
}

function getItemsNextCachedInternal() {
    return {type: GET_ITEMS_NEXT_CACHED};
}

function getItemsNextInternal(team_id, start, limit, query) {
    var url = '/teams/'+team_id+'/items/search/?start=' + start + '&limit='+(limit);
    if (query) {
        url = url + "&query=" + query;
    }

    return {
        types: [GET_ITEMS_START, GET_ITEMS_SUCCESS, GET_ITEMS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getItemsNext () {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.items.start;
        var limit = state.items.limit;
        var query = state.items.query;
        var currentCount = state.items.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getItemsNextCachedInternal());
        } else {
            dispatch(getItemsNextInternal(team_id, start, limit, query));
        }
    }
}

export function getItemsPrev() {
    return {
        type: GET_ITEMS_PREV_CACHED
    }
}

export function updateQueryInternal(query) {
    return {
        type: UPDATE_QUERY,
        query: query
    }
}

var debouncedGetItemsInit = debounce(function(dispatch, getState) {
    getItemsInit()(dispatch, getState);
}, 500)

export function searchItems(query) {
    return function (dispatch, getState) {
        dispatch(updateQueryInternal(query));
        debouncedGetItemsInit(dispatch, getState);
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