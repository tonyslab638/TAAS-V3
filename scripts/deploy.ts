import hre from "hardhat";

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log("====================================");
  console.log("Deploying with wallet:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("====================================");

  const Factory = await hre.ethers.getContractFactory("TaaSProductCore");

  console.log("Deploying contract...");

  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("====================================");
  console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY");
  console.log("Address:", address);
  console.log("====================================");
}

main().catch((err) => {
  console.error("DEPLOY FAILED:", err);
  process.exitCode = 1;
});