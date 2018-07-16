export const INIT_TEAM_ID = 'dashboard/init_team_id'
export const CREATE_ITEM_START = 'dashboard/create_item_start';
export const CREATE_ITEM_FAILURE = 'dashboard/create_item_failure';
export const CREATE_ITEM_SUCCESS = 'dashboard/create_item_success';

const INITIAL_STATE = {
    team_id: "",
    team_name: "",
};

export default function dashboard(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case INIT_TEAM_ID:
            return {...state, team_id: action.team_id, team_name: action.team_name}
	case CREATE_ITEM_START:
            return { ...state, createItemItemProgress: true, createItemError: ""};
        case CREATE_ITEM_SUCCESS:
            var itemsData = JSON.parse(action.result);
            itemsData = parseSolrResponse(itemsData);
            return { ...state, createItemItemProgress: false, createItemError: ""};
        case CREATE_ITEM_FAILURE:
            return { ...state, createItemItemProgress: false, createItemError: "Create Item Failed."};
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

export function createItem(team_id, data) {
    return {
        types: [CREATE_ITEM_START, CREATE_ITEM_SUCCESS, CREATE_ITEM_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/items/', 
        {
            data: {
                name: data.name,
                price: data.price,
                serial_number: data.serial_number
            }
        })
    }
}

