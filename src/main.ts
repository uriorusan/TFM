import { deploySwapContract } from './deploySwapContract';
import { deployFlashLoanContract } from './deployFlashLoanContract';
import { executeSimpleFlashLoan } from './executeSimpleFlashLoan';
import { executeSwapContract } from './executeSwapContract';
import { executeSwapUniswapV3 } from './executeSwapUniswapV3';
import { listenToSwapContractEvents } from './listenToSwapContractEvents';
import { wrapEth } from './wrapEth';
import { ethers } from "hardhat";

async function flashLoan() {
  const flashLoanAddress = await deployFlashLoanContract();
  await wrapEth("2", flashLoanAddress)
  await executeSimpleFlashLoan(flashLoanAddress);
}

async function swapUniswapV3() {
  let provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_JSONRPC_ENDPOINT);
  let wallet = await (await provider.getSigner()).getAddress();

  await wrapEth("2", wallet);

  await executeSwapUniswapV3();
}

async function main() {
  const swapContractAddress = await deploySwapContract();
  // let swapContractAddress = "0x9be634797af98cb560db23260b5f7c6e98accacf";

  await wrapEth("2", swapContractAddress);
  await wrapEth("2", await (await ethers.provider.getSigner()).getAddress());

  await listenToSwapContractEvents(swapContractAddress);

  await executeSwapContract(swapContractAddress);
}

main().catch(console.error).finally(() => process.exit(0));
