import { BigNumberish } from 'ethers';
import { SwapContractV3Manager, SwapContractV2Manager } from './swapContract';
import { ethers } from "hardhat";
import { FlashLoanArbitrageContractManager } from './flashLoans/flashLoanArbitrage';

export enum TransactionDirection {
    WrappedEth_SellV3_BuyV2 = "0",
    WrappedEth_SellV2_BuyV3 = "1",
}

/**
 * This function allows to perform an arbitrage between Uniswap V2 and Uniswap V3. Note that token0 is always WETH
 * @param token1Address token1 address
 * @param direction whether to sell WETH in V2 and buy in V3 or viceversa
 * @param amount amount to sell in WEI
 */
export async function arbitrage(token1Address: string, direction: TransactionDirection, amount: BigNumberish) {
    let v3PoolFee = 500;

    let v3 = new SwapContractV3Manager();
    let v2 = new SwapContractV2Manager();
    await v3.initialize();
    await v2.initialize();

    await v3.fundWithWrappedEth("10", v3.wallet);

    let token1Symbol = await (await v3.getErc20Token(token1Address)).symbol();

    let wrappedEthAddress = v3.wEthAddress; // WETH address

    let wrappedEthBalanceBefore = await v3.getWEthBalance(v3.wallet);

    if (direction === TransactionDirection.WrappedEth_SellV2_BuyV3) {
        console.log(`Selling in V2: ${amount} WETH for ${token1Symbol}.`);
        let amountOut = await v2.executeTrade(amount, wrappedEthAddress, token1Address);
        console.log(`Amount out: ${amountOut} ${token1Symbol}`);
        amountOut = await v3.executeTrade(amountOut, token1Address, wrappedEthAddress, v3PoolFee);
        console.log(`Amount out: ${amountOut} WETH`);
    }
    else if (direction === TransactionDirection.WrappedEth_SellV3_BuyV2) {
        console.log(`Selling in V3: ${amount} WETH for ${token1Symbol}.`);
        let amountOut = await v3.executeTrade(amount, wrappedEthAddress, token1Address, v3PoolFee);
        console.log(`Received: ${amountOut} ${token1Symbol}`);
        amountOut = await v2.executeTrade(amountOut, token1Address, wrappedEthAddress);
        console.log(`Amount out: ${amountOut} WETH`);
    }

    let wrappedEthBalanceAfter = await v3.getWEthBalance(v3.wallet);

    let profit = wrappedEthBalanceAfter - wrappedEthBalanceBefore;

    console.log(`Arbitrage completed. ${profit > 0 ? "Profit!" : "Loss"}: ${profit} WETH`);
}


async function calculateAmount(): Promise<BigNumberish> {
    return ethers.parseEther("0.1");
}

/**
 * This function allows to perform an arbitrage between Uniswap V2 and Uniswap V3. Note that token0 is always WETH
 * @param token1Address token1 address
 * @param direction whether to sell WETH in V2 and buy in V3 or viceversa
 * @param amount amount to sell in WEI
 */
export async function flashLoanArbitrage(token1Address: string, direction: TransactionDirection, amount: BigNumberish) {
    let v3PoolFee = 500;

    let v3 = new SwapContractV3Manager();
    let v2 = new SwapContractV2Manager();
    await v3.initialize();
    await v2.initialize();

    await v3.fundWithWrappedEth("1", v3.wallet);

    let flashLoanArbitrage = new FlashLoanArbitrageContractManager(v3.address, v2.address);
    await flashLoanArbitrage.initialize();
    await flashLoanArbitrage.fundWithWrappedEth("11");

    let token1Symbol = await (await v3.getErc20Token(token1Address)).symbol();

    let profit: number = 0;

    if (direction === TransactionDirection.WrappedEth_SellV2_BuyV3) {
        console.log(`Selling in V2: ${amount} WETH for ${token1Symbol}.`);
        profit = await flashLoanArbitrage.execute(false, token1Address, amount, v3PoolFee);
    }
    else if (direction === TransactionDirection.WrappedEth_SellV3_BuyV2) {
        console.log(`Selling in V3: ${amount} WETH for ${token1Symbol}.`);
        profit = await flashLoanArbitrage.execute(true, token1Address, amount, v3PoolFee);
    }

    console.log(`Arbitrage completed. ${profit > 0 ? "Profit!" : "Loss"}: ${profit} WETH`);
}
