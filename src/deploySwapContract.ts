import { ethers } from "hardhat";

export async function deploySwapContract() {
  const SwapContract = await ethers.getContractFactory("SwapContract");
  
  console.log("Deploying SwapContract...")
  const swapContract = await SwapContract.deploy();
  
  console.log("Waiting for SwapContract deployment...")
  await swapContract.waitForDeployment();
  
  let address = await swapContract.getAddress();
  console.log("SwapContract deployed to:", address);
  return address;
}