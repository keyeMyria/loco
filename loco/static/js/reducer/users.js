import {debounce} from './utils.js'

export const CLEAR_STATE = 'dashboard/clear_state'
export const GET_USERS_INIT = 'dashboard/get_users_init';
export const GET_USERS_START = 'dashboard/get_users_start';
export const GET_USERS_PREV_CACHED = 'dashboard/get_users_prev_cached';
export const GET_USERS_NEXT_CACHED = 'dashboard/get_users_next_cached';
export const GET_USERS_FAILURE = 'dashboard/get_users_failure';
export const GET_USERS_SUCCESS = 'dashboard/get_users_success';
export const GET_USER_DETAILS_START = 'dashboard/get_user_details_start';
export const GET_USER_DETAILS_FAILURE = 'dashboard/get_user_details_failure';
export const GET_USER_DETAILS_SUCCESS = 'dashboard/get_user_details_success';
export const GET_USER_TASKS_INIT = 'dashboard/get_user_tasks_init';
export const GET_USER_TASKS_START = 'dashboard/get_user_tasks_start';
export const GET_USER_TASKS_PREV_CACHED = 'dashboard/get_user_tasks_prev_cached';
export const GET_USER_TASKS_NEXT_CACHED = 'dashboard/get_user_tasks_next_cached';
export const GET_USER_TASKS_FAILURE = 'dashboard/get_user_tasks_failure';
export const GET_USER_TASKS_SUCCESS = 'dashboard/get_user_tasks_success';
export const UPDATE_QUERY = 'dashboard/update_users_query';
export const GET_USER_LOGS_INIT = 'dashboard/get_user_logs_init';
export const GET_USER_LOGS_START = 'dashboard/get_user_logs_start';
export const GET_USER_LOGS_PREV_CACHED = 'dashboard/get_user_logs_prev_cached';
export const GET_USER_LOGS_NEXT_CACHED = 'dashboard/get_user_logs_next_cached';
export const GET_USER_LOGS_FAILURE = 'dashboard/get_user_logs_failure';
export const GET_USER_LOGS_SUCCESS = 'dashboard/get_user_logs_success';
export const GET_USER_PLANS_INIT = 'dashboard/get_user_plans_init';
export const GET_USER_PLANS_START = 'dashboard/get_user_plans_start';
export const GET_USER_PLANS_PREV_CACHED = 'dashboard/get_user_plans_prev_cached';
export const GET_USER_PLANS_NEXT_CACHED = 'dashboard/get_user_plans_next_cached';
export const GET_USER_PLANS_FAILURE = 'dashboard/get_user_plans_failure';
export const GET_USER_PLANS_SUCCESS = 'dashboard/get_user_plans_success';
export const REMOVE_USER_START = 'dashboard/remove_user_start';
export const REMOVE_USER_FAILURE = 'dashboard/remove_user_failure';
export const REMOVE_USER_SUCCESS = 'dashboard/remove_user_success';
export const CHANGE_USER_ROLE_START = 'dashboard/change_user_role_start';
export const CHANGE_USER_ROLE_FAILURE = 'dashboard/change_user_role_failure';
export const CHANGE_USER_ROLE_SUCCESS = 'dashboard/change_user_role_success';

const INITIAL_STATE = {
    inProgress: true,
    start: -1,
    end: 0,
    limit: 10,
    totalCount: 0,
    currentCount: 0,
    data: [],
    getTime: '',
    error: '',
    query: '',
    filters: [],
    startDate: "",
    endDate: "",
    csvURL: '',
    userTasks: {
        inProgress: true,
        start: -1,
        end: 0,
        limit: 10,
        totalCount: -1,
        currentCount: 0,
        data: [],
        csvURL: ''
    },
    userLogs: {
        inProgress: true,
        start: -1,
        end: 0,
        limit: 10,
        totalCount: -1,
        currentCount: 0,
        data: [],
        csvURL: ''
    },
    userPlans: {
        inProgress: true,
        start: -1,
        end: 0,
        limit: 10,
        totalCount: -1,
        currentCount: 0,
        data: [],
        csvURL: ''
    },
    removeUserProgress: false,
    removeUserError: '',
    removeUserSuccess: false
};

export default function users(state = INITIAL_STATE, action={}) {
    switch(action.type) {
    	case GET_USERS_INIT:
    	    return { ...state, start: -1, data:[], inProgress: true, csvURL: ''};
    	case GET_USERS_START:
    	    return { ...state, inProgress: true, error: ""};
    	case GET_USERS_SUCCESS:
    	    var result = JSON.parse(action.result);
    	    var start = state.start + state.limit;
    	    if (state.start == -1) {
    	        start = 0;
    	    }

    	    if (!result.data) {
    	        result.data = []
    	    }

    	    var newData = state.data.concat(result.data);

    	    return { ...state, inProgress: false, error: "",
    	            data: newData,
    	            totalCount: result.count,
    	            currentCount: newData.length,
    	            start: start,
    	            end: start + result.data.length,
    	            csvURL: result.csv
    	        };
    	case GET_USERS_NEXT_CACHED:
    	    var start = state.start + state.limit;
    	    var end = start + state.limit;
    	    if (end > state.currentCount) {
    	        end = state.currentCount;
    	    }

    	    return {...state, start:start, end:end}
    	case GET_USERS_PREV_CACHED:
    	    var end = state.start; 
    	    var start = state.start - state.limit;
    	    return {...state, start:start, end:end}
    	case GET_USERS_FAILURE:
    	    return { ...state, inProgress: false, error: "Unable to get users.", data: []};
    	case GET_USER_DETAILS_START:
            return { ...state, getUserDetailsProgress: true, getUserDetailsError: ""};
        case GET_USER_DETAILS_SUCCESS:
            var userDetailsData = JSON.parse(action.result);
            return { ...state, getUserDetailsProgress: false, 
                getUserDetailsError: "", 
                userDetailsData: userDetailsData
            };
        case GET_USER_DETAILS_FAILURE:
            var error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, getUserDetailsProgress: false, 
                getUserDetailsError: "Unable to get user details", 
                error: error
            };
        case REMOVE_USER_START:
            return { ...state, removeUserSuccess:false, removeUserProgress: true, removeUserError: ""};
        case REMOVE_USER_SUCCESS:
            return { ...state, removeUserSuccess:true, removeUserProgress: false, 
                removeUserError: ""
            };
        case REMOVE_USER_FAILURE:
            return { ...state, removeUserSuccess:false, removeUserProgress: false, 
                removeUserError: error,
            };
        case CHANGE_USER_ROLE_START:
            return { ...state, changeUserRoleSuccess:false, changeUserRoleProgress: true, changeUserRoleError: ""};
        case CHANGE_USER_ROLE_SUCCESS:
            return { ...state, changeUserRoleSuccess:true, changeUserRoleProgress: false, 
                changeUserRoleError: ""
            };
        case CHANGE_USER_ROLE_FAILURE:
            return { ...state, changeUserRoleSuccess:false, changeUserRoleProgress: false, 
                changeUserRoleError: error,
            };
        case GET_USER_TASKS_INIT:
            var tasks = {...state.userTasks,
                data: [],
                inProgress: true,
                start: -1,
                csvURL: '',
                error: ''
            }

            return { ...state, userTasks:tasks};
        case GET_USER_TASKS_START:
            var tasks = {...state.userTasks, inProgress: true, error: ""}
            return { ...state, userTasks:tasks};
        case GET_USER_TASKS_SUCCESS:
            var result = JSON.parse(action.result);
            var start = state.userTasks.start + state.userTasks.limit;
            if (state.userTasks.start == -1) {
                start = 0;
            }

            if (!result.data) {
                result.data = []
            }

            var newData = state.userTasks.data.concat(result.data);

            var tasks = { ...state.userTasks, inProgress: false, error: "",
                    data: newData,
                    totalCount: result.count,
                    currentCount: newData.length,
                    start: start,
                    end: start + result.data.length,
                    csvURL: result.csv
                };

            return {...state, userTasks: tasks};

        case GET_USER_TASKS_NEXT_CACHED:
            var start = state.userTasks.start + state.userTasks.limit;
            var end = start + state.userTasks.limit;
            if (end > state.userTasks.currentCount) {
                end = state.userTasks.currentCount;
            }

            var tasks = {...state.userTasks, start:start, end:end}
            return {...state, userTasks:tasks}
        case GET_USER_TASKS_PREV_CACHED:
            var end = state.userTasks.start; 
            var start = state.userTasks.start - state.userTasks.limit;
            var tasks = {...state.userTasks, start:start, end:end}
            return {...state, userTasks:tasks}
        case GET_USER_TASKS_FAILURE:
            var tasks = {...state.userTasks, inProgress: false, error: "Unable to get tasks.", data: []}
            return { ...state, userTasks:tasks};
        case GET_USER_LOGS_INIT:
            var logs = {...state.userLogs,
                data: [],
                inProgress: true,
                start: -1,
                csvURL: '',
                error: ''
            }

            return { ...state, userLogs:logs};
        case GET_USER_LOGS_START:
            var logs = {...state.userLogs, inProgress: true, error: ""}
            return { ...state, userLogs:logs};
        case GET_USER_LOGS_SUCCESS:
            var result = JSON.parse(action.result);
            var start = state.userLogs.start + state.userLogs.limit;
            if (state.userLogs.start == -1) {
                start = 0;
            }

            if (!result.data) {
                result.data = []
            }

            var newData = state.userLogs.data.concat(result.data);

            var logs = { ...state.userLogs, inProgress: false, error: "",
                    data: newData,
                    totalCount: result.count,
                    currentCount: newData.length,
                    start: start,
                    end: start + result.data.length,
                    csvURL: result.csv
                };

            return {...state, userLogs:logs};

        case GET_USER_LOGS_NEXT_CACHED:
            var start = state.userLogs.start + state.userLogs.limit;
            var end = start + state.userLogs.limit;
            if (end > state.userLogs.currentCount) {
                end = state.userLogs.currentCount;
            }

            var logs = {...state.userLogs, start:start, end:end}
            return {...state, userLogs:logs}
        case GET_USER_LOGS_PREV_CACHED:
            var end = state.userLogs.start; 
            var start = state.userLogs.start - state.userLogs.limit;
            var logs = {...state.userLogs, start:start, end:end}
            return {...state, userLogs:logs}
        case GET_USER_LOGS_FAILURE:
            var logs = {...state.userLogs, inProgress: false, error: "Unable to get logs.", data: []}
            return { ...state, userLogs:logs};
        case GET_USER_PLANS_INIT:
            var plans = {...state.userPlans,
                data: [],
                inProgress: true,
                start: -1,
                csvURL: '',
                error: ''
            }

            return { ...state, userPlans:plans};
        case GET_USER_PLANS_START:
            var plans = {...state.userPlans, inProgress: true, error: ""}
            return { ...state, userPlans:plans};
        case GET_USER_PLANS_SUCCESS:
            var result = JSON.parse(action.result);
            var start = state.userPlans.start + state.userPlans.limit;
            if (state.userPlans.start == -1) {
                start = 0;
            }

            if (!result.data) {
                result.data = []
            }

            var newData = state.userPlans.data.concat(result.data);

            var plans = { ...state.userPlans, inProgress: false, error: "",
                    data: newData,
                    totalCount: result.count,
                    currentCount: newData.length,
                    start: start,
                    end: start + result.data.length,
                    csvURL: result.csv
                };

            return {...state, userPlans:plans};

        case GET_USER_PLANS_NEXT_CACHED:
            var start = state.userPlans.start + state.userPlans.limit;
            var end = start + state.userPlans.limit;
            if (end > state.userPlans.currentCount) {
                end = state.userPlans.currentCount;
            }

            var plans = {...state.userPlans, start:start, end:end}
            return {...state, userPlans:plans}
        case GET_USER_PLANS_PREV_CACHED:
            var end = state.userPlans.start; 
            var start = state.userPlans.start - state.userPlans.limit;
            var plans = {...state.userPlans, start:start, end:end}
            return {...state, userPlans:plans}
        case GET_USER_PLANS_FAILURE:
            var plans = {...state.userPlans, inProgress: false, error: "Unable to get plans.", data: []}
            return { ...state, userPlans:plans};
        case UPDATE_QUERY:
            return { ...state, query: action.query};
        case CLEAR_STATE:
            return INITIAL_STATE;
        default:
            return state;
    }
}



export function clearState() {
    return {
        type: CLEAR_STATE
    }
}

export function getUserDetailsInternal(user_id, team_id) {
    return {
        types: [GET_USER_DETAILS_START, GET_USER_DETAILS_SUCCESS, GET_USER_DETAILS_FAILURE],
        promise: (client) => client.local.get('/teams/' + team_id + '/memberships/' + user_id)
    }
}

export function getUserDetails(user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        return dispatch(getUserDetailsInternal(user_id, team_id));
    }
}

export function removeUserInternal(user_id, team_id) {
    return {
        types: [REMOVE_USER_START, REMOVE_USER_SUCCESS, REMOVE_USER_FAILURE],
        promise: (client) => client.local.del('/teams/' + team_id + '/members/' + user_id)
    }
}

export function changeUserRole(user_id, team_id, role) {
    return {
        types: [CHANGE_USER_ROLE_START, CHANGE_USER_ROLE_SUCCESS, CHANGE_USER_ROLE_FAILURE],
        promise: (client) => client.local.put('/teams/' + team_id + '/members/' + user_id + "/", {
            data: {
                role: role
            }
        })
    }
}

export function removeUser(user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        return dispatch(removeUserInternal(user_id, team_id));
    }
}

function getUsersInitInternal(team_id, limit, query, filters, startDate, endDate) {
    var url = '/teams/'+team_id+'/memberships/search/?start=0&limit='+limit;
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

    if(startDate && endDate) {
        if(url.includes("&filters=")) {
            url = url + ` AND created:[${startDate} TO ${endDate}]`
        } else {
            url = url + `&filters=created:[${startDate} TO ${endDate}]`
        }
    }

    return {
        types: [GET_USERS_INIT, GET_USERS_SUCCESS, GET_USERS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUsersInit () {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.users.limit;
        var query = state.users.query;
        var filters = state.users.filters;
        var startDate = state.users.startDate;
        var endDate = state.users.endDate;
        var team_id = state.dashboard.team_id;
        return dispatch(getUsersInitInternal(team_id, limit, query, filters, startDate, endDate));
    }
}

function getUsersNextCachedInternal() {
    return {type: GET_USERS_NEXT_CACHED};
}

function getUsersNextInternal(team_id, start, limit, query, filters, startDate, endDate) {
    var url = '/teams/'+team_id+'/memberships/search/?start=' + start + '&limit='+(limit);
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

    if(startDate && endDate) {
        if(url.includes("&filters=")) {
            url = url + ` AND created:[${startDate} TO ${endDate}]`
        } else {
            url = url + `&filters=created:[${startDate} TO ${endDate}]`
        }
    }

    return {
        types: [GET_USERS_START, GET_USERS_SUCCESS, GET_USERS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUsersNext() {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.users.start;
        var limit = state.users.limit;
        var query = state.users.query;
        var filters = state.users.filters;
        var startDate = state.users.startDate;
        var endDate = state.users.endDate;
        var currentCount = state.users.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getUsersNextCachedInternal());
        } else {
            dispatch(getUsersNextInternal(team_id, start, limit, query, filters, startDate, endDate));
        }
    }
}

export function getUsersPrev() {
    return {
        type: GET_USERS_PREV_CACHED
    }
}

function getUserTasksInitInternal(team_id, limit, user_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=0&limit='+limit;
    url = url + '&filters=created_by:' + user_id;
    return {
        types: [GET_USER_TASKS_INIT, GET_USER_TASKS_SUCCESS, GET_USER_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUserTasksInit (user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.users.userTasks.limit;
        var query = state.users.userTasks.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getUserTasksInitInternal(team_id, limit, user_id));
    }
}

function getUserTasksNextCachedInternal() {
    return {type: GET_USER_TASKS_NEXT_CACHED};
}

function getUserTasksNextInternal(team_id, start, limit, user_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=' + start + '&limit='+(limit);
    url = url + '&filters=created_by:' + user_id;
    
    return {
        types: [GET_USER_TASKS_START, GET_USER_TASKS_SUCCESS, GET_USER_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUserTasksNext(user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.userTasks.start;
        var limit = state.userTasks.limit;
        var currentCount = state.userTasks.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getUserTasksNextCachedInternal());
        } else {
            dispatch(getUserTasksNextInternal(team_id, start, limit, user_id));
        }
    }
}

export function getUserTasksPrev() {
    return {
        type: GET_USER_TASKS_PREV_CACHED
    }
}

export function updateQueryInternal(query) {
    return {
        type: UPDATE_QUERY,
        query: query
    }
}

var debouncedGetUsersInit = debounce(function(dispatch, getState) {
    getUsersInit()(dispatch, getState);
}, 500)

export function searchUsers(query) {
    return function (dispatch, getState) {
        dispatch(updateQueryInternal(query));
        debouncedGetUsersInit(dispatch, getState);
    }
}

function getUserLogsInitInternal(team_id, limit, user_id) {
    var url = '/teams/'+team_id+'/logs/?start=0&limit='+limit;
    url = url + '&user=' + user_id;
    return {
        types: [GET_USER_LOGS_INIT, GET_USER_LOGS_SUCCESS, GET_USER_LOGS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUserLogsInit (user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.users.userLogs.limit;
        var query = state.users.userLogs.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getUserLogsInitInternal(team_id, limit, user_id));
    }
}

function getUserLogsNextCachedInternal() {
    return {type: GET_USER_LOGS_NEXT_CACHED};
}

function getUserLogsNextInternal(team_id, start, limit, user_id) {
    var url = '/teams/'+team_id+'/logs/?start=' + start + '&limit='+(limit);
    url = url + '&user=' + user_id;
    
    return {
        types: [GET_USER_LOGS_START, GET_USER_LOGS_SUCCESS, GET_USER_LOGS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUserLogsNext(user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.userLogs.start;
        var limit = state.userLogs.limit;
        var currentCount = state.userLogs.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getUserLogsNextCachedInternal());
        } else {
            dispatch(getUserLogsNextInternal(team_id, start, limit, user_id));
        }
    }
}

export function getUserLogsPrev() {
    return {
        type: GET_USER_LOGS_PREV_CACHED
    }
}

function getUserPlansInitInternal(team_id, limit, user_id) {
    var url = '/teams/'+team_id+'/plans/?start=0&limit='+limit;
    url = url + '&user=' + user_id;
    return {
        types: [GET_USER_PLANS_INIT, GET_USER_PLANS_SUCCESS, GET_USER_PLANS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUserPlansInit (user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.users.userPlans.limit;
        var query = state.users.userPlans.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getUserPlansInitInternal(team_id, limit, user_id));
    }
}

function getUserPlansNextCachedInternal() {
    return {type: GET_USER_PLANS_NEXT_CACHED};
}

function getUserPlansNextInternal(team_id, start, limit, user_id) {
    var url = '/teams/'+team_id+'/plans/?start=' + start + '&limit='+(limit);
    url = url + '&user=' + user_id;
    
    return {
        types: [GET_USER_PLANS_START, GET_USER_PLANS_SUCCESS, GET_USER_PLANS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getUserPlansNext(user_id) {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.userPlans.start;
        var limit = state.userPlans.limit;
        var currentCount = state.userPlans.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getUserPlansNextCachedInternal());
        } else {
            dispatch(getUserPlansNextInternal(team_id, start, limit, user_id));
        }
    }
}

export function getUserPlansPrev() {
    return {
        type: GET_USER_PLANS_PREV_CACHED
    }
}