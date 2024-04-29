import { deployFlashLoan } from './deployFlashLoanContract';
import { executeSimpleFlashLoan } from './executeFlashLoanTransaction';

async function main() {
  const flashLoanAddress = await deployFlashLoan();
  await executeSimpleFlashLoan(flashLoanAddress);
}

main().catch(console.error).finally(() => process.exit(0));
