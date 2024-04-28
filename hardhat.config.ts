import { HardhatUserConfig, SolidityUserConfig } from "hardhat/types";
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import { artifacts } from "./artifacts";
require("dotenv").config();


const solidityConfig: SolidityUserConfig = {
  compilers: [
    {
      version: "0.8.20",
    },
    {
      version: "0.8.10",
    },
    {
      version: "0.6.12",
    }
  ]
};

const config: HardhatUserConfig = {
  solidity: solidityConfig,
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    externalArtifacts: artifacts,
  },
  networks: {
    sepolia: {
      url: `${process.env.ALCHEMY_SEPOLIA_ENDPOINT_HTTPS}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    mainnet: {
      url: `${process.env.ALCHEMY_MAINNET_ENDPOINT_HTTPS}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      ],
    }
  }
};

export default config;
