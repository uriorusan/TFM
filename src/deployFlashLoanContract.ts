import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

export async function deployFlashLoanContract() {
  try {
    const FlashLoan = await ethers.getContractFactory("FlashLoanV3");
    const flashLoan = await FlashLoan.deploy(AaveV3Ethereum.POOL_ADDRESSES_PROVIDER);
    
    await flashLoan.waitForDeployment();
    let flashLoanAddress = await flashLoan.getAddress();
    
    console.log("FlashLoan deployed to:", flashLoanAddress);
    return flashLoanAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1)
  }
}