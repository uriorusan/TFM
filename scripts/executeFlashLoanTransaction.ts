
import { FlashLoanV3, IERC20Metadata, IPool, IPoolAddressesProvider, WrappedTokenGatewayV3, IAToken } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

const MAINNET = false;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.LOCALHOST_JSONRPC_ENDPOINT;

const provider = new ethers.JsonRpcProvider(DOMAIN);

// Main function to execute the script
async function main() {
    const signer = await provider.getSigner();

    // Get the FlashLoan contract instance
    const flashLoanContractAddress = "0x8CeA85eC7f3D314c4d144e34F2206C8Ac0bbadA1"; // Local deployment
    const flashLoanContract: FlashLoanV3 = await ethers.getContractAt('FlashLoanV3', flashLoanContractAddress, signer);

    // Get the Uniswap router instance
    const wEthGatewayAddress = AaveV3Ethereum.WETH_GATEWAY;
    const wEthGateway: WrappedTokenGatewayV3 = await ethers.getContractAt('WrappedTokenGatewayV3', wEthGatewayAddress, signer);
    
    // Get the Link token instance
    const linkTokenAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING;
    const linkToken: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', linkTokenAddress, signer);
    const linkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await linkToken.decimals());

    // Get wEth token instance
    const aWEthAddress = AaveV3Ethereum.ASSETS.WETH.A_TOKEN;
    const aWEth: IAToken = await ethers.getContractAt('IAToken', aWEthAddress, signer);

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING;
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Setup for Aave interactions. We need to get some aLink tokens to use as collateral
    const poolAddressesProviderAddress = AaveV3Ethereum.POOL_ADDRESSES_PROVIDER;
    const poolAddressesProvider: IPoolAddressesProvider = await ethers.getContractAt("IPoolAddressesProvider", poolAddressesProviderAddress, signer);
    const poolAddress = await poolAddressesProvider.getPool();
    const pool: IPool = await ethers.getContractAt("IPool", poolAddress, signer);

    // Get some wEth:
    const amountEthToSwap = ethers.parseEther("1"); 

    // Swap ETH for aWEth
    let tx = await wEthGateway.depositETH(poolAddress, signer.address, 0, { value: amountEthToSwap });
    await tx.wait();
    console.log(`Swapped 1 ETH for aWEth`);

    // Get Balances of the flashLoanContract
    let aWEthbalanceBefore = ethers.getBigInt(await aWEth.balanceOf(signer.address)) / WEthDecimals

    // Withdraw WETH with the aWETH
    console.log(`Withdrawing WETH...`);
    tx = await pool.withdraw(WEthAddress, amountEthToSwap, flashLoanContractAddress);
    await tx.wait();

    let aWethBalanceAfter = ethers.getBigInt(await aWEth.balanceOf(signer.address)) / WEthDecimals

    console.log(`aWETH Amount Before: ${aWEthbalanceBefore}, aWETH Amount After: ${aWethBalanceAfter}`);

    let balanceBeforeWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)

    // Do the FlashLoan of the WETH
    let amountToFlashLoan = amountEthToSwap / ethers.getBigInt(1);
    tx = await flashLoanContract.requestFlashLoan(WEthAddress, amountToFlashLoan);
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`FlashLoan transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    // Get Balances of the flashLoanContract
    let balanceAfterWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)

    console.log(`WETH Amount Before: ${balanceBeforeWETH}, WETH Amount After FlashLoan: ${balanceAfterWETH}`);
}

main().catch(console.error).finally(() => process.exit(0));

const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
