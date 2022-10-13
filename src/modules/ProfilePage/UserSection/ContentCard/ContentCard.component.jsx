import React, { useEffect, useState } from "react";
import moment from "moment";
import { NFTStorage, File } from 'nft.storage';
import html2canvas from 'html2canvas';
import { 
    useContractWrite,
    usePrepareContractWrite,
    useContractRead,
    useAccount,
    useContractEvent 
} from "wagmi";
import { ethers } from 'ethers';

import "./ContentCard.styles.scss";
import { StackunderflowNftABI, StackunderflowNftContractAddress } from "../../../../abi/StackunderflowNft";

const scores = {
    css: 5,
    python: 4,
    react: 10,
    jquery: 2,
    sql: 1,
    javascript: 15,
    reactnative: 10
}

const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGRiODQ4QmE5NWZmN0ZCYmY1OWYxN0RhYkM2ODg2MDVmMjlkNEYzNjgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTEyMjI4MTQ0NSwibmFtZSI6IlN0YWNrdW5kZXJmbG93In0.pZ3RMnkFG8tFwR1HqXHbTaPncjn-vMLCWtqColY96JE';
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const ContentCard = ({
    username,
    answers_count,
    posts_count,
    comments_count,
    tags_count,
    created_at,
}) => {
    const [metadataUri, setMetadataUri] = useState('');
    const [readToMint, setReadyToMint] = useState(false);
    const [isSendingScore, setIsSendingScore] = useState(false);
    const { isConnected, address } = useAccount();
    if (isConnected) {
        console.log('wallet connected ', address);
    }else {
        console.log('wallet not connected');
    }
    const { config } = usePrepareContractWrite({
        addressOrName: StackunderflowNftContractAddress,
        contractInterface: StackunderflowNftABI,
        functionName: "mintNFT",
        args: [address, metadataUri],
        chainId: 5,
        overrides: {
            value: ethers.utils.parseUnits('1', 'gwei')
        }
    });
    const { write: doMintNFT } = useContractWrite(config);
    // const { data: balance, refetch  } = useContractRead({
    //     addressOrName: StackunderflowNftContractAddress,
    //     contractInterface: StackunderflowNftABI,
    //     functionName: "balanceOf",
    //     args: [address]
    // });
    // const noOfNFT = balance ? ethers.utils.formatUnits(balance, 0) : '0';

    useEffect(() => {
        const wordCloudCtr = document.getElementsByClassName("wordCloud-container")[0];
        const scoreText = Object.keys(scores).reduce((acc, key) => {
            const times = scores[key];
            let str = "";
            for (let i=0; i<times; i++){
                str += key.toString();
                str += " ";
            }
            return acc + str;
        },"");

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
    }, []);
    
    const onIPFSStoringClick = async () => {
        setIsSendingScore(true);
        const mainBar = document.getElementById('mainbar');
        console.log("screenshooting user profile and score word-cloud then send to IPFS ");
        
        const userCanvas = await html2canvas(mainBar);
        const userBlob = await new Promise(resolve => userCanvas.toBlob(resolve));
        const userFile = new File([ userBlob ], 'user_score_proof.png', { type: 'image/png' });
        const userScoreCid = await client.storeDirectory([userFile]); //for directly storing file(s) in IPFS
        console.log('ipfs user profile cid ', userScoreCid);
        
        const wordCloudTarget = document.querySelector('.wordCloud-container');
        const wordCloudCanvas = await html2canvas(wordCloudTarget);
        const wordCloudBlob = await new Promise(resolve => wordCloudCanvas.toBlob(resolve));
        const wordCloudFile = new File([ wordCloudBlob ], 'user_word_cloud.png', { type: 'image/png' });
        const wordCloudMetadata = await client.store({
            name: 'user_score NFT',
            description: 'test user score NFT',
            image: wordCloudFile
        }); 
        console.log('ipfs user score NFT metadata ', wordCloudMetadata);
        setMetadataUri(wordCloudMetadata.url);
        setReadyToMint(true);
        setIsSendingScore(false);
    };
    
    
    const onMintClick = () => {
        console.log("gonig to mint NFT");
        if (metadataUri) {
            doMintNFT();
            setMetadataUri('');
            setReadyToMint(false);
        }
    }

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
                    <button className={`s-btn s-btn__filled ${isSendingScore ? 'is-loading' : ''}`} type="button" onClick={onIPFSStoringClick}>Send score proof to IPFS</button>
                    <button className="s-btn s-btn__filled" type="button" disabled={!readToMint} onClick={onMintClick}>Mint a score NFT</button>
                </div>
            </div>
        </div>
    );
};

export default ContentCard;
