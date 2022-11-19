import {
    StackunderflowSoulAddress,
    StackunderflowSoulABI,
} from "./../contract/StackunderflowSoul";
import { useContractRead } from "wagmi";
import { useEffect, useState } from "react";
import { utils } from "ethers";

const useNextTokenId = () => {
    const [nextTokenId, setNextTokenId] = useState(0);
    const { data: _tokenId } = useContractRead({
        addressOrName: StackunderflowSoulAddress,
        contractInterface: StackunderflowSoulABI,
        functionName: "getNextTokenId",
        args: [],
        watch: true,
    });

    useEffect(() => {
        if (_tokenId) {
            setNextTokenId(utils.formatUnits(_tokenId, 0));
        }
    }, [_tokenId]);

    return {
        nextTokenId,
    };
};

export default useNextTokenId;
