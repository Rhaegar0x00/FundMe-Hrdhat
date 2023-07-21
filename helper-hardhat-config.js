const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    fundMe: "0x4f4E90D4d508fD8466C383398fF8A67fBa3ae544",
  },
};

const developmentChain = ["hardhat", "localhost"];
const DECIMAL = 8;
const INITIAL_ANSWER = 2000000000000;
module.exports = {
  networkConfig,
  developmentChain,
  DECIMAL,
  INITIAL_ANSWER,
};
