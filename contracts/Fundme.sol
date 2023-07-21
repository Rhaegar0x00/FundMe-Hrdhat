// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *   @author Rhaegar
 *   @notice This contract is to demo a sample funding contract
 *   @dev This implements price feeds from chainlink as library
 */
contract FundMe {
    // Type Declararions
    using PriceConvert for uint256;

    //State Variables
    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;
    address private immutable i_owner;
    uint256 private s_minimumUSD = 5 * 10 ** 18;
    AggregatorV3Interface public s_priceFeed;

    //events
    error FundMe__Not_owner();
    //Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__Not_owner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address _pricefeed) public {
        s_priceFeed = AggregatorV3Interface(
            // 0x694AA1769357215DE4FAC081bf1f309aDC325306
            _pricefeed
        );
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= s_minimumUSD,
            "You need to spend more ETH!"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    // 1000000000

    function withdraw() public payable onlyOwner {
        (bool success, ) = address(i_owner).call{value: address(this).balance}(
            ""
        );
        require(success);
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
    }

    function cheaperWithdraw() public payable onlyOwner {
        (bool success, ) = address(i_owner).call{value: address(this).balance}(
            ""
        );
        require(success);
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            s_addressToAmountFunded[funders[funderIndex]] = 0;
        }
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getfunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function setMinimum(uint256 _minimumUSD) public onlyOwner {
        require(_minimumUSD >= 100000000000000, "Too small !");
        s_minimumUSD = _minimumUSD;
    }

    function getMinimum() public view returns (uint256) {
        return s_minimumUSD;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }
}
