// import

// function deployFunc() {
//   console.log("Hmm ?");
// }

// module.exports.default = deployFunc;

// import file
const { network } = require("hardhat");
const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { verify } = require("../util/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainID = network.config.chainID;

  let ethUsdPriceFeedAddress;
  if (developmentChain.includes(network.name)) {
    const ethUsdPriceFeed = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdPriceFeed.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"];
    console.log(`Price feed address : ${ethUsdPriceFeedAddress}`);
  }
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // args for contructor
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log(`args : ${args}`);
    await verify(fundMe.address, args);
  }
  log("---------------------------------------");
};

module.exports.tags = ["all", "fundme"];
