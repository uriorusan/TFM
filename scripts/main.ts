import { deployFlashLoan } from './deployFlashLoanContract';
import { executeSimpleFlashLoan } from './executeFlashLoanTransaction';
import { wrapEth } from './wrapEth';

async function main() {
  const flashLoanAddress = await deployFlashLoan();
  await wrapEth("2", flashLoanAddress)
  await executeSimpleFlashLoan(flashLoanAddress);
}

main().catch(console.error).finally(() => process.exit(0));
