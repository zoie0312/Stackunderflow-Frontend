import { db } from "../../firebase";
import {
    collection,
    getDocs,
    getDoc,
    doc,
    serverTimestamp,
    setDoc,
    query,
    where,
} from "firebase/firestore";

import { setAlert } from "../alert/alert.actions";
import {
    GET_POSTS,
    GET_POST,
    GET_TAG_POSTS,
    POST_ERROR,
    DELETE_POST,
    ADD_POST,
} from "./posts.types";
import { deleteSinglePost } from "../../api/postsApis";
import { updateUserScores } from "../users/users.actions";

// Get posts
export const getPosts = () => async (dispatch) => {
    try {
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
        const { title, body, tagname, user } = formData;
        const tags = tagname
            .split(",")
            .filter(Boolean)
            .map((tag) => tag.trim());

        const newPostRef = doc(collection(db, "posts"));
        const promises = tags.map(
            (tagName) =>
                new Promise((resolve, reject) => {
                    const q = query(
                        collection(db, "tags"),
                        where("tagname", "==", tagName)
                    );
                    getDocs(q)
                        .then((querySnapshot) => {
                            if (!querySnapshot.empty) {
                                const tagData = querySnapshot.docs[0];
                                resolve({
                                    tagname: tagName,
                                    id: tagData.id,
                                    posttag: {
                                        createdAt: new Date().toISOString(),
                                        post_id: newPostRef.id,
                                        tag_id: tagData.id,
                                        updatedAt: new Date().toISOString(),
                                    },
                                });
                            } else {
                                resolve("");
                            }
                        })
                        .catch((err) => reject(err));
                })
        );
        const promiseResult = await Promise.all(promises);

        const tagsData = promiseResult.filter((result) => result !== "");

        const newPostData = {
            answer_count: 0,
            comment_count: 0,
            views: 0,
            gravatar: `https://secure.gravatar.com/avatar/${
                Math.floor(Math.random() * 100) + 1
            }?s=164&d=identicon`,
            id: newPostRef.id,
            user_id: user.id,
            username: user.username,
            body,
            title,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            tags: tagsData,
        };
        await setDoc(newPostRef, newPostData);
        console.log("new post id, ", newPostRef.id);
        dispatch({
            type: ADD_POST,
            payload: newPostData,
        });
        dispatch(
            updateUserScores({
                user,
                tags,
                type: "BY_QUESTION",
            })
        );

        dispatch(setAlert("Add a new Question", "success"));

        dispatch(getPosts());
    } catch (err) {
        dispatch(setAlert(err.toString(), "danger"));

        dispatch({
            type: POST_ERROR,
            payload: {
                msg: err.toString(),
                status: "Error",
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
