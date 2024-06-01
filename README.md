# Oriol Cortes TFM

## Install dependencies
```shell
npm install
```

## Run the code
```
# run blockchain fork
npm run blockchain

# run main
npm run main

# run main + blockchain fork
npm run start
```

## Considerations
Every time the fork is ran, a copy of the current state of Ethereum is fetched and ran locally. This means that each time you run the code the results will be different.

Currently, the code loses money when doing the FlashLoanOriolMultiple. This is because the swap between DAI and USDC does not work correctly.
