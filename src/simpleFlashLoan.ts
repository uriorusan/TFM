
import { FlashLoanV3 } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { ContractManager } from './ContractManager';

export class SimpleFlashLoanContractManager extends ContractManager<FlashLoanV3> {

        constructor(address?: string) {
            super("FlashLoanV3", address, [AaveV3Ethereum.POOL_ADDRESSES_PROVIDER]);
        }

        execute = async () => {
            console.log(`Will execute a FlashLoan using the contract: ${this.address}`);
            const walletAddress = await this.signer.getAddress();

            let balanceBeforeWETH = await this.getWEthBalance(walletAddress);

            // Do the FlashLoan of 1 WETH
            let amountToFlashLoan = ethers.parseEther("1") / ethers.getBigInt(1);
            let tx = await this.contract.requestFlashLoan(this.wEthAddress, amountToFlashLoan);
            await tx.wait(); // Wait for the transaction to be mined

            // Get Balances of the flashLoanContract
            let balanceAfterWETH = await this.getWEthBalance(walletAddress);

            console.log(`WETH Amount Before Simple FlashLoan: ${balanceBeforeWETH}, WETH Amount After FlashLoan: ${balanceAfterWETH}`);
        }
}