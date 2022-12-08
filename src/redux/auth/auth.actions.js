import { signInWithMoralis as signInWithMoralisByEvm } from "@moralisweb3/client-firebase-evm-auth";
import { db } from "../../firebase";
import { getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

import { registerUser, loginUser } from "../../api/authApi";
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
    WALLET_LOGIN_SUCCESS,
    WALLET_LOGOUT,
    WALLET_AUTHENTICATING,
} from "./auth.types";
import { auth, moralisAuth } from "../../firebase";

// Load User
export const loadUser = () => async (dispatch) => {
    // if (localStorage.token) {
    //     setAuthToken(localStorage.token);
    // }
    try {
        if (auth.currentUser) {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            dispatch({
                type: USER_LOADED,
                payload: docSnap.data(),
            });
        }
    } catch (err) {
        dispatch({
            type: AUTH_ERROR,
        });
    }
};

export const loadUserByWallet = (userCredential) => async (dispatch) => {
    const { displayName: address, uid } = userCredential;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    if (!userData) {
        await setDoc(doc(db, "users", uid), {
            id: uid,
            address,
            username: "new user",
            created_at: serverTimestamp(),
            gravatar: `https://secure.gravatar.com/avatar/${
                Math.floor(Math.random() * 100) + 1
            }?s=164&d=identicon`,
            scores: {},
            posts_count: 0,
            tags_count: 0,
        });
        dispatch({
            type: USER_LOADED,
            payload: {
                id: uid,
                address,
                username: "new user",
                scores: {},
            },
        });
    } else {
        dispatch({
            type: USER_LOADED,
            payload: {
                address,
                username: userData.username,
                id: userData.id,
                scores: userData.scores,
            },
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
        dispatch(loadUserByWallet(res.credentials.user));

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
