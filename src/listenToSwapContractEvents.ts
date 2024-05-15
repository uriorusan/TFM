import { ethers } from "hardhat";
import { SwapContract } from "../typechain-types";


export async function listenToSwapContractEvents(swapContractAddress: string) {
    let provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_JSONRPC_ENDPOINT);
    let signer = await provider.getSigner();

    const contract: SwapContract = await ethers.getContractAt("SwapContract", swapContractAddress, signer);

    console.log(`Listening to SwapContract events at address: ${swapContractAddress}`);

    // Listen for the SwapInitiated event
    contract.on(contract.getEvent("SwapInitiated"), (params) => {
        /*
         tokenIn: _tokenIn,
        tokenOut: _tokenOut,
        fee: _poolFee,
        recipient: msg.sender,
        deadline: block.timestamp,
        amountIn: _amount,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
        */
        console.log(`EVENT! Swap from ${params.tokenIn} to ${params.tokenOut} initiated, ${params.amountIn} in, sent to ${params.recipient}`);
    });

}