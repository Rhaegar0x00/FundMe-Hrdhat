const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChain } = require("../../helper-hardhat-config");

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let mocV3Aggregator;
      let accounts, signers, sendValue;

      console.log("Star testing ..... ");
      beforeEach(async function () {
        // deploy out fundMe contract
        // using Hardhat-deploy
        accounts = await getNamedAccounts();
        signers = await ethers.getSigners();
        sendValue = ethers.parseUnits("1", "ether");
        // const account0 = accounts[0];
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContractAt(
          "FundMe",
          (
            await deployments.get("FundMe")
          ).address
        );
        mocV3Aggregator = await deployments.get("MockV3Aggregator");
      });
      describe("constructor", async function () {
        it("sets the aggregator address correctly ", async function () {
          console.log("Testing constructor ...... ");
          const response = await fundMe.s_priceFeed();
          assert.equal(response, mocV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("Fail if you don't send enough ETH ", async function () {
          // await fundMe.fund();
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });

        it("Updated the amount funded data structure", async function () {
          const deployer = accounts.account_1;
          const txn = await fundMe
            .connect(signers[1])
            .fund({ value: sendValue });
          const response = await fundMe.s_addressToAmountFunded(deployer);
          console.log(`Msg.sender : ${signers[1].address}`);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Add funder to array of funder ", async function () {
          await fundMe.connect(signers[0]).fund({ value: sendValue });
          const funder = await fundMe.s_funders(0);
          assert.equal(funder, signers[0].address);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          for (let i = 0; i < signers.length; i++) {
            await fundMe.connect(signers[i]).fund({ value: sendValue });
          }
        });

        it("withdraw ETH from a single founder", async function () {
          //arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const startDeployerBalance = await ethers.provider.getBalance(
            signers[0].address
          );
          //act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            signers[0].address
          );
          //assert

          console.log(typeof startDeployerBalance);
          assert.equal(endingFundMeBalance.toString(), "0");
          assert.equal(
            (startingFundMeBalance + startDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );
        });

        it("Withdraw for multiple funders ", async function () {
          const staringOwnerBalance = await ethers.provider.getBalance(
            fundMe.getOwner()
          );
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const endingOwnerBalance = await ethers.provider.getBalance(
            fundMe.getOwner()
          );

          // endingOwnerBalance = startingOwnerBalance + StartingFUndMeBalance - gas fee
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          assert.equal(
            endingOwnerBalance.toString(),
            (staringOwnerBalance + startingFundMeBalance - gasCost).toString()
          );

          //reset funders
          await expect(fundMe.s_funders(0)).to.be.reverted;

          // address => unit256 balance = 0
          for (i in signers) {
            assert.equal(
              await fundMe.s_addressToAmountFunded(signers[i].address),
              0
            );
          }
          console.log(
            `owner Balance after withdraw ${await ethers.provider.getBalance(
              fundMe.getOwner()
            )}`
          );
        });

        it("Only Owner can withdraw", async function () {
          const attacker = signers[5];
          const AttackerContractConnected = await fundMe.connect(attacker);
          await expect(AttackerContractConnected.withdraw()).to.be.reverted;
        });
      });

      // cheaper Withdraw
      it("Cheaper withdraw ETH from a single founder", async function () {
        //arrange
        const startingFundMeBalance = await ethers.provider.getBalance(
          fundMe.getAddress()
        );
        const startDeployerBalance = await ethers.provider.getBalance(
          signers[0].address
        );
        //act
        const transactionResponse = await fundMe.cheaperWithdraw();
        const transactionReceipt = await transactionResponse.wait(1);
        const { gasUsed, gasPrice } = transactionReceipt;
        const gasCost = gasUsed * gasPrice;
        const endingFundMeBalance = await ethers.provider.getBalance(
          fundMe.getAddress()
        );
        const endingDeployerBalance = await ethers.provider.getBalance(
          signers[0].address
        );
        //assert

        console.log(typeof startDeployerBalance);
        assert.equal(endingFundMeBalance.toString(), "0");
        assert.equal(
          (startingFundMeBalance + startDeployerBalance).toString(),
          (endingDeployerBalance + gasCost).toString()
        );
      });

      it("Cheaper Withdraw for multiple funders ", async function () {
        const staringOwnerBalance = await ethers.provider.getBalance(
          fundMe.getOwner()
        );
        const startingFundMeBalance = await ethers.provider.getBalance(
          fundMe.getAddress()
        );
        const transactionResponse = await fundMe.cheaperWithdraw();
        const transactionReceipt = await transactionResponse.wait(1);

        const endingOwnerBalance = await ethers.provider.getBalance(
          fundMe.getOwner()
        );

        // endingOwnerBalance = startingOwnerBalance + StartingFUndMeBalance - gas fee
        const { gasUsed, gasPrice } = transactionReceipt;
        const gasCost = gasUsed * gasPrice;
        assert.equal(
          endingOwnerBalance.toString(),
          (staringOwnerBalance + startingFundMeBalance - gasCost).toString()
        );

        //reset funders
        await expect(fundMe.s_funders(0)).to.be.reverted;

        // address => unit256 balance = 0
        for (i in signers) {
          assert.equal(
            await fundMe.s_addressToAmountFunded(signers[i].address),
            0
          );
        }
        console.log(
          `owner Balance after withdraw ${await ethers.provider.getBalance(
            fundMe.getOwner()
          )}`
        );
      });
    });
