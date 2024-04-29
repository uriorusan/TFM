
import { FlashLoanV3, IERC20Metadata, IPool, IPoolAddressesProvider, WrappedTokenGatewayV3, IAToken } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

const MAINNET = false;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.LOCALHOST_JSONRPC_ENDPOINT;

const provider = new ethers.JsonRpcProvider(DOMAIN);

// Main function to execute the script
export async function executeSimpleFlashLoan(flashLoanContractAddress: string) {
    const signer = await provider.getSigner();

    // Get the FlashLoan contract instance
    const flashLoanContract: FlashLoanV3 = await ethers.getContractAt('FlashLoanV3', flashLoanContractAddress, signer);

    // Get the Uniswap router instance
    const wEthGatewayAddress = AaveV3Ethereum.WETH_GATEWAY;
    const wEthGateway: WrappedTokenGatewayV3 = await ethers.getContractAt('WrappedTokenGatewayV3', wEthGatewayAddress, signer);

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
    console.log(`Deposited 1 ETH into the wrapped ETH gateway AAVE Pool`);

    // Withdraw WETH with the aWETH
    console.log(`Withdrawing WETH from the wrapped ETH gateway AAVE Pool`);
    tx = await pool.withdraw(WEthAddress, amountEthToSwap, flashLoanContractAddress);
    await tx.wait();

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

const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
