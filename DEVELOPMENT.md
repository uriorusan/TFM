## 29th April 2024 - 5th of May 2024

Most of the progress has been in changing the code so that it runs against a fork of the Ethereum network instead of Sepolia using manual interaction with Remix. Instead, all code now runs directly from the terminal without any human interaction by running `npm run setup` followed by `npm run main`.

This allows me to test and develop my contract again and again without having to:
- Change the code
- Copy the code to remix 
- Deploy the contract in Sepolia
- If I don't have funds, use a faucet
- Fund the contract
- Execute the contract function that I want to test

Repeat for every small modification in the contract.

As this was not scalable, I looked around until I found the following tutorial:
https://blog.uniswap.org/your-first-uniswap-integration

And set up the hardhat environment with the localhost network and forked the ethereum current state, and then created a few scripts to:

- Deploy the FlashLoan contract
- Change some ETH for WETH ERC20 Token
- Fund the Contract
- Call the contract functions

This was tested and developed using a simple FlashLoan contract that only requests the Loan and immidiately returns it, copied from here:
https://github.com/jspruance/aave-flash-loan-tutorial



