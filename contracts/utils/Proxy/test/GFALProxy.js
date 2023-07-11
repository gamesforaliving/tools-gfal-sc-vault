const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

const NFT_METADATA_BASEURI =
  "https://prod-web3-token-tracker-tqkvar3wjq-uc.a.run.app/metadata/";

const ROYALTIES_IN_BASIS_POINTS = 1000;

describe("GFALProxy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContracts() {
    // Contracts are deployed using the first signer/account by default
    const [
      admin,
      user,
      contract,
      owner,
      feeCollector,
      royaltiesCollector,
      superAdmin,
    ] = await ethers.getSigners();

    // GFAL TOKEN
    const GFALToken = await ethers.getContractFactory("GFALToken");
    const gfalToken = await GFALToken.deploy();
    await gfalToken.deployed();

    // PROXY SC
    const Proxy = await ethers.getContractFactory("GFALProxy");
    const proxy = await Proxy.deploy(
      gfalToken.address,
      owner.address,
      feeCollector.address,
      royaltiesCollector.address,
      superAdmin.address
    );
    await proxy.deployed();

    // ORACLE CONSUMER
    const OracleConsumer = await ethers.getContractFactory(
      "GFALOracleConsumer"
    );
    const oracleConsumer = await OracleConsumer.deploy(
      proxy.address,
      ethers.utils.parseUnits("0.1", "ether")
    );
    await oracleConsumer.deployed();

    // MARKETPLACE
    const GFALMarketplace = await ethers.getContractFactory("GFALMarketplace");
    const gFALMarketplace = await GFALMarketplace.deploy(
      ROYALTIES_IN_BASIS_POINTS,
      proxy.address
    );
    await gFALMarketplace.deployed();

    return {
      owner,
      user,
      admin,
      contract,
      gfalToken,
      proxy,
      oracleConsumer,
      gFALMarketplace,
      feeCollector,
      royaltiesCollector,
      superAdmin,
    };
  }

  describe("Set addresses in GFALProxy", function () {
    it("Owner & Admin should be set correctly", async function () {
      const { owner, proxy, admin } = await loadFixture(deployContracts);

      expect(await proxy.owner()).to.equal(owner.address);
      console.log("- Owner set correctly!");

      expect(true).to.equal(await proxy.checkAdmin(admin.address));
    });

    it("Should have been set the addresses right", async function () {
      const {
        contract,
        gfalToken,
        proxy,
        oracleConsumer,
        gFALMarketplace,
        superAdmin,
        feeCollector,
        royaltiesCollector,
      } = await loadFixture(deployContracts);

      await proxy.connect(superAdmin).updateGfalToken(gfalToken.address);
      expect(await proxy.getGfalToken()).to.equal(gfalToken.address);

      await proxy
        .connect(superAdmin)
        .updateOracleConsumer(oracleConsumer.address);
      expect(await proxy.getOracleConsumer()).to.equal(oracleConsumer.address);

      expect(await proxy.getFeeCollector()).to.equal(feeCollector.address);
      await proxy.connect(superAdmin).updateFeeCollector(contract.address);
      expect(await proxy.getFeeCollector()).to.equal(contract.address);

      expect(await proxy.getRoyaltiesCollector()).to.equal(
        royaltiesCollector.address
      );
      await proxy
        .connect(superAdmin)
        .updateRoyaltiesCollector(contract.address);
      expect(await proxy.getRoyaltiesCollector()).to.equal(contract.address);

      await proxy
        .connect(superAdmin)
        .updateMarketPlace(gFALMarketplace.address);
      expect(await proxy.getMarketPlace()).to.equal(gFALMarketplace.address);

      console.log(
        `\n- All contracts addresses are set correctly in the Proxy!`
      );
    });

    it("Should reject to set addresses from not admin", async function () {
      const { user, contract, proxy, gFALMarketplace } = await loadFixture(
        deployContracts
      );

      await expect(proxy.connect(user).updateGfalToken(contract.address)).to.be
        .reverted;

      await expect(proxy.connect(user).updateOracleConsumer(contract.address))
        .to.be.reverted;

      await expect(proxy.connect(user).updateFeeCollector(contract.address)).to
        .be.reverted;

      await expect(
        proxy.connect(user).updateRoyaltiesCollector(contract.address)
      ).to.be.reverted;

      await expect(
        proxy.connect(user).updateMarketPlace(gFALMarketplace.address)
      ).to.be.reverted;

      console.log(`\n- Setting addresses in contract from NOT OWNER rejected!`);
    });

    it("Should update Admin and refuse if caller is not owner", async () => {
      const { owner, user, admin, proxy, superAdmin } = await loadFixture(
        deployContracts
      );

      await expect(proxy.connect(admin).updateAdmin(user.address, true)).to.be
        .reverted;
      await expect(proxy.connect(superAdmin).updateAdmin(user.address, true)).to
        .be.reverted;

      await proxy.connect(owner).updateAdmin(user.address, true);

      expect(await proxy.checkAdmin(user.address)).to.equal(true);
    });

    it("Should return false if not superAdmin", async () => {
      const { user, admin, proxy } = await loadFixture(deployContracts);

      await expect(proxy.connect(admin).updateSuperAdmin(user.address, true)).to
        .be.reverted;
      await expect(proxy.connect(user).updateSuperAdmin(user.address, true)).to
        .be.reverted;
    });
  });
});
