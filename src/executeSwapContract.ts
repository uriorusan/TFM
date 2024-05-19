
import { SwapContract, IERC20Metadata } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

export async function executeSwapContractUni(swapContractAddress: string) {
    console.log(`Will execute a Swap in UniV3 using the contract: ${swapContractAddress}`)
    const signer = await ethers.provider.getSigner();
    let walletAddress = await signer.getAddress();

    console.log(`Will execute transactions from wallet: ${walletAddress}`)

    // Get the FlashLoan contract instance
    const swapContract: SwapContract = await ethers.getContractAt('SwapContract', swapContractAddress, signer);
    console.log(`SwapContract fetched at address: ${swapContractAddress}`);

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeWETH = Number(await WEth.balanceOf(swapContractAddress)) / Number(WEthDecimals)

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // get swapRouter address
    const swapRouterAddressUniswap = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // uniswap
    const swapRouterAddressPancakeswap = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
    let poolFeeUni = 3000;
    let poolFeePancake = 2500;

    // Get LINK Balance of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    // Approve spending of WETH
    let amountToSwap = ethers.parseEther("1");
    let approveTx = await WEth.approve(swapContractAddress, amountToSwap);
    await approveTx.wait(); // Wait for the transaction to be mined

    // Do the SwapSingle of 1 WETH for LINK
    console.log(`Swapping ${amountToSwap} WETH for LINK`);
    let tx = await swapContract.swapSingle(WEthAddress, LinkAddress, swapRouterAddressUniswap, amountToSwap, poolFeeUni);
    await tx.wait(); // Wait for the transaction to be mined

    // console.log(`Swap transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    console.log(`WETH on the SwapContract: ${Number(await WEth.balanceOf(swapContractAddress)) / Number(WEthDecimals)}`)

    // Get Balances of the swapContract
    let balanceAfterWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals)
    let balanceAfterLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    console.log(`WETH swapContract Amount Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
    console.log(`LINK Wallet Amount Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
}

export async function executeSwapContractPancake(swapContractAddress: string) {
    console.log(`Will execute a Swap in PancakeV3 using the contract: ${swapContractAddress}`)
    const signer = await ethers.provider.getSigner();
    let walletAddress = await signer.getAddress();

    console.log(`Will execute transactions from wallet: ${walletAddress}`)

    // Get the FlashLoan contract instance
    const swapContract: SwapContract = await ethers.getContractAt('SwapContract', swapContractAddress, signer);
    console.log(`SwapContract fetched at address: ${swapContractAddress}`);

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeWETH = Number(await WEth.balanceOf(swapContractAddress)) / Number(WEthDecimals)

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // get swapRouter address
    const swapRouterAddressPancakeswap = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
    let poolFeePancake = 2500;

    // Get LINK Balance of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    // Approve spending of WETH
    let amountToSwap = ethers.parseEther("1");
    let approveTx = await WEth.approve(swapContractAddress, amountToSwap);
    await approveTx.wait(); // Wait for the transaction to be mined

    // Do the SwapSingle of 1 WETH for LINK
    console.log(`Swapping ${amountToSwap} WETH for LINK`);
    let tx = await swapContract.swapSingle(WEthAddress, LinkAddress, swapRouterAddressPancakeswap, amountToSwap, poolFeePancake);
    await tx.wait(); // Wait for the transaction to be mined

    // console.log(`Swap transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    console.log(`WETH on the SwapContract: ${Number(await WEth.balanceOf(swapContractAddress)) / Number(WEthDecimals)}`)

    // Get Balances of the swapContract
    let balanceAfterWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals)
    let balanceAfterLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    console.log(`WETH swapContract Amount Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
    console.log(`LINK Wallet Amount Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
}

const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
