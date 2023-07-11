// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IWBNB.sol";
import "./interfaces/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SwapBNBtoGFAL - GAMES FOR A LIVING
 * @dev Smart contract to swaps BNB to GFAL by performing internal exchanges from BNB to WBNB to USDT to GFAL.
 * Note: Constructor and functions that need gas fee are set as payable to avoid OPCODES checking msg.value.
 */
contract SwapBNBtoGFAL is ReentrancyGuard {
    // PancakeSwapV2Router
    IUniswapV2Router private constant router =
        IUniswapV2Router(0x10ED43C718714eb63d5aA57B78B54704E256024E);
    IERC20 private constant USDT =
        IERC20(0x55d398326f99059fF775485246999027B3197955);
    IERC20 private constant GFAL =
        IERC20(0x47c454cA6be2f6DEf6f32b638C80F91c9c3c5949);
    IWBNB private constant WBNB =
        IWBNB(0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c);

    /**
     *@dev Emitted when BNB is swapped for GFAL.
     *@param BNB The amount of BNB swapped.
     *@param GFAL The amount of GFAL received.
     *@param Swapper The address of the account that performed the swap.
     */
    event SwappedBNBtoGFAL(uint256 BNB, uint256 GFAL, address indexed Swapper);

    constructor() payable {}

    /**
     *@dev Swaps BNB for GFAL.
     *@param amountOutMin The minimum amount of GFAL we are willing to receive.
     *@return amountOut The amount of GFAL received.
     * NOTE: This function Swaps BNB to WBNB, to USDT, to GFAL.
     */
    function swapBNBforGFAL(
        uint256 amountOutMin
    ) external payable nonReentrant returns (uint amountOut) {
        require(msg.value != 0, "BNB cannot be 0");
        require(amountOutMin != 0, "AmountOutMin cannot be 0");

        WBNB.deposit{value: msg.value}();
        uint256 balanceWBNB = WBNB.balanceOf(address(this));
        WBNB.approve(address(router), balanceWBNB);

        address[] memory path;
        path = new address[](3);
        path[0] = address(WBNB);
        path[1] = address(USDT);
        path[2] = address(GFAL);

        try
            router.swapExactTokensForTokens(
                balanceWBNB,
                amountOutMin,
                path,
                msg.sender,
                block.timestamp
            )
        {
            uint[] memory amounts = router.getAmountsOut(balanceWBNB, path);
            emit SwappedBNBtoGFAL(msg.value, amounts[2], msg.sender);
            return amounts[2];
        } catch {
            revert("Swap failed");
        }
    }
}
