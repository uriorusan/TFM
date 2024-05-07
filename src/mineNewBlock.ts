import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";


async function main() {
  // instantly mine 1 block
  await mine();
  const provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_JSONRPC_ENDPOINT);
  let latestBlock = await provider.getBlockNumber();
  console.log(latestBlock);
}

main().catch(console.error).finally(() => process.exit(0));