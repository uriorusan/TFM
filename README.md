# Oriol Cortes TFM

## Running code
```shell
# before building
node -r ts-node/register scripts/generateAbisFromArtifacts.ts abis/
# then
npx hardhat run scripts/listenToFlashLoanEvents.ts
npx hardhat run --network sepolia scripts/deployFlashLoanContract.ts
```
