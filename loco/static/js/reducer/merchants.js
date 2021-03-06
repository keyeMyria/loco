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
export const GET_MERCHANT_DETAILS_START = 'dashboard/get_merchant_details_start';
export const GET_MERCHANT_DETAILS_FAILURE = 'dashboard/get_merchant_details_failure';
export const GET_MERCHANT_DETAILS_SUCCESS = 'dashboard/get_merchant_details_success';
export const DELETE_MERCHANT_START = 'dashboard/delete_merchant_start';
export const DELETE_MERCHANT_FAILURE = 'dashboard/delete_merchant_failure';
export const DELETE_MERCHANT_SUCCESS = 'dashboard/delete_merchant_success';
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
export const UPDATE_FILTER = 'dashboard/update_merchants_filters';
export const CLEAR_STATE = 'dashboard/clear_state'
export const GET_BUY_TASKS_INIT = 'dashboard/merchants/get_buy_tasks_init';
export const GET_BUY_TASKS_START = 'dashboard/merchants/get_buy_tasks_start';
export const GET_BUY_TASKS_PREV_CACHED = 'dashboard/merchants/get_buy_tasks_prev_cached';
export const GET_BUY_TASKS_NEXT_CACHED = 'dashboard/merchants/get_buy_tasks_next_cached';
export const GET_BUY_TASKS_FAILURE = 'dashboard/merchants/get_buy_tasks_failure';
export const GET_BUY_TASKS_SUCCESS = 'dashboard/merchants/get_buy_tasks_success';
export const GET_SELL_TASKS_INIT = 'dashboard/merchants/get_sell_tasks_init';
export const GET_SELL_TASKS_START = 'dashboard/merchants/get_sell_tasks_start';
export const GET_SELL_TASKS_PREV_CACHED = 'dashboard/merchants/get_sell_tasks_prev_cached';
export const GET_SELL_TASKS_NEXT_CACHED = 'dashboard/merchants/get_sell_tasks_next_cached';
export const GET_SELL_TASKS_FAILURE = 'dashboard/merchants/get_sell_tasks_failure';
export const GET_SELL_TASKS_SUCCESS = 'dashboard/merchants/get_sell_tasks_success';


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
    filters: [],
    csvURL: '',
    uploads: [],
    states: [],
    cities: [],
    buyTasks: {
        inProgress: true,
        start: -1,
        end: 0,
        limit: 10,
        totalCount: -1,
        currentCount: 0,
        hasMoreItems: true,
        data: [],
        csvURL: ''
    },
    sellTasks: {
        inProgress: true,
        start: -1,
        end: 0,
        limit: 10,
        totalCount: -1,
        currentCount: 0,
        hasMoreItems: true,
        data: [],
        csvURL: ''
    }
};

export default function merchants(state = INITIAL_STATE, action={}) {
    let error = "";
    switch(action.type) {
        case CREATE_MERCHANT_START:
            return { ...state, createMerchantProgress: true, createMerchantError: ""};
        case CREATE_MERCHANT_SUCCESS:
            var merchantsData = JSON.parse(action.result);
            return { ...state, createMerchantProgress: false, createMerchantError: "", createMerchantSucess: true};
        case CREATE_MERCHANT_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, createMerchantProgress: false, createMerchantError: "Create Merchant Failed.", createMerchantSucess: false, error: error};
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
        case UPDATE_FILTER:
            return { ...state, filters: action.filters}
        case GET_MERCHANT_DETAILS_START:
            return { ...state, getMerchantDetailsProgress: true, getMerchantDetailsError: ""};
        case GET_MERCHANT_DETAILS_SUCCESS:
            var merchantDetailsData = JSON.parse(action.result);
            return { ...state, getMerchantDetailsProgress: false, getMerchantDetailsError: "", merchantDetailsData: merchantDetailsData};
        case GET_MERCHANT_DETAILS_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, getMerchantDetailsProgress: false, getMerchantDetailsError: "Get Merchant Details Failed.", error: error};
        case DELETE_MERCHANT_START:
            return { ...state, deleteMerchantProgress: true};
        case DELETE_MERCHANT_SUCCESS:
            return { ...state, deleteMerchantProgress: false, deleteMerchantSuccess: true};
        case DELETE_MERCHANT_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, deleteMerchantProgress: false, error: error};
        case EDIT_MERCHANT_START:
            return { ...state, editMerchantProgress: true, editMerchantError: ""};
        case EDIT_MERCHANT_SUCCESS:
            return { ...state, editMerchantProgress: false, editMerchantError: "", editMerchantSuccess: true};
        case EDIT_MERCHANT_FAILURE:
            error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, editMerchantProgress: false, editMerchantError: "Edit Merchant Failed.", editMerchantSuccess: false, error: error};
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
        case GET_BUY_TASKS_INIT:
            var tasks = {...state.buyTasks,
                data: [],
                inProgress: true,
                start: -1,
                csvURL: '',
                error: ''
            }

            return { ...state, buyTasks:tasks};
        case GET_BUY_TASKS_START:
            var tasks = {...state.buyTasks, inProgress: true, error: ""}
            return { ...state, buyTasks:tasks};
        case GET_BUY_TASKS_SUCCESS:
            var result = JSON.parse(action.result);
            var start = state.buyTasks.start + state.buyTasks.limit;
            if (state.buyTasks.start == -1) {
                start = 0;
            }

            if (!result.data) {
                result.data = []
            }

            var newData = state.buyTasks.data.concat(result.data);
            var hasMoreItems = true
            if (result.data.length < state.buyTasks.limit) {
                hasMoreItems = false;
            }

            var tasks = { ...state.buyTasks, inProgress: false, error: "",
                    data: newData,
                    totalCount: result.count,
                    currentCount: newData.length,
                    start: start,
                    end: start + result.data.length,
                    hasMoreItems: hasMoreItems,
                    csvURL: result.csv
                };

            return {...state, buyTasks: tasks};

        case GET_BUY_TASKS_NEXT_CACHED:
            var start = state.buyTasks.start + state.buyTasks.limit;
            var end = start + state.buyTasks.limit;
            if (end > state.buyTasks.currentCount) {
                end = state.buyTasks.currentCount;
            }

            var tasks = {...state.buyTasks, start:start, end:end}
            return {...state, buyTasks:tasks}
        case GET_BUY_TASKS_PREV_CACHED:
            var end = state.buyTasks.start; 
            var start = state.buyTasks.start - state.buyTasks.limit;
            var tasks = {...state.buyTasks, start:start, end:end}
            return {...state, buyTasks:tasks}
        case GET_BUY_TASKS_FAILURE:
            var tasks = {...state.buyTasks, inProgress: false, error: "Unable to get tasks.", data: []}
            return { ...state, buyTasks:tasks};
        case GET_SELL_TASKS_INIT:
            var tasks = {...state.sellTasks,
                data: [],
                inProgress: true,
                start: -1,
                csvURL: '',
                error: ''
            }

            return { ...state, sellTasks:tasks};
        case GET_SELL_TASKS_START:
            var tasks = {...state.sellTasks, inProgress: true, error: ""}
            return { ...state, sellTasks:tasks};
        case GET_SELL_TASKS_SUCCESS:
            var result = JSON.parse(action.result);
            var start = state.sellTasks.start + state.sellTasks.limit;
            if (state.sellTasks.start == -1) {
                start = 0;
            }

            if (!result.data) {
                result.data = []
            }

            var newData = state.sellTasks.data.concat(result.data);
            var hasMoreItems = true
            if (result.data.length < state.sellTasks.limit) {
                hasMoreItems = false;
            }

            var tasks = { ...state.sellTasks, inProgress: false, error: "",
                    data: newData,
                    totalCount: result.count,
                    currentCount: newData.length,
                    start: start,
                    end: start + result.data.length,
                    hasMoreItems: hasMoreItems,
                    csvURL: result.csv
                };

            return {...state, sellTasks: tasks};

        case GET_SELL_TASKS_NEXT_CACHED:
            var start = state.sellTasks.start + state.sellTasks.limit;
            var end = start + state.sellTasks.limit;
            if (end > state.sellTasks.currentCount) {
                end = state.sellTasks.currentCount;
            }

            var tasks = {...state.sellTasks, start:start, end:end}
            return {...state, sellTasks:tasks}
        case GET_SELL_TASKS_PREV_CACHED:
            var end = state.sellTasks.start; 
            var start = state.sellTasks.start - state.sellTasks.limit;
            var tasks = {...state.sellTasks, start:start, end:end}
            return {...state, sellTasks:tasks}
        case GET_SELL_TASKS_FAILURE:
            var tasks = {...state.sellTasks, inProgress: false, error: "Unable to get tasks.", data: []}
            return { ...state, sellTasks:tasks};
        case CLEAR_STATE:
            return INITIAL_STATE;
        default:
            return state;
    }
}


function getMerchantsInitInternal(team_id, limit, query, filters) {
    var url = '/teams/'+team_id+'/merchants/search/?start=0&limit='+limit;
    if (query) {
        url = url + "&query=" + query;
    }

    if(filters && Array.isArray(filters) && filters.length > 0) {
        for(var i = 0; i< filters.length; i++) {
            if(filters[i].name && filters[i].value) {
                if(url.includes("&filters=")) {
                    url = url + ` AND ${filters[i].name}:*${filters[i].value}*`
                } else {
                    url = url + `&filters=${filters[i].name}:*${filters[i].value}*`
                }
            }
        }
    }

    return {
        types: [GET_MERCHANTS_INIT, GET_MERCHANTS_SUCCESS, GET_MERCHANTS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
            ),
    }
}

export function getMerchantsInit() {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.merchants.limit;
        var query = state.merchants.query;
        var filters = state.merchants.filters;
        var team_id = state.dashboard.team_id;
        return dispatch(getMerchantsInitInternal(team_id, limit, query, filters));
    }
}

function getMerchantsNextCachedInternal() {
    return {type: GET_MERCHANTS_NEXT_CACHED};
}

function getMerchantsNextInternal(team_id, start, limit, query, filters) {
    var url = '/teams/'+team_id+'/merchants/search/?start=' + start + '&limit='+(limit);
    if (query) {
        url = url + "&query=" + query;
    }

    if(filters && Array.isArray(filters) && filters.length > 0) {
        for(var i = 0; i< filters.length; i++) {
            if(filters[i].name && filters[i].value) {
                if(url.includes("&filters=")) {
                    url = url + ` AND ${filters[i].name}:*${filters[i].value}*`
                } else {
                    url = url + `&filters=${filters[i].name}:*${filters[i].value}*`
                }
            }
        }
    }

    return {
        types: [GET_MERCHANTS_START, GET_MERCHANTS_SUCCESS, GET_MERCHANTS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        ),
    }
}

export function getMerchantsNext() {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.merchants.start;
        var limit = state.merchants.limit;
        var query = state.merchants.query;
        var filters = state.merchants.filters;
        var currentCount = state.merchants.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getMerchantsNextCachedInternal());
        } else {
            dispatch(getMerchantsNextInternal(team_id, start, limit, query, filters));
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

export function updateFilterInternal(filters) {
    return {
        type: UPDATE_FILTER,
        filters: filters
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

export function filterMerchants(filters) {
    return function (dispatch, getState) {
        dispatch(updateFilterInternal(filters));
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


export function getMerchantDetails(merchant_id) {
    return {
        types: [GET_MERCHANT_DETAILS_START, GET_MERCHANT_DETAILS_SUCCESS, GET_MERCHANT_DETAILS_FAILURE],
        promise: (client) => client.local.get('/crm/merchants/' + merchant_id)
    }
}

export function deleteMerchant(merchant_id) {
    return {
        types: [DELETE_MERCHANT_START, DELETE_MERCHANT_SUCCESS, DELETE_MERCHANT_FAILURE],
        promise: (client) => client.local.del('/crm/merchants/' + merchant_id)
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

export function clearState() {
    return {
        type: CLEAR_STATE
    }
}

function getMerchantBuyTasksInitInternal(team_id, limit, merchant_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=0&limit='+limit;
    url = url + '&filters=merchant_id:' + merchant_id;
    return {
        types: [GET_BUY_TASKS_INIT, GET_BUY_TASKS_SUCCESS, GET_BUY_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: false,
            }
        )
    }
}

export function getMerchantBuyTasksInit (merchant_id) {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.merchants.buyTasks.limit;
        var query = state.merchants.buyTasks.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getMerchantBuyTasksInitInternal(team_id, limit, merchant_id));
    }
}

function getMerchantBuyTasksNextCachedInternal() {
    return {type: GET_BUY_TASKS_NEXT_CACHED};
}

function getMerchantBuyTasksNextInternal(team_id, start, limit, merchant_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=' + start + '&limit='+(limit);
    url = url + '&filters=merchant_id:' + merchant_id;
    
    return {
        types: [GET_BUY_TASKS_START, GET_BUY_TASKS_SUCCESS, GET_BUY_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: false,
            }
        )
    }
}

export function getMerchantBuyTasksNext(merchant_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.buyTasks.start;
        var limit = state.buyTasks.limit;
        var currentCount = state.buyTasks.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getMerchantBuyTasksNextCachedInternal());
        } else {
            dispatch(getMerchantBuyTasksNextInternal(team_id, start, limit, merchant_id));
        }
    }
}

export function getMerchantBuyTasksPrev() {
    return {
        type: GET_BUY_TASKS_PREV_CACHED
    }
}

function getMerchantSellTasksInitInternal(team_id, limit, merchant_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=0&limit='+limit;
    url = url + '&filters=merchant_seller_id:' + merchant_id;
    return {
        types: [GET_SELL_TASKS_INIT, GET_SELL_TASKS_SUCCESS, GET_SELL_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: false,
            }
        )
    }
}

export function getMerchantSellTasksInit (merchant_id) {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.merchants.sellTasks.limit;
        var query = state.merchants.sellTasks.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getMerchantSellTasksInitInternal(team_id, limit, merchant_id));
    }
}

function getMerchantSellTasksNextCachedInternal() {
    return {type: GET_SELL_TASKS_NEXT_CACHED};
}

function getMerchantSellTasksNextInternal(team_id, start, limit, merchant_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=' + start + '&limit='+(limit);
    url = url + '&filters=merchant_seller_id:' + merchant_id;
    
    return {
        types: [GET_SELL_TASKS_START, GET_SELL_TASKS_SUCCESS, GET_SELL_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: false,
            }
        )
    }
}

export function getMerchantSellTasksNext(merchant_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.sellTasks.start;
        var limit = state.sellTasks.limit;
        var currentCount = state.sellTasks.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getMerchantSellTasksNextCachedInternal());
        } else {
            dispatch(getMerchantSellTasksNextInternal(team_id, start, limit, merchant_id));
        }
    }
}

export function getMerchantSellTasksPrev() {
    return {
        type: GET_SELL_TASKS_PREV_CACHED
    }
}
