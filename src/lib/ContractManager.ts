
import { IERC20Metadata } from '../../typechain-types';
import { ethers } from "hardhat";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { Contract } from 'ethers';

interface IContractManager<T> {
    initialize(): Promise<void>;
    extraInitalize?(): void;
}

export abstract class ContractManager<T> implements IContractManager<T> {
    signer: any;
    wallet: string = "";
    address: string;
    contract: T = {} as T;
    contractName: string;
    wEth: IERC20Metadata = {} as IERC20Metadata;
    Link: IERC20Metadata = {} as IERC20Metadata;
    wEthAddress: string = AaveV3Ethereum.ASSETS.WETH.UNDERLYING;
    LinkAddress: string = AaveV3Ethereum.ASSETS.LINK.UNDERLYING;
    deployParams: any[];

    constructor(contractName: string, address?: string, deployParams?: any[]) {
        this.address = address || "";
        this.contractName = contractName;
        this.deployParams = deployParams || [];
    }

    async initialize() {
        this.signer = await ethers.provider.getSigner();
        this.wallet = await this.signer.getAddress();
        if (this.address === "") {
            this.address = await this.deploy();
        }
        this.contract = await ethers.getContractAt(this.contractName, this.address, this.signer) as T;
        this.Link = await ethers.getContractAt('IERC20Metadata', AaveV3Ethereum.ASSETS.LINK.UNDERLYING, this.signer);
        this.wEth = await ethers.getContractAt('IERC20Metadata', AaveV3Ethereum.ASSETS.WETH.UNDERLYING, this.signer);
    }

    private async deploy(): Promise<string> {
        let factory = await ethers.getContractFactory(this.contractName, this.signer);
        let contract = await factory.deploy(...this.deployParams);
        contract.waitForDeployment();

        let address = await contract.getAddress();
        console.log(`${this.contractName} deployed to:`, address);
        return address;
    }

    // If you don't provide an address, it uses the contract address
    async getLinkBalance(address?: string) {
        let LinkDecimals = ethers.getBigInt(10) ** ethers.getBigInt(await this.Link.decimals());
        let balanceLink = Number(await this.Link.balanceOf(address || this.address)) / Number(LinkDecimals)
        return balanceLink;
    }

    // If you don't provide an address, it uses the contract address
    async getWEthBalance(address?: string) {
        let wEthDecimals = ethers.getBigInt(10) ** ethers.getBigInt(18);
        let balanceWETH = Number(await this.wEth.balanceOf(address || this.address)) / Number(wEthDecimals);
        return balanceWETH;
    }

    async fundWithEth(amount: string) {
        let amountWei = ethers.parseEther(amount);
        console.log(`Sending ${amount} ETH from ${this.signer.address} to ${this.address}`);

        const tx = await this.signer.sendTransaction({
            to: this.address,
            value: amountWei
        });

        await tx.wait();
    }

    fundWithWrappedEth = async (amount: string, address?: string) => {
        let amountWei = ethers.parseEther(amount);

        const wEthGatewayAddress = AaveV3Ethereum.WETH_GATEWAY;
        const wEthGateway = await ethers.getContractAt('WrappedTokenGatewayV3', wEthGatewayAddress, this.signer);

        // Setup for Aave interactions. We need to get some aLink tokens to use as collateral
        const poolAddressesProviderAddress = AaveV3Ethereum.POOL_ADDRESSES_PROVIDER;
        const poolAddressesProvider = await ethers.getContractAt("IPoolAddressesProvider", poolAddressesProviderAddress, this.signer);
        const poolAddress = await poolAddressesProvider.getPool();
        const pool = await ethers.getContractAt("IPool", poolAddress, this.signer);

        let tx = await wEthGateway.depositETH(poolAddress, this.signer.address, 0, { value: amountWei });
        await tx.wait();

        let wEthAddress = AaveV3Ethereum.ASSETS.WETH.UNDERLYING;

        if (!address || address === "") {
            address = this.address;
        }

        tx = await pool.withdraw(wEthAddress, amountWei, address);
        await tx.wait();

        console.log(`Sent ${amount} weth to ${address}`);
    }

    getErc20Token = async (address: string) => {
        return await ethers.getContractAt('IERC20Metadata', address, this.signer);
    }

    replacer = (key: any, value: any) =>
        typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
}
