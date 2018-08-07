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
export const UPLOAD_ITEM_START = 'dashboard/upload_item_start';
export const UPLOAD_ITEM_FAILURE = 'dashboard/upload_item_failure';
export const UPLOAD_ITEM_SUCCESS = 'dashboard/upload_item_success';
export const ITEM_UPLOADS_START = 'dashboard/item_uploads_start';
export const ITEM_UPLOADS_FAILURE = 'dashboard/item_uploads_failure';
export const ITEM_UPLOADS_SUCCESS = 'dashboard/item_uploads_success';
export const GET_ITEM_DETAILS_START = 'dashboard/get_item_details_start';
export const GET_ITEM_DETAILS_FAILURE = 'dashboard/get_item_details_failure';
export const GET_ITEM_DETAILS_SUCCESS = 'dashboard/get_item_details_success';
export const DELETE_ITEM_START = 'dashboard/delete_item_start';
export const DELETE_ITEM_FAILURE = 'dashboard/delete_item_failure';
export const DELETE_ITEM_SUCCESS = 'dashboard/delete_item_success';
export const EDIT_ITEM_START = 'dashboard/edit_item_start';
export const EDIT_ITEM_FAILURE = 'dashboard/edit_item_failure';
export const EDIT_ITEM_SUCCESS = 'dashboard/edit_item_success';
export const UPDATE_QUERY = 'dashboard/update_items_query';
export const CLEAR_STATE = 'dashboard/clear_state'

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
    csvURL: '',
    uploads: []
};

export default function items(state = INITIAL_STATE, action={}) {
    let error = "";
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
            return { ...state, createItemProgress: true, createItemError: ""};
        case CREATE_ITEM_SUCCESS:
            return { ...state, createItemProgress: false, createItemError: "", createItemSucess: true};
        case CREATE_ITEM_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, createItemProgress: false, createItemError: "Create Item Failed.", error: error};
        case UPLOAD_ITEM_START:
            return { ...state, uploadProgress: true, uploadError: ""};
        case UPLOAD_ITEM_SUCCESS:
            var data = JSON.parse(action.result);
            var uploads = state.uploads.slice();
            uploads.unshift(data);
            return { ...state, uploadProgress: false, uploadError: "", uploads, uploads};
        case UPLOAD_ITEM_FAILURE:
            return { ...state, uploadProgress: false, uploadError: "Upload Failed."};
        case ITEM_UPLOADS_START:
            return { ...state, getUploadsProgress: true, getUploadsError: "", uploads: []};
        case ITEM_UPLOADS_SUCCESS:
            var uploads = JSON.parse(action.result);
            return { ...state, getUploadsProgress: false, getUploadsError: "", uploads: uploads};
        case ITEM_UPLOADS_FAILURE:
            return { ...state, getUploadsProgress: false, getUploadsError: "Unable to get past uploads", uploads: []};
        case GET_ITEM_DETAILS_START:
            return { ...state, getItemDetailsProgress: true};
        case GET_ITEM_DETAILS_SUCCESS:
            var itemDetailsData = JSON.parse(action.result);
            return { ...state, getItemDetailsProgress: false, itemDetailsData: itemDetailsData};
        case GET_ITEM_DETAILS_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, getItemDetailsProgress: false, error: error};
        case DELETE_ITEM_START:
            return { ...state, deleteItemProgress: true};
        case DELETE_ITEM_SUCCESS:
            return { ...state, deleteItemProgress: false, deleteItemSuccess: true};
        case DELETE_ITEM_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, deleteItemProgress: false, error: error};
        case EDIT_ITEM_START:
            return { ...state, editItemProgress: true, editItemError: ""};
        case EDIT_ITEM_SUCCESS:
            return { ...state, editItemProgress: false, editItemError: "", editItemSuccess: true};
        case EDIT_ITEM_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, editItemProgress: false, editItemError: "Edit Item Failed.", error: error};
        case CLEAR_STATE:
            return INITIAL_STATE;    
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
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
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
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
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

export function getItemDetails(item_id) {
    return {
        types: [GET_ITEM_DETAILS_START, GET_ITEM_DETAILS_SUCCESS, GET_ITEM_DETAILS_FAILURE],
        promise: (client) => client.local.get('/crm/items/' + item_id)
    }
}

export function deleteItem(item_id) {
    return {
        types: [DELETE_ITEM_START, DELETE_ITEM_SUCCESS, DELETE_ITEM_FAILURE],
        promise: (client) => client.local.del('/crm/items/' + item_id)
    }
}

export function editItemDetails(data) {
    return {
        types: [EDIT_ITEM_START, EDIT_ITEM_SUCCESS, EDIT_ITEM_FAILURE],
        promise: (client) => client.local.put(`/crm/items/${data.id}/`, {
            data:data
        })
    }
}

function getItemUploadsInternal(team_id) {
    return {
        types: [ITEM_UPLOADS_START, ITEM_UPLOADS_SUCCESS, ITEM_UPLOADS_FAILURE],
        promise: (client) => client.local.get('/teams/' + team_id + '/items/upload/')
    }
}

export function getItemUploads(start, limit) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        dispatch(getItemUploadsInternal(team_id));
    }
}

function uploadItemInternal(team_id, data) {
    return {
        types: [UPLOAD_ITEM_START, UPLOAD_ITEM_SUCCESS, UPLOAD_ITEM_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/items/upload/', 
            {form: {data: data}}
        )
    }
}

export function uploadItem(data) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        dispatch(uploadItemInternal(team_id, data));
    }
}

export function clearState() {
    return {
        type: CLEAR_STATE
    }
}