import { HardhatUserConfig, SolidityUserConfig } from "hardhat/types";
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import {config as dotEnvConfig} from 'dotenv';

dotEnvConfig();

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
    },
    {
      version: "0.7.6",
    }
  ]
};

const config: HardhatUserConfig = {
  solidity: solidityConfig,
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
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
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      }
    }
  }
};

export default config;
