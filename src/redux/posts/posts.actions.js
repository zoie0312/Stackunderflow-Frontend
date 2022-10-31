import { db } from "../../firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

import { setAlert } from "../alert/alert.actions";
import {
    GET_POSTS,
    GET_POST,
    GET_TAG_POSTS,
    POST_ERROR,
    DELETE_POST,
    ADD_POST,
} from "./posts.types";
import {
    allPostsData,
    singlePostData,
    allTagPostsData,
    createSinglePost,
    deleteSinglePost,
} from "../../api/postsApis";

// Get posts
export const getPosts = () => async (dispatch) => {
    try {
        //const res = await allPostsData();
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postsData = querySnapshot.docs.map((doc) => doc.data());
        dispatch({
            type: GET_POSTS,
            payload: postsData,
        });
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

// Get post
export const getPost = (id) => async (dispatch) => {
    try {
        //const res = await singlePostData(id);
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        dispatch({
            type: GET_POST,
            payload: docSnap.data(),
        });
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

//GET TAG POSTS
export const getTagPosts = (tagName) => async (dispatch) => {
    try {
        //const res = await allTagPostsData(tagName);
        const querySnapshot = await getDocs(collection(db, "posts"));
        let tagPosts = [];
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            post.tags.every((tag) => {
                if (tag.tagname === tagName) {
                    tagPosts.push(post);
                    return false;
                }
                return true;
            });
        });

        dispatch({
            type: GET_TAG_POSTS,
            payload: tagPosts,
        });
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

// Add post
export const addPost = (formData) => async (dispatch) => {
    try {
        const res = await createSinglePost(formData);

        dispatch({
            type: ADD_POST,
            payload: res.data.data,
        });

        dispatch(setAlert(res.data.message, "success"));

        dispatch(getPosts());
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};

// Delete post
export const deletePost = (id) => async (dispatch) => {
    try {
        const res = await deleteSinglePost(id);

        dispatch({
            type: DELETE_POST,
            payload: id,
        });

        dispatch(setAlert(res.data.message, "success"));
    } catch (err) {
        dispatch(setAlert(err.response.data.message, "danger"));

        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.response.statusText,
                status: err.response.status,
            },
        });
    }
};
