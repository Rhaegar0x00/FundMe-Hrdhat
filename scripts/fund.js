const { deployments, ethers, network } = require("hardhat");
const { developmentChain, networkConfig } = require("../helper-hardhat-config");

async function main() {
  // get accounts/signers
  const signers = await ethers.getSigners();
  const signer = getSigner(signers, 0);

  const test = await deployments.get("FundMe");
  //get contract
  let fundMe;

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
    console.log(fundMe);
    console.log("Sucessful get contract ad developmentchain");
  } else {
    const chainID = network.config.chainID;
    const contractAdress = networkConfig[chainID]["fundMe"];
    fundMe = await ethers.getContractAt("FundMe", contractAdress);
    console.log(fundMe);
    console.log(
      `Successful get contract from ${networkConfig[chainID]["name"]}`
    );
  }

  //fund
  const funder = signers[1];
  const sendValue = ethers.parseEther("0.01");
  const fundtx = await fund(funder, sendValue, fundMe);
  fundtx.wait(1);
  //   const fundtx = await fundMe.connect(signers[1]).fund({ value: sendValue });
  console.log(`Fundtx : ${fundtx}`);
  console.log(`Contract address : ${await fundMe.getAddress()}`);
  console.log(
    `Contract balance : ${await ethers.provider.getBalance(
      fundMe.getAddress()
    )}`
  );
}

async function getSigner(signers, index) {
  return signers[index];
}

async function fund(signer, value, fundMe) {
  const fundtx = await fundMe.connect(signer).fund({ value: value });
  fundtx.wait(1);
  return fundtx;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
