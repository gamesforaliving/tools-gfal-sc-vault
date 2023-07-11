# GFAL Game Objects

This smart contract represents an ERC721 token for the GFAL games. The contract allows the game to mint tokens safely by ensuring that users have approved the required amount of GFAL tokens before minting, and allows the Marketplace smart contract to manage all NFTs.

## Functionality

Bundler safely mints an ERC721 token for a user if the user has approved the required amount of GFAL tokens.
Allows the admin or super admin (set in the proxy contract) to update minting prices and the base URI.
Implements the ERC721, ERC721Enumerable, and ERC721Burnable interfaces & ERC2981 functionalities for royalty compatibility.
Allows querying of the owner of a token by token ID or array of token IDs.

## Usage

The contract owner sets the GFAL proxy address and the base URI for the token metadata by calling the constructor.
The game client checks if the user has approved the required amount of GFAL tokens and sends a request to the server to start the minting process.
If the minting is successful, the GFAL tokens are transferred from the user's wallet to the fee collector's wallet, and the ERC721 token is minted and sent to the user's address.
If the ERC721 token is minted successfully, the user's address is set as the owner of the token and the setApprovalForAll() function is called to allow the Marketplace smart contract to manage the token. This is meanly done to avoid friction for the user.

## Key Features

- SafeERC20 and Counters are used to handle token transfers and manage the number of tokens minted.
- ERC721, ERC721Enumerable, and ERC721Burnable are used to provide standard ERC721 token functionality.
- OracleConsumer is used to fetch GFAL price conversion rates indexed from an external API.
- GFALProxy is used to store contract and wallet addresses.
- The safeMint function safely mints an ERC721 token for a user if the user has approved the required amount of GFAL tokens.
- The createCollection function sets a new Collection to track the total sold NFTs and the max supply. If max supply is set as zero, it means it will not have a max supply.
- The getOwnersByTokens function returns the address of the token owner for the provided array of token ids.
- The tokensByWallet function returns the tokens owned by the address passed as parameter.
- The royaltyInfo function returns the Royalty receiver and the the royaltyAmount (ERC2981). Used for secondary sale in not GFAL Marketplace.
- The setTokenRoyalty function sets the new feeNumerator for the royaltyAmount (ERC2981). Used for secondary sale in not GFAL Marketplace.

## License

This smart contract is released under the MIT License.

## Solidity Version

- 0.8.19
