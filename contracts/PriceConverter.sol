// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConvert {
    function getPrice(
        AggregatorV3Interface _pricefeed
    ) internal view returns (uint256) {
        (, int256 answer, , , ) = _pricefeed.latestRoundData();
        return uint256(answer * 10000000000);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        uint256 price = getPrice(_priceFeed);
        uint256 AmountUSD = (ethAmount * price) / 1000000000000000000;
        return AmountUSD;
    }
}
