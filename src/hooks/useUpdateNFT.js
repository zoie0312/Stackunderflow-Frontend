import { useContractWrite } from "wagmi";
import {
    StackunderflowSoulAddress,
    StackunderflowSoulABI,
} from "./../contract/StackunderflowSoul";

const useUpdateNFT = (metadataURI) => {
    const { writeAsync, status, data } = useContractWrite({
        mode: "recklesslyUnprepared",
        addressOrName: StackunderflowSoulAddress,
        contractInterface: StackunderflowSoulABI,
        functionName: "updateUserNFT",
        args: [metadataURI.toString()],
    });

    return {
        updateUserNFT: writeAsync,
        status,
        data,
    };
};

export default useUpdateNFT;
