
import { FlashLoanV3, IERC20Metadata, IPool, IPoolAddressesProvider, WrappedTokenGatewayV3, IAToken } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

const MAINNET = false;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.LOCALHOST_JSONRPC_ENDPOINT;

const provider = new ethers.JsonRpcProvider(DOMAIN);

// Main function to execute the script
export async function wrapEth(amountEthToSwap: string, destinationAddress: string) {
    const signer = await provider.getSigner();

    // Get the Uniswap router instance
    const wEthGatewayAddress = AaveV3Ethereum.WETH_GATEWAY;
    const wEthGateway: WrappedTokenGatewayV3 = await ethers.getContractAt('WrappedTokenGatewayV3', wEthGatewayAddress, signer);

    // Get wEth token instance
    const aWEthAddress = AaveV3Ethereum.ASSETS.WETH.A_TOKEN;

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING;
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Setup for Aave interactions. We need to get some aLink tokens to use as collateral
    const poolAddressesProviderAddress = AaveV3Ethereum.POOL_ADDRESSES_PROVIDER;
    const poolAddressesProvider: IPoolAddressesProvider = await ethers.getContractAt("IPoolAddressesProvider", poolAddressesProviderAddress, signer);
    const poolAddress = await poolAddressesProvider.getPool();
    const pool: IPool = await ethers.getContractAt("IPool", poolAddress, signer);

    // Get the amount of eth to swap:
    let parsedEthToSwap = ethers.parseEther(amountEthToSwap); 

    // Check current balance of the destination address
    let balanceBeforeWETH = Number(await WEth.balanceOf(destinationAddress)) / Number(WEthDecimals)

    // Swap ETH for aWEth
    let tx = await wEthGateway.depositETH(poolAddress, signer.address, 0, { value: parsedEthToSwap });
    await tx.wait();
    console.log(`Deposited ${amountEthToSwap} ETH into the wrapped ETH gateway AAVE Pool`);

    // Withdraw WETH with the aWETH
    console.log(`Withdrawing WETH from the wrapped ETH gateway AAVE Pool and sending it to ${destinationAddress}`);
    tx = await pool.withdraw(WEthAddress, parsedEthToSwap, destinationAddress);
    await tx.wait();

    console.log(`TX: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`); // Print the transaction data

    // Get Balances of the flashLoanContract
    let balanceAfterWETH = Number(await WEth.balanceOf(destinationAddress)) / Number(WEthDecimals)

    console.log(`WETH Amount Before: ${balanceBeforeWETH}, WETH Amount After Sending ${amountEthToSwap}: ${balanceAfterWETH}`);
}

const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
