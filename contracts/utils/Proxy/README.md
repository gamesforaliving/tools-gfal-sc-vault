# GFALProxy Smart Contract

GFALProxy is an Solidity smart contract designed to facilitate the integration of multiple ERC20, ERC721, and ERC1155 tokens into a unified ecosystem. The contract provides an interface to verify addresses as token address, fee collector address, royalties collector address, admin addresses, super admin addresses and owner address to interact with the underlying protocol, and the associated marketplace. The contract allows for the updating of various addresses related to the GFAL ecosystem, such as the address of the Oracle Consumer, Fee Collector, Royalties Collector, Admins mapping, super Admins mapping, Owner and Marketplace.

## Functions

The GFALProxy contract has the following functions:

## Constructor

**constructor(address \_gfalToken, address \_admin)**

- Initializes the GFALProxy contract with the given GFAL Token address, admin address as a bundler role and sets the Fee Collector and the Royalties Collector to the contract deployer.
- Parameters:
  **\_gfalToken:** The address of GFAL Token (ERC20).
  **\_owner:** The address of the Owner (Master account to offer privileges).
  **\_feeCollector:** The address to collect the fees when minting.
  **\_royaltiesCollector:** The address to collect the royalties paid in Marketplaces.
  **\_superAdmin:** The address set as super admin. (Account with privileges).

## Functions

**updateAdmin**: Allows the owner of the contract to update an admin address.
**updateSuperAdmin**: Allows the owner of the contract to update a super admin address.
**updateGfalToken**: Allows the superAdmins set in the contract to update the GFAL Token address.
**updateOracleConsumer**: Allows the superAdmins set in the contract to update the GFAL price feed address.
**updateFeeCollector**: Allows the superAdmins set in the contract to update the fee collector address for minting NFTs price.
**updateRoyaltiesCollector**: Allows the superAdmins set in the contract to update the royalties collector address for the marketplace royalty fees.
**updateMarketPlace**: Allows the superAdmins set in the contract to update the ERC721 and ERC1155 marketplace address.

**getGfalToken**: Returns the GFAL Token address.
**checkAdmin**: Returns true if the address passed as parameter is an Admin.
**checkSuperAdmin**: Returns true if the address passed as parameter is a super Admin.
**getMarketPlace**: Returns the ERC721 and ERC1155 marketplace address.
**getOracleConsumer**: Returns the GFAL price feed address.
**getFeeCollector**: Returns the fee collector address for minting NFTs.
**getRoyaltiesCollector**: Returns the royalties collector address for secondary NFT sale.

## Events

The GFALProxy contract emits the following events:

- GfalTokenUpdated(address indexed oldGfalToken, address indexed newGfalToken)
- OracleConsumerUpdated(address indexed oldOracleConsumer, address indexed newOracleConsumer)
- FeeCollectorUpdated(address indexed oldFeeCollector, address indexed newFeeCollector)
- RoyaltyCollectorUpdated(address indexed oldRoyaltyCollector, address indexed newRoyaltyCollector)
- MarketPlaceUpdated(address indexed oldMarketPlace, address indexed newMarketPlace)
- AdminUpdated(address indexed admin, bool status)
- SuperAdminUpdated(address indexed superAdmin, bool status)

Note: The GFALProxy contract requires the use of the OpenZeppelin's Ownable contract.

## Solidity Version

- 0.8.19

## License

This contract is licensed under the MIT license.
