import { SimpleFlashLoanContractManager } from './simpleFlashLoan';
import { SwapContractManager } from './swapContract';
import { executeSwapUniswapV3 } from './swapOnUniswapV3';
import { FlashLoanOriolContractManager } from './flashLoanOriol';
import { ethers } from "hardhat";

async function main() {
  let wallet = await (await ethers.provider.getSigner()).getAddress();

  // Swap contract: allows to swap 1 WETH for LINK in Uniswap
  let swapContract = new SwapContractManager();
  await swapContract.initialize();
  await swapContract.fundWithWrappedEth("1", wallet);
  await swapContract.executeOnUni();

  // SimpleFlashLoan contract: does a flash loan of 1 WETH and immidiately repays it
  let simpleFlashLoan = new SimpleFlashLoanContractManager();
  await simpleFlashLoan.initialize();
  await simpleFlashLoan.fundWithWrappedEth("1");
  await simpleFlashLoan.execute();

  // flashLoan contract: does a flash loan, performs arbitrage then repays the loan
  let flashLoan = new FlashLoanOriolContractManager(swapContract.address);
  await flashLoan.initialize();
  await flashLoan.fundWithWrappedEth("1");
  await flashLoan.execute();
}

// Run main and do not exit
main().catch(console.error);
