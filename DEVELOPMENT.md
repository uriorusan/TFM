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

## 6th of May - 12th of May 2024

Most of the progress has been on trying to develop a Contract to Swap two tokens on Uniswap. To do this, you basically have to
implement an interface that is already provided by Uniswap, deploy it and then call it's functions.

In general terms, if you can interact with a contract through a UI it will be much easier to understand how to use the contract
using code; you just need to read the transactions they are preparing for you!

So I navigated a bit through the Uniswap interface, which I had done before, but this time looking at the transaction fields and
method calls in Metamask, and saw that it was a relatevely easy:

- Approve the spending of the ERC20. This is a standard function shared in all ERC20 tokens that basically gives permission to another
address to spend your wallet's token when you call a function from that wallet in the next block.

- Choose an amount in or an amount out that you want (you can't choose both) of the pool and prepare an input JSON for the corresponding function.

- Call the function `exactInputSingle` or `exactOutputSingle` of the swapRouter contract. This will give you your other token.

- Check the new balance of the new token in your wallet.


So then I implemented a new script, `src/executeSwapUniswapV3.ts` that does this process on WETH-LINK pair, and it works!

I then tried it from inside the blockchain by creating the contract `SwapContract.sol` and calling IT, but it didn't work.

I'm in the process of finding out why, adding logs and events to the contract.

## 13th of May - 19th of May 2024

After a long session with Jordi Guirao, my professor, we managed to get it running from Remix, but not locally. We didn't understand why this was the case, but he helped me point in the right direction!

Debugging session:
- Realised that the deployment address of the contract when running main.ts was always the same. After a quick google search, I found that this is
expected due to how the contract deployment addresses are calculated [link](https://ethereum.stackexchange.com/questions/17927/how-to-deploy-smart-contract-in-predefined-contract-address-in-private-ethereum). In summary, the contract address is calculated from a deterministic pseudorandom formula that receives as input the wallet address of the deployer and the nonce (number of times this wallet has transacted). Since the nonce is 0 for the predifined wallet addresses, the deployment address is always the same.

-










