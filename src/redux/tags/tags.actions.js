import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

import { setAlert } from "../alert/alert.actions";
import { GET_TAG, GET_TAGS, TAG_ERROR } from "./tags.types";
import { allTagsData, singleTagData } from "../../api/tagsApi";

export const getTag = (tagName) => async (dispatch) => {
    try {
        //const res = await singleTagData(tagName);
        const q = query(
            collection(db, "tags"),
            where("tagname", "==", tagName)
        );
        const querySnapshot = await getDocs(q);
        const tagsData = querySnapshot.docs.map((doc) => doc.data());

        dispatch({
            type: GET_TAG,
            payload: tagsData[0],
        });
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: TAG_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

export const getTags = () => async (dispatch) => {
    try {
        //const res = await allTagsData();
        const querySnapshot = await getDocs(collection(db, "tags"));
        const tagsData = querySnapshot.docs.map((doc) => doc.data());

        dispatch({
            type: GET_TAGS,
            payload: tagsData,
        });
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: TAG_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};
