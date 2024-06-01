
import { Web3 } from 'web3';
import { getTokensBalance } from '@mycrypto/eth-scan';
import ERC20 from '../../artifacts/@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json';

import fs from 'fs';

const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const WBtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const web3 = new Web3(DOMAIN);

let most_borrowed_assets = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
]

let most_borrowed_assets_names: Record<string, string> = {
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": "wstETH",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": "LINK",
    "0x0D8775F648430679A709E98d2b0Cb6250d2887EF": "BAT",
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0": "LUSD",
} as const;

async function main() {
    const allTransactions = JSON.parse(fs.readFileSync('./logs/flash_loans_mainnet.log', 'utf8')) as FlashLoanEvent[];
    let count = 0;

    for (let transaction of allTransactions) {
        count++;
        if (most_borrowed_assets.includes(transaction.returnValues.asset)) {
            const transactionReceipt = await web3.eth.getTransactionReceipt(transaction.transactionHash);
            const asset = transaction.returnValues.asset;
            const wallet = transaction.returnValues.initiator;
            const blockNumber = transaction.blockNumber;
            const assetName = most_borrowed_assets_names[asset] || "Unknown Asset";

            const erc20Contract = new web3.eth.Contract(ERC20.abi, asset);

            try {
                const balanceBefore = await erc20Contract.methods.balanceOf(wallet).call({}, Number(blockNumber) - 1);
                const balanceAfter = await erc20Contract.methods.balanceOf(wallet).call({}, Number(blockNumber));

                // Profit calculation here should also subtract any fees or interest paid
                const decimals = await erc20Contract.methods.decimals().call();
                const profit = (Number(balanceAfter) - Number(balanceBefore)) * 10 ** (-1 * Number(decimals)); // Ensure this calculation accounts for fees

                if (profit > 0) {
                    console.log(`Profit for ${wallet} in transaction ${transaction.transactionHash}: ${profit} ${assetName}`);
                    console.log(`Transaction Receipt: ${JSON.stringify(transactionReceipt, replacer, 4)}`)
                }



            } catch (error) {
                console.error(`Error processing transaction ${transaction.transactionHash}:`, error);
            }
        }

        if (count % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep for 10 seconds to prevent rate limiting
        }
    }
}

main().catch(console.error).finally(() => process.exit(0));


// Custom replacer function to convert BigInt to strings
const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String


// Generate interface for the FlashLoan event
interface FlashLoanEvent {
    address: string;
    blockHash: string;
    blockNumber: string;
    data: string;
    logIndex: string;
    removed: boolean;
    topics: string[];
    transactionHash: string;
    transactionIndex: string;
    returnValues: {
        [key: string]: string;
        target: string;
        initiator: string;
        asset: string;
        amount: string;
        interestRateMode: string;
        premium: string;
        referralCode: string;
    };
    event: string;
    signature: string;
    raw: {
        data: string;
        topics: string[];
    };
}
