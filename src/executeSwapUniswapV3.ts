
import { SwapContract, IERC20Metadata } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

const MAINNET = false;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.LOCALHOST_JSONRPC_ENDPOINT;

const provider = new ethers.JsonRpcProvider(DOMAIN);

// Main function to execute the script
export async function executeSwapUniswapV3(swapContractAddress: string) {
    const signer = await provider.getSigner();
    let walletAddress = await signer.getAddress();

    // Get the FlashLoan contract instance
    const swapContract: SwapContract = await ethers.getContractAt('SwapContract', swapContractAddress, signer);
    console.log(`SwapContract fetched at address: ${swapContractAddress}`);
    
    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals)

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // get swapRouter address
    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const poolFee = 3000;

    // Get LINK Balance of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    // Approve spending of WETH
    let approveTx = await WEth.approve(swapRouterAddress, ethers.MaxUint256);
    await approveTx.wait(); // Wait for the transaction to be mined

    console.log(`Approved WETH spending: ${JSON.stringify(await approveTx.getTransaction(), replacer, 4)}`)

    // Do the SwapSingle of 1 WETH for LINK
    let amountToSwap = ethers.parseEther("1") / ethers.getBigInt(1);
    let tx = await swapContract.swapSingle(WEthAddress, LinkAddress, swapRouterAddress, amountToSwap, poolFee);
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`Swap transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    // Get Balances of the swapContract
    let balanceAfterWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals)
    let balanceAfterLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    console.log(`WETH Amount Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
    console.log(`LINK Amount Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
}

const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
