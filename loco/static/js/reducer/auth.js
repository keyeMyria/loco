export const LOGIN_START = 'login/login_start';
export const LOGIN_FAILURE = 'login/login_failure';
export const LOGIN_SUCCESS = 'login/login_success';
export const LOGOUT_START = 'logout/logout_start';
export const LOGOUT_FAILURE = 'logout/logout_failure';
export const LOGOUT_SUCCESS = 'logout/logout_success';

const INITIAL_STATE = {
    inProgress: false,
    error: "",
    isLoggedIn: false,
    logoutInProgress: false
};

export default function auth(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case LOGIN_START:
            return { ...state, inProgress: true, error: "", isLoggedIn:false};
        case LOGIN_SUCCESS:
            return { ...state, inProgress: false, error: "", isLoggedIn: true};
        case LOGIN_FAILURE:
            return { ...state, inProgress: false, error: "Login Failed. Please check phone and password.", isLoggedIn:false};
        case LOGOUT_START:
            return { ...state, logoutInProgress: true, error: ""};
        case LOGOUT_SUCCESS:
            window.location.href = "/";
            return { ...state, logoutInProgress: false, error: ""};
        case LOGOUT_FAILURE:
            return { ...state, logoutInProgress: false, error: "Logout Failed."};
        default:
            return state;
    }
}

export function login(phone, password) {
    return {
        types: [LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILURE],
        promise: (client) => client.local.post('/users/login/',
            {
                data: {
                    phone: phone,
                    password: password
                }
            }
        )
    }
}

export function logout(phone, password) {
    return {
        types: [LOGOUT_START, LOGOUT_SUCCESS, LOGOUT_FAILURE],
        promise: (client) => client.local.get('/users/logout/?session_type=web',
            {}
        )
    }
}

