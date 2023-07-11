// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IGFALOracleConsumer {
    function getConversionRate(uint256 value) external view returns (uint256);

    function updateRateValue(uint256 _lastTokenRateValue) external;
}
