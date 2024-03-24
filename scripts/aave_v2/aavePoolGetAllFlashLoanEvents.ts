
import { Web3 } from 'web3';
import fs from 'fs';
import path from 'path';
import LendingPool from '../../abis/LendingPool';
import LendingPoolAddressesProvider from '../../abis/LendingPoolAddressesProvider';

const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const web3 = new Web3(DOMAIN);

// Define the AAVE V3 Address Provider contract address
const PoolAddressesProviderAddress = MAINNET ? "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5" : '';

// Get ABIs
const lendingPoolAddressesProviderABI = LendingPoolAddressesProvider.abi;
const lendingPoolAbi = LendingPool.abi;

// Main function to execute the script
async function main() {

  const poolAddressesProviderContract = new web3.eth.Contract(lendingPoolAddressesProviderABI, PoolAddressesProviderAddress);

  const lendingPoolContractAddress: string = await poolAddressesProviderContract.methods.getLendingPool().call();
  console.log(`Lending Pool Address: ${JSON.stringify(lendingPoolContractAddress)}`);

    if (!lendingPoolContractAddress) {
        throw new Error('Pool Address not found');
    }

    const lendingPoolContract = new web3.eth.Contract(lendingPoolAbi, lendingPoolContractAddress);

    // Subscribe to the FlashLoan event
    let pastEvents = await lendingPoolContract.getPastEvents('FlashLoan', {
        fromBlock: 17503775, // around 280 days ago
        toBlock: 'latest'
    });

    // Write the events to a file
    fs.writeFileSync(path.join('logs', 'flash_loans_aave_v2_mainnet.log'), JSON.stringify(pastEvents, replacer, 4), 'utf8');
}

// Run Main function
main().catch(console.error).finally(() => process.exit(0));


// Custom replacer function to convert BigInt to strings
const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String