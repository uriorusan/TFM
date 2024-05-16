import { deploySwapContract } from './deploySwapContract';
import { deployFlashLoanV3Contract } from './deployFlashLoanV3Contract';
import { deployFlashLoanOriolContract } from './deployFlashLoanOriolContract';
import { executeSimpleFlashLoan } from './executeSimpleFlashLoan';
import { executeSwapContract } from './executeSwapContract';
import { executeSwapUniswapV3 } from './executeSwapUniswapV3';
import { listenToSwapContractEvents } from './listenToSwapContractEvents';
import { executeFlashLoanOriol } from './executeFlashLoanOriol';
import { wrapEth } from './wrapEth';
import { ethers } from "hardhat";
import { fundWithEth } from './fundWithEth';

async function flashLoan() {
  const flashLoanAddress = await deployFlashLoanV3Contract();
  await wrapEth("2", flashLoanAddress)
  await executeSimpleFlashLoan(flashLoanAddress);
}

async function swapUniswapV3() {
  let provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_JSONRPC_ENDPOINT);
  let wallet = await (await provider.getSigner()).getAddress();

  await wrapEth("2", wallet);

  await executeSwapUniswapV3();
}

async function swapContract() {
  const swapContractAddress = await deploySwapContract();

  await wrapEth("2", swapContractAddress);
  await wrapEth("2", await (await ethers.provider.getSigner()).getAddress());

  await listenToSwapContractEvents(swapContractAddress);

  await executeSwapContract(swapContractAddress);
}

async function main() {
  const swapContractAddress = await deploySwapContract();
  let flashLoanContractAddress = await deployFlashLoanOriolContract(swapContractAddress);

  await wrapEth("10", await (await ethers.provider.getSigner()).getAddress());

  await fundWithEth(flashLoanContractAddress, "10");

  await executeSwapContract(swapContractAddress);

  // await executeFlashLoanOriol(flashLoanContractAddress);
}

// Run main and do not exit
main().catch(console.error);
