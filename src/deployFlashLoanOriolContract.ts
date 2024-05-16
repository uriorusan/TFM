import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

export async function deployFlashLoanOriolContract(swapContractAddress: string) {
    let signer = await ethers.provider.getSigner();
    const FlashLoan = await ethers.getContractFactory("FlashLoanOriol", signer);
    const flashLoan = await FlashLoan.deploy(AaveV3Ethereum.POOL_ADDRESSES_PROVIDER, swapContractAddress);

    await flashLoan.waitForDeployment();
    let flashLoanAddress = await flashLoan.getAddress();

    console.log("FlashLoan deployed to:", flashLoanAddress);
    return flashLoanAddress;
}