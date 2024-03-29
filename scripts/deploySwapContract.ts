import { ethers } from "hardhat";

async function main() {

  try {
    const SwapContract = await ethers.getContractFactory("SwapContract");
    console.log("Deploying SwapContract...")
    const swapContract = await SwapContract.deploy();
    console.log("Waiting for SwapContract deployment...")
    await swapContract.waitForDeployment();
    console.log("FlashLoan deployed to:", await swapContract.getAddress());
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

// Main function execution
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// First deployment at address 

// LINK TOKEN AT 0x779877A7B0D9E8603169DdbD7836e478b4624789
// USDC TOKEN AT 0x5fd84259d66Cd46123540766Be93DFE6D43130D7