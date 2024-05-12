import { deploySwapContract } from './deploySwapContract';
import { deployFlashLoanContract } from './deployFlashLoanContract';
import { executeSimpleFlashLoan } from './executeSimpleFlashLoan';
import { executeSwapUniswapV3 } from './executeSwapUniswapV3';
import { listenToSwapContractEvents } from './listenToSwapContractEvents';
import { wrapEth } from './wrapEth';
import { ethers } from "hardhat";

async function flashLoan() {
  const flashLoanAddress = await deployFlashLoanContract();
  await wrapEth("2", flashLoanAddress)
  await executeSimpleFlashLoan(flashLoanAddress);
}

async function main() {
  const swapContractAddress = await deploySwapContract();
  let provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_JSONRPC_ENDPOINT);
  let wallet = await (await provider.getSigner()).getAddress();
  
  await wrapEth("2", wallet);

  await listenToSwapContractEvents(swapContractAddress);
  
  await executeSwapUniswapV3(swapContractAddress);
}

main().catch(console.error)// .finally(() => process.exit(0));
