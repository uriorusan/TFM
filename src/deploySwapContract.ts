import { ethers } from "hardhat";

export async function deploySwapContract() {
  let signer = await ethers.provider.getSigner();

  console.log("Deploying SwapContract...")

  const SwapContract = await ethers.getContractFactory("SwapContract", signer);
  let swapContract = await SwapContract.deploy();

  console.log("Waiting for SwapContract deployment...")
  swapContract.waitForDeployment();

  console.log("SwapContract deployed with transaction:", JSON.stringify(await swapContract.deploymentTransaction(), null, 2));

  let address = await swapContract.getAddress();
  console.log("SwapContract deployed to:", address);
  return address;
}