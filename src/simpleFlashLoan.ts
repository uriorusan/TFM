
import { FlashLoanV3, IERC20Metadata, IPool, IPoolAddressesProvider, WrappedTokenGatewayV3, IAToken } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

export async function deployFlashLoanV3Contract() {
    const FlashLoan = await ethers.getContractFactory("FlashLoanV3");
    const flashLoan = await FlashLoan.deploy(AaveV3Ethereum.POOL_ADDRESSES_PROVIDER);

    await flashLoan.waitForDeployment();
    let flashLoanAddress = await flashLoan.getAddress();

    console.log("FlashLoan deployed to:", flashLoanAddress);
    return flashLoanAddress;
}

export async function executeSimpleFlashLoan(flashLoanContractAddress: string) {
    const signer = await ethers.provider.getSigner();

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
