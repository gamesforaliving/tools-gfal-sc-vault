// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../Proxy/IGFALProxy.sol";

/**
 * @title GFAL OracleConsumer - GAMES FOR A LIVING
 * @dev This contract allows the exchange of USD to GFAL tokens using a conversion rate.
 * Note: Constructor and functions that need gas fee are set as payable to avoid OPCODES checking msg.value.
 */
contract GFALOracleConsumer {
    // Address of the GFALProxy contract
    IGFALProxy private immutable gfalProxy;
    // The value of 1 USD in wei (18 decimal places)
    uint64 constant dollarValue = 1e18; // 1.000.000.000.000.000.000
    // The last known value of the GFAL token exchange rate in USD
    uint256 public lastTokenRateValue;

    // Event emitted when the exchange rate is updated
    event UpdatedRate(uint256 value);

    /**
     * @dev Modifier to ensure that only the admin set in the proxy contract can execute certain functions.
     */
    modifier onlySuperAdmin() {
        require(gfalProxy.checkSuperAdmin(msg.sender), "Not Admin");
        _;
    }

    /**
     * @dev Constructor function to set the GFALProxy contract address.
     * @param _gfalProxy The address of the GFALProxy contract.
     * @param _newTokenRateValue The new value of the GFAL token exchange rate.
     */
    constructor(address _gfalProxy, uint256 _newTokenRateValue) payable {
        require(_newTokenRateValue != 0, "RateValue cannot be 0");
        lastTokenRateValue = _newTokenRateValue;
        gfalProxy = IGFALProxy(_gfalProxy);
    }

    /**
     * @dev Function to get the amount of GFAL tokens for a given USD value.
     * @param value The value in USD to exchange for GFAL tokens.
     * @return The amount of GFAL tokens for the given USD value.
     */
    function getConversionRate(uint256 value) external view returns (uint256) {
        return (dollarValue * value) / lastTokenRateValue;
    }

    /**
     * @dev Function for the owner of the contract to update the last known value of the GFAL token exchange rate.
     * @param newValue The new value of the GFAL token exchange rate.
     * Note: This function can only be called by a superAdmin set in GFAL Proxy.
     */
    function updateRateValue(uint256 newValue) external payable onlySuperAdmin {
        require(newValue != 0, "RateValue cannot be 0");
        lastTokenRateValue = newValue;
        emit UpdatedRate(newValue);
    }
}
