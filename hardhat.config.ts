import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    goerli: {
      url: `${process.env.ALCHEMY_SEPOLIA_ENDPOINT}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  }
};

export default config;
