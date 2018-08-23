import {debounce} from './utils.js'

export const CREATE_TASK_START = 'dashboard/create_task_start';
export const CREATE_TASK_FAILURE = 'dashboard/create_task_failure';
export const CREATE_TASK_SUCCESS = 'dashboard/create_task_success';
export const GET_TASKS_INIT = 'dashboard/get_tasks_init';
export const GET_TASKS_START = 'dashboard/get_tasks_start';
export const GET_TASKS_PREV_CACHED = 'dashboard/get_tasks_prev_cached';
export const GET_TASKS_NEXT_CACHED = 'dashboard/get_tasks_next_cached';
export const GET_TASKS_FAILURE = 'dashboard/get_tasks_failure';
export const GET_TASKS_SUCCESS = 'dashboard/get_tasks_success';
export const GET_TASK_DETAILS_START = 'dashboard/get_task_details_start';
export const GET_TASK_DETAILS_FAILURE = 'dashboard/get_task_details_failure';
export const GET_TASK_DETAILS_SUCCESS = 'dashboard/get_task_details_success';
export const CLEAR_STATE = 'dashboard/clear_state'
export const UPDATE_QUERY = 'dashboard/update_tasks_query';
export const UPDATE_FILTER = 'dashboard/update_tasks_filters';
export const UPDATE_FILTER_DATE = 'dashboard/update_tasks_filter_date';
export const DELETE_TASK_START = 'dashboard/delete_task_start';
export const DELETE_TASK_FAILURE = 'dashboard/delete_task_failure';
export const DELETE_TASK_SUCCESS = 'dashboard/delete_task_success';

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
    startDate: "",
    endDate: "",
    csvURL: ''
};

export default function tasks(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case CREATE_TASK_START:
            return { ...state, createTaskProgress: true, createTaskError: ""};
        case CREATE_TASK_SUCCESS:
            var data = JSON.parse(action.result);
            data = parseSolrResponse(data);
            return { ...state, createTaskProgress: false, createTaskError: ""};
        case CREATE_TASK_FAILURE:
            return { ...state, createTaskProgress: false, createTaskError: "Create Task Failed."};
        case GET_TASKS_INIT:
            return { ...state, start: -1, data:[], inProgress: true, csvURL: ''};
        case GET_TASKS_START:
            return { ...state, inProgress: true, error: ""};
        case GET_TASKS_SUCCESS:
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
        case GET_TASKS_NEXT_CACHED:
            var start = state.start + state.limit;
            var end = start + state.limit;
            if (end > state.currentCount) {
                end = state.currentCount;
            }

            return {...state, start:start, end:end}
        case GET_TASKS_PREV_CACHED:
            var end = state.start; 
            var start = state.start - state.limit;
            return {...state, start:start, end:end}
        case GET_TASKS_FAILURE:
            return { ...state, inProgress: false, error: "Unable to get tasks.", data: []};
        case GET_TASK_DETAILS_START:
            return { ...state, getTaskDetailsProgress: true, getTaskDetailsError: ""};
        case GET_TASK_DETAILS_SUCCESS:
            let taskDetailsData = JSON.parse(action.result);
            taskDetailsData = taskDetailsData.data;
            if(taskDetailsData && taskDetailsData.length > 0) {
                taskDetailsData = taskDetailsData[0];
            }

            taskDetailsData["content"] = JSON.parse(taskDetailsData.content)
            let task = taskDetailsData.content;
            taskDetailsData["description"] = task.content.description;
            if(task && task.content && task.content.items && Array.isArray(task.content.items)) {
                taskDetailsData["items_data"] = task.content.items;
            } else {
                taskDetailsData["items_data"] = [];
            }

            return { ...state, getTaskDetailsProgress: false, getTaskDetailsError: "", taskDetailsData: taskDetailsData};
        case GET_TASK_DETAILS_FAILURE:
            let error = "Something went wrong. Please try again later.";
            if(action.result) {
                let result = JSON.parse(action.result);
                let resultError = result.error;
                if(resultError) {
                    error = resultError;
                }
            }
            return { ...state, getTaskDetailsProgress: false, getTaskDetailsError: "Get Task Details Failed.", error: error};
        case UPDATE_QUERY:
            return { ...state, query: action.query};
        case UPDATE_FILTER:
            return { ...state, filters: action.filters}
        case UPDATE_FILTER_DATE:
            return { ...state, startDate: action.startDate, endDate: action.endDate}
        case DELETE_TASK_START:
            return { ...state, deleteTaskProgress: true, deleteTaskSuccess:false};
        case DELETE_TASK_SUCCESS:
            return { ...state, deleteTaskProgress: false, deleteTaskSuccess: true};
        case DELETE_TASK_FAILURE:
            var error = "Something went wrong. Please try again later.";
            return { ...state, deleteTaskProgress: false, error: error, deleteTaskSuccess:false};
        case CLEAR_STATE:
            return INITIAL_STATE;
        default:
            return state;
    }
}


function getTasksInitInternal(team_id, limit, query, filters, startDate, endDate) {
    var url = '/teams/'+team_id+'/tasks/search/?start=0&limit='+limit;
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
        types: [GET_TASKS_INIT, GET_TASKS_SUCCESS, GET_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getTasksInit () {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.tasks.limit;
        var query = state.tasks.query;
        var filters = state.tasks.filters;
        var startDate = state.tasks.startDate;
        var endDate = state.tasks.endDate;
        var team_id = state.dashboard.team_id;
        return dispatch(getTasksInitInternal(team_id, limit, query, filters, startDate, endDate));
    }
}

function getTasksNextCachedInternal() {
    return {type: GET_TASKS_NEXT_CACHED};
}

function getTasksNextInternal(team_id, start, limit, query, filters, startDate, endDate) {
    var url = '/teams/'+team_id+'/tasks/search/?start=' + start + '&limit='+(limit);
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
        types: [GET_TASKS_START, GET_TASKS_SUCCESS, GET_TASKS_FAILURE],
        promise: (client) => client.local.get(url,
            {
                cancelPrevious: true,
            }
        )
    }
}

export function getTasksNext() {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.tasks.start;
        var limit = state.tasks.limit;
        var query = state.tasks.query;
        var filters = state.tasks.filters;
        var startDate = state.tasks.startDate;
        var endDate = state.tasks.endDate;
        var currentCount = state.tasks.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getTasksNextCachedInternal());
        } else {
            dispatch(getTasksNextInternal(team_id, start, limit, query, filters, startDate, endDate));
        }
    }
}

export function getTasksPrev() {
    return {
        type: GET_TASKS_PREV_CACHED
    }
}

export function updateQueryInternal(query) {
    return {
        type: UPDATE_QUERY,
        query: query
    }
}

export function updateFiltersInternal(filters) {
    return {
        type: UPDATE_FILTER,
        filters: filters
    }
}

export function updateFiltersDateInternal(startDate, endDate) {
    return {
        type: UPDATE_FILTER_DATE,
        startDate: startDate,
        endDate: endDate
    }
}

var debouncedGetTasksInit = debounce(function(dispatch, getState) {
    getTasksInit()(dispatch, getState);
}, 500)

export function searchTasks(query) {
    return function (dispatch, getState) {
        dispatch(updateQueryInternal(query));
        debouncedGetTasksInit(dispatch, getState);
    }
}

export function filterTasks(filters) {
    return function (dispatch, getState) {
        dispatch(updateFiltersInternal(filters));
        debouncedGetTasksInit(dispatch, getState);
    }
}

export function filterTasksDate(startDate, endDate) {
    return function (dispatch, getState) {
        dispatch(updateFiltersDateInternal(startDate, endDate));
        debouncedGetTasksInit(dispatch, getState);
    }
}

export function createTask(team_id, data) {
    return {
        types: [CREATE_TASK_START, CREATE_TASK_SUCCESS, CREATE_TASK_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/tasks/', 
        {
            data: {
                name: data.name,
                price: data.price,
                serial_number: data.serial_number
            }
        })
    }
}

export function getTaskDetails(team_id, task_id) {
    var url = '/teams/'+team_id+'/tasks/search/?start=0&limit=1&filters=task_id:'+task_id;

    return {
        types: [GET_TASK_DETAILS_START, GET_TASK_DETAILS_SUCCESS, GET_TASK_DETAILS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function clearState() {
    return {
        type: CLEAR_STATE
    }
}

export function deleteTask(task_id) {
    return {
        types: [DELETE_TASK_START, DELETE_TASK_SUCCESS, DELETE_TASK_FAILURE],
        promise: (client) => client.local.del('/tasks/' + task_id)
    }
}