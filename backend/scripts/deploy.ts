import { ethers, network, run } from "hardhat";

async function main(){
    console.log("Deploying Locketing Contract...");

    const LocketingFactory = await ethers.getContractFactory("Locketing");
    const locketing = await LocketingFactory.deploy();
    console.log('Still Waiting for Confirmation Block...');
    await locketing.waitForDeployment();

    const address = await locketing.getAddress();
    console.log(`Locketing Contract Deployed at: ${address}`);
    if(network.name === "sepolia"){
        await new Promise(resolve => setTimeout(resolve, 30000));
        await verify(address, []);
    }
}

async function verify(contractAddress:string, args: any[]){
    console.log("Verifying Contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments:args,
        })
    } catch (error: any) {
        if(error.message.toLowerCase().includes("already verified")){
            console.log("Already Verified");
        } else {
            console.log(error);
        }
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
})