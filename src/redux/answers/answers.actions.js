import { db } from "../../firebase";
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";

import { setAlert } from "../alert/alert.actions";
import {
  GET_ANSWERS,
  ANSWER_ERROR,
  ADD_ANSWER,
  DELETE_ANSWER,
} from "./answers.types";
import { deleteSingleAnswer } from "../../api/answersApi";
import { updateUserScores } from "../users/users.actions";

export const getAnswers = (postId) => async (dispatch) => {
  try {

    const q = query(
        collection(db, "answers"),
        where("post_id", "==", postId)
    );
    const querySnapshot = await getDocs(q);
    const answersData = querySnapshot.docs.map((doc) => doc.data());
    dispatch({
        type: GET_ANSWERS,
        payload: answersData,
    });
  } catch (err) {
    dispatch({
      type: ANSWER_ERROR,
      payload: { msg: err, status: 'Error' },
    });
  }
};

// Add Answer
export const addAnswer = (postId, postTags, formData, authUser) => async (dispatch) => {
  try {
    const {text} = formData;

    const newAnswerRef = doc(collection(db, "answers"));
    const newAnswerData = {
        body: text,
        created_at: (new Date()).toISOString(),
        gravatar: `https://secure.gravatar.com/avatar/${Math.floor(Math.random()*100)+1}?s=164&d=identicon`,
        id: newAnswerRef.id,
        post_id: postId,
        user_id: authUser.id,
        username: authUser.username
    }
    await setDoc(newAnswerRef, newAnswerData);

    console.log('addAnswer successfully!! answer id = ', newAnswerRef.id);
    dispatch({
      type: ADD_ANSWER,
      payload: newAnswerData,
    });

    dispatch(setAlert('Add new answer', "success"));

    dispatch(updateUserScores({
        user: authUser,
        tags: postTags.map(tag => tag.tagname),
        type: 'BY_ANSWER'
    }));

    dispatch(getAnswers(postId));
  } catch (err) {
    dispatch(setAlert(err.response.data.message, "danger"));

    dispatch({
      type: ANSWER_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Delete Answer
export const deleteAnswer = (AnswerId) => async (dispatch) => {
  try {
    const res = await deleteSingleAnswer(AnswerId);

    dispatch({
      type: DELETE_ANSWER,
      payload: AnswerId,
    });

    dispatch(setAlert(res.data.message, "success"));
  } catch (err) {
    dispatch(setAlert(err.response.data.message, "danger"));

    dispatch({
      type: ANSWER_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};
