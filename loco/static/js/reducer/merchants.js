import {debounce} from './utils.js'

export const CREATE_MERCHANT_START = 'dashboard/create_merchant_start';
export const CREATE_MERCHANT_FAILURE = 'dashboard/create_merchant_failure';
export const CREATE_MERCHANT_SUCCESS = 'dashboard/create_merchant_success';

const INITIAL_STATE = {
};

export default function merchants(state = INITIAL_STATE, action={}) {
    switch(action.type) {
        case CREATE_MERCHANT_START:
            return { ...state, createMerchantProgress: true, createMerchantError: ""};
        case CREATE_MERCHANT_SUCCESS:
            var merchantsData = JSON.parse(action.result);
            merchantsData = parseSolrResponse(merchantsData);
            return { ...state, createMerchantProgress: false, createMerchantError: ""};
        case CREATE_MERCHANT_FAILURE:
            return { ...state, createMerchantProgress: false, createMerchantError: "Create Merchant Failed."};
        default:
            return state;
    }
}

export function createMerchant(team_id, data) {
    return {
        types: [CREATE_MERCHANT_START, CREATE_MERCHANT_SUCCESS, CREATE_MERCHANT_FAILURE],
        promise: (client) => client.local.post('/teams/' + team_id + '/merchants/', 
        {
            data: {
                name: data.name,
                price: data.price,
                serial_number: data.serial_number
            }
        })
    }
}