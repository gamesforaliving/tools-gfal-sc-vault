const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

const NFT_METADATA_BASEURI =
  "https://prod-web3-token-tracker-tqkvar3wjq-uc.a.run.app/metadata/";
const ROYALTIES_IN_BASIS_POINTS = 480;

describe("Game Objects", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContracts() {
    // Contracts are deployed using the first signer/account by default
    const [admin, owner, superAdmin, user, user2] = await ethers.getSigners();

    // GFAL TOKEN
    const GFALToken = await ethers.getContractFactory("GFALToken");
    const gfalToken = await GFALToken.deploy();
    await gfalToken.deployed();
    await gfalToken.transfer(
      user.address,
      hre.ethers.utils.parseEther("10000000000")
    );

    // PROXY SC
    const Proxy = await ethers.getContractFactory("GFALProxy");
    const proxy = await Proxy.deploy(
      gfalToken.address,
      owner.address,
      owner.address,
      owner.address,
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

    // GameObjects NFT
    const GameObjects = await ethers.getContractFactory("GFALGameObjects");
    const gameObjects = await GameObjects.deploy(
      proxy.address,
      "ipfs://",
      ROYALTIES_IN_BASIS_POINTS
    );
    await gameObjects.deployed();

    // MARKETPLACE
    const GFALMarketplace = await ethers.getContractFactory("GFALMarketplace");
    const gFALMarketplace = await GFALMarketplace.deploy(
      ROYALTIES_IN_BASIS_POINTS,
      proxy.address
    );
    await gFALMarketplace.deployed();

    await gameObjects
      .connect(admin)
      .updateBaseURI(NFT_METADATA_BASEURI + gameObjects.address + "/");

    // Set Oracle for consuming the price when minting
    await proxy
      .connect(superAdmin)
      .updateOracleConsumer(oracleConsumer.address);
    await proxy.connect(superAdmin).updateMarketPlace(gFALMarketplace.address);

    await gameObjects.connect(admin).createCollection(100);

    await gfalToken
      .connect(user)
      .approve(
        gameObjects.address,
        ethers.utils.parseUnits("10000000000", "ether")
      );

    return {
      owner,
      user,
      user2,
      admin,
      gfalToken,
      oracleConsumer,
      gFALMarketplace,
      proxy,
      gameObjects,
      superAdmin,
    };
  }

  describe("Deployment", function () {
    it("Should have been deployed successfully", async function () {
      const { gameObjects } = await loadFixture(deployContracts);

      expect(gameObjects.address).to.be.equal(gameObjects.address);
    });
    it("Should have been set tokenURI", async function () {
      const { gameObjects, user, admin } = await loadFixture(deployContracts);
      await gameObjects
        .connect(admin)
        .safeMint(user.address, 1, ethers.utils.parseUnits("1000", "ether"));

      const expectedTokenURI =
        NFT_METADATA_BASEURI + gameObjects.address + "/1";

      expect(await gameObjects.tokenURI(1)).to.be.equal(expectedTokenURI);
    });
  });

  describe("Workflow", function () {
    describe("Validations", function () {
      it("Should revert if a not owner tries to mint a token", async function () {
        const { gameObjects, user } = await loadFixture(deployContracts);

        await expect(
          gameObjects
            .connect(user)
            .safeMint(user.address, 1, ethers.utils.parseUnits("1000", "ether"))
        ).to.be.reverted;
      });

      it("Should return the Owners by token", async function () {
        const { gameObjects, user, admin } = await loadFixture(deployContracts);
        await gameObjects
          .connect(admin)
          .safeMint(user.address, 1, ethers.utils.parseUnits("1000", "ether"));
        await gameObjects
          .connect(admin)
          .safeMint(user.address, 1, ethers.utils.parseUnits("1000", "ether"));
        await gameObjects
          .connect(admin)
          .safeMint(admin.address, 1, ethers.utils.parseUnits("0", "ether"));

        const ownerByID = await gameObjects.getOwnersByTokens([1, 2, 3]);

        expect(ownerByID[0]).to.equal(user.address);
        expect(ownerByID[1]).to.equal(user.address);
        expect(ownerByID[2]).to.equal(admin.address);
      });

      it("Should return `true` when calling supportsInterface() ", async function () {
        const { gameObjects } = await loadFixture(deployContracts);

        expect(await gameObjects.supportsInterface(0x80ac58cd)).to.equal(true);
      });

      it("Create Collection", async function () {
        const { gameObjects, gfalToken, admin, owner, user } =
          await loadFixture(deployContracts);

        const balanceBeforeGFALUser = await gfalToken.balanceOf(user.address);
        const balanceBeforeGFALOwner = await gfalToken.balanceOf(owner.address);

        await gameObjects.createCollection(10);
        await gameObjects.createCollection(20);
        await gameObjects.createCollection(60);
        await gameObjects.createCollection(50);
        await gameObjects.createCollection(10);

        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 2, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 3, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await expect(gameObjects.connect(admin).safeMint(user.address, 8, 100))
          .to.be.reverted;

        expect(await gameObjects.collectionCounter()).to.equal(6);
        const balanceAfterGFALUser = await gfalToken.balanceOf(user.address);
        const balanceAfterGFALOwner = await gfalToken.balanceOf(owner.address);

        expect(balanceBeforeGFALUser).to.be.greaterThan(balanceAfterGFALUser);
        expect(balanceAfterGFALOwner).to.be.greaterThan(balanceBeforeGFALOwner);
      });

      it("Sold out collection and check amount when max supply is reached", async () => {
        const { gameObjects, admin, user } = await loadFixture(deployContracts);

        await gameObjects.connect(admin).createCollection(10);

        for (let i = 0; i < 10; i++) {
          await gameObjects.connect(admin).safeMint(user.address, 2, 0);
        }

        await expect(
          gameObjects.connect(admin).safeMint(user.address, 2, 0)
        ).to.be.revertedWith("Sold out");

        const collectionDetails = await gameObjects.collectionSupply(2);
        expect(collectionDetails.maxSupply).to.equal(
          collectionDetails.totalSold
        );
      });

      it("Create a collection with max supply 0 and mint some", async () => {
        const { gameObjects, admin, user2 } = await loadFixture(
          deployContracts
        );

        await gameObjects.connect(admin).createCollection(0);

        for (let i = 0; i < 100; i++) {
          await gameObjects.connect(admin).safeMint(user2.address, 2, 0);
        }

        expect(await gameObjects.balanceOf(user2.address)).to.equal(100);
      });

      it("Should retrieve the nfts owned by the wallet passed", async () => {
        const { gameObjects, gfalToken, admin, user, user2 } =
          await loadFixture(deployContracts);
        await gameObjects.createCollection(10);

        await gfalToken
          .connect(user)
          .transfer(user2.address, ethers.utils.parseUnits("100000", "ether"));

        await gfalToken
          .connect(user2)
          .approve(
            gameObjects.address,
            ethers.utils.parseEther("10000", "ether")
          );

        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user2.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user2.address, 1, 100);
        await gameObjects.connect(admin).safeMint(user2.address, 1, 100);

        await gameObjects.createCollection(10);
        await gameObjects.createCollection(20);

        const resultUser = await gameObjects.tokensByWallet(user.address);

        const resultUser2 = await gameObjects.tokensByWallet(user2.address);

        expect(resultUser[0]._hex).to.equal("0x01");
        expect(resultUser[1]._hex).to.equal("0x02");
        expect(resultUser2[0]._hex).to.equal("0x03");
        expect(resultUser2[1]._hex).to.equal("0x04");
        expect(resultUser2[2]._hex).to.equal("0x05");
      });

      it("should return the set royalty fees", async () => {
        const { gameObjects, owner } = await loadFixture(deployContracts);

        const result = await gameObjects.royaltyInfo(0, 1000);

        expect(result[0]).to.equal(owner.address);
        expect(result[1]).to.equal(48);
      });
    });
  });

  describe("Royalty for secondary market ERC2981", function () {
    it("Should have set the royaltyFraction price correctly", async function () {
      const { gameObjects } = await loadFixture(deployContracts);

      let result = await gameObjects.royaltyInfo(0, 1000);
      expect(result[1]).to.equal(48);
    });

    it("Update royaltyFraction price and check", async function () {
      const { gameObjects, admin } = await loadFixture(deployContracts);

      await gameObjects.connect(admin).setTokenRoyalty(1000);

      let result = await gameObjects.royaltyInfo(0, 1000);
      expect(result[1]).to.equal(100);
    });

    it("Should revert if caller to update royaltyFraction is not admin", async function () {
      const { user, gameObjects } = await loadFixture(deployContracts);

      await expect(gameObjects.connect(user).setTokenRoyalty(10000)).to.be
        .reverted;
    });
  });
});
