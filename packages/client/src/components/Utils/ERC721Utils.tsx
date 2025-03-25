import { useEffect, useState } from "react";
import { useMUD } from "../../MUDContext";
import { parseAbi } from "viem";
import { numToEntityID } from "../rightPart/index";
import { getComponentValue } from "@latticexyz/recs";


const erc721Abi = parseAbi([
    "function balanceOf(address owner) external view returns (uint256 balance)"
]);

const chainToContract: Record<number, `0x${string}`> = {
    2818: "0xf6e9932469CBde5dB4b9293330Ff1897Bb43b2AE",
    31337: "0xf6e9932469CBde5dB4b9293330Ff1897Bb43b2AE",
};

export const useERC721Balance = (chainId: number, userAddress?: `0x${string}`) => {
    const [balance, setBalance] = useState(0);

    const {
        network: { publicClient },
    } = useMUD();
    
    useEffect(() => {
        const fetchBalance = async () => {
            
            try {
                const result = await publicClient.readContract({
                    address: chainToContract[chainId],
                    abi: erc721Abi,
                    functionName: "balanceOf",
                    args: [userAddress],
                });
                setBalance(Number(result));
            } catch (error) {
                console.error("Error fetching ERC721 balance:", error);
                setBalance(0);
            }
        };
        
        if (!chainToContract[chainId] || !userAddress) {
            setBalance(0);
            return
        }

        fetchBalance();
    }, [chainId, userAddress, publicClient]);

    return balance;
};


export const useNFTDiscount = (chainId: number, userAddress?: `0x${string}`) => {
    const NFTBalance = useERC721Balance(chainId, userAddress);
    const [discount, setDiscount] = useState(0);
    const {
        components: {
            NFTToTokenDiscount
        }
    } = useMUD();
    
    useEffect(() => {
        if(!userAddress || !NFTToTokenDiscount || NFTBalance === 0){
            setDiscount(0);
            return;
        }

        let discountData;
        const maxDiscount = Number(getComponentValue(NFTToTokenDiscount, numToEntityID(0))?.discount)
        if(NFTBalance > maxDiscount){
            discountData = getComponentValue(NFTToTokenDiscount, numToEntityID(maxDiscount));
        }else{
            discountData = getComponentValue(NFTToTokenDiscount, numToEntityID(NFTBalance));
        }
        
        if (discountData && Number(discountData.discount) > 0) {
            setDiscount(Number(discountData.discount));
        }else{
            setDiscount(0);
        }
    }, [NFTBalance, userAddress, NFTToTokenDiscount])

    return discount;
};


