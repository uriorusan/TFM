import { ethers } from "hardhat";
import { SwapContract } from "../typechain-types";


export async function listenToSwapContractEvents(swapContractAddress: string) {
    let provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_JSONRPC_ENDPOINT);
    let signer = await provider.getSigner();

    const contract: SwapContract = await ethers.getContractAt("SwapContract", swapContractAddress, signer);

    console.log(`Listening to SwapContract events at address: ${swapContractAddress}`);

    // Listen for the SwapInitiated event
    contract.on(contract.getEvent("SwapInitiated"), (tokenIn, tokenOut, amountIn, amountOut, event) => {
        console.log(`Swap from ${tokenIn} to ${tokenOut} initiated, ${amountIn} in, ${amountOut} out`);
    });

    console.log(`Added ${await contract.listenerCount("SwapInitiated")} event listener`);

    // Listen for OwnershipTransferred events
    contract.on(contract.getEvent("OwnershipTransferred"), (previousOwner, newOwner) => {
        console.log(`Ownership transferred from ${previousOwner} to ${newOwner}`);
    });

    // Listen for ApprovalSet events
    contract.on(contract.getEvent("ApprovalSet"), (tokenIn, tokenOut, amountIn, amountOut, event) => {
        console.log(`Swap from ${tokenIn} to ${tokenOut} completed, ${amountIn} in, ${amountOut} out`);
    });

    // Listen for TransferPerformed events
    contract.on(contract.getEvent("TransferPerformed"), (tokenIn, tokenOut, amountIn, amountOut, event) => {
        console.log(`Swap from ${tokenIn} to ${tokenOut} completed, ${amountIn} in, ${amountOut} out`);
    });

    console.log(`Added ${await contract.listenerCount("ApprovalSet")} event listener`);

}