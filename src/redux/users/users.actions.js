import { db } from "../../firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

import { GET_USERS, GET_USER, USER_ERROR } from "./users.types";
import { usersData, profileData } from "../../api/usersApi";

// Get users
export const getUsers = () => async (dispatch) => {
    try {
        //const res = await usersData();
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => doc.data());
        dispatch({
            type: GET_USERS,
            payload: usersData,
        });
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

// Get user
export const getProfile = (id) => async (dispatch) => {
    try {
        //const res = await profileData(id);
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        dispatch({
            type: GET_USER,
            payload: docSnap.data(),
        });
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};
