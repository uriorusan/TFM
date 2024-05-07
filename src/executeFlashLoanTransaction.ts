
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

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING;
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    let balanceBeforeWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)

    // Do the FlashLoan of 1 WETH
    let amountToFlashLoan = ethers.parseEther("1") / ethers.getBigInt(1);
    let tx = await flashLoanContract.requestFlashLoan(WEthAddress, amountToFlashLoan);
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`FlashLoan transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    // Get Balances of the flashLoanContract
    let balanceAfterWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)

    console.log(`WETH Amount Before FlashLoan: ${balanceBeforeWETH}, WETH Amount After FlashLoan: ${balanceAfterWETH}`);
}

const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
