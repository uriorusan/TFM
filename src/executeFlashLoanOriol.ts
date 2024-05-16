
import { FlashLoanOriol, IERC20Metadata, IPool, IPoolAddressesProvider, WrappedTokenGatewayV3, IAToken } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";

// Main function to execute the script
export async function executeFlashLoanOriol(flashLoanContractAddress: string) {
    const signer = await ethers.provider.getSigner();

    // Get the FlashLoan contract instance
    const flashLoanContract: FlashLoanOriol = await ethers.getContractAt('FlashLoanOriol', flashLoanContractAddress, signer);

    // Get WEth token instance
    const WEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING; // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const WEth: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', WEthAddress, signer);
    const WEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await WEth.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)

    // Get the Link token address
    const LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING; // 0x514910771AF9Ca656af840dff83E8264EcF986CA
    const Link: IERC20Metadata = await ethers.getContractAt('IERC20Metadata', LinkAddress, signer);
    const LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await Link.decimals());

    // Get WETH Balance of the wallet
    let balanceBeforeLink = Number(await Link.balanceOf(flashLoanContractAddress)) / Number(LinkDecimals)

    // fund the flashLoan contract with weth
    let amountToFund = ethers.parseEther("1") / ethers.getBigInt(1);
    let txFund = await WEth.transfer(flashLoanContractAddress, amountToFund);
    await txFund.wait(); // Wait for the transaction to be mined

    console.log(`Funded FlashLoan contract with ${amountToFund} WETH: ${JSON.stringify(await txFund.getTransaction(), replacer, 4)}`)

    console.log(`WETH Amount Before Funding the contract: ${balanceBeforeWETH}, WETH Amount After Funding: ${Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)}`);

    balanceBeforeWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(LinkDecimals);

    // Prepare the transaction to request a flashLoan
    const swapRouterAddressUniswap = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
    const swapRouterAddressSushiswap = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // Sushiswap Router. Currently doesn't work.
    const swapRouterAddresses = [swapRouterAddressUniswap, swapRouterAddressSushiswap];
    const poolFees = [3000, 3000];
    const tokens = [WEthAddress, LinkAddress];

    // Prepare the transaction to request a flashLoan
    let amountToFlashLoan = ethers.parseEther("1") / ethers.getBigInt(1);
    let tx = await flashLoanContract.requestFlashLoanArbitrageSimple(amountToFlashLoan, tokens, swapRouterAddresses, poolFees);
    await tx.wait(); // Wait for the transaction to be mined

    console.log(`FlashLoan transaction completed: ${JSON.stringify(await tx.getTransaction(), replacer, 4)}`)

    // Print the balances of the wallet
    let balanceAfterWETH = Number(await WEth.balanceOf(flashLoanContractAddress)) / Number(WEthDecimals)
    let balanceAfterLink = Number(await Link.balanceOf(flashLoanContractAddress)) / Number(LinkDecimals)
    console.log(`WETH Amount Before FlashLoan: ${balanceBeforeWETH}, WETH Amount After FlashLoan: ${balanceAfterWETH}`);
    console.log(`LINK Amount Before FlashLoan: ${balanceBeforeLink}, LINK Amount After FlashLoan: ${balanceAfterLink}`);
}

const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
