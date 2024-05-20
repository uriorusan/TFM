import { executeSimpleFlashLoan, deployFlashLoanV3Contract } from './simpleFlashLoan';
import { SwapContractManager } from './swapContract';
import { executeSwapUniswapV3 } from './swapOnUniswapV3';
import { FlashLoanOriolContractManager } from './flashLoanOriol';
import { wrapEth } from './wrapEth';
import { ethers } from "hardhat";

async function main() {
  let wallet = await (await ethers.provider.getSigner()).getAddress();
  let swapContract = new SwapContractManager();
  await swapContract.initialize();
  await swapContract.fundWithWrappedEth("1", wallet);
  await swapContract.executeOnUni();

  let flashLoan = new FlashLoanOriolContractManager(swapContract.address);
  await flashLoan.initialize();
  await flashLoan.fundWithWrappedEth("1");
  await flashLoan.execute();
}

// Run main and do not exit
main().catch(console.error);
