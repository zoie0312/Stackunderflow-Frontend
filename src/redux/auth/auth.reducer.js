import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    WALLET_LOGIN_SUCCESS,
    WALLET_LOGOUT,
    WALLET_AUTHENTICATING,
} from "./auth.types";

const initialState = {
    token: localStorage.getItem("token"),
    isAuthenticated: null,
    loading: false,
    user: null,
    provider: null,
    wallet: null,
    walletAddress: null,
    firebaseUid: null,
};

export default function auth(state = initialState, action) {
    switch (action.type) {
        case USER_LOADED:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
            };

        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem("token", action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
            };
        case REGISTER_FAIL:
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem("token");
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case WALLET_AUTHENTICATING:
            return {
                ...state,
                loading: true,
            };
        case WALLET_LOGIN_SUCCESS:
            return {
                ...state,
                walletAddress: action.payload.displayName,
                firebaseUid: action.payload.uid,
                isAuthenticated: true,
                loading: false,
            };
        case WALLET_LOGOUT:
            return {
                ...state,
                walletAddress: null,
                firebaseUid: null,
                isAuthenticated: false,
                loading: false,
            };
        default:
            return state;
    }
}
