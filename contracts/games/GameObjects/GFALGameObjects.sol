// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../../utils/OracleConsumer/IGFALOracleConsumer.sol";
import "../../utils/Proxy/IGFALProxy.sol";

/**
 * @title GFAL Game Objects - GAMES FOR A LIVING
 * @dev This contract represents an ERC721 token for GFAL (Games for a living) game Items. It uses SafeERC20 to transfer GFAL tokens and OracleConsumer to fetch GFAL price conversion rates.
 * The contract allows the game to safely mint tokens by ensuring that users have approved the required amount of GFAL tokens before minting & allowes the Marketplace SC to manage all NFTs.
 * The contract also allows the game owner to update minting prices and the base URI.
 * Note: Constructor and functions that need gas fee are set as payable to avoid OPCODES checking msg.value.
 */

contract GFALGameObjects is ERC721, ERC721Enumerable, ERC721Burnable {
    using SafeERC20 for IERC20;

    struct Collection {
        uint256 totalSold;
        uint256 maxSupply;
    }

    // Proxy to store variables as addresses from contracts and from wallets
    IGFALProxy private immutable gfalProxy;
    uint16 private royaltyFraction; // Royalty percentage to send to feeCollector when sold in secondary market, but not in our marketplace. (royaltyFraction / 10.000)
    string private baseURI;
    uint256 private _tokenIdCounter; // Counter for the total number of tokens minted.
    uint256 public collectionCounter; // Counter for the total number of Items Collections created.

    mapping(uint256 => Collection) public collectionSupply; // Tracking for Collections.

    event NewCollection(uint256 collectionCounter, uint256 maxSupply);
    event Mint(
        address indexed from,
        address indexed to,
        uint256 tokenId, // Token id. (General counter for all the Tokens minted) Starts from 1
        uint256 collectionId, // Collection id (General counter for all collections created).  Starts from 1
        uint256 copyId, // Copy id (for Token minted in a specific Collection Id). Starts from 1
        uint256 price // Price paid in GFAL for minting. It can be 0 as some payments will be processed by Debit / Credit Card.
    );

    modifier onlyPrivileges() {
        require(
            gfalProxy.checkAdmin(msg.sender) ||
                gfalProxy.checkSuperAdmin(msg.sender),
            "Not Admin or Super Admin"
        );
        _;
    }

    /**
     * @dev Initializes the Items contract by setting the GFAL proxy address, the base URI and royalty Fraction.
     * @param _gfalProxy The GFALProxy contract address.
     * @param _baseUri The base URI for the token metadata.
     * @param _royaltyFraction The Royalty percentage
     */
    constructor(
        address _gfalProxy,
        string memory _baseUri,
        uint16 _royaltyFraction
    ) payable ERC721("Elemental Raiders Heroes", "ERHEROES") {
        require(_gfalProxy != address(0), "Address cannot be 0");
        gfalProxy = IGFALProxy(_gfalProxy);
        baseURI = _baseUri;
        royaltyFraction = _royaltyFraction;
    }

    // Abstract high-level flow
    // - In-game user on in-game inventory clicks on Mint
    // - Game clients check if the user already gave the approval to this contract, for the required amount
    // - - Yes: Fine! Maybe the user tried before and something failed, or simply did that via User Portal or even chain block explorer!
    // - - No: The user is prompted to confirm an approval transaction for the required minting amount in GFAL
    // - Ack -> Game client sends the POST req to Game Server to start the mint, which will try move pre-approved amount and fails if the approval has been hijacked
    // - Web3Provider is going to answer the Promise with a success or error in JSON-RPC format.
    // - Further game handling.
    /**
     * @dev Safely mints an ERC721 token for a user if the user has approved the required amount of GFAL tokens.
     * @param to The address to which the minted token should be sent.
     * @param collectionId The collection id to mint.
     * @param price The price value must be set in USD to do the conversion to GFAL.
     * Requirements: The caller must be the contract admin or super admin (Set in the Proxy contract).
     * Note: It will allow the marketplace contract to manage all the NFTs. To avoid friction for the user to approve the marketplace.
     *       Price can be 0 as some payments will be processed by Debit / Credit Card.
     */
    function safeMint(
        address to,
        uint256 collectionId,
        uint256 price // USD
    ) external payable onlyPrivileges {
        _tokenIdCounter = _tokenIdCounter + 1;
        Collection memory details = collectionSupply[collectionId];
        collectionSupply[collectionId].totalSold++;
        require(
            collectionId <= collectionCounter && collectionId != 0,
            "Not valid collection"
        );

        if (details.maxSupply != 0) {
            require(details.maxSupply > details.totalSold, "Sold out");
        }

        address marketPlace = gfalProxy.getMarketPlace();
        if (!isApprovedForAll(to, marketPlace)) {
            _setApprovalForAll(to, marketPlace, true);
        }

        // Get the conversion from USD to GFAL
        uint256 tokenPrice = IGFALOracleConsumer(gfalProxy.getOracleConsumer())
            .getConversionRate(price);
        // Transferring $GFAL fee from player wallet to feeCollector. Assuming previous allowance has been given.
        IERC20(gfalProxy.getGfalToken()).safeTransferFrom(
            to,
            gfalProxy.getFeeCollector(),
            tokenPrice
        );

        _safeMint(to, _tokenIdCounter);
        emit Mint(
            address(0),
            to,
            _tokenIdCounter,
            collectionId,
            details.totalSold,
            tokenPrice
        );
    }

    /**
     * @dev Sets a new Collection to track the total sold NFTs and the max supply.
     * @param maxSupply The maximum supply to set for this NFT collection.
     * Requirements: The caller must be the contract admin or super admin (Set in the Proxy contract).
     * Note: It will allow the marketplace contract to mint NFTs until the max supply is reached.
     * Note: If maxSupply is set as "0" it will be unlimited minting. So no maxSupply.
     */
    function createCollection(
        uint256 maxSupply
    ) external payable onlyPrivileges {
        collectionCounter = collectionCounter + 1;
        collectionSupply[collectionCounter] = Collection(0, maxSupply);
        emit NewCollection(collectionCounter, maxSupply);
    }

    /**
     * @dev Returns the address of the token owner for the provided array of token ids.
     * @param tokens An array of token ids.
     * @return An array of addresses owning the tokens passed as parameters.
     */
    function getOwnersByTokens(
        uint256[] memory tokens
    ) external view returns (address[] memory) {
        address[] memory response = new address[](tokens.length);

        for (uint256 i = 0; i < tokens.length; ) {
            response[i] = ownerOf(tokens[i]);
            unchecked {
                i++;
            }
        }

        return response;
    }

    /**
     * @dev Updates the base URI for the token metadata.
     * @param _baseUri The new base URI.
     * Requirements: The caller must be the contract admin or super admin (Set in the Proxy contract).
     */
    function updateBaseURI(
        string calldata _baseUri
    ) external payable onlyPrivileges {
        baseURI = _baseUri;
    }

    /**
     * @dev Updates the royalty fraction set for secondary market sale.
     * @param feeNumerator The new royalty fraction to set. 100 * (feeNumerator) / 480 = 4.8% as fee
     * Note: It will take effect only in secondary market sales. (Not in our own market place)
     */
    function setTokenRoyalty(
        uint16 feeNumerator
    ) external payable onlyPrivileges {
        require(feeNumerator < 10001, "Royalty fee will exceed salePrice");
        royaltyFraction = feeNumerator;
    }

    /**
     * @dev Returns the fee collector and the royaltyAmount to transfer. (ERC-2981)
     * @param salePrice Total sale price.
     * Note: It will take effect only in secondary market place. (Not in our own market place)
     */
    function royaltyInfo(
        uint256,
        uint256 salePrice
    ) external view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyFraction) / 10000;

        return (gfalProxy.getFeeCollector(), royaltyAmount);
    }

    /**
     *@dev Returns the tokens id a wallet owns.
     *@param wallet public address to get tokens owned.
     */
    function tokensByWallet(
        address wallet
    ) external view returns (uint256[] memory) {
        uint256 counter = balanceOf(wallet);
        uint256[] memory result = new uint256[](counter);

        for (uint256 i = 0; i < counter; i++) {
            uint256 _result = tokenOfOwnerByIndex(wallet, i);
            result[i] = _result;
        }
        return result;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     * Note: Added interface for ERC2981 (for being Royalties compatible)
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return
            interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }

    /**
     *@dev Returns the base URI for the token metadata.
     *Note: Overrides the internal _baseURI() function of ERC721.
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     *@dev Hook that is called before any token transfer.
     * Note: Overrides the internal _beforeTokenTransfer() function of ERC721 and ERC721Enumerable.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
