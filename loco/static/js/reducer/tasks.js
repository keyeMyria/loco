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
export const UPDATE_QUERY = 'dashboard/update_tasks_query';

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
        case UPDATE_QUERY:
            return { ...state, query: action.query};
        default:
            return state;
    }
}


function getTasksInitInternal(team_id, limit, query) {
    var url = '/teams/'+team_id+'/tasks/search/?start=0&limit='+limit;
    if (query) {
        url = url + "&query=" + query;
    }

    return {
        types: [GET_TASKS_INIT, GET_TASKS_SUCCESS, GET_TASKS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getTasksInit () {
    return function (dispatch, getState) {
        var state = getState();
        var limit = state.tasks.limit;
        var query = state.tasks.query;
        var team_id = state.dashboard.team_id;
        return dispatch(getTasksInitInternal(team_id, limit, query));
    }
}

function getTasksNextCachedInternal() {
    return {type: GET_TASKS_NEXT_CACHED};
}

function getTasksNextInternal(team_id, start, limit, query) {
    var url = '/teams/'+team_id+'/tasks/search/?start=' + start + '&limit='+(limit);
    if (query) {
        url = url + "&query=" + query;
    }

    return {
        types: [GET_TASKS_START, GET_TASKS_SUCCESS, GET_TASKS_FAILURE],
        promise: (client) => client.local.get(url)
    }
}

export function getTasksNext () {
    return function (dispatch, getState) {
        var state = getState();
        var team_id = state.dashboard.team_id;
        var start = state.tasks.start;
        var limit = state.tasks.limit;
        var query = state.tasks.query;
        var currentCount = state.tasks.currentCount;
        start = start + limit;
        if (start < currentCount) {
            dispatch(getTasksNextCachedInternal());
        } else {
            dispatch(getTasksNextInternal(team_id, start, limit, query));
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

var debouncedGetTasksInit = debounce(function(dispatch, getState) {
    getTasksInit()(dispatch, getState);
}, 500)

export function searchTasks(query) {
    return function (dispatch, getState) {
        dispatch(updateQueryInternal(query));
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