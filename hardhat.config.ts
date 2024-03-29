import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `${process.env.ALCHEMY_SEPOLIA_ENDPOINT_HTTPS}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    mainnet: {
      url: `${process.env.ALCHEMY_MAINNET_ENDPOINT_HTTPS}`,
      accounts: [process.env.PRIVATE_KEY as string],
    }
  }
};

export default config;
