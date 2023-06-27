# SwapBNBtoGFAL Smart Contract

The SwapBNBtoGFAL smart contract is a contract that facilitates the swapping of BNB for GFAL. It utilizes the PancakeSwap V2 Router and internally wraps from BNB to WBNB (Wrapped BNB), to swap WBNB for USDT (Tether), and finally USDT for to GFAL.

## Prerequisites

- Solidity version: 0.8.19
- [IUniswapV2Router.sol](./interfaces/IUniswapV2Router.sol): Interface for the PancakeSwap V2 Router contract.
- [IWBNB.sol](./interfaces/IWBNB.sol): Interface for the Wrapped BNB (WBNB) contract.
- [IERC20.sol](./interfaces/IERC20.sol): Interface for the ERC20 token contract.
- [ReentrancyGuard.sol](https://docs.openzeppelin.com/contracts/3.x/api/security#ReentrancyGuard): Contract from OpenZeppelin library used to prevent reentrancy attacks.

## Usage

The `SwapBNBtoGFAL` contract allows users to swap BNB for GFAL by calling the `swapBNBforGFAL` function.

### `swapBNBforGFAL` Function

```solidity
function swapBNBforGFAL(uint256 amountOutMin) external payable nonReentrant returns (uint amountOut)
```

This function performs the swap from BNB to GFAL. It requires the caller to send a non-zero amount of BNB and specifies the minimum amount of GFAL desired (`amountOutMin`).

The swap is done in the following steps:

1. The function receives BNB and wraps it to WBNB.
2. The contract approves the PancakeSwap V2 Router to spend the WBNB.
3. The contract constructs the swap path: WBNB -> USDT -> GFAL.
4. The contract attempts to perform the swap using the PancakeSwap V2 Router's `swapExactTokensForTokens` function.
5. If the swap is successful, the contract emits a `SwappedBNBtoGFAL` event and returns the amount of GFAL received.

**Note**: Our backend will check the `amountOutMin` and add it as parameter to the `swapBNBforGFAL function`. It will make sure the amount is not lower than 0.8% what the swapper should receive. As PancakeSwap keeps 0.25% of each swap and this functions performs 2 swaps.

### Events

#### `SwappedBNBtoGFAL` Event

```solidity
event SwappedBNBtoGFAL(uint256 BNB, uint256 GFAL, address indexed Swapper);
```

This event is emitted when BNB is successfully swapped for GFAL. It provides information about the amount of BNB swapped (`BNB`), the amount of GFAL received (`GFAL`), and the address of the swapper (`Swapper`).

## Dependencies

The contract relies on the following external contracts:

- PancakeSwap V2 Router: The contract address is hardcoded as `0x10ED43C718714eb63d5aA57B78B54704E256024E`. Ensure that the correct version of the router is deployed at this address.
- USDT: The contract address for the USDT token is hardcoded as `0x55d398326f99059fF775485246999027B3197955`. Ensure that the correct version of the USDT token is deployed at this address.
- GFAL: The contract address for the GFAL token is hardcoded as `0x47c454cA6be2f6DEf6f32b638C80F91c9c3c5949`. Ensure that the correct version of the GFAL token is deployed at this address.

Note: The contract also imports the `ReentrancyGuard` contract from the OpenZeppelin library.

**Important:** Make sure to review and understand the code
