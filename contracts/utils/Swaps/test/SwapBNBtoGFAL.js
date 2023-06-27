const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const GFALToken = require("../artifacts/contracts/_mock/GFALToken.sol/GFALToken.json");

// NOTE: The requirement to run this test is to have a valid fork of BSC mainnet and to impersonate a wallet with enough BNB balance to complete the swap.
describe("MultiSwap BNB/GFAL", function () {
  async function deployContracts() {
    // Hard coded amount to send in BNB
    const BNBSwap = "1";
    // Hard coded amount to receive  to avoid front running (It should be equivalent to the GFAL amount we are expecting to receive)
    const amountOutMin = "13200553541451765";

    const GFAL_ADDRESS = process.env.GFAL_TOKEN_MAINNET;
    const USDT_ADDRESS = process.env.USDT_TOKEN_MAINNET;
    const WBNB_ADDRESS = process.env.WBNB_ADDRESS;
    const WBNB_WHALE_SIGNER = process.env.BNB_WHALE_HOLDER;

    console.log("BNB_WHALE_HOLDER: ", WBNB_WHALE_SIGNER);

    const BNBWhaleSigner = await ethers.getImpersonatedSigner(
      WBNB_WHALE_SIGNER
    );
    const Wale_BNB_Balance = await ethers.provider.getBalance(
      BNBWhaleSigner.address
    );

    const gfalToken = await ethers.getContractAt(GFALToken.abi, GFAL_ADDRESS);
    const wbnbToken = await ethers.getContractAt(GFALToken.abi, WBNB_ADDRESS);
    const usdtToken = await ethers.getContractAt(GFALToken.abi, USDT_ADDRESS);

    const SwapBNBtoGFAL = await ethers.getContractFactory(
      "SwapBNBtoGFAL",
      BNBWhaleSigner
    );
    const swapBNBtoGFAL = await SwapBNBtoGFAL.deploy();
    await swapBNBtoGFAL.deployed();

    console.log(
      `${BNBWhaleSigner.address}: Owns ${ethers.utils.formatEther(
        Wale_BNB_Balance,
        "wei"
      )} BNB`
    );

    return {
      BNBWhaleSigner,
      swapBNBtoGFAL,
      WBNB_ADDRESS,
      gfalToken,
      GFAL_ADDRESS,
      Wale_BNB_Balance,
      USDT_ADDRESS,
      wbnbToken,
      usdtToken,
      BNBSwap,
      amountOutMin,
    };
  }

  describe("Deployment", () => {
    it("Swap BNB for GFAL", async () => {
      const {
        BNBWhaleSigner,
        swapBNBtoGFAL,
        gfalToken,
        wbnbToken,
        usdtToken,
        BNBSwap,
        amountOutMin,
      } = await loadFixture(deployContracts);

      const balanceBeforeSwapGFAL = await gfalToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceBeforeSwapWBNB = await wbnbToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceBeforeSwapUSDT = await usdtToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceBeforeSwapBNB = await ethers.provider.getBalance(
        BNBWhaleSigner.address
      );

      await swapBNBtoGFAL.connect(BNBWhaleSigner).swapBNBforGFAL(amountOutMin, {
        // Hard
        value: ethers.utils.parseUnits(BNBSwap, "ether"),
      });

      // console.log(" RESULT:", result);

      const balanceAfterSwapGFAL = await gfalToken.balanceOf(
        BNBWhaleSigner.address
      );

      const balanceAfterSwapWBNB = await wbnbToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceAfterSwapUSDT = await usdtToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceAfterSwapBNB = await ethers.provider.getBalance(
        BNBWhaleSigner.address
      );

      console.log(
        `\nBalance BEFORE GFAL: ${ethers.utils.formatEther(
          balanceBeforeSwapGFAL
        )}`
      );
      console.log(
        `Balance AFTER GFAL: ${ethers.utils.formatEther(balanceAfterSwapGFAL)}`
      );

      console.log(
        `\nBalance BEFORE WBNB: ${ethers.utils.formatEther(
          balanceBeforeSwapWBNB
        )}`
      );
      console.log(
        `Balance AFTER WBNB: ${ethers.utils.formatEther(balanceAfterSwapWBNB)}`
      );
      console.log(
        `\nBalance BEFORE USDT: ${ethers.utils.formatEther(
          balanceBeforeSwapUSDT
        )}`
      );
      console.log(
        `Balance AFTER USDT: ${ethers.utils.formatEther(balanceAfterSwapUSDT)}`
      );
      console.log(
        `\nBalance BEFORE BNB: ${ethers.utils.formatEther(
          balanceBeforeSwapBNB
        )}`
      );
      console.log(
        `Balance AFTER BNB: ${ethers.utils.formatEther(balanceAfterSwapBNB)}`
      );

      const GFALbalanceAFTER = ethers.utils.formatEther(balanceAfterSwapGFAL);
      const GFALbalanceBEFORE = ethers.utils.formatEther(balanceBeforeSwapGFAL);

      console.log(`\nGFAL DIFF: +${GFALbalanceAFTER - GFALbalanceBEFORE}`);

      expect(balanceAfterSwapGFAL).to.be.greaterThan(amountOutMin);
      expect(balanceAfterSwapGFAL).to.be.greaterThan(balanceBeforeSwapGFAL);
      expect(balanceBeforeSwapBNB).to.be.greaterThan(balanceAfterSwapBNB);
      expect(balanceAfterSwapUSDT).to.equal(balanceBeforeSwapUSDT);
      expect(balanceAfterSwapWBNB).to.equal(balanceAfterSwapWBNB);
    });

    //Test that the contract rejects swaps when the sent BNB amount is zero:
    it("Should revert when swapping with zero BNB", async () => {
      const { swapBNBtoGFAL, amountOutMin } = await loadFixture(
        deployContracts
      );

      await expect(
        swapBNBtoGFAL.swapBNBforGFAL(amountOutMin, { value: 0 })
      ).to.be.revertedWith("BNB cannot be 0");
    });

    //Test that the contract rejects swaps when the amountOutMin is zero:
    it("Should revert when swapping with zero amountOutMin", async () => {
      const { swapBNBtoGFAL, BNBSwap } = await loadFixture(deployContracts);

      await expect(
        swapBNBtoGFAL.swapBNBforGFAL(0, {
          value: ethers.utils.parseUnits(BNBSwap, "ether"),
        })
      ).to.be.revertedWith("AmountOutMin cannot be 0");
    });

    //Test that the contract emits the correct event when a swap occurs:
    it("Should emit SwappedBNBtoGFAL event on successful swap", async () => {
      const { swapBNBtoGFAL, BNBWhaleSigner, amountOutMin, BNBSwap } =
        await loadFixture(deployContracts);

      await expect(
        swapBNBtoGFAL.swapBNBforGFAL(amountOutMin, {
          value: ethers.utils.parseUnits(BNBSwap, "ether"),
        })
      )
        .to.emit(swapBNBtoGFAL, "SwappedBNBtoGFAL")
        .withArgs(
          ethers.utils.parseUnits(BNBSwap, "ether"),
          anyValue, // GFAL amount received
          BNBWhaleSigner.address
        );
    });

    //Test the balances of BNB, WBNB, USDT, and GFAL tokens before and after the swap to ensure they are updated correctly:
    it("Should update token balances correctly after the swap", async () => {
      const {
        swapBNBtoGFAL,
        BNBWhaleSigner,
        gfalToken,
        wbnbToken,
        usdtToken,
        amountOutMin,
        BNBSwap,
      } = await loadFixture(deployContracts);

      const balanceBeforeSwapGFAL = await gfalToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceBeforeSwapWBNB = await wbnbToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceBeforeSwapUSDT = await usdtToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceBeforeSwapBNB = await ethers.provider.getBalance(
        BNBWhaleSigner.address
      );

      await swapBNBtoGFAL.connect(BNBWhaleSigner).swapBNBforGFAL(amountOutMin, {
        value: ethers.utils.parseUnits(BNBSwap, "ether"),
      });

      const balanceAfterSwapGFAL = await gfalToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceAfterSwapWBNB = await wbnbToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceAfterSwapUSDT = await usdtToken.balanceOf(
        BNBWhaleSigner.address
      );
      const balanceAfterSwapBNB = await ethers.provider.getBalance(
        BNBWhaleSigner.address
      );

      expect(balanceAfterSwapGFAL).to.be.gt(balanceBeforeSwapGFAL);
      expect(balanceAfterSwapWBNB).to.be.equal(balanceBeforeSwapWBNB);
      expect(balanceAfterSwapUSDT).to.equal(balanceBeforeSwapUSDT);
      expect(balanceAfterSwapBNB).to.be.lt(balanceBeforeSwapBNB);
    });
  });
});
