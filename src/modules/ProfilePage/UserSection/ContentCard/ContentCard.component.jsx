import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { NFTStorage, File } from "nft.storage";
import html2canvas from "html2canvas";
import { useAccount } from "wagmi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useParams } from "react-router-dom";

import "./ContentCard.styles.scss";
import useNextTokenId from "../../../../hooks/useNextTokenId";
import useNFTMint from "../../../../hooks/useNFTMint";
import useNFTBalance from "../../../../hooks/useNFTBalance";
import useUpdateNFT from "../../../../hooks/useUpdateNFT";
import { ReactComponent as EditLogo } from "../../../../assets/Edit.svg";
import { updateUsername } from "../../../../redux/users/users.actions";

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
    auth,
    updateUsername,
}) => {
    const [metadataUri, setMetadataUri] = useState("");
    const [readyToUpdate, setReadyToUpdate] = useState(false);
    const [isSendingScore, setIsSendingScore] = useState(false);
    const [open, setOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const { nextTokenId } = useNextTokenId();
    const { balance } = useNFTBalance();
    const { mint: mintNFT } = useNFTMint(metadataUri);
    const { updateUserNFT, status: updateStatus } = useUpdateNFT(metadataUri);
    const { isConnected, address } = useAccount();
    if (isConnected) {
        console.log("wallet connected ", address);
    } else {
        console.log("wallet not connected");
    }
    //console.log("nextTokenId: ", nextTokenId);

    const { id: userId } = useParams();
    const editable =
        auth && auth.isAuthenticated && auth.user && auth.user.id === userId;

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
        // console.log(
        //     "screenshooting score word-cloud then send to IPFS "
        // );

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
        //console.log("ipfs user score NFT metadata ", wordCloudMetadata);
        setMetadataUri(wordCloudMetadata.url);
        setReadyToUpdate(true);
        setIsSendingScore(false);
    };

    const onMintClick = () => {
        if (metadataUri) {
            mintNFT();
            setMetadataUri("");
            setReadyToUpdate(false);
        }
    };

    const onUpdateClick = () => {
        if (metadataUri) {
            updateUserNFT();
            setMetadataUri("");
            setReadyToUpdate(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const onSaveClick = () => {
        updateUsername({ user: auth.user, newName: userInput });
        setOpen(false);
        setUserInput("");
    };
    const onCancelClick = () => {
        setOpen(false);
    };
    const handleChange = (e) => {
        setUserInput(e.target.value);
    };

    return (
        <div className="content-card">
            <div className="content-grid">
                <div className="info-cell">
                    <div className="info">
                        <div className="details">
                            <h2>{username}</h2>
                            <button
                                type="button"
                                className="s-btn p0 ml6"
                                data-action="s-modal#show"
                                onClick={handleOpen}
                                disabled={!editable}
                            >
                                <EditLogo className="edit" />
                            </button>
                        </div>
                        <div>
                            <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: 300,
                                        bgcolor: "background.paper",
                                        border: "2px solid #000",
                                        boxShadow: 24,
                                        p: 4,
                                        color: "black",
                                    }}
                                >
                                    <Typography
                                        id="modal-modal-title"
                                        variant="h6"
                                        component="h2"
                                    >
                                        Update Username
                                    </Typography>
                                    <TextField
                                        //ref={inputRef}
                                        margin="normal"
                                        placeholder={username}
                                        helperText="please enter name"
                                        value={userInput}
                                        onChange={handleChange}
                                    />
                                    <Stack mt={4} spacing="2" direction="row">
                                        <Button
                                            variant="text"
                                            onClick={onSaveClick}
                                        >
                                            Save Change
                                        </Button>
                                        <Button
                                            variant="text"
                                            onClick={onCancelClick}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Box>
                            </Modal>
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
                        disabled={!editable}
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

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, { updateUsername })(ContentCard);
