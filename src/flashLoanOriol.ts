
import { FlashLoanOriol, IERC20Metadata } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { ContractManager } from "./ContractManager";

export class FlashLoanOriolContractManager extends ContractManager<FlashLoanOriol> {
    constructor (swapContractAddress: string, address?: string) {
        super("FlashLoanOriol", address, [AaveV3Ethereum.POOL_ADDRESSES_PROVIDER, swapContractAddress]);
    }

    execute = async (input?: FlashLoanOriol.RequestFlashLoanArbitrageSimpleParamsStruct) => {

        // Prepare the transaction to request a flashLoan
        const swapRouterAddressUniswap = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
        const swapRouterAddressSushiswap = "0x1b81D678ffb9C0263b24A97847620C99d213eB14"; // Sushiswap Router.
        const swapRouterAddresses = [swapRouterAddressUniswap, swapRouterAddressSushiswap];
        const poolFees = [3000, 2500];
        const tokens = [this.wEthAddress, this.LinkAddress];
        const amountToFlashLoan = ethers.parseEther("1");

        if (!input) {
            input = {
                amount: amountToFlashLoan,
                tokens: tokens,
                swapRouters: swapRouterAddresses,
                poolFees: poolFees
            } as FlashLoanOriol.RequestFlashLoanArbitrageSimpleParamsStruct;
        }

        let wEthBefore = await this.getWEthBalance(this.wallet);
        let wEthBeforeContract = await this.getWEthBalance();

        // Prepare the transaction to request a flashLoan
        let tx = await this.contract.requestFlashLoanArbitrageSimple(input);
        await tx.wait(); // Wait for the transaction to be mined

        console.log(`FlashLoan transaction completed: ${JSON.stringify(await tx.getTransaction(), this.replacer, 4)}`);

        let wEthAfter = await this.getWEthBalance(this.wallet);
        console.log(`WETH Amount Before FlashLoan: ${wEthBefore} (wallet), ${wEthBeforeContract} (contract), WETH Amount After FlashLoan: ${wEthAfter}.`);
        let result = wEthAfter - (wEthBefore + wEthBeforeContract);
        console.log(`${result > 0 ? "Profit" : "Loss"} of ${result} WETH`);
    }
}