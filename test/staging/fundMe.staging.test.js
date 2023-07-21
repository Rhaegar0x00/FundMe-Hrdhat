const { assert } = require("chai");
const { developmentChain } = require("../../helper-hardhat-config");
const { network } = require("hardhat");

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let signers;
      const sendValue = ethers.parseEther("0.01");
      let owner;
      const fundMeAddress = "0x4f4E90D4d508fD8466C383398fF8A67fBa3ae544";
      beforeEach(async function () {
        signers = await ethers.getSigners();
        for (index in signers) {
          console.log(signers[index].address);
        }
        fundMe = await ethers.getContractAt("FundMe", fundMeAddress);
        owner = await fundMe.getOwner();
        console.log(`Owner address : ${owner}`);
      });

      it("Allow people to fund and withdraw", async function () {
        let totalAmountFunded = BigInt("0");
        const startingFundMeBalnce = await ethers.provider.getBalance(
          fundMeAddress
        );
        console.log(`staringFundMeBalance : ${startingFundMeBalnce}`);
        for (index in signers) {
          const fundtxnResponse = await fundMe
            .connect(signers[index])
            .fund({ value: sendValue });
          await fundtxnResponse.wait(1);
          totalAmountFunded = totalAmountFunded + sendValue;
          console.log(
            `Account ${index} : ${await ethers.provider.getBalance(
              fundMeAddress
            )}`
          );
        }

        const endingFundMeBalance = await ethers.provider.getBalance(
          fundMeAddress
        );
        console.log(`endingFundMeBalance : ${endingFundMeBalance}`);
        assert.equal(
          totalAmountFunded.toString(),
          (endingFundMeBalance - startingFundMeBalnce).toString()
        );
        const transactionResponse = await fundMe
          .connect(signers[0])
          .cheaperWithdraw();
        const transactionReceipt = await transactionResponse.wait(1);
        console.log(transactionReceipt);
        const afterFundMeWithdrawBalance = await ethers.provider.getBalance(
          fundMeAddress
        );
        assert.equal(afterFundMeWithdrawBalance, "0");
      }).timeout(1000000);
    });
