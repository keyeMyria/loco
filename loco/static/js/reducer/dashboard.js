export const INIT_TEAM_ID = 'dashboard/init_team_id'

const INITIAL_STATE = {
    team_id: "",
    team_name: "",
};

export default function dashboard(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case INIT_TEAM_ID:
            return {...state, team_id: action.team_id, team_name: action.team_name}
        default:
            return state;
    }
}

export function initTeamId(team_id, team_name) {
    return {
        type: INIT_TEAM_ID,
        team_id: team_id,
        team_name: team_name,
    }
}

