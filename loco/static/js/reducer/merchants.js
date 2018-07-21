import {debounce} from './utils.js'

export const CREATE_MERCHANT_START = 'dashboard/create_merchant_start';
export const CREATE_MERCHANT_FAILURE = 'dashboard/create_merchant_failure';
export const CREATE_MERCHANT_SUCCESS = 'dashboard/create_merchant_success';
export const GET_MERCHANTS_INIT = 'dashboard/get_merchants_init';
export const GET_MERCHANTS_START = 'dashboard/get_merchants_start';
export const GET_MERCHANTS_PREV_CACHED = 'dashboard/get_merchants_prev_cached';
export const GET_MERCHANTS_NEXT_CACHED = 'dashboard/get_merchants_next_cached';
export const GET_MERCHANTS_FAILURE = 'dashboard/get_merchants_failure';
export const GET_MERCHANTS_SUCCESS = 'dashboard/get_merchants_success';
export const GET_MERCHANT_DETAILS_START = 'dashboard/get_merchant_details_start';
export const GET_MERCHANT_DETAILS_FAILURE = 'dashboard/get_merchant_details_failure';
export const GET_MERCHANT_DETAILS_SUCCESS = 'dashboard/get_merchant_details_success';
export const EDIT_MERCHANT_START = 'dashboard/edit_merchant_start';
export const EDIT_MERCHANT_FAILURE = 'dashboard/edit_merchant_failure';
export const EDIT_MERCHANT_SUCCESS = 'dashboard/edit_merchant_success';
export const GET_STATES_START = 'dashboard/get_states_start';
export const GET_STATES_FAILURE = 'dashboard/get_states_failure';
export const GET_STATES_SUCCESS = 'dashboard/get_states_success';
export const GET_CITIES_START = 'dashboard/get_cities_start';
export const GET_CITIES_FAILURE = 'dashboard/get_cities_failure';
export const GET_CITIES_SUCCESS = 'dashboard/get_cities_success';
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
    states: [],
    cities: []
};

export default function merchants(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case CREATE_MERCHANT_START:
            return { ...state, createMerchantProgress: true, createMerchantError: ""};
        case CREATE_MERCHANT_SUCCESS:
            var merchantsData = JSON.parse(action.result);
            merchantsData = parseSolrResponse(merchantsData);
            return { ...state, createMerchantProgress: false, createMerchantError: ""};
        case CREATE_MERCHANT_FAILURE:
            return { ...state, createMerchantProgress: false, createMerchantError: "Create Merchant Failed."};
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
        case GET_MERCHANT_DETAILS_START:
            return { ...state, getMerchantDetailsProgress: true, getMerchantDetailsError: ""};
        case GET_MERCHANT_DETAILS_SUCCESS:
            var merchantDetailsData = JSON.parse(action.result);
            return { ...state, getMerchantDetailsProgress: false, getMerchantDetailsError: "", merchantDetailsData: merchantDetailsData};
        case GET_MERCHANT_DETAILS_FAILURE:
            return { ...state, getMerchantDetailsProgress: false, getMerchantDetailsError: "Get Merchant Details Failed."};
        case EDIT_MERCHANT_START:
            return { ...state, editMerchantProgress: true, editMerchantError: ""};
        case EDIT_MERCHANT_SUCCESS:
            return { ...state, editMerchantProgress: false, editMerchantError: ""};
        case EDIT_MERCHANT_FAILURE:
            return { ...state, editMerchantProgress: false, editMerchantError: "Edit Merchant Failed."};
        case GET_STATES_START:
            return { ...state, getStatesProgress: true, getStatesrror: ""};
        case GET_STATES_SUCCESS:
            return { ...state, getStatesProgress: false, getStatesError: "", states: JSON.parse(action.result)};
        case GET_STATES_FAILURE:
            return { ...state, getStatesProgress: false, getStatesError: "Get States Failed."};
        case GET_CITIES_START:
            return { ...state, getCitiesProgress: true, getCitiesrror: ""};
        case GET_CITIES_SUCCESS:
            return { ...state, getCitiesProgress: false, getCitiesError: "", cities: JSON.parse(action.result)};
        case GET_CITIES_FAILURE:
            return { ...state, getCitiesProgress: false, getCitiesError: "Get Cities Failed."};
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
            data: data
        })
    }
}

export function getMerchantDetails(merchant_id) {
    return {
        types: [GET_MERCHANT_DETAILS_START, GET_MERCHANT_DETAILS_SUCCESS, GET_MERCHANT_DETAILS_FAILURE],
        promise: (client) => client.local.get('/crm/merchants/' + merchant_id)
    }
}

export function editMerchantDetails(data) {
    return {
        types: [EDIT_MERCHANT_START, EDIT_MERCHANT_SUCCESS, EDIT_MERCHANT_FAILURE],
        promise: (client) => client.local.put(`/crm/merchants/${data.id}/`, {
            data:data
        })
    }
}

export function getStates(merchant_id) {
    return {
        types: [GET_STATES_START, GET_STATES_SUCCESS, GET_STATES_FAILURE],
        promise: (client) => client.local.get('/crm/states/')
    }
}

export function getCities(merchant_id) {
    return {
        types: [GET_CITIES_START, GET_CITIES_SUCCESS, GET_CITIES_FAILURE],
        promise: (client) => client.local.get('/crm/cities/?start=0&limit=10000')
    }
}