import { db } from "../../firebase";
import { collection, getDocs, getDoc, doc, setDoc } from "firebase/firestore";

import { GET_USERS, GET_USER, USER_ERROR, UPDATE_USER_SCORE } from "./users.types";

// Get users
export const getUsers = () => async (dispatch) => {
    try {
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

export const updateUserScores = ({user, tags, type}) => async (dispatch) => {
    try {
        const docRef = doc(db, "users", user.id);
        const docSnap = await getDoc(docRef);
        const increment = type === 'BY_ANSWER' ? 3 : 1;
        const newScores = {...docSnap.data().scores};
        tags.forEach(tag => {
            tag in newScores ? newScores[tag] += increment : newScores[tag] = increment
        });
        await setDoc(docRef, {scores: newScores}, {merge: true});
        dispatch({
            type: UPDATE_USER_SCORE,
            payload: newScores
        })
    } catch (error) {
        dispatch({
            type: USER_ERROR,
            payload: {
                msg: 'updateUserScores failure',
                status: 'Error',
            },
        })
    }
}