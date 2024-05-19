
import { FlashLoanOriol, IERC20Metadata } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

// Main function to execute the script
export async function executeFlashLoanOriol(flashLoanContractAddress: string, input?: FlashLoanOriol.RequestFlashLoanArbitrageSimpleParamsStruct) {
    console.log(`Will execute a FlashLoan Arbitrage in the FlashLoan contract: ${flashLoanContractAddress}`)
    const signer = await ethers.provider.getSigner();
    let wallet = await signer.getAddress();

    // Get the FlashLoan contract instance
    const flashLoanContract: FlashLoanOriol = await ethers.getContractAt('FlashLoanOriol', flashLoanContractAddress, signer);

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // Prepare the transaction to request a flashLoan
    const swapRouterAddressUniswap = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
    const swapRouterAddressSushiswap = "0x1b81D678ffb9C0263b24A97847620C99d213eB14"; // Sushiswap Router.
    const swapRouterAddresses = [swapRouterAddressUniswap, swapRouterAddressSushiswap];
    const poolFees = [3000, 2500];
    const tokens = [WEthAddress, LinkAddress];
    const amountToFlashLoan = ethers.parseEther("1");

    if (!input) {
        input = {
            amount: amountToFlashLoan,
            tokens: tokens,
            swapRouters: swapRouterAddresses,
            poolFees: poolFees
        } as FlashLoanOriol.RequestFlashLoanArbitrageSimpleParamsStruct;
    }

    console.log(JSON.stringify(input, replacer, 4));

    // Get Balances of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(wallet)) / Number(LinkDecimals);
    let balanceBeforeWETH = Number(await WEth.balanceOf(wallet)) / Number(WEthDecimals)

    // Prepare the transaction to request a flashLoan
    let tx = await flashLoanContract.requestFlashLoanArbitrageSimple(input);
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`FlashLoan transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`);

    // Print the balances of the wallet
    let balanceAfterWETH = Number(await WEth.balanceOf(wallet)) / Number(WEthDecimals);
    let balanceAfterLink = Number(await Link.balanceOf(wallet)) / Number(LinkDecimals);
    console.log(`WETH Amount Before FlashLoan: ${balanceBeforeWETH}, WETH Amount After FlashLoan: ${balanceAfterWETH}`);
    console.log(`LINK Amount Before FlashLoan: ${balanceBeforeLink}, LINK Amount After FlashLoan: ${balanceAfterLink}`);
}

const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
