
import { Web3 } from 'web3';
import { ethers } from 'hardhat';
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import fs from 'fs';
import path from 'path';
import {IPool, IPoolAddressesProvider } from '../../typechain-types';

export default async function main() {

    // Define the AAVE V3 Address Provider contract address
    const PoolAddressesProviderAddress = AaveV3Ethereum.POOL_ADDRESSES_PROVIDER;

    const poolAddressesProviderContract: IPoolAddressesProvider = await ethers.getContractAt('IPoolAddressesProvider', PoolAddressesProviderAddress);

    const poolContractAddress: string = await poolAddressesProviderContract.getPool()
    console.log(`Pool Address: ${JSON.stringify(poolContractAddress)}`);

    const poolContract = await ethers.getContractAt('IPool', poolContractAddress);

    // Subscribe to the FlashLoan event
    let flashLoanEventsFilter = await poolContract.filters.FlashLoan(undefined, undefined, AaveV3Ethereum.ASSETS.WETH.UNDERLYING); 

    let events = await poolContract.queryFilter(flashLoanEventsFilter, 0, 'latest');

    let fileName = 'flash_loans_mainnet_ethers.log';

    console.log(`FlashLoan Events for WETH written to logs/${fileName}`);

    // Write the events to a file
    fs.writeFileSync(path.join('logs', fileName), JSON.stringify(events, replacer, 4), 'utf8');
}

// Run Main function
main().catch(console.error).finally(() => process.exit(0));


// Custom replacer function to convert BigInt to strings
const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String