import { reset } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { UniswapV2PoolContractManager } from './uniswap/UniswapV2PoolContractManager';
import { UniswapV3PoolContractManager } from './uniswap/UniswapV3PoolContractManager';
import { arbitrage, TransactionDirection } from './arbitrage';
import { ethers } from "hardhat";
import { config } from "dotenv";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

async function main() {
    config();
    let usdcAddress = AaveV3Ethereum.ASSETS.USDC.UNDERLYING;
    const lastBlock = await ethers.provider.getBlockNumber();

    // Get blocknumbers to run the test on
    let blockNumbers = [];
    let interval = 4123;

    for (let i = 0; i < 10; i++) {
        blockNumbers.push(lastBlock - interval * i);
    }

    let goodTestingBlocks = [19995279, 19992279, 19987279, 19992334, 19959350 ] // found with trial and error

    // Loop through the block numbers
    for (const blockNumber of blockNumbers) {
        // Reset the Hardhat network to the specific block number
        await reset(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, blockNumber);

        // Get the timestamp of the block
        let block = (await ethers.provider.getBlock(blockNumber));
        let timestamp = block?.timestamp || 0;
        console.log(`\nTesting at block number: ${blockNumber}, dated at ${new Date((timestamp * 1000))}`);

        // Get prices from Uniswap V3 (WETH/USDC)
        let uniswapV3Pool = new UniswapV3PoolContractManager("0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"); // WETH/USDC in UniV3
        await uniswapV3Pool.initialize();
        let priceV3 = await uniswapV3Pool.getWrappedEthPrice();

        // Get prices from Uniswap V2 (WETH/USDC)
        let uniswapV2Pool = new UniswapV2PoolContractManager("0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"); // WETH/USDC in UniV2
        await uniswapV2Pool.initialize();
        let priceV2 = await uniswapV2Pool.getWrappedEthPrice();

        console.log(`Price in UniV2: ${priceV2}, Price in UniV3: ${priceV3}`);

        let priceDiff = Number(priceV2) - Number(priceV3);

        if (Math.abs(priceDiff) < 5) {
            console.log(`Prices are within $5 of each other: ${priceDiff}`);
            continue;
        }
        if (priceDiff > 0) {
            console.log(`Price in UniV2 is higher than in UniV3 by $${priceDiff}`);
            await arbitrage(usdcAddress, TransactionDirection.WrappedEth_SellV2_BuyV3, ethers.parseEther("1"));
        } else {
            console.log(`Price in UniV3 is higher than in UniV2 by $${Math.abs(priceDiff)}`);
            await arbitrage(usdcAddress, TransactionDirection.WrappedEth_BuyV2_SellV3, ethers.parseEther("1"));
        }
    }
}

// Make sure to call the main function
main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(() => process.exit(0));


