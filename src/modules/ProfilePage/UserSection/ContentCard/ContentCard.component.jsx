import React, { useEffect, useState } from "react";
import moment from "moment";
import { NFTStorage, File } from "nft.storage";
import html2canvas from "html2canvas";
import { useAccount } from "wagmi";

import "./ContentCard.styles.scss";
import useNextTokenId from "../../../../hooks/useNextTokenId";
import useNFTMint from "../../../../hooks/useNFTMint";
import useNFTBalance from "../../../../hooks/useNFTBalance";
import useUpdateNFT from "../../../../hooks/useUpdateNFT";

// const scores = {
//     css: 5,
//     python: 4,
//     react: 10,
//     jquery: 2,
//     sql: 1,
//     javascript: 15,
//     reactnative: 10,
// };

const client = new NFTStorage({
    token: String(process.env.REACT_APP_NFT_STORAGE_API_KEY),
});

const composeMetadata = (imageFile, scoresObj, tokenId) => {
    let attributes = [];
    if (scoresObj && Object.keys(scoresObj).length > 0) {
        Object.keys(scoresObj).forEach((key) => {
            attributes.push({
                trait_type: key,
                value: scoresObj[key],
            });
        });
    }

    return {
        name: "Stackunderflow NFT",
        description:
            "Stackunderflow NFT is used to represent one's technical credibility in a decentralized manner.",
        image: imageFile,
        attributes,
    };
};

const ContentCard = ({
    username,
    answers_count,
    posts_count,
    comments_count,
    tags_count,
    created_at,
    id,
    scores,
}) => {
    const [metadataUri, setMetadataUri] = useState("");
    const [readyToUpdate, setReadyToUpdate] = useState(false);
    const [isSendingScore, setIsSendingScore] = useState(false);
    const { nextTokenId } = useNextTokenId();
    const { balance } = useNFTBalance();
    const { mint: mintNFT, status: mintStatus, data } = useNFTMint(metadataUri);
    const { updateUserNFT, status: updateStatus } = useUpdateNFT(metadataUri);
    const { isConnected, address } = useAccount();
    if (isConnected) {
        console.log("wallet connected ", address);
    } else {
        console.log("wallet not connected");
    }
    console.log("nextTokenId: ", nextTokenId);

    useEffect(() => {
        const wordCloudCtr = document.getElementsByClassName(
            "wordCloud-container"
        )[0];
        if (scores && Object.keys(scores).length > 0) {
            const scoreText = Object.keys(scores).reduce((acc, key) => {
                const times = scores[key];
                let str = "";
                for (let i = 0; i < times; i++) {
                    str += key.toString();
                    str += " ";
                }
                return acc + str;
            }, "");

            fetch(
                `https://quickchart.io/wordcloud?width=200&height=200&rotation=0&backgroundColor=white&text=${scoreText}`
            )
                .then(function (response) {
                    wordCloudCtr.innerHTML = "";
                    return response.text();
                })
                .then(function (myText) {
                    console.log(myText);
                    wordCloudCtr.innerHTML += myText;
                });
        } else {
            wordCloudCtr.innerHTML = "";
        }
    }, [scores, id]);

    const onIPFSStoringClick = async () => {
        setIsSendingScore(true);
        const mainBar = document.getElementById("mainbar");
        console.log(
            "screenshooting user profile and score word-cloud then send to IPFS "
        );

        const userCanvas = await html2canvas(mainBar);
        const userBlob = await new Promise((resolve) =>
            userCanvas.toBlob(resolve)
        );
        const userFile = new File([userBlob], "user_score_proof.png", {
            type: "image/png",
        });
        const userScoreCid = await client.storeDirectory([userFile]); //for directly storing file(s) in IPFS
        console.log("ipfs user profile cid ", userScoreCid);

        const wordCloudTarget = document.querySelector(".wordCloud-container");
        const wordCloudCanvas = await html2canvas(wordCloudTarget);
        const wordCloudBlob = await new Promise((resolve) =>
            wordCloudCanvas.toBlob(resolve)
        );
        const wordCloudFile = new File([wordCloudBlob], "user_word_cloud.png", {
            type: "image/png",
        });
        const metadata = composeMetadata(wordCloudFile, scores, nextTokenId);
        const wordCloudMetadata = await client.store(metadata);
        console.log("ipfs user score NFT metadata ", wordCloudMetadata);
        setMetadataUri(wordCloudMetadata.url);
        setReadyToUpdate(true);
        setIsSendingScore(false);
    };

    const onMintClick = () => {
        console.log("gonig to mint NFT");
        if (metadataUri) {
            mintNFT();
            setMetadataUri("");
            setReadyToUpdate(false);
        }
    };

    const onUpdateClick = () => {
        console.log("gonig to update NFT");
        if (metadataUri) {
            updateUserNFT();
            setMetadataUri("");
            setReadyToUpdate(false);
        }
    };

    return (
        <div className="content-card">
            <div className="content-grid">
                <div className="info-cell">
                    <div className="info">
                        <div className="details">
                            <h2>{username}</h2>
                        </div>
                        <div className="date">
                            <p>
                                user created &nbsp;-&nbsp;
                                {moment(created_at).fromNow(false)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="stats-cell">
                    <div className="count-sec">
                        <div className="counts">
                            <div className="cells">
                                <div className="column-grid">
                                    <div className="head fc-black-700">
                                        {answers_count}
                                    </div>
                                    <div className="foot fc-black-500">
                                        answers
                                    </div>
                                </div>
                            </div>
                            <div className="cells">
                                <div className="column-grid">
                                    <div className="head fc-black-700">
                                        {posts_count}
                                    </div>
                                    <div className="foot fc-black-500">
                                        questions
                                    </div>
                                </div>
                            </div>
                            <div className="cells">
                                <div className="column-grid">
                                    <div className="head fc-black-700">
                                        {comments_count}
                                    </div>
                                    <div className="foot fc-black-500">
                                        comments
                                    </div>
                                </div>
                            </div>
                            <div className="cells">
                                <div className="column-grid">
                                    <div className="head fc-black-700">
                                        {tags_count}
                                    </div>
                                    <div className="foot fc-black-500">
                                        tags
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nft-area">
                <div className="wordCloud-container"></div>
                <div className="mint-container">
                    <button
                        className={`s-btn s-btn__filled ${
                            isSendingScore ? "is-loading" : ""
                        }`}
                        type="button"
                        onClick={onIPFSStoringClick}
                    >
                        Send score proof to IPFS
                    </button>
                    {balance > 0 ? (
                        <button
                            className="s-btn s-btn__filled"
                            type="button"
                            disabled={!readyToUpdate}
                            onClick={onUpdateClick}
                        >
                            update NFT score
                        </button>
                    ) : (
                        <button
                            className="s-btn s-btn__filled"
                            type="button"
                            disabled={!readyToUpdate}
                            onClick={onMintClick}
                        >
                            Mint score NFT
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentCard;
