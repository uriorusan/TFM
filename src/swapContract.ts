
import { SwapContract, IERC20Metadata } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { ContractManager } from "./ContractManager";

export class SwapContractManager extends ContractManager<SwapContract> {

    constructor(address?: string) {
        super("SwapContract", address);
    }

    execute = async (platform: string) => {
        console.log(`Will execute a Swap in ${platform} using the contract: ${this.address}`);
        const walletAddress = await this.signer.getAddress();
        console.log(`Will execute transactions from wallet: ${walletAddress}`);

        const swapRouterAddress = platform === "uniswap"
          ? "0xE592427A0AEce92De3Edee1F18E0157C05861564"
          : "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
        const poolFee = platform === "uniswap" ? 3000 : 2500;

        let balanceBeforeWETH = await this.getWEthBalance(this.wallet);
        let balanceBeforeLink = await this.getLinkBalance(this.wallet);

        let amountToSwap = ethers.parseEther("1");
        let approveTx = await this.wEth.approve(this.address, amountToSwap);
        await approveTx.wait();

        let wEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING;
        let LinkAddress = AaveV3Ethereum.ASSETS.LINK.UNDERLYING;

        console.log(`Swapping ${amountToSwap} WETH for LINK in ${swapRouterAddress}`);
        let tx = await this.contract.swapSingle(wEthAddress, LinkAddress, swapRouterAddress, amountToSwap, poolFee);
        await tx.wait();

        let balanceAfterWETH = await this.getWEthBalance(this.wallet);
        let balanceAfterLink = await this.getLinkBalance(this.wallet);

        console.log(`WETH contract Amount Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
        console.log(`LINK Wallet Amount Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
      }

    public async executeOnUni() {
        await this.execute("uniswap");
    }

    public async executeOnPancake() {
        await this.execute("pancakeswap");
      }
}