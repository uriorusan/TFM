
import { Web3 } from 'web3';
import Pool from '../../abis/Pool';
import PoolAddressesProvider from '../../abis/PoolAddressesProvider';
import Quoter from '../../abis/Quoter';

const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const web3 = new Web3(DOMAIN);

// Define the AAVE Address Provider contract address
const PoolAddressesProviderAddress = MAINNET ? "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e" : '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A';
const quoterAddress = MAINNET ? "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6" : '';

// Main function to execute the script
async function main() {

  const poolAddressesProviderContract = new web3.eth.Contract(PoolAddressesProvider.abi, PoolAddressesProviderAddress);
  const quoterContract = new web3.eth.Contract(Quoter.abi, quoterAddress);

  const poolContractAddress: string = await poolAddressesProviderContract.methods.getPool().call();
  console.log(`Pool Address: ${JSON.stringify(poolContractAddress)}`);

    if (!poolContractAddress) {
        throw new Error('Pool Address not found');
    }

    const poolContract = new web3.eth.Contract(Pool.abi, poolContractAddress);

    const [token0, token1, fee, liquidity, slot0] = await Promise.all([
        poolContract.methods.token0(),
        poolContract.methods.token1(),
        poolContract.methods.fee(),
        poolContract.methods.liquidity(),
        poolContract.methods.slot0(),
    ])

    console.log(`Token0: ${token0}`);
    console.log(`Token1: ${token1}`);
    console.log(`Liquidity: ${liquidity}`);
    
    // Subscribe to the FlashLoan event
    let eventSubscription = await poolContract.events.FlashLoan();

    eventSubscription.on('data', (event: any) => {
        console.log(event);
    });


}

main().catch(console.error)

const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String

type ReserveConfiguration = {
    ltv: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    decimals: number;
    reserveIsActive: boolean;
    reserveIsFrozen: boolean;
    borrowingEnabled: boolean;
    stableRateBorrowingEnabled: boolean;
    assetIsPaused: boolean;
    borrowingInIsolationModeEnabled: boolean;
    reserveFactor: number;
    borrowCap: number;
    supplyCap: number;
    liquidationProtocolFee: number;
    eModeCategory: number;
    unbackedMintCap: number;
    debtCeilingIsolationMode: number;
};

function parseReserveConfiguration(config: string): ReserveConfiguration {
    const configNum = BigInt(config);
    
    return {
        ltv: Number((configNum >> BigInt(0)) & BigInt(0xFFFF)),
        liquidationThreshold: Number((configNum >> BigInt(16)) & BigInt(0xFFFF)),
        liquidationBonus: Number((configNum >> BigInt(32)) & BigInt(0xFFFF)),
        decimals: Number((configNum >> BigInt(48)) & BigInt(0xFF)),
        reserveIsActive: Boolean((configNum >> BigInt(56)) & BigInt(0x1)),
        reserveIsFrozen: Boolean((configNum >> BigInt(57)) & BigInt(0x1)),
        borrowingEnabled: Boolean((configNum >> BigInt(58)) & BigInt(0x1)),
        stableRateBorrowingEnabled: Boolean((configNum >> BigInt(59)) & BigInt(0x1)),
        assetIsPaused: Boolean((configNum >> BigInt(60)) & BigInt(0x1)),
        borrowingInIsolationModeEnabled: Boolean((configNum >> BigInt(61)) & BigInt(0x1)),
        reserveFactor: Number((configNum >> BigInt(64)) & BigInt(0xFFFF)),
        borrowCap: Number((configNum >> BigInt(80)) & BigInt(0xFFFFFFFF)),
        supplyCap: Number((configNum >> BigInt(116)) & BigInt(0xFFFFFFFF)),
        liquidationProtocolFee: Number((configNum >> BigInt(152)) & BigInt(0xFFFF)),
        eModeCategory: Number((configNum >> BigInt(168)) & BigInt(0xFF)),
        unbackedMintCap: Number((configNum >> BigInt(176)) & BigInt(0xFFFFFFFF)),
        debtCeilingIsolationMode: Number((configNum >> BigInt(212)) & BigInt(0x3FFFFFFF)),
    };
}

