export const LOGIN_START = 'auth/login_start';
export const LOGIN_FAILURE = 'auth/login_failure';
export const LOGIN_SUCCESS = 'auth/login_success';
export const LOGOUT_START = 'auth/logout_start';
export const LOGOUT_FAILURE = 'auth/logout_failure';
export const LOGOUT_SUCCESS = 'auth/logout_success';
export const GETOTP_START = 'auth/getotp_start';
export const GETOTP_FAILURE = 'auth/getotp_failure';
export const GETOTP_SUCCESS = 'auth/getotp_success';
export const SIGNUP_START = 'auth/signnup_start';
export const SIGNUP_FAILURE = 'auth/signnup_failure';
export const SIGNUP_SUCCESS = 'auth/signnup_success';

const INITIAL_STATE = {
    loginProgress: false,
    error: "",
    isLoggedIn: false,
    logoutInProgress: false,
    signupProgress: false,
    signupError: "",
    getOtpProgress: false,
    getOtpSuccess: false,
    getOtpUser: '',
    getOtpError: ""
};

export default function auth(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case LOGIN_START:
            return { ...state, loginProgress: true, error: "", isLoggedIn:false};
        case LOGIN_SUCCESS:
            return { ...state, loginProgress: false, error: "", isLoggedIn: true};
        case LOGIN_FAILURE:
            return { ...state, loginProgress: false, error: "Login Failed. Please check phone and password.", isLoggedIn:false};
        case LOGOUT_START:
            return { ...state, logoutInProgress: true, error: ""};
        case LOGOUT_SUCCESS:
            window.location.href = "/";
            return { ...state, logoutInProgress: false, error: ""};
        case LOGOUT_FAILURE:
            return { ...state, logoutInProgress: false, error: "Logout Failed."};
        case GETOTP_START:
            return { ...state,getOtpSuccess:false,getOtpUser: '', getOtpProgress: true, getOtpError: ""};
        case GETOTP_SUCCESS:
            var res = '';
            if (action.result) {
                res = JSON.parse(action.result);
            }

            return { ...state,getOtpSuccess:true, getOtpUser: res, getOtpProgress: false, getOtpError: ""};
        case GETOTP_FAILURE:
            return { ...state,getOtpSuccess:false,getOtpUser: '', getOtpProgress: false, getOtpError: "Unable to get OTP"};
        case SIGNUP_START:
            return { ...state, signupProgress: true, signupError: ""};
        case SIGNUP_SUCCESS:
            window.location.href = "/";
            return { ...state, signupProgress: false, signupError: ""};
        case SIGNUP_FAILURE:
            var error = "Signup failed. Please check you connection."
            if (action.error.status=400) {
                error = "Signup failed. Please re-check details entered above"
                if (action.error.response.body) {
                    error = action.error.response.body.error;
                }
            }
            return { ...state, signupProgress: false, signupError: error};
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

export function getOtp(phone) {
    return {
        types: [GETOTP_START, GETOTP_SUCCESS, GETOTP_FAILURE],
        promise: (client) => client.local.post('/users/getOtp',
            {
                data: {
                    phone: phone
                }
            }
        )
    }
}

export function signup(phone, otp, name, password) {
    return {
        types: [SIGNUP_START, SIGNUP_SUCCESS, SIGNUP_FAILURE],
        promise: (client) => client.local.post('/users/web-auth-setup',
            {
                data: {
                    phone: phone,
                    otp: otp, 
                    name: name,
                    password: password
                }
            }
        )
    }
}

