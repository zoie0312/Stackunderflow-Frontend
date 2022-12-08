import React from "react";

import TagBadge from "../../../components/molecules/TagBadge/TagBadge.component";

import "./UserActivity.styles.scss";

const UserActivity = ({ user }) => {
    const { scores } = user;
    const scoreArray = Object.keys(scores).map((key) => {
        const temp = {};
        temp[key] = scores[key];
        return temp;
    });
    scoreArray.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

    return (
        <div className="grid-cell2">
            <div className="top-tags">
                <h3 className="fw-bold fc-dark bc-black-3">Top Categories</h3>
                <div className="top-tags-sec">
                    {scoreArray.slice(0, 5).map((score) => (
                        <div className="top-tags-cells">
                            <div className="top-cell">
                                <div className="tag-cell bg-black-025">
                                    <TagBadge
                                        tag_name={Object.keys(score)[0]}
                                        size={"s-tag s-tag__lg"}
                                        float={"left"}
                                    />
                                    <div className="score">
                                        <div className="score-txt">
                                            <div className="score-tab">
                                                <span className="number fc-black-800">
                                                    {
                                                        scores[
                                                            Object.keys(
                                                                score
                                                            )[0]
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserActivity;
