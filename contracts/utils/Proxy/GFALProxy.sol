// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

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
/**
 * @title GFALProxy
 * @dev This contract designed to facilitate the integration of multiple ERC20, ERC721, and ERC1155 tokens into a unified ecosystem.
 * The contract provides an interface to verify addresses as token address, fee collector address, royalties collector address, admin addresses,
 * super admin addresses and owner address to interact with the underlying protocol, and the associated marketplace.
 * The contract allows for the updating of various addresses related to the GFAL Token, such as the address of the Oracle Consumer, Fee Collector,
 * Royalties Collector, Admins mapping, super Admins mapping, Owner and Marketplace.
 * Note: Constructor and functions that need gas fee are set as payable to avoid OPCODES checking msg.value.
 */
contract GFALProxy is Ownable {
    address private gfalToken; // Address of GFAL Token (ERC20)
    address private oracleConsumer; // Address of GFAL price feed. Needs to be set once deployed
    address private feeCollector; // Address of Fee Collector from minting NFTs
    address private royaltiesCollector; // Address of Royalties Collector from Marketplace
    address private marketPlace; // Address of ERC721 and ERC1155 Marketplace. Needs to be set once deployed

    mapping(address => bool) private superAdmins; // Address of Super Admin to call and have previlegies over the contracts
    mapping(address => bool) private admins; // Address of Admin to call and have previlegies over the contracts

    event GfalTokenUpdated(
        address indexed oldGfalToken,
        address indexed newGfalToken
    );
    event OracleConsumerUpdated(
        address indexed oldOracleConsumer,
        address indexed newOracleConsumer
    );
    event FeeCollectorUpdated(
        address indexed oldFeeCollector,
        address indexed newFeeCollector
    );
    event RoyaltyCollectorUpdated(
        address indexed oldRoyaltyCollector,
        address indexed newRoyaltyCollector
    );
    event MarketPlaceUpdated(
        address indexed oldMarketPlace,
        address indexed newMarketPlace
    );
    event AdminUpdated(address indexed admin, bool status);
    event SuperAdminUpdated(address indexed superAdmin, bool status);

    /**
     * @dev Modifier to restrict access to only the admin set in the GFALProxy contract.
     */
    modifier onlySuperAdmin() {
        require(superAdmins[msg.sender], "Not super admin");
        _;
    }

    /**
     * @dev Initializes the GFALProxy contract with the given GFAL Token address and sets the
     *      Fee Collector, the Royalties Collector, the owner address, the super admin address and the admin address to the contract deployer.
     * @param _gfalToken The address of GFAL Token.
     * @param _owner The Owner address.
     * @param _feeCollector The fee Collector address.
     * @param _royaltiesCollector The royalties Collector address.
     * @param _superAdmin The super Admin address.
     * Note: Deployer will be removed from superAdmin after deployment and set up.
     */
    constructor(
        address _gfalToken,
        address _owner,
        address _feeCollector,
        address _royaltiesCollector,
        address _superAdmin
    ) payable {
        require(_gfalToken != address(0));
        require(_owner != address(0));
        require(_feeCollector != address(0));
        require(_royaltiesCollector != address(0));
        require(_superAdmin != address(0));

        feeCollector = _feeCollector;
        royaltiesCollector = _royaltiesCollector;
        gfalToken = _gfalToken;
        superAdmins[_superAdmin] = true;
        superAdmins[msg.sender] = true;
        admins[msg.sender] = true;
        _transferOwnership(_owner);
    }

    /**
     * @dev Updates the address of admin.
     * @param admin The address of admin.
     * @param status The address status. True (is a new admin), false (is not admin anymore)
     */
    function updateAdmin(
        address admin,
        bool status
    ) external payable onlyOwner {
        require(admin != address(0), "Not valid address");
        admins[admin] = status;

        emit AdminUpdated(admin, status);
    }

    /**
     * @dev Updates the address of super admin.
     * @param superAdmin The address of superAdmin.
     * @param status The address status. True (is a new superAdmin), false (is not superAdmin anymore)
     */
    function updateSuperAdmin(
        address superAdmin,
        bool status
    ) external payable onlyOwner {
        require(superAdmin != address(0), "Not valid address");
        superAdmins[superAdmin] = status;

        emit SuperAdminUpdated(superAdmin, status);
    }

    /**
     * @dev Updates the address of GFAL Token.
     * @param newToken The new address of GFAL Token.
     */
    function updateGfalToken(address newToken) external payable onlySuperAdmin {
        require(newToken != address(0), "Not valid address");
        address _oldGfal = gfalToken;
        gfalToken = newToken;

        emit GfalTokenUpdated(_oldGfal, newToken);
    }

    /**
     * @dev Updates the address of Oracle Consumer.
     * @param newOracle The new address of Oracle Consumer.
     */
    function updateOracleConsumer(
        address newOracle
    ) external payable onlySuperAdmin {
        require(newOracle != address(0), "Not valid address");
        address _oldOracle = oracleConsumer;
        oracleConsumer = newOracle;

        emit OracleConsumerUpdated(_oldOracle, newOracle);
    }

    /**
     * @dev Updates the address of Fee Collector.
     * @param newFeeCollector The new address of Fee Collector.
     */
    function updateFeeCollector(
        address newFeeCollector
    ) external payable onlySuperAdmin {
        require(newFeeCollector != address(0), "Not valid address");

        address _oldCollector = feeCollector;
        feeCollector = newFeeCollector;

        emit FeeCollectorUpdated(_oldCollector, newFeeCollector);
    }

    /**
     * @dev Updates the address of Royalties Collector.
     * @param newCollector The new address of Royalties Collector.
     */
    function updateRoyaltiesCollector(
        address newCollector
    ) external payable onlySuperAdmin {
        require(newCollector != address(0), "Not valid address");

        address _oldCollector = royaltiesCollector;
        royaltiesCollector = newCollector;

        emit RoyaltyCollectorUpdated(_oldCollector, newCollector);
    }

    /**
     * @dev Updates the address of MarketPlace.
     * @param newMarketPlace The new address of MarketPlace.
     */
    function updateMarketPlace(
        address newMarketPlace
    ) external payable onlySuperAdmin {
        require(newMarketPlace != address(0), "Not valid address");

        address _oldMarketPlace = marketPlace;
        marketPlace = newMarketPlace;

        emit MarketPlaceUpdated(_oldMarketPlace, newMarketPlace);
    }

    /**
     * @dev Getter for the GfalToken (ERC20) address set.
     * @return GfalToken address set.
     */
    function getGfalToken() external view returns (address) {
        require(gfalToken != address(0), "Address set as 0");
        return gfalToken;
    }

    /**
     * @dev Checker for the admin address set.
     * @return true if address is Admin.
     */
    function checkAdmin(address admin) external view returns (bool) {
        require(admin != address(0), "Address set as 0");
        return admins[admin];
    }

    /**
     * @dev Checker for the super admin address set.
     * @return true if address is superAdmin.
     */
    function checkSuperAdmin(address superAdmin) external view returns (bool) {
        require(superAdmin != address(0), "Address set as 0");
        return superAdmins[superAdmin];
    }

    /**
     * @dev Getter for the marketPlace (ERC721 & ERC1155) address set.
     * @return marketPlace address set.
     */
    function getMarketPlace() external view returns (address) {
        require(marketPlace != address(0), "Address set as 0");
        return marketPlace;
    }

    /**
     * @dev Getter for the oracle consumer address set.
     * @return oracle consumer address set.
     */
    function getOracleConsumer() external view returns (address) {
        require(oracleConsumer != address(0), "Address set as 0");
        return oracleConsumer;
    }

    /**
     * @dev Getter for the fee collector address set.
     * @return fee collector address set.
     */
    function getFeeCollector() external view returns (address) {
        require(feeCollector != address(0), "Address set as 0");
        return feeCollector;
    }

    /**
     * @dev Getter for the royalties collector address set.
     * @return royalties collector address set.
     */
    function getRoyaltiesCollector() external view returns (address) {
        require(royaltiesCollector != address(0), "Address set as 0");
        return royaltiesCollector;
    }
}
