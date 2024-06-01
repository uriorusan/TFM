
import { Web3 } from 'web3';
import Pool from '../../artifacts/@aave/core-v3/contracts/interfaces/IPool.sol/IPool.json';
import PoolAddressesProvider from '../../artifacts/@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol/IPoolAddressesProvider.json';

const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const web3 = new Web3(DOMAIN);

// Define the AAVE Address Provider contract address
const PoolAddressesProviderAddress = MAINNET ? "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e" : '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A';

// Get ABIs
const PoolAddressesProviderABI = PoolAddressesProvider.abi;
const PoolAbi = Pool.abi;

// Main function to execute the script
async function main() {

  const poolAddressesProviderContract = new web3.eth.Contract(PoolAddressesProviderABI, PoolAddressesProviderAddress);

  const poolContractAddress: string = await poolAddressesProviderContract.methods.getPool().call();
  console.log(`Pool Address: ${JSON.stringify(poolContractAddress)}`);

    if (!poolContractAddress) {
        throw new Error('Pool Address not found');
    }

    const poolContract = new web3.eth.Contract(PoolAbi, poolContractAddress);

    // Subscribe to the FlashLoan event
    poolContract.events.FlashLoan().on('data', (event: any) => {
        console.log(event);
    });

}

// Run Main function
main().catch(console.error)