export const TEAMS_GET_START = 'teams/teams_get_start';
export const TEAMS_GET_FAILURE = 'teams/teams_get_failure';
export const TEAMS_GET_SUCCESS = 'teams/teams_get_success';

const INITIAL_STATE = {
    inProgress: false,
    error: "",
    teams: []
};

export default function teams(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case TEAMS_GET_START:
            return { ...state, inProgress: true, error: "", teams:[]};
        case TEAMS_GET_SUCCESS:
            return { ...state, inProgress: false, error: "", teams: JSON.parse(action.result || '[]')};
        case TEAMS_GET_FAILURE:
            return { ...state, inProgress: false, error: "Unable to get teams", teams:[]};
        default:
            return state;
    }
}

export function getTeams() {
	return {
		types: [TEAMS_GET_START, TEAMS_GET_SUCCESS, TEAMS_GET_FAILURE],
		promise: (client) => client.local.get('/teams/')
	}
}

