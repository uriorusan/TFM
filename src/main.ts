import { deploySwapContract } from './deploySwapContract';
import { deployFlashLoanV3Contract } from './deployFlashLoanV3Contract';
import { deployFlashLoanOriolContract } from './deployFlashLoanOriolContract';
import { executeSimpleFlashLoan } from './executeSimpleFlashLoan';
import { executeSwapContractUni, executeSwapContractPancake } from './executeSwapContract';
import { executeSwapUniswapV3 } from './executeSwapUniswapV3';
import { executeFlashLoanOriol } from './executeFlashLoanOriol';
import { wrapEth } from './wrapEth';
import { ethers } from "hardhat";
import { fundWithEth } from './fundWithEth';

async function main() {
  let wallet = await (await ethers.provider.getSigner()).getAddress();
  const addressSwapContract = await deploySwapContract();
  let addressFlashContractSimple = await deployFlashLoanV3Contract();
  let addressFlashContractOriol = await deployFlashLoanOriolContract(addressSwapContract);

  // Fund the contracts and wallet
  await wrapEth("10", wallet);
  await wrapEth("1", addressFlashContractOriol);

  // Swap 1 WETH for LINK directly from the wallet
  // await executeSwapUniswapV3();

  // Request a FlashLoan to AAVE without doing any arbitrage, and pay it back
  // await wrapEth("2", addressFlashContractSimple);
  // await executeSimpleFlashLoan(addressFlashContractSimple);

  // Execute a swap from a contract in UniswapV3
  // await executeSwapContractUni(addressSwapContract);

  // Execute a swap from a contract in PancakeV3
  // await executeSwapContractPancake(addressSwapContract);

  // Request a FlashLoan (from AAVE), do an arbitrage (buy in Uni, sell in Pancake) and pay it back
  await executeFlashLoanOriol(addressFlashContractOriol);
}

// Run main and do not exit
main().catch(console.error);
