
import { IUniswapV2Router02, IERC20Metadata, ISwapRouter } from '../../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";


export async function executeSwapUniswapV3() {
    console.log(`Will execute a Swap to UniswapV3 SwapRouter from wallet.`)
    const signer = await ethers.provider.getSigner();
    let walletAddress = await signer.getAddress();

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals);

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // get swapRouter contract
    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const poolFee = 3000;
    const swapRouter: ISwapRouter = await ethers.getContractAt('ISwapRouter', swapRouterAddress, signer);

    // Get LINK Balance of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    // Approve spending of WETH
    let approveTx = await WEth.approve(swapRouterAddress, ethers.MaxUint256);
    await approveTx.wait(); // Wait for the transaction to be mined

    console.log(`Approved WETH spending of ISwapRouter at address ${swapRouterAddress}.`)

    // Do the SwapSingle of 1 WETH for LINK
    let amountToSwap = ethers.parseEther("1") / ethers.getBigInt(1);
    console.log(`Swapping ${amountToSwap} WETH for LINK`);

    let params = {
        tokenIn: WEthAddress,
        tokenOut: LinkAddress,
        fee: poolFee,
        recipient: walletAddress,
        deadline: ethers.MaxUint256,
        amountIn: amountToSwap,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    } satisfies ISwapRouter.ExactInputSingleParamsStruct;

    let tx = await swapRouter.exactInputSingle(params);
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`Swap transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    // Get Balances of the swapContract
    let balanceAfterWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals)
    let balanceAfterLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    console.log(`WETH Amount of the wallet Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
    console.log(`LINK Amount of the wallet Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
}


export async function executeSwapUniswapV2() {
    console.log(`Will execute a Swap to UniswapV2 SwapRouter from wallet.`)
    const signer = await ethers.provider.getSigner();
    let walletAddress = await signer.getAddress();

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals);

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // get swapRouter contract
    const swapRouterV2Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02
    const swapRouter: IUniswapV2Router02 = await ethers.getContractAt('IUniswapV2Router02', swapRouterV2Address, signer);

    // Get LINK Balance of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    // Approve spending of WETH
    let approveTx = await WEth.approve(swapRouterV2Address, ethers.MaxUint256);
    await approveTx.wait(); // Wait for the transaction to be mined

    console.log(`Approved WETH spending of UniswapV2Router02 at address ${swapRouterV2Address}.`)

    // Do the SwapSingle of 1 WETH for LINK
    let amountToSwap = ethers.parseEther("1") / ethers.getBigInt(1);
    console.log(`Swapping ${amountToSwap} WETH for LINK on UniV2`);

    let timestamp = (await ethers.provider.getBlock('latest'))?.timestamp || 0;
    console.log(`Current timestamp: ${timestamp}`);

    let tx = await swapRouter.swapExactTokensForTokens(amountToSwap, 0, [WEthAddress, LinkAddress], walletAddress, ethers.getBigInt(timestamp + 100));
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`Swap transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    // Get Balances of the swapContract
    let balanceAfterWETH = Number(await WEth.balanceOf(walletAddress)) / Number(WEthDecimals)
    let balanceAfterLink = Number(await Link.balanceOf(walletAddress)) / Number(LinkDecimals)

    console.log(`WETH Amount of the wallet Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
    console.log(`LINK Amount of the wallet Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
}

const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
