import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { signInWithMoralis as signInWithMoralisByEvm } from "@moralisweb3/client-firebase-evm-auth";

import { loadUserData, registerUser, loginUser } from "../../api/authApi";
import setAuthToken from "./auth.utils";
import { setAlert } from "../alert/alert.actions";
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    WALLET_CONNECT_SUCCESS,
    WALLET_DISCONNECT_SUCCESS,
    WALLET_LOGIN_SUCCESS,
    WALLET_LOGOUT,
    WALLET_AUTHENTICATING,
} from "./auth.types";
import { auth, moralisAuth } from "../../firebase";

const web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    network: "rinkeby",
    providerOptions: {}, // required
});

// Load User
export const loadUser = () => async (dispatch) => {
    if (localStorage.token) {
        setAuthToken(localStorage.token);
    }
    try {
        const res = await loadUserData();

        dispatch({
            type: USER_LOADED,
            payload: res.data.data,
        });
    } catch (err) {
        dispatch({
            type: AUTH_ERROR,
        });
    }
};

// Register User
export const register =
    ({ username, password }) =>
    async (dispatch) => {
        try {
            const res = await registerUser(username, password);

            dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data.data,
            });

            dispatch(setAlert(res.data.message, "success"));

            dispatch(loadUser());
        } catch (err) {
            dispatch(setAlert(err.response.data.message, "danger"));

            dispatch({
                type: REGISTER_FAIL,
            });
        }
    };

// Login User
export const login =
    ({ username, password }) =>
    async (dispatch) => {
        try {
            const res = await loginUser(username, password);

            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data.data,
            });

            dispatch(setAlert(res.data.message, "success"));

            dispatch(loadUser());
        } catch (err) {
            dispatch(setAlert(err.response.data.message, "danger"));

            dispatch({
                type: LOGIN_FAIL,
            });
        }
    };

export const walletLogin = () => async (dispatch) => {
    try {
        dispatch({ type: WALLET_AUTHENTICATING });
        const res = await signInWithMoralisByEvm(moralisAuth);
        dispatch({
            type: WALLET_LOGIN_SUCCESS,
            payload: res.credentials.user,
        });
    } catch (err) {
        dispatch({
            type: LOGIN_FAIL,
        });
    }
};

export const walletLogout = () => async (dispatch) => {
    await auth.signOut();
    dispatch(setAlert("User has logged out", "success"));
    dispatch({ type: WALLET_LOGOUT });
};

//LOGOUT
export const logout = () => (dispatch) => {
    dispatch(setAlert("User has logged out", "success"));
    localStorage.removeItem("token");

    dispatch({ type: LOGOUT });
};

export const connectWallet = () => async (dispatch) => {
    try {
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        console.log("wallet address, ", address);
        console.log("network id, ", network.chainId);
        dispatch({
            type: WALLET_CONNECT_SUCCESS,
            payload: {
                provider,
                wallet: {
                    address,
                },
            },
        });
    } catch (error) {
        console.log("wallet connect error, ", error);
    }
};

export const disconnectWallet = () => async (dispatch) => {
    await web3Modal.clearCachedProvider();
    dispatch({
        type: WALLET_DISCONNECT_SUCCESS,
    });
};
