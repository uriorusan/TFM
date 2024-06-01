import { BigNumberish } from 'ethers';
import { SwapContractV3Manager, SwapContractV2Manager } from './swapContract';
import { ethers } from "hardhat";

export enum TransactionDirection {
    WrappedEth_BuyV2_SellV3 = "0",
    WrappedEth_SellV2_BuyV3 = "1",
}

/**
 * This function allows to perform an arbitrage between Uniswap V2 and Uniswap V3. Note that token0 is always WETH
 * @param token1Address token1 address
 * @param direction whether to sell WETH in V2 and buy in V3 or viceversa
 * @param amount amount to sell in WEI
 */
export async function arbitrage(token1Address: string, direction: TransactionDirection, amount: BigNumberish) {
    let v3PoolFee = 3000;

    let v3 = new SwapContractV3Manager();
    let v2 = new SwapContractV2Manager();
    await v3.initialize();
    await v2.initialize();

    await v3.fundWithWrappedEth("10", v3.wallet);

    let wrappedEthAddress = v3.wEthAddress; // WETH address

    let wrappedEthBalanceBefore = await v3.getWEthBalance(v3.wallet);

    console.log(`\nArbitrage started. Wallet Adress: ${v3.wallet} Direction: ${direction}, Amount: ${amount}`);

    if (direction === TransactionDirection.WrappedEth_SellV2_BuyV3) {
        console.log(`Selling in V2: ${amount} ${wrappedEthAddress} for ${token1Address}, in contract ${v2.address}`);
        let amountOut = await v2.executeTrade(amount, wrappedEthAddress, token1Address);
        console.log(`Amount out: ${amountOut}`);
        await v3.executeTrade(amountOut, token1Address, wrappedEthAddress, v3PoolFee);
    }
    else if (direction === TransactionDirection.WrappedEth_BuyV2_SellV3) {
        console.log(`Selling in V3: ${amount} ${wrappedEthAddress} for ${token1Address}, , in contract ${v3.address}`);
        let amountOut = await v3.executeTrade(amount, wrappedEthAddress, token1Address, v3PoolFee);
        console.log(`Amount out: ${amountOut}`);
        await v2.executeTrade(amountOut, token1Address, wrappedEthAddress);
    }

    let wrappedEthBalanceAfter = await v3.getWEthBalance(v3.wallet);

    let profit = wrappedEthBalanceAfter - wrappedEthBalanceBefore;

    console.log(`Arbitrage completed. Profit: ${profit}`);
}



