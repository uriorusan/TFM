import { FlashLoanArbitrage } from '../../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { ContractManager } from "../lib/ContractManager";
import { AddressLike, BigNumberish } from 'ethers';

export class FlashLoanArbitrageContractManager extends ContractManager<FlashLoanArbitrage> {
    constructor(swapContractV3Address: string, swapContractV2Address: string, address?: string) {
        super("FlashLoanArbitrage", address, [AaveV3Ethereum.POOL_ADDRESSES_PROVIDER, swapContractV3Address, swapContractV2Address]);
    }

    test = async () => {
        // Prepare the transaction to request a flashLoan
        const usdcAddress = AaveV3Ethereum.ASSETS.USDC.UNDERLYING;

        await this.execute(true, usdcAddress, ethers.parseEther("1"), 3000);
    }

    execute = async (v3First: boolean, token1Address: AddressLike, amount: BigNumberish, v3Fee: number) => {
        // Prepare the transaction to request a flashLoan
        const swapRouterV3Address = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
        const swapRouterV2Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router.
        const swapRouterAddresses = v3First ? [swapRouterV3Address, swapRouterV2Address] : [swapRouterV2Address, swapRouterV3Address];
        const poolFees = v3First ? [v3Fee, 0] : [0, v3Fee];
        const tokens = [this.wEthAddress, token1Address];
        const amountToFlashLoan = amount;

        let direction = await this.contract.getDirectionParam(v3First);

        let input = {
            amount: amountToFlashLoan,
            tokens: tokens,
            swapRouters: swapRouterAddresses,
            poolFees: poolFees,
            direction: direction
        } as FlashLoanArbitrage.RequestFlashLoanArbitrageSimpleParamsStruct;

        let wEthBefore = await this.getWEthBalance(this.wallet);
        let wEthBeforeContract = await this.getWEthBalance();

        // Prepare the transaction to request a flashLoan
        let tx = await this.contract.requestFlashLoanArbitrageSimple(input);
        await tx.wait(); // Wait for the transaction to be mined

        let wEthAfter = await this.getWEthBalance(this.wallet);
        console.log(`WETH Amount Before FlashLoan: ${wEthBefore} (wallet), ${wEthBeforeContract} (contract), WETH Amount After FlashLoan: ${wEthAfter}.`);
        let result = wEthAfter - (wEthBefore + wEthBeforeContract);
        console.log(`${result > 0 ? "Profit" : "Loss"} of ${result} WETH`);
        return result;
    }
}
