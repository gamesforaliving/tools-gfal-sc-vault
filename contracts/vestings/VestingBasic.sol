// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VestingBasic is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant VESTER_ROLE = keccak256("VESTER_ROLE");

    address public vestingToken;
    address public vestingCollector; // the address who collect the vested amount when VESTER_ROLE withdraws
    uint256 public unlockTime; // it must be future, imagine that -> 13rd March 11h am UTC -> 1678705200

    Vesting[] public vestingSchedule;
    uint256 public nextVestingPeriod;
    uint256 public vestingScheduleMaxLength;

    struct Vesting {
        uint256 when; // timestamp of when the vesting item is able to be claimed
        uint256 amount; // amount of tokens to withdraw, in Wei
    }

    event Withdrawal(uint256 when, uint256 amount);

    constructor(address _vestingToken, address _vestingCollector, uint256 _unlockTime) {
        require(_vestingToken != address(0), "Vesting token should be a valid address");
        require(_vestingCollector != address(0), "Vesting collector should be a valid address");
        require(block.timestamp < _unlockTime, "Unlock time should be in the future");
        require(vestingScheduleMaxLength <= 250, "Vesting schedule max length exceeded");

        // Unlock variables initialization
        vestingToken = _vestingToken;
        vestingCollector = _vestingCollector;
        unlockTime = _unlockTime;
        vestingScheduleMaxLength = 150;

        // Granting default role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Withdraws the available vested tokens.
     *      Must be called by an account with VESTER_ROLE.
     *      Tokens will be transferred to the vestingCollector address.
     *      Emits a Withdrawal event for each vesting item claimed.
     *      Reverts if all vesting periods have already been claimed.
     *      Reverts if called before the unlockTime.
     *      Reverts if the claimable amount is zero.
     */
    function withdraw() public onlyRole(VESTER_ROLE) {
        require(block.timestamp >= unlockTime, "Vesting schedule should be after unlockTime");
        require(nextVestingPeriod < vestingSchedule.length, "All vesting periods have been claimed");
        uint256 claimableAmount;

        // Foreach vestingSchedule is existing in the array
        for (uint256 i = nextVestingPeriod; i < vestingSchedule.length; i++) {
            // If the vesting schedule is not vested and is available to vest by timestamp
            if (vestingSchedule[i].when <= block.timestamp) {
                // Increment the claimable amount
                claimableAmount += vestingSchedule[i].amount;
                // Set the array index of last vested in order to avoid useless iterations next time
                nextVestingPeriod = i + 1;
                // Emit the event for each one of them
                emit Withdrawal(block.timestamp, vestingSchedule[i].amount);
            }
        }

        require(claimableAmount > 0, "You cannot vest zero amount");

        // Transfer the amount from the contract to the vestingCollector
        IERC20(vestingToken).safeTransfer(vestingCollector, claimableAmount);
    }

    /**
     * @dev Sets the vesting schedule for the contract.
     *      Must be called by an account with DEFAULT_ADMIN_ROLE.
     *      Reverts if called after the first setup.
     *      Reverts if called after the unlockTime.
     *      Reverts if the vesting schedule length exceeds the max length.
     *      Reverts if the length of the `when` array is different from the length of the `amount` array.
     * @param when An array of timestamps representing the vesting times for each item.
     * @param amount An array of amounts representing the vesting amounts for each item, in wei.
     */
    function setVestingSchedule(uint256[] memory when, uint256[] memory amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(block.timestamp < unlockTime, "Setting vesting schedule should be before unlockTime");
        require(vestingSchedule.length + when.length <= vestingScheduleMaxLength, "Setting vesting schedule total maximum length exceeded");
        require(when.length <= 25, "Maximum amount per single setVestingSchedule exceeded");
        require(when.length == amount.length, "When.length length must be the same as Amount.length");

        for (uint256 i = 0; i < when.length; i++) {
            Vesting memory currentVesting = Vesting(
                when[i],
                amount[i]
            );
            vestingSchedule.push(currentVesting);
        }
    }

    /**
     * @dev Updates the vesting collector address.
     *      Must be called by an account with DEFAULT_ADMIN_ROLE.
     *      Reverts if the new vesting collector address is the zero address.
     * @param _vestingCollector The new address to set as the vesting collector.
     */
    function updateVestingCollector(address _vestingCollector) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_vestingCollector != address(0), "Address 0 cannot be the vesting collector");
        vestingCollector = _vestingCollector;
    }
}
