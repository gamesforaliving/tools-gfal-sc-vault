// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@#################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@#########        #########@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  #####          (###########@@@@@@@@          @@@           @     @@@@@    @@@@@@
  ###        ########   (####@@@@@@    @@@@@@   @@    @@@@@@@   @   @@@@    @@@@@@
  ###     ##(((((%%     /####@@@@@    @@@@@                @   @@@   @@@    @@@@@@
  ###     #####%%%#     /####@@@@@    @@@@####   (    @@@@@   @@@@@   @@    @@@@@@
  ###      #######      /####@@@@@@@     @@     @@    @@@@             @    @@@@@@
  %%%%#               *#%%%%#@@@@@@@@@@      @@@@@    @@@    @@@@@@@   ,        @@
  #########       #########(@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@########(((#######@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@#########@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                                                        GFAL - GAMES FOR A LIVING
*/
interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] memory path) external view returns (uint[] memory amounts);
}
