# Oriol Cortes TFM

## Running code
```shell
# before building
node -r ts-node/register scripts/gen.ts abis/
# then
npx hardhat run scripts/listenToFlashLoanEvents.ts
npx hardhat run scripts/deployFlashLoanContract.ts
```
