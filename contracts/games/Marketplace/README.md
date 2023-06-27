# GFAL Marketplace Smart contract

The GFAL Marketplace is a decentralized platform for buying and selling non-fungible tokens (NFTs) using the GFAL token as a medium of exchange. The marketplace supports both ERC721 and ERC1155 token standards.

## Features

The GFAL Marketplace offers the following features:

- **Sell NFTs:** users can sell their NFTs by setting a price and amount for each token.
- **Buy NFTs:** users can purchase NFTs listed on the marketplace.
- **Update Sale Price:** users can update the Sale price while selling.
- **Whitelist:** only NFTs from whitelisted collections can be sold on the marketplace.
- **ERC721 and ERC1155 support:** the marketplace supports both token standards.
- **Royalties:** a percentage of the sales goes to the protocol as royalties.
- **Maintenance mode:** the marketplace can be temporarily disabled for maintenance, but it will allow the sellers to update and remove tokens from sale.

## Dependencies

The GFAL Marketplace relies on the following dependencies:

- OpenZeppelin: a library for secure smart contract development.
- OracleConsumer: a utility for getting exchange rates from an oracle.
- G4ALProxy: a utility for storing contract addresses and wallet addresses.

## Structures

### Sale

- price: Price of the NFT in USD or GFAL tokens.
- isDollar: Indicates whether the price is denominated in USD (true) or GFAL tokens (false).
- isForSale: Indicates whether the NFT is currently listed for sale.
- amount: Amount of NFTs on sale.
- seller: Seller of the NFT sale.
- saleId: Identifier / counter for all the sales in the Marketplace.

### Whitelist

- allowed: Indicates whether the NFT collection is allowed to be traded on the marketplace.
- tokenStandard: Specifies the token standard (ERC721 or ERC1155) of the NFT collection.

## Events

- SellToken: Emitted when a token is listed for sale.
- BuyToken: Emitted when a token is purchased.
- RemoveToken: Emitted when a token is removed from sale listings.
- SaleUpdated: Emitted when a sale price is updated.
- ContractStatusUpdated: Emitted when the contract status is updated.
- RoyaltiesInBasisPointsUpdated: Emitted when the royalties basis points are updated.
- CollectionUpdated: Emitted when a ERC721 or ERC1155 is whitelisted or blacklisted.

## Modifiers

onlyPrivileges: Requires that the method caller is an Admin or Super Admin.

## Marketplace Methods

### sellToken

List an NFT for sale by specifying its contract address, token ID, amount, price, and whether the price is denominated in USD or GFAL tokens. Requires the token to be in a whitelisted collection and owned by the Marketplace contract. When selling ERC1155 tokens, the seller can only sell a batch of the same token Id until it is sold or removed.

### buyToken

Purchase an NFT by specifying its contract address, token ID, and the seller's address. Requires the buyer to have sufficient GFAL token allowance to cover the purchase price.

### updatePrice

Seller can update Sale price & currency while NFT is on sale.

### removeToken

Remove an NFT from sale listings by specifying its contract address and token ID. Requires the token to be in a whitelisted collection and owned by the marketplace.

### \_calculateMarketplaceRoyalties

Internal function to calculate the marketplace royalties to split the sale price.

## Admin or Super Admin Functions

### updateCollection

Whitelist or blacklist an NFT collection by specifying its contract address, token standard (ERC721 or ERC1155), and whether it should be allowed for sale.

### updateRoyaltiesInBasisPoints

Update the royalties percentage as basis points (e.g., 250 for 2.5%).

## Solidity Version

- 0.8.19

## License

This contract is licensed under the MIT license.
