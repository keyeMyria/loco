import {parseSolrResponse} from './utils.js'

export const GET_ITEMS_INIT = 'dashboard/get_items_init';
export const GET_ITEMS_START = 'dashboard/get_items_start';
export const GET_ITEMS_PREV = 'dashboard/get_items_prev';
export const GET_ITEMS_NEXT = 'dashboard/get_items_next';
export const GET_ITEMS_FAILURE = 'dashboard/get_items_failure';
export const GET_ITEMS_SUCCESS = 'dashboard/get_items_success';

const INITIAL_STATE = {
    team_id: "",
    inProgress: true,
    start: -1,
    end: 0,
    limit: 10,
    totalCount: 0,
    currentCount: 0,
    hasMoreItems: true,
    data: [],
    getTime: '',
    error: ''
};

export default function items(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case GET_ITEMS_INIT:
            return { ...state, ...INITIAL_STATE};
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
                    hasMoreItems: hasMoreItems
                };
        case GET_ITEMS_NEXT:
            var start = state.start + state.limit;
            var end = start + state.limit;
            if (end > state.currentCount) {
                end = state.currentCount;
            }

            return {...state, start:start, end:end}
        case GET_ITEMS_PREV:
            var end = state.start; 
            var start = state.start - state.limit;
            return {...state, start:start, end:end}
        case GET_ITEMS_FAILURE:
            return { ...state, inProgress: false, error: "Get Items Failed.", itemsData: []};
        default:
            return state;
    }
}

export function getItemsInit(team_id, limit) {
    var url = '/teams/'+team_id+'/items/search?start=0&limit='+limit;

    return {
        types: [GET_ITEMS_INIT, GET_ITEMS_SUCCESS, GET_ITEMS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getItemsNext(team_id, start, limit, currentCount) {
    start = start + limit;
    if (start < currentCount) {
        return {type: GET_ITEMS_NEXT}
    }

    var url = '/teams/'+team_id+'/items/search?start=' + start + '&limit='+(limit);
    return {
        types: [GET_ITEMS_START, GET_ITEMS_SUCCESS, GET_ITEMS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getItemsPrev() {
    return {
        type: GET_ITEMS_PREV
    }
}
