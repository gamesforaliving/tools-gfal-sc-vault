# Smart Contract Documentation: VestingBasic

Audit Report: [View](https://github.com/gamesforaliving/web3-contracts-bundle/blob/main/contracts/vestings/VestingBasic_Audit_Report.pdf)

## Overview:
VestingBasic is a smart contract that manages the vesting of ERC20 tokens. The contract allows a specific set of users, called "vesters", to withdraw tokens from the contract at specific time intervals defined in a vesting schedule. The contract provides an easy way to manage and distribute tokens over time, rather than all at once.

## Business Logic:
The VestingBasic smart contract implements the following business logic:

- The contract is initialized with the address of the ERC20 token to be vested, the address of the collector, and the unlock time.
- The contract can only be managed by users who have been granted the VESTER_ROLE.
- A vesting schedule is defined by calling the setVestingSchedule function. The function accepts two arrays: the first array specifies the timestamps of each vesting period, and the second array specifies the amount of tokens to be vested in each period.
- Once the vesting schedule has been defined, the vesters can withdraw their vested tokens by calling the withdraw function. This function will transfer the tokens from the contract to the vesting collector.

## Main Functions:

- Constructor: Initializes the contract with the ERC20 token address, the vesting collector address, and the unlock time.
constructor(address _vestingToken, address _vestingCollector, uint256 _unlockTime)

- setVestingSchedule: Sets the vesting schedule for the contract. The function takes two arrays as parameters: the timestamps for each vesting period and the amount of tokens to be vested in each period.

function setVestingSchedule(uint256[] memory when, uint256[] memory amount)

- withdraw: Allows vesters to withdraw their vested tokens. The function will only allow withdrawals after the unlock time and will only allow vesters to withdraw their tokens in accordance with the defined vesting schedule. The vested token amount will be sent to the vestingCollector address.

function withdraw() public onlyRole(VESTER_ROLE)

## Important Technical Information:

- Access Control: The AccessControl contract from the OpenZeppelin library is used to manage access to the contract. Users who are granted the VESTER_ROLE can withdraw their vested tokens.

contract VestingBasic is AccessControl

- SafeERC20: The SafeERC20 library from the OpenZeppelin library is used to safely transfer ERC20 tokens.

using SafeERC20 for IERC20;

- Structs: The Vesting struct is defined to store information about each vesting period.

struct Vesting {
uint256 when;
uint256 amount;
}

- Events: The Withdrawal event is emitted each time a vester withdraws their tokens from the contract.

event Withdrawal(uint256 when, uint256 amount);

- Modifiers: The onlyRole modifier is used to restrict access to the withdraw function to users who have been granted the VESTER_ROLE.

modifier onlyRole(bytes32 role)

- Time: The block.timestamp is used to check the current time and ensure that withdrawals and vesting schedules are being managed correctly.

require(block.timestamp < _unlockTime, "Unlock time should be in the future");

## Conclusion:
The VestingBasic smart contract provides a simple and secure way to manage vesting schedules for ERC20 tokens. The contract ensures that tokens are released to vesters only when they are due and provides a mechanism for securely transferring tokens to a vesting collector. This documentation provides an overview of the business logic, main functions, and important technical information for the contract and can be used by consumers and auditors to understand the workings of the contract.