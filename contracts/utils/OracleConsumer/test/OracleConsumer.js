const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

describe("OracleConsumer", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContracts() {
    // Contracts are deployed using the first signer/account by default
    const [admin, owner, user, superAdmin] = await ethers.getSigners();

    const GFALToken = await ethers.getContractFactory("GFALToken");
    const gfalToken = await GFALToken.deploy();
    await gfalToken.deployed();

    const Proxy = await ethers.getContractFactory("GFALProxy");
    const proxy = await Proxy.deploy(
      gfalToken.address,
      owner.address,
      owner.address,
      owner.address,
      superAdmin.address
    );
    await proxy.deployed();

    //Note: Admin will be removed after the massive deployment is finished and everything is set up for production.
    await proxy.connect(owner).updateSuperAdmin(admin.address, false);

    const OracleConsumer = await ethers.getContractFactory("OracleConsumer");
    const oracleConsumer = await OracleConsumer.deploy(
      proxy.address,
      ethers.utils.parseUnits("0.1", "ether")
    );
    await oracleConsumer.deployed();

    return { owner, user, admin, superAdmin, oracleConsumer };
  }

  describe("Deployment", function () {
    it("Should have been deployed successfully", async function () {
      const { oracleConsumer } = await loadFixture(deployContracts);

      expect(await oracleConsumer.address).to.be.equal(oracleConsumer.address);
    });

    it("Should not allow to set the lastTokenRateValue to 0", async function () {
      const { oracleConsumer, superAdmin } = await loadFixture(deployContracts);

      expect(await oracleConsumer.lastTokenRateValue()).to.equal(
        ethers.utils.parseUnits("0.1", "ether")
      );

      await expect(oracleConsumer.connect(superAdmin).updateRateValue(0)).to.be
        .reverted;
    });
  });

  describe("Workflow", function () {
    describe("Validations", function () {
      it("Should revert if a not super admin tries to change the price index", async function () {
        const { oracleConsumer, user, admin } = await loadFixture(
          deployContracts
        );

        // Expect to find it in the mapping as true
        await expect(oracleConsumer.connect(user).updateRateValue(1000)).to.be
          .reverted;
        await expect(oracleConsumer.connect(admin).updateRateValue(1000)).to.be
          .reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event UpdatedRate on updating the rate", async function () {
        const { oracleConsumer, superAdmin } = await loadFixture(
          deployContracts
        );

        await expect(
          await oracleConsumer
            .connect(superAdmin)
            .updateRateValue(ethers.utils.parseUnits("0.1", "ether"))
        )
          .to.emit(oracleConsumer, "UpdatedRate")
          .withArgs(ethers.utils.parseUnits("0.1", "ether"));
      });
    });

    describe("Workflow", function () {
      it("Should update the lastTokenRateValue", async function () {
        const { oracleConsumer, superAdmin } = await loadFixture(
          deployContracts
        );

        expect(await oracleConsumer.lastTokenRateValue()).to.equal(
          ethers.utils.parseUnits("0.1", "ether")
        );

        await oracleConsumer
          .connect(superAdmin)
          .updateRateValue(ethers.utils.parseUnits("0.01", "ether")); // here we are converting the float to wei to work as "intFloat"

        expect(await oracleConsumer.lastTokenRateValue()).to.equal(
          ethers.utils.parseUnits("0.01", "ether")
        );
      });

      it("Should get the correct getConversionRate", async function () {
        const { oracleConsumer, superAdmin } = await loadFixture(
          deployContracts
        );

        await oracleConsumer
          .connect(superAdmin)
          .updateRateValue(ethers.utils.parseUnits("10", "ether")); // here we are converting the float to wei to work as "intFloat"

        const price1 = ethers.utils.formatUnits("1000000000000000000", "wei");
        const price2 = ethers.utils.formatUnits("3000000000000000000", "wei");
        const price3 = ethers.utils.formatUnits("5000000000000000000", "wei");
        const price4 = ethers.utils.formatUnits("7000000000000000000", "wei");

        expect(
          await oracleConsumer.getConversionRate(BigNumber.from(price1))
        ).to.equal("100000000000000000");
        expect(
          await oracleConsumer.getConversionRate(BigNumber.from(price2))
        ).to.equal("300000000000000000");
        expect(
          await oracleConsumer.getConversionRate(BigNumber.from(price3))
        ).to.equal("500000000000000000");
        expect(
          await oracleConsumer.getConversionRate(BigNumber.from(price4))
        ).to.equal("700000000000000000");
      });
    });
  });
});
