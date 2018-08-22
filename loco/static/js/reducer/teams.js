export const TEAMS_GET_START = 'teams/teams_get_start';
export const TEAMS_GET_FAILURE = 'teams/teams_get_failure';
export const TEAMS_GET_SUCCESS = 'teams/teams_get_success';
export const CREATE_TEAM_START = 'teams/create_team_start';
export const CREATE_TEAM_FAILURE = 'teams/create_team_failure';
export const CREATE_TEAM_SUCCESS = 'teams/create_team_success';
export const JOIN_TEAM_START = 'teams/join_team_start';
export const JOIN_TEAM_FAILURE = 'teams/join_team_failure';
export const JOIN_TEAM_SUCCESS = 'teams/join_team_success';

const INITIAL_STATE = {
    inProgress: false,
    error: "",
    teams: [],
};

export default function teams(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case TEAMS_GET_START:
            return { ...state, inProgress: true, error: "", teams:[]};
        case TEAMS_GET_SUCCESS:
            return { ...state, inProgress: false, error: "", teams: JSON.parse(action.result || '[]')};
        case TEAMS_GET_FAILURE:
            return { ...state, inProgress: false, error: "Unable to get teams", teams:[]};
        case CREATE_TEAM_START:
            return { ...state, inProgress: true};
        case CREATE_TEAM_SUCCESS:
            return { ...state, inProgress: false, teamData: JSON.parse(action.result || '{}')};
        case CREATE_TEAM_FAILURE:
            return { ...state, inProgress: false, error: "Unable to create team"};
        case JOIN_TEAM_START:
            return { ...state, inProgress: true};
        case JOIN_TEAM_SUCCESS:
            return { ...state, inProgress: false, joinTeamData: JSON.parse(action.result || '{}')};
        case JOIN_TEAM_FAILURE:
            return { ...state, inProgress: false, joinTeamError: "Invalid code."};
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

export function createTeam(name) {  
    return {
        types: [CREATE_TEAM_START, CREATE_TEAM_SUCCESS, CREATE_TEAM_FAILURE],
        promise: (client) => client.local.post('/teams/',
            {
            data: {
                name: name,
            }
        })
    }
}

export function joinTeam(code) {  
    return {
        types: [JOIN_TEAM_START, JOIN_TEAM_SUCCESS, JOIN_TEAM_FAILURE],
        promise: (client) => client.local.put('/teams/join/',
        {
            data: {
                code: code,
            }
        })
    }
}
