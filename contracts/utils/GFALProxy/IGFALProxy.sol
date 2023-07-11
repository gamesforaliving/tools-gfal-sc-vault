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
interface IGFALProxy {
    function checkAdmin(address admin) external view returns (bool);

    function checkSuperAdmin(address superAdmin) external view returns (bool);

    function getGfalToken() external view returns (address);

    function getMarketPlace() external view returns (address);

    function getOracleConsumer() external view returns (address);

    function getFeeCollector() external view returns (address);

    function getRoyaltiesCollector() external view returns (address);
}
