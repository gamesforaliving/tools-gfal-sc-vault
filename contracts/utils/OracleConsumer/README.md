# OracleConsumer Smart Contract

The OracleConsumer smart contract allows the exchange of USD to GFAL tokens using a conversion rate. The conversion rate is determined by the last known value of the GFAL token exchange rate in USD. This value can be updated by the superAdmin set in the Proxy contract using the updateRateValue function.

## Usage

### Constructor

**constructor(address \_g4alProxy)**

- Initializes the OracleConsumer contract with the given GFAL Proxy address and sets the new token rate value GFAL/USD.

- Parameters:
  **\_gfalProxy:** The address of GFAL Proxy contract.
  **\_newTokenRateValue:** The new value of the GFAL token exchange rate.

### Functions

**getConversionRate(uint256 \_value)**
This function takes one parameter, value, which is the value in USD to exchange for GFAL tokens. It returns the amount of GFAL tokens for the given USD value, based on the last known value of the GFAL token exchange rate in USD.

**updateRateValue(uint256 \_lastTokenRateValue)**
This function is used by the superAdmin to update the last known value of the GFAL token exchange rate to USD. It takes one parameter, \_lastTokenRateValue, which is the new value of the GFAL token exchange rate.

### Events

**UpdatedRate(uint256 value)**
This event is emitted when the exchange rate is updated by the owner of the contract. It includes the new value of the GFAL token exchange rate.

## Solidity Version

- 0.8.19

## License

This smart contract is released under the MIT License.
