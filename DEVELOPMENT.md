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

- After running the code from zero, the fact that the contract address was "new" allowed it to work.

From there, I modified the FlashLoanOriol contract to receive three arrays of two values each:

- requestFlashLoan is the entry point for the contract.
- it will store the arbitrage details and initiate the flash loan
- @param _amount amount to borrow
- @param _tokens array of token addresses to swap. [0] will be the one loaned, traded for [1] and traded back for [0]
- @param _swapRouters array of swap router addresses. Correlated with _tokens
- param _poolFees array of pool fees. Correlated with _tokens

This allows us to indicate a list of swaps as a three arrays:

- Start by swapping token 0 for 1 on swapRouter 0 with poolFee 0.
- End by swapping n for 0 on swapRouter n with poolFee n.
- in between, token t for t+1, on swapRouter t+1 with poolFee t+1.
- Always trade the max amount of token t available at that step.

I divided this in two contracts for minimal fees, one that allows only one trade and another that allows n trades, called Simple and Multiple


I've been debugging further, and apparently I can only trade with Uniswap. I've tried both Sushiswap and PancakeSwap and both failed.
I'm trying to figure out why this is the case, as they are direct clones of Uniswap:
- apparently sushi had a hack a while back and did something to the Ethereum SwapRouter?
- Pancakeswap should work, I have no idea why it doesn't.

After a bit of debugging, I discovered that Pancake swap has different default "poolFee" tiers, as opposed to Uniswap's 0.05%, 0.30%, and 1% (500, 3000 & 10000 in Eth's units), pancake uses 0.01%, 0.05%, 0.25%, and 1% (100, 500, 2500 & 10000).

It also uses a differently named callback function when doing swaps, but after testing, swapContract works with both pancake and uni.

After adding logging and changing an incorrect contract address, I've managed to do an arbitrage trade with the funds from a Flash Loan!! Finally!

At first I saw that I was netting 0.13Eth of profit with a 1 ETH transaction, and I got curious. Upon further inspection it looks like Pancake V3 WETH-LINK pools is basically empty of liquidity. I was also miscalculating, and actually losing 0.87Eth instead of gaining 1.13!


## 20th of May - 26th of May 2024

During the beggining of the week, I've dedicated time to refactoring the whole code base, which was a bit of a mess. I've now created the Contract Manager abstract class, which handles the deployment, initialisation and funding of the contracts. Other classes then implement this abstract class and have a whol lot of functionality baked in.

This should help explaining in the documentation how everything actually works, which is nice!

I've also refactored the swapContract, flashLoanSimple and flashLoanOriol to use the ContractManager, and they look much nicer now.

Also, main.ts is also much more readable, for example:

```
  let swapContract = new SwapContractManager();
  await swapContract.initialize();
  await swapContract.fundWithWrappedEth("1", wallet);
  await swapContract.executeOnUni();
```

I'll dedicate the rest of the week on writing the actual documentation of how the code works, and once that is done I'll try to find arbitrage opportunities, which I've left for last because I feel (although I might be wrong) that it's a solved problem. I'm sure that there are libraries out there that compute the arbitrage opportunities perfectly and quickly. I've seen [MEV-Inspect](https://docs.flashbots.net/flashbots-data/mev-inspect-py/quick-start), which should be a nice starting point for this.



