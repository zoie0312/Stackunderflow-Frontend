import { useContractWrite } from "wagmi";
import {
    StackunderflowSoulAddress,
    StackunderflowSoulABI,
} from "./../contract/StackunderflowSoul";

const useNFTMint = (metadataURI) => {
    const { writeAsync, status, data } = useContractWrite({
        mode: "recklesslyUnprepared",
        addressOrName: StackunderflowSoulAddress,
        contractInterface: StackunderflowSoulABI,
        functionName: "mint",
        args: [metadataURI.toString()],
    });

    return {
        mint: writeAsync,
        status,
        data,
    };
};

export default useNFTMint;
