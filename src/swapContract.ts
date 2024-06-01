
import { SwapContractUniV3, SwapContractUniV2 } from '../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { ContractManager } from "./lib/ContractManager";
import { token } from '../typechain-types/@openzeppelin/contracts';
import { BigNumberish } from 'ethers';

export class SwapContractV3Manager extends ContractManager<SwapContractUniV3> {
  swapRouterV3Address = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

  constructor(address?: string) {
      super("SwapContractUniV3", address);
  }

  public async test(platform: string = "uniswap") {
    console.log(`Will execute a Swap in ${platform} using the contract: ${this.address}`);
    console.log(`Will execute transactions from wallet: ${this.wallet}`);

    const swapRouterAddress = platform === "uniswap"
      ? "0xE592427A0AEce92De3Edee1F18E0157C05861564"
      : "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
    const poolFee = platform === "uniswap" ? 3000 : 2500;

    let balanceBeforeWETH = await this.getWEthBalance(this.wallet);
    let balanceBeforeLink = await this.getLinkBalance(this.wallet);

    let amountToSwap = ethers.parseEther("1");
    await this.executeTrade(amountToSwap, AaveV3Ethereum.ASSETS.WETH.UNDERLYING, AaveV3Ethereum.ASSETS.LINK.UNDERLYING, poolFee);

    let balanceAfterWETH = await this.getWEthBalance(this.wallet);
    let balanceAfterLink = await this.getLinkBalance(this.wallet);

    console.log(`WETH contract Amount Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
    console.log(`LINK Wallet Amount Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
  }

  public async testOnUni() {
      await this.test();
  }

  public async testOnPancake() {
      await this.test("pancakeswap");
  }

  /**
   * Executes a trade in UniswapV3
   * @param amount amount, in full units, of the token0 to swap
   * @param token0Address address of token0
   * @param token1Address address of token1
   * @param poolFee pool fee in base 10000
   */
  public async executeTrade(amount: BigNumberish, token0Address: string, token1Address: string, poolFee: number) {

    let token0 = await this.getErc20Token(token0Address);
    let token1 = await this.getErc20Token(token1Address);

    let approveTx = await token0.approve(this.address, amount);
    await approveTx.wait();

    let tx = await this.contract.swapSingle(token0Address, token1Address, this.swapRouterV3Address, amount, poolFee);
    await tx.wait();

    return await token1.balanceOf(this.wallet);
  }
}

export class SwapContractV2Manager extends ContractManager<SwapContractUniV2> {

  swapRouterV2Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02

  constructor(address?: string) {
      super("SwapContractUniV2", address);
  }

  test = async () => {
      console.log(`Will execute a Swap in UniswapV2 using the contract: ${this.address}`);
      console.log(`Will execute transactions from wallet: ${this.wallet}`);

      let balanceBeforeWETH = await this.getWEthBalance(this.wallet);
      let balanceBeforeLink = await this.getLinkBalance(this.wallet);

      let amountToSwap = ethers.parseEther("1");
      await this.executeTrade(amountToSwap, AaveV3Ethereum.ASSETS.WETH.UNDERLYING, AaveV3Ethereum.ASSETS.LINK.UNDERLYING);

      let balanceAfterWETH = await this.getWEthBalance(this.wallet);
      let balanceAfterLink = await this.getLinkBalance(this.wallet);

      console.log(`WETH contract Amount Before Swap: ${balanceBeforeWETH}, WETH Amount After Swap: ${balanceAfterWETH}`);
      console.log(`LINK Wallet Amount Before Swap: ${balanceBeforeLink}, LINK Amount After Swap: ${balanceAfterLink}`);
    }

    /**
     * Executes a trade in UniswapV2
     * @param amount amount as a readable string of the token0 to swap
     * @param token0Address address of token0
     * @param token1Address address of token1
     * @returns the balance of token1 in the wallet after the trade
     */
    async executeTrade(amount: BigNumberish, token0Address: string, token1Address: string) {
      let token0 = await this.getErc20Token(token0Address);

      let token1 = await this.getErc20Token(token1Address);

      let approveTx = await token0.approve(this.address, amount);
      await approveTx.wait();

      let tx = await this.contract.swapSingle(token0Address, token1Address, this.swapRouterV2Address, amount);
      await tx.wait();

      return await token1.balanceOf(this.wallet);
    }
}