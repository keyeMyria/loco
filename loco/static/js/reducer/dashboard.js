export const INIT_TEAM_ID = 'dashboard/init_team_id'

const INITIAL_STATE = {
    team_id: ""
};

export default function dashboard(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case INIT_TEAM_ID:
            state.team_id = action.team_id;
            return {...state, team_id: action.team_id}
        default:
            return state;
    }
}

export function initTeamId(team_id) {
    return {
        type: INIT_TEAM_ID,
        team_id: team_id
    }
}

