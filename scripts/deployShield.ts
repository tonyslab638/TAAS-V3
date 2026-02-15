import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function main() {

    const rpc = process.env.SEPOLIA_RPC_URL!;
    const key = process.env.PRIVATE_KEY!;
    const core = process.env.CONTRACT_ADDRESS!;

    if(!rpc || !key || !core)
        throw new Error("Missing ENV");

    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(key, provider);

    console.log("Deploying Shield with:", wallet.address);

    const artifact = JSON.parse(
        fs.readFileSync(
            "./artifacts/contracts/TaaSShield.sol/TaaSShield.json",
            "utf8"
        )
    );

    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        wallet
    );

    const contract = await factory.deploy(core);

    await contract.waitForDeployment();

    console.log("===================================");
    console.log("🛡 SHIELD DEPLOYED");
    console.log(await contract.getAddress());
    console.log("===================================");
}

main();