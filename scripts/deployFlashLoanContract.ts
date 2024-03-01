import { ethers } from "hardhat";

async function main() {
  try {
    const FlashLoan = await ethers.getContractFactory("FlashLoan");
    const flashLoan = await FlashLoan.deploy("0x5E52dEc931FFb32f609681B8438A51c675cc232d");

    await flashLoan.waitForDeployment();
    console.log("FlashLoan deployed to:", flashLoan.getAddress());
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
