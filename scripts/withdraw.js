const { deployments, ethers, network } = require("hardhat");
const { developmentChain, networkConfig } = require("../helper-hardhat-config");

async function main() {
  let fundMe;
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const test = await deployments.get("FundMe");
  // get contract
  if (developmentChain.includes(network.name)) {
    if (network.name === "hardhat") {
      await deployments.fixture(["all"]);
    }
    fundMe = await ethers.getContractAt(
      "FundMe",
      (
        await deployments.get("FundMe")
      ).address
    );
  } else {
    const chainID = network.config.chainID;
    const contractAddress = networkConfig[chainID]["fundMe"];
    fundMe = await ethers.getContractAt("FundMe", contractAddress);
  }

  console.log(`Contract address : ${await fundMe.getAddress()}`);
  console.log(
    `initial withdraw balance ${await ethers.provider.getBalance(
      await fundMe.getAddress()
    )}`
  );
  const withdrawTx = await fundMe.connect(owner).cheaperWithdraw();
  withdrawTx.wait(1);
  console.log(withdrawTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
