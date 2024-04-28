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

// First deployment at sepolia address 0xd374dFB560df8CADC441196e08Cac964A7Cbe7E4
// Second at 0x6C816ceF66e84Fd67E7c7D81BbD789AB6019c3c8

// Universal Router at sepolia address 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD

// LINK TOKEN AT 0x779877A7B0D9E8603169DdbD7836e478b4624789
// USDC TOKEN AT 0x5fd84259d66Cd46123540766Be93DFE6D43130D7