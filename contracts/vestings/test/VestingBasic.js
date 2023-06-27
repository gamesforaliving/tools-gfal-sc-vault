const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VestingBasic", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  // Constants
  const DEFAULT_ADMIN_ROLE =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const VESTER_ROLE =
    "0x64ed6499e2f5a7ea55dfd56da361bf9d48064843bb3891c36f1dabd9ba246135";
  const UNLOCK_TIME = 1707819000;
  const MAX_VESTING_TOTAL = 150;
  const MAX_VESTING_SINGLE = 25;

  const VESTING_SCHEDULE_SUCCESS = {
    when: [
      1707820000, 1707820100, 1707820200, 1707820300, 1707820400, 1707820500,
      1707820600, 1707820700, 1707820800, 1707820900, 1707821000, 1707822000,
      1707823000, 1707824000, 1707825000, 1707826000, 1707827000, 1707828000,
      1707829000, 1707830000, 1707831000, 1707832000, 1707833000, 1707834000,
      1707835000, 1707836000, 1707837000, 1707838000, 1707839000, 1707840000,
      1707841000, 1707842000, 1707843000, 1707844000, 1707845000, 1707846000,
      1707847000, 1707848000, 1707849000, 1707850000, 1707851000, 1707852000,
      1707853000, 1707854000, 1707855000, 1707856000, 1707857000, 1707858000,
      1707859000, 1707860000, 1707861000, 1707862000, 1707863000, 1707864000,
      1707865000, 1707866000, 1707867000, 1707868000, 1707869000, 1707870000,
      1707871000, 1707872000, 1707873000, 1707874000, 1707875000, 1707876000,
      1707877000, 1707878000, 1707879000, 1707880000, 1707881000, 1707882000,
      1707883000, 1707884000, 1707885000, 1707886000, 1707887000, 1707888000,
      1707889000, 1707890000, 1707891000, 1707892000, 1707893000, 1707894000,
      1707895000, 1707896000, 1707897000, 1707898000, 1707899000, 1707900000,
      1707901000, 1707902000, 1707903000, 1707904000, 1707905000, 1707906000,
      1707907000, 1707908000, 1707909000, 1707910000, 1707911000, 1707912000,
      1707913000, 1707914000, 1707915000, 1707916000, 1707917000, 1707918000,
      1707919000, 1707920000, 1707921000, 1707922000, 1707923000, 1707924000,
      1707925000, 1707926000, 1707927000, 1707928000, 1707929000, 1707930000,
      1707931000, 1707932000, 1707933000, 1707934000, 1707935000, 1707936000,
      1707937000, 1707938000, 1707939000, 1707940000, 1707941000, 1707942000,
      1707943000, 1707944000, 1707945000, 1707946000, 1707947000, 1707948000,
      1707949000, 1707950000, 1707951000, 1707952000, 1707953000, 1707954000,
      1707955000, 1707956000, 1707957000, 1707958000, 1707959000, 1707960000,
    ],
    amount: [
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
    ],
  };
  const VESTING_SCHEDULE_ERROR = {
    when: [
      1707820000, // 13 March 2023, 11:00:00 UTC/GMT
      1707821000, // 13 April 2023, 11:00:00 UTC/GMT
    ],
    amount: [
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
      ethers.utils.parseEther(String(2500000)), // 30.000.000 / 12 = 2.500.000 to Wei
    ],
  };

  async function deployContracts() {
    const accounts = await ethers.getSigners();
    const owner = accounts[0];
    const vester = accounts[1];
    const stranger = accounts[2];

    const GFALToken = await ethers.getContractFactory("GFALToken");
    const gfalToken = await GFALToken.deploy();

    const VestingBasic = await ethers.getContractFactory("VestingBasic");
    const vestingBasic = await VestingBasic.deploy(
      gfalToken.address,
      vester.address,
      UNLOCK_TIME
    );

    let totalVestingAmount = ethers.utils.parseEther(String(0));
    for (let i = 0; i < VESTING_SCHEDULE_SUCCESS.amount.length; i++) {
      totalVestingAmount = totalVestingAmount.add(
        VESTING_SCHEDULE_SUCCESS.amount[i]
      );
    }

    await gfalToken.transfer(vestingBasic.address, totalVestingAmount);

    return { gfalToken, vestingBasic, owner, vester, stranger };
  }

  describe("Deployment", function () {
    it("Should set the right vestingToken", async function () {
      const { gfalToken, vestingBasic } = await loadFixture(deployContracts);

      await expect(await vestingBasic.vestingToken()).to.equal(
        gfalToken.address
      );
    });

    it("Should set the right vestingCollector", async function () {
      const { vestingBasic, vester } = await loadFixture(deployContracts);

      await expect(await vestingBasic.vestingCollector()).to.equal(
        vester.address
      );
    });

    it("Should set the right unlockTime", async function () {
      const { vestingBasic } = await loadFixture(deployContracts);

      await expect(await vestingBasic.unlockTime()).to.equal(UNLOCK_TIME);
    });

    it("Should set the right vestingScheduleMaxLength", async function () {
      const { vestingBasic } = await loadFixture(deployContracts);

      await expect(await vestingBasic.vestingScheduleMaxLength()).to.equal(
        MAX_VESTING_TOTAL
      );
    });

    it("Should set the right DEFAULT_ADMIN_ROLE", async function () {
      const { vestingBasic, owner } = await loadFixture(deployContracts);

      await expect(
        await vestingBasic.hasRole(DEFAULT_ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Should set an empty vestingSchedule", async function () {
      const { vestingBasic } = await loadFixture(deployContracts);

      expect(vestingBasic.vestingSchedule(0)).to.be.reverted;
    });

    it("Should set the right nextVestingPeriod", async function () {
      const { vestingBasic } = await loadFixture(deployContracts);

      await expect(await vestingBasic.nextVestingPeriod()).to.equal(0);
    });
  });

  describe("Access Control", function () {
    describe("Validations", function () {
      it("Should revert if a stranger tries to grant a role", async function () {
        const { vestingBasic, stranger, vester } = await loadFixture(
          deployContracts
        );

        await expect(
          vestingBasic.connect(stranger).grantRole(VESTER_ROLE, vester.address)
        ).to.be.revertedWith(
          "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
      });

      it("Should revert if a stranger tries to change the vestingCollector address", async function () {
        const { vestingBasic, stranger } = await loadFixture(deployContracts);

        await expect(
          vestingBasic
            .connect(stranger)
            .updateVestingCollector(stranger.address)
        ).to.be.revertedWith(
          "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
      });
    });

    describe("Workflow", function () {
      it("Should allow a DEFAULT_ADMIN_ROLE to grant role", async function () {
        const { vestingBasic, vester } = await loadFixture(deployContracts);

        await vestingBasic.grantRole(VESTER_ROLE, vester.address);

        await expect(
          await vestingBasic.hasRole(VESTER_ROLE, vester.address)
        ).to.be.equal(true);
      });
    });
  });

  describe("SetVestingSchedule", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called after unlockTime", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);
        // fast-forward to unlock time
        await time.increaseTo(UNLOCK_TIME);

        await expect(
          vestingBasic.setVestingSchedule(
            VESTING_SCHEDULE_SUCCESS.when,
            VESTING_SCHEDULE_SUCCESS.amount
          )
        ).to.be.revertedWith(
          "Setting vesting schedule should be before unlockTime"
        );
      });

      it("Should revert with the right error if called with arrays longer than allowed single set entries", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);
        await expect(
          vestingBasic.setVestingSchedule(
            VESTING_SCHEDULE_SUCCESS.when,
            VESTING_SCHEDULE_SUCCESS.amount
          )
        ).to.be.revertedWith(
          "Maximum amount per single setVestingSchedule exceeded"
        );
      });

      it("Should revert with the right error if trying to set more then allowed total entries", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);

        // Increasing +1 entries to reach 151 elements
        let when = [...VESTING_SCHEDULE_SUCCESS.when];
        let amount = [...VESTING_SCHEDULE_SUCCESS.amount];
        when.push(when[when.length - 1] + 1000); // taking the last timestamp, increase 1000 and push
        amount.push(amount[amount.length - 1]); // taking the last amount and push

        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(when, amount);

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          if (i < Number(MAX_VESTING_TOTAL / MAX_VESTING_SINGLE)) {
            await vestingBasic.setVestingSchedule(
              vestingExecutions[i].when,
              vestingExecutions[i].amount
            );
          } else {
            await expect(
              vestingBasic.setVestingSchedule(
                vestingExecutions[i].when,
                vestingExecutions[i].amount
              )
            ).to.be.revertedWith(
              "Setting vesting schedule total maximum length exceeded"
            );
          }
        }
      });

      it("Should revert with the right error if set inconsistent vesting schedule", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);

        await expect(
          vestingBasic.setVestingSchedule(
            VESTING_SCHEDULE_ERROR.when,
            VESTING_SCHEDULE_ERROR.amount
          )
        ).to.be.revertedWith(
          "When.length length must be the same as Amount.length"
        );
      });
    });

    describe("Workflow", function () {
      it("Should set the vesting schedule as expected", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);

        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when,
          VESTING_SCHEDULE_SUCCESS.amount
        );

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          await vestingBasic.setVestingSchedule(
            vestingExecutions[i].when,
            vestingExecutions[i].amount
          );
        }

        // Check the first month - one index zero
        const firstVesting = await vestingBasic.vestingSchedule(0);
        expect(firstVesting.when).to.equal(VESTING_SCHEDULE_SUCCESS.when[0]);
        expect(firstVesting.amount).to.equal(
          VESTING_SCHEDULE_SUCCESS.amount[0]
        );

        // Check the last month - twelve index eleven
        const lastVesting = await vestingBasic.vestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when.length - 1
        );
        expect(lastVesting.when).to.equal(
          VESTING_SCHEDULE_SUCCESS.when[
            VESTING_SCHEDULE_SUCCESS.when.length - 1
          ]
        );
        expect(lastVesting.amount).to.equal(
          VESTING_SCHEDULE_SUCCESS.amount[
            VESTING_SCHEDULE_SUCCESS.when.length - 1
          ]
        );

        // Not existing, reverting, vesting period
        await expect(
          vestingBasic.vestingSchedule(VESTING_SCHEDULE_SUCCESS.when.length)
        ).to.be.reverted;
      });

      it("Should update the vesting collector as expected", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);

        await vestingBasic.updateVestingCollector(
          "0x0000000000000000000000000000000000000001"
        );

        // Check the last month - twelve index eleven
        expect(await vestingBasic.vestingCollector()).to.equal(
          "0x0000000000000000000000000000000000000001"
        );
      });
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { vestingBasic } = await loadFixture(deployContracts);

        await expect(vestingBasic.withdraw()).to.be.revertedWith(
          "AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x64ed6499e2f5a7ea55dfd56da361bf9d48064843bb3891c36f1dabd9ba246135"
        );
      });

      it("Should revert with the right error if called before unlockTime", async function () {
        const { vestingBasic, vester } = await loadFixture(deployContracts);

        // Start - Already tested required things
        await vestingBasic.grantRole(VESTER_ROLE, vester.address);
        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when,
          VESTING_SCHEDULE_SUCCESS.amount
        );

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          await vestingBasic.setVestingSchedule(
            vestingExecutions[i].when,
            vestingExecutions[i].amount
          );
        }
        // End - Already tested required things

        // fast-forward to unlock time
        await time.increaseTo(UNLOCK_TIME - 2);

        await expect(
          vestingBasic.connect(vester).withdraw()
        ).to.be.revertedWith("Vesting schedule should be after unlockTime");
      });

      it("Should revert with the right error if called after unlockTime but before vesting", async function () {
        const { vestingBasic, vester } = await loadFixture(deployContracts);

        // Start - Already tested required things
        await vestingBasic.grantRole(VESTER_ROLE, vester.address);
        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when,
          VESTING_SCHEDULE_SUCCESS.amount
        );

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          await vestingBasic.setVestingSchedule(
            vestingExecutions[i].when,
            vestingExecutions[i].amount
          );
        }
        // End - Already tested required things

        // fast-forward to unlock time
        await time.increaseTo(VESTING_SCHEDULE_SUCCESS.when[0] - 2);

        await expect(
          vestingBasic.connect(vester).withdraw()
        ).to.be.revertedWith("You cannot vest zero amount");
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { vestingBasic, vester } = await loadFixture(deployContracts);

        // Start - Already tested required things
        await vestingBasic.grantRole(VESTER_ROLE, vester.address);
        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when,
          VESTING_SCHEDULE_SUCCESS.amount
        );

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          await vestingBasic.setVestingSchedule(
            vestingExecutions[i].when,
            vestingExecutions[i].amount
          );
        }
        // End - Already tested required things

        for (let i = 0; i < VESTING_SCHEDULE_SUCCESS.when.length; i++) {
          // fast-forward to unlock time
          await time.increaseTo(VESTING_SCHEDULE_SUCCESS.when[i]);
          await expect(await vestingBasic.connect(vester).withdraw())
            .to.emit(vestingBasic, "Withdrawal")
            .withArgs(
              VESTING_SCHEDULE_SUCCESS.when[i] + 1,
              VESTING_SCHEDULE_SUCCESS.amount[i]
            );
        }
      });
    });

    describe("Workflow", function () {
      it("Should transfer the funds to the vestingCollector for single claim", async function () {
        const { gfalToken, vestingBasic, vester } = await loadFixture(
          deployContracts
        );

        // Start - Already tested required things
        await vestingBasic.grantRole(VESTER_ROLE, vester.address);

        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when,
          VESTING_SCHEDULE_SUCCESS.amount
        );

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          await vestingBasic.setVestingSchedule(
            vestingExecutions[i].when,
            vestingExecutions[i].amount
          );
        }
        // End - Already tested required things

        for (let i = 0; i < VESTING_SCHEDULE_SUCCESS.when.length; i++) {
          // fast-forward to unlock time
          await time.increaseTo(VESTING_SCHEDULE_SUCCESS.when[i]);

          const beforeBalanceContract = await gfalToken.balanceOf(
            vestingBasic.address
          );
          const beforeBalanceCollector = await gfalToken.balanceOf(
            await vestingBasic.vestingCollector()
          );

          await vestingBasic.connect(vester).withdraw();

          const afterBalanceContract = await gfalToken.balanceOf(
            vestingBasic.address
          );
          const afterBalanceCollector = await gfalToken.balanceOf(
            await vestingBasic.vestingCollector()
          );

          expect(afterBalanceContract).to.equal(
            beforeBalanceContract.sub(VESTING_SCHEDULE_SUCCESS.amount[i])
          );
          expect(afterBalanceCollector).to.equal(
            beforeBalanceCollector.add(VESTING_SCHEDULE_SUCCESS.amount[i])
          );
        }
      });

      it("Should transfer the funds to the vestingCollector for cumulative claim", async function () {
        const { gfalToken, vestingBasic, vester } = await loadFixture(
          deployContracts
        );

        // Start - Already tested required things
        await vestingBasic.grantRole(VESTER_ROLE, vester.address);

        // Split array into batches of maximum and iterate through them
        let vestingExecutions = splitVestingSchedule(
          VESTING_SCHEDULE_SUCCESS.when,
          VESTING_SCHEDULE_SUCCESS.amount
        );

        // Iterate through each batch and call setVestingSchedules() function
        for (let i = 0; i < vestingExecutions.length; i++) {
          await vestingBasic.setVestingSchedule(
            vestingExecutions[i].when,
            vestingExecutions[i].amount
          );
        }
        // End - Already tested required things

        // fast-forward to unlock time
        await time.increaseTo(VESTING_SCHEDULE_SUCCESS.when[1]);

        const beforeBalanceContract = await gfalToken.balanceOf(
          vestingBasic.address
        );
        const beforeBalanceCollector = await gfalToken.balanceOf(
          await vestingBasic.vestingCollector()
        );

        await vestingBasic.connect(vester).withdraw();

        const afterBalanceContract = await gfalToken.balanceOf(
          vestingBasic.address
        );
        const afterBalanceCollector = await gfalToken.balanceOf(
          await vestingBasic.vestingCollector()
        );

        expect(afterBalanceContract).to.equal(
          beforeBalanceContract
            .sub(VESTING_SCHEDULE_SUCCESS.amount[0])
            .sub(VESTING_SCHEDULE_SUCCESS.amount[1])
        );
        expect(afterBalanceCollector).to.equal(
          beforeBalanceCollector
            .add(VESTING_SCHEDULE_SUCCESS.amount[0])
            .add(VESTING_SCHEDULE_SUCCESS.amount[1])
        );

        // expiring time to the last claim

        await time.increaseTo(
          VESTING_SCHEDULE_SUCCESS.when[
            VESTING_SCHEDULE_SUCCESS.when.length - 1
          ]
        );

        let beforeBalanceContractEnd = await gfalToken.balanceOf(
          vestingBasic.address
        );
        let beforeBalanceCollectorEnd = await gfalToken.balanceOf(
          await vestingBasic.vestingCollector()
        );

        await vestingBasic.connect(vester).withdraw();

        const afterBalanceContractEnd = await gfalToken.balanceOf(
          vestingBasic.address
        );
        const afterBalanceCollectorEnd = await gfalToken.balanceOf(
          await vestingBasic.vestingCollector()
        );

        // Iterating increase of bigNumber
        for (let i = 2; i < VESTING_SCHEDULE_SUCCESS.amount.length; i++) {
          beforeBalanceContractEnd = beforeBalanceContractEnd.sub(
            VESTING_SCHEDULE_SUCCESS.amount[i]
          );
          beforeBalanceCollectorEnd = beforeBalanceCollectorEnd.add(
            VESTING_SCHEDULE_SUCCESS.amount[i]
          );
        }

        expect(beforeBalanceContractEnd).to.equal(0); // just to ensure, hardcoded value
        expect(afterBalanceContractEnd).to.equal(beforeBalanceContractEnd);
        expect(afterBalanceCollectorEnd).to.equal(beforeBalanceCollectorEnd);
      });
    });
  });
});

function splitVestingSchedule(when, amount) {
  let vestingExecutions = [];
  let batchSize = 25;
  for (let i = 0; i < when.length; i += batchSize) {
    let batch = {
      when: when.slice(i, i + batchSize),
      amount: amount.slice(i, i + batchSize),
    };
    vestingExecutions.push(batch);
  }
  return vestingExecutions;
}
