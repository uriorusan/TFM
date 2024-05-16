import { ethers } from "hardhat";

export async function fundWithEth(address: string, amount: string) {
  const signer = await ethers.provider.getSigner();

  let amountWei = ethers.parseEther(amount);
  console.log(`Sending ${amount} ETH from ${signer.address} to ${address}`);

  const tx = await signer.sendTransaction({
    to: address,
    value: amountWei
  });

  await tx.wait();
}
