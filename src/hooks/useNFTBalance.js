import {
    StackunderflowSoulAddress,
    StackunderflowSoulABI,
} from "./../contract/StackunderflowSoul";
import { useContractRead, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { utils } from "ethers";

const useNFTBalance = () => {
    const [balance, setBalance] = useState("");
    const { address } = useAccount();
    const { data: _balance } = useContractRead({
        addressOrName: StackunderflowSoulAddress,
        contractInterface: StackunderflowSoulABI,
        functionName: "balanceOf",
        args: [address],
        watch: true,
    });

    useEffect(() => {
        if (_balance) {
            setBalance(utils.formatUnits(_balance, 0));
        }
    }, [_balance]);

    return {
        balance,
    };
};

export default useNFTBalance;
