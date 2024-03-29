import { ethers } from "hardhat";

async function main() {

  try {
    const FlashLoan = await ethers.getContractFactory("FlashLoan");
    const flashLoan = await FlashLoan.deploy("0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A");

    await flashLoan.waitForDeployment();
    console.log("FlashLoan deployed to:", await flashLoan.getAddress());
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

// First deployment at address 0xEcEFCA45FAc0e7D3BeF85EAfd242D7A2dB931b5b

// LINK TOKEN AT 0x779877A7B0D9E8603169DdbD7836e478b4624789, AAVE token at 0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5
// USDC TOKEN AT 0x5fd84259d66Cd46123540766Be93DFE6D43130D7