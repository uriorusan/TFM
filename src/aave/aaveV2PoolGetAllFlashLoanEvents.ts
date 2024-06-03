
import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';
import { AaveV2Ethereum } from '@bgd-labs/aave-address-book';

// Main function to execute the script
async function main() {

    const poolAddressesProviderContract = await ethers.getContractAt('ILendingPoolAddressesProvider', AaveV2Ethereum.POOL_ADDRESSES_PROVIDER);

    const lendingPoolContractAddress: string = await poolAddressesProviderContract.getLendingPool();

    console.log(`Lending Pool Address: ${JSON.stringify(lendingPoolContractAddress)}`);

    if (!lendingPoolContractAddress) {
        throw new Error('Pool Address not found');
    }

    const lendingPoolContract = await ethers.getContractAt('ILendingPool', lendingPoolContractAddress);

    // Subscribe to the FlashLoan event
    let pastEvents = await lendingPoolContract.queryFilter(
        lendingPoolContract.filters.FlashLoan(),
    );

    // Write the events to a file
    fs.writeFileSync(path.join('logs', 'flash_loans_aave_v2_mainnet.log'), JSON.stringify(pastEvents, replacer, 4), 'utf8');
}

// Run Main function
main().catch(console.error).finally(() => process.exit(0));


// Custom replacer function to convert BigInt to strings
const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String