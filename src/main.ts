import { SimpleFlashLoanContractManager } from './flashLoans/simpleFlashLoan';
import { SwapContractV3Manager, SwapContractV2Manager } from './swapContract';
import { executeSwapUniswapV3, executeSwapUniswapV2 } from './uniswap/swapOnUniswap';
import { UniswapV2PoolContractManager } from './uniswap/UniswapV2PoolContractManager';
import { UniswapV3PoolContractManager } from './uniswap/UniswapV3PoolContractManager';
import { UniswapV3FactoryContractManager } from './uniswap/UniswapV3FactoryContractManager';
import { FlashLoanOriolContractManager, FlashLoanOriolMultipleContractManager } from './flashLoans/flashLoanOriol';
import { FlashLoanArbitrageContractManager } from './flashLoans/flashLoanArbitrage';
import { ethers } from "hardhat";

async function main() {
    let wallet = await (await ethers.provider.getSigner()).getAddress();

    console.log(`Current block: ${await ethers.provider.getBlockNumber()}`)

    // Swap contract: allows to swap 1 WETH for LINK in Uniswap V3 (Section 4.2)
    let swapContractV3 = new SwapContractV3Manager();
    await swapContractV3.initialize();
    await swapContractV3.fundWithWrappedEth("10", wallet);
    await swapContractV3.test();

    console.log("\n")

    // Swap contract: allows to swap 1 WETH for LINK in Uniswap V2 (Section 4.1)
    let swapContractV2 = new SwapContractV2Manager();
    await swapContractV2.initialize();
    await swapContractV2.test();

    console.log("\n")

    // Swap 1 WETH -> LINK in Uniswap V3 (Section 4.2)
    await executeSwapUniswapV3();

    // Swap 1 WETH -> LINK in Uniswap V2 (Section 4.2)
    await executeSwapUniswapV2();

    console.log("\n")

    // SimpleFlashLoan contract: does a flash loan of 1 WETH and immidiately repays it
    let simpleFlashLoan = new SimpleFlashLoanContractManager();
    await simpleFlashLoan.initialize();
    await simpleFlashLoan.fundWithWrappedEth("1");
    await simpleFlashLoan.execute();

    console.log("\n")

    // flashLoan contract: does a flash loan, performs arbitrage then repays the loan
    let flashLoanSingle = new FlashLoanOriolContractManager(swapContractV3.address);
    await flashLoanSingle.initialize();
    await flashLoanSingle.fundWithWrappedEth("1");
    await flashLoanSingle.test();

    console.log("\n")

    // Get prices from Uniswap V2, pair WETH/USDC (Section 4.1)
    let pairAddressV2 = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; // WETH/USDC
    let uniswapV2Pool = new UniswapV2PoolContractManager(pairAddressV2);
    await uniswapV2Pool.initialize();
    let price = await uniswapV2Pool.getWrappedEthPrice();
    console.log(`Price of 1 WETH in USDC in UniV2: ${price}`);

    console.log("\n")

    // Get prices from Uniswap V3, pair USDC/WETH. (Section 4.1)
    let factory = new UniswapV3FactoryContractManager();
    let usdcWethPair = await factory.getUsdcWethPool();
    let uniswapV3Pool = new UniswapV3PoolContractManager(usdcWethPair);
    await uniswapV3Pool.initialize();
    price = await uniswapV3Pool.getWrappedEthPrice();
    console.log(`Price of 1 WETH in USDC in UniV3: ${price}`);

    console.log("\n")

    // Get prices from Uniswap V3, pair DAI/WETH. (Section 4.1)
    let daiWethPair = await factory.getDaiWethPool();
    let uniswapV3Pool2 = new UniswapV3PoolContractManager(daiWethPair);
    await uniswapV3Pool2.initialize();
    price = await uniswapV3Pool2.getWrappedEthPrice();
    console.log(`Price of 1 WETH in DAI in UniV3: ${price}`);

    console.log("\n")

    // Get prices from Uniswap V3, pair DAI/USDC. (Section 4.1)
    let daiUsdtPair = await factory.getDaiUsdcPool();
    let uniswapV3Pool3 = new UniswapV3PoolContractManager(daiUsdtPair);
    await uniswapV3Pool3.initialize();
    await uniswapV3Pool3.getPrice();

    console.log("\n")

    // Swap 1 WETH -> USDC -> DAI -> WETH in Uniswap V3
    let flashLoanMultiple = new FlashLoanOriolMultipleContractManager(swapContractV3.address);
    await flashLoanMultiple.initialize();
    await flashLoanMultiple.fundWithWrappedEth("1");
    await flashLoanMultiple.test();

    console.log("\n")

    // FlashLoan, then arbitrage between UniswapV3 and UniswapV2 with the pair WETH/USDC
    let flashLoanArbitrage = new FlashLoanArbitrageContractManager(swapContractV3.address, swapContractV2.address);
    await flashLoanArbitrage.initialize();
    await flashLoanArbitrage.fundWithWrappedEth("1");
    await flashLoanArbitrage.test();
}

// Run main and do not exit
main().catch(console.error);