import {debounce} from './utils.js'

export const CREATE_MERCHANT_START = 'dashboard/create_merchant_start';
export const CREATE_MERCHANT_FAILURE = 'dashboard/create_merchant_failure';
export const CREATE_MERCHANT_SUCCESS = 'dashboard/create_merchant_success';
export const UPLOAD_MERCHANT_START = 'dashboard/upload_merchant_start';
export const UPLOAD_MERCHANT_FAILURE = 'dashboard/upload_merchant_failure';
export const UPLOAD_MERCHANT_SUCCESS = 'dashboard/upload_merchant_success';
export const MERCHANT_UPLOADS_START = 'dashboard/merchant_uploads_start';
export const MERCHANT_UPLOADS_FAILURE = 'dashboard/merchant_uploads_failure';
export const MERCHANT_UPLOADS_SUCCESS = 'dashboard/merchant_uploads_success';
export const GET_MERCHANTS_INIT = 'dashboard/get_merchants_init';
export const GET_MERCHANTS_START = 'dashboard/get_merchants_start';
export const GET_MERCHANTS_PREV_CACHED = 'dashboard/get_merchants_prev_cached';
export const GET_MERCHANTS_NEXT_CACHED = 'dashboard/get_merchants_next_cached';
export const GET_MERCHANTS_FAILURE = 'dashboard/get_merchants_failure';
export const GET_MERCHANTS_SUCCESS = 'dashboard/get_merchants_success';
export const UPDATE_QUERY = 'dashboard/update_merchants_query';

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

export default function merchants(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case CREATE_MERCHANT_START:
            return { ...state, createMerchantProgress: true, createMerchantError: ""};
        case CREATE_MERCHANT_SUCCESS:
            var merchantsData = JSON.parse(action.result);
            return { ...state, createMerchantProgress: false, createMerchantError: ""};
        case CREATE_MERCHANT_FAILURE:
            return { ...state, createMerchantProgress: false, createMerchantError: "Create Merchant Failed."};
        case UPLOAD_MERCHANT_START:
            return { ...state, uploadProgress: true, uploadError: ""};
        case UPLOAD_MERCHANT_SUCCESS:
            var data = JSON.parse(action.result);
            var uploads = state.uploads.slice();
            uploads.unshift(data);
            return { ...state, uploadProgress: false, uploadError: "", uploads, uploads};
        case UPLOAD_MERCHANT_FAILURE:
            return { ...state, uploadProgress: false, uploadError: "Upload Failed."};
        case MERCHANT_UPLOADS_START:
            return { ...state, getUploadsProgress: true, getUploadsError: "", uploads: []};
        case MERCHANT_UPLOADS_SUCCESS:
            var uploads = JSON.parse(action.result);
            return { ...state, getUploadsProgress: false, getUploadsError: "", uploads: uploads};
        case MERCHANT_UPLOADS_FAILURE:
            return { ...state, getUploadsProgress: false, getUploadsError: "Unable to get past uploads", uploads: []};
        case GET_MERCHANTS_INIT:
            return { ...state, start: -1, data:[], inProgress: true, csvURL: ''};
        case GET_MERCHANTS_START:
            return { ...state, inProgress: true, error: ""};
        case GET_MERCHANTS_SUCCESS:
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
        case GET_MERCHANTS_NEXT_CACHED:
            var start = state.start + state.limit;
            var end = start + state.limit;
            if (end > state.currentCount) {
                end = state.currentCount;
            }

            return {...state, start:start, end:end}
        case GET_MERCHANTS_PREV_CACHED:
            var end = state.start; 
            var start = state.start - state.limit;
            return {...state, start:start, end:end}
        case GET_MERCHANTS_FAILURE:
            return { ...state, inProgress: false, error: "Unable to get merchants.", data: []};
        case UPDATE_QUERY:
            return { ...state, query: action.query};
        default:
            return state;
    }
}


function getMerchantsInitInternal(team_id, limit, query) {
    var url = '/teams/'+team_id+'/merchants/search/?start=0&limit='+limit;
    if (query) {
        url = url + "&query=" + query;
    }

    return {
        types: [GET_MERCHANTS_INIT, GET_MERCHANTS_SUCCESS, GET_MERCHANTS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getMerchantsInit () {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.merchants.limit;
        var query = state.merchants.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getMerchantsInitInternal(team_id, limit, query));
    }
}

function getMerchantsNextCachedInternal() {
    return {type: GET_MERCHANTS_NEXT_CACHED};
}

function getMerchantsNextInternal(team_id, start, limit, query) {
    var url = '/teams/'+team_id+'/merchants/search/?start=' + start + '&limit='+(limit);
    if (query) {
        url = url + "&query=" + query;
    }

    return {
        types: [GET_MERCHANTS_START, GET_MERCHANTS_SUCCESS, GET_MERCHANTS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getMerchantsNext () {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.merchants.start;
        var limit = state.merchants.limit;
        var query = state.merchants.query;
        var currentCount = state.merchants.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getMerchantsNextCachedInternal());
        } else {
            dispatch(getMerchantsNextInternal(team_id, start, limit, query));
        }
    }
}

export function getMerchantsPrev() {
    return {
        type: GET_MERCHANTS_PREV_CACHED
    }
}

export function updateQueryInternal(query) {
    return {
        type: UPDATE_QUERY,
        query: query
    }
}

var debouncedGetMerchantsInit = debounce(function(dispatch, getState) {
    getMerchantsInit()(dispatch, getState);
}, 500)

export function searchMerchants(query) {
    return function (dispatch, getState) {
        dispatch(updateQueryInternal(query));
        debouncedGetMerchantsInit(dispatch, getState);
    }
}


export function createMerchant(team_id, data) {
    return {
        types: [CREATE_MERCHANT_START, CREATE_MERCHANT_SUCCESS, CREATE_MERCHANT_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/merchants/', 
        {
            data: {
                name: data.name,
                price: data.price,
                serial_number: data.serial_number
            }
        })
    }
}

function getMerchantUploadsInternal(team_id) {
    return {
        types: [MERCHANT_UPLOADS_START, MERCHANT_UPLOADS_SUCCESS, MERCHANT_UPLOADS_FAILURE],
        promise: (client) => client.local.get('/teams/' + team_id + '/merchants/upload/')
    }
}

export function getMerchantUploads(start, limit) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        dispatch(getMerchantUploadsInternal(team_id));
    }
}

function uploadMerchantInternal(team_id, data) {
    return {
        types: [UPLOAD_MERCHANT_START, UPLOAD_MERCHANT_SUCCESS, UPLOAD_MERCHANT_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/merchants/upload/', 
            {form: {data: data}}
        )
    }
}

export function uploadMerchant(data) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        dispatch(uploadMerchantInternal(team_id, data));
    }
}
