// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../utils/OracleConsumer/IGFALOracleConsumer.sol";
import "../../utils/Proxy/IGFALProxy.sol";

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
 *@title GFALMarketplace
 *@dev GFAL Marketplace is a smart contract where users can sell and buy ERC721 and ERC1155 tokens.
 * It uses OpenZeppelin contracts as libraries and inherits from ReentrancyGuard to prevent reentrancy attacks.
 * Note: Constructor and functions that need gas fee are set as payable to avoid OPCODES checking msg.value.
 */
contract GFALMarketplace is ReentrancyGuard, ERC721Holder, ERC1155Holder {
    using SafeERC20 for IERC20;

    /**
     * @dev Structure to hold the sale information.
     */
    struct Sale {
        uint256 price; // Price of the NFTs in USD or GFAL tokens.
        bool isDollar; // Indicates whether the price is denominated in USD (true) or GFAL tokens (false).
        bool isForSale; // Indicates whether the NFT is currently listed for sale.
        uint256 amount; // Amount of NFTs to sale.
        address seller; // Seller of the NFT sale.
        uint256 tokenId; // token id for the sale
        address collection; // smart contract address
    }

    /**
     * @dev Structure to hold the whitelist information of a collection.
     */
    struct Whitelist {
        bool allowed;
        TokenStandard tokenStandard;
    }

    /**
     * @dev Enum for different token standards.
     */
    enum TokenStandard {
        ERC721,
        ERC1155
    }

    IGFALProxy private immutable gfalProxy; // Proxy to store variables as addresses from contracts and from wallets.
    bool public isActive; // Toggle for allowing new sales or stop the protocol in case something went wrong.
    uint256 public royaltiesInBasisPoints; // Royalty fee for every sale.
    uint256 public saleCounter; // Sale counter for every sale.

    mapping(address => Whitelist) public whitelistNFTs; // Whitelisted NFTs smart contracts.
    mapping(uint256 => Sale) public Sales; // mapping to store all the Sales details.

    modifier onlyPrivileges() {
        require(
            gfalProxy.checkAdmin(msg.sender) ||
                gfalProxy.checkSuperAdmin(msg.sender),
            "Not Admin or Super Admin"
        );
        _;
    }

    event SellToken(
        address indexed collection,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        bool isDollar,
        address indexed seller,
        uint256 saleId
    );
    event BuyToken(
        address indexed collection,
        uint tokenId,
        uint256 amount,
        uint price,
        uint sellerRevenue,
        uint royalties,
        address indexed seller,
        address indexed buyer,
        uint256 saleId
    );
    event SaleUpdated(
        address indexed collection,
        uint256 tokenId,
        uint256 newPrice,
        bool isDollar,
        address indexed seller,
        uint256 saleId
    );
    event RemoveToken(
        address indexed collection,
        uint256 tokenId,
        address indexed seller,
        uint256 saleId
    );
    event ContractStatusUpdated(bool isActive);
    event RoyaltiesInBasisPointsUpdated(
        uint256 oldRoyalties,
        uint256 newRoyalties
    );
    event CollectionUpdated(address indexed collection, bool isActive);

    /**
     * @dev Initializes the GFALMarketplace contract with the given GFALProxy contract address and the rolaties in basis points to calculate the marketplace fees.
     * @param _royaltiesInBasisPoints Royalties amount to set.
     * @param _gfalProxy The address of the Proxy contract.
     * Note: It sets the Marketplace as Activ by default.
     */
    constructor(uint256 _royaltiesInBasisPoints, address _gfalProxy) {
        require(_gfalProxy != address(0), "Address cannot be 0");
        royaltiesInBasisPoints = _royaltiesInBasisPoints;
        gfalProxy = IGFALProxy(_gfalProxy);
        isActive = true;
    }

    /**
     *@dev Allows NFTs owners to sell NFTs in the marketplace.
     *@param collection The address of the NFT contract.
     *@param tokenId The ID of the token being sold.
     *@param amount The amount of tokens being sold.
     *@param price The price of the tokens being sold.
     *@param isDollar A boolean flag indicating whether the price is in dollars or in GFAL.
     *@notice This function can only be called by the owner of the token and if the token's collection is whitelisted.
     *@notice The token needs to be approved for spending before it can be sold.
     *@notice The amount cannot be 0, the marketplace needs to be active and the NFT collection needs to be whitelisted.
     *@notice If the token is an ERC721 token, the amount needs to be 1 and the token needs to be approved for spending.
     *@notice If the token is an ERC1155 token, the token needs to be approved for spending.
     *@notice The details of the sale are stored in the Sales mappings and an event is emitted with the details of the sale.
     */
    function sellToken(
        address collection,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        bool isDollar
    ) external payable {
        require(amount != 0, "Value cannot be 0");
        require(price != 0, "Value cannot be 0");
        require(tokenId != 0, "Value cannot be 0");

        require(isActive, "MarketPlace Under maintenance");
        require(
            whitelistNFTs[collection].allowed,
            "Not allowed NFT collect payableion"
        );

        uint256 saleId = saleCounter;
        Sales[saleId] = Sale(
            price,
            isDollar,
            true,
            amount,
            msg.sender,
            tokenId,
            collection
        );

        // Check on TokenStandard.ERC721 or ERC1155 in order to look for specific approval
        if (whitelistNFTs[collection].tokenStandard == TokenStandard.ERC721) {
            require(amount == 1, "Amount needs to be 1");
            require(
                IERC721Enumerable(collection).ownerOf(tokenId) == msg.sender,
                "Token does not belong to user or not existing 721."
            );

            IERC721Enumerable(collection).safeTransferFrom(
                msg.sender,
                address(this),
                tokenId
            );
        } else {
            require(
                IERC1155(collection).balanceOf(msg.sender, tokenId) >= amount,
                "Not enough token balance 1155"
            );

            IERC1155(collection).safeTransferFrom(
                msg.sender,
                address(this),
                tokenId,
                amount,
                ""
            );
        }
        saleCounter = saleId + 1;

        emit SellToken(
            collection,
            tokenId,
            amount,
            price,
            isDollar,
            msg.sender,
            saleId
        );
    }

    /**
     *@dev Function to buy an NFT token from a seller.
     *@param saleId Unic identifier for each sale.
     *Note: If you purchase an ERC1155 you will purchase the whole sale amount.
     *      e.g: Seller lists Token id 152, 5 copies (ERC1155). Buyer will buy the 5 copies for the listed price.
     */
    function buyToken(uint256 saleId) external payable nonReentrant {
        require(isActive, "SC Under maintenance");
        require(saleId <= saleCounter, "Not Valid id");

        Sale memory sale;
        sale = Sales[saleId];
        delete Sales[saleId]; // Setting sale as not for sell.

        require(sale.isForSale, "Token is not for sale");
        require(
            whitelistNFTs[sale.collection].allowed,
            "Blacklisted collection"
        );
        // Calculate royalties and wanted price, if isDollar expressed listing.
        uint256 price = sale.isDollar
            ? IGFALOracleConsumer(gfalProxy.getOracleConsumer())
                .getConversionRate(sale.price) // Convert from USD to GFAL.
            : sale.price;

        // Otherwise already in GFAL
        (
            uint256 amountAfterRoyalties,
            uint256 royaltiesAmount
        ) = _calculateMarketplaceRoyalties(price);

        // Send funds to seller and fees to marketplaceRoyalties.
        IERC20(gfalProxy.getGfalToken()).safeTransferFrom(
            msg.sender,
            sale.seller,
            amountAfterRoyalties
        );
        IERC20(gfalProxy.getGfalToken()).safeTransferFrom(
            msg.sender,
            gfalProxy.getRoyaltiesCollector(),
            royaltiesAmount
        );

        bool isERC721 = whitelistNFTs[sale.collection].tokenStandard ==
            TokenStandard.ERC721;

        // Check NFT type and transfer it accordingly.
        if (isERC721) {
            IERC721Enumerable(sale.collection).safeTransferFrom(
                address(this),
                msg.sender,
                sale.tokenId
            );
        } else {
            IERC1155(sale.collection).safeTransferFrom(
                address(this),
                msg.sender,
                sale.tokenId,
                sale.amount,
                ""
            );
        }

        emit BuyToken(
            sale.collection,
            sale.tokenId,
            sale.amount,
            price,
            amountAfterRoyalties,
            royaltiesAmount,
            sale.seller,
            msg.sender,
            saleId
        );
    }

    /**
     *@dev Function to update NFT sale price
     *@param saleId Unic identifier for each sale.
     *@param newPrice The new price to set for the sale
     *@param isDollar A boolean flag indicating whether the price is in dollars or in GFAL.
     */
    function updatePrice(
        uint256 saleId,
        uint256 newPrice,
        bool isDollar
    ) external payable {
        require(newPrice != 0, "Price must be greater than 0");
        require(saleId <= saleCounter, "Not Valid id");

        Sale memory sale;
        sale = Sales[saleId];
        require(sale.seller == msg.sender, "Not seller");

        Sales[saleId].price = newPrice;
        Sales[saleId].isDollar = isDollar;

        emit SaleUpdated(
            sale.collection,
            sale.tokenId,
            newPrice,
            isDollar,
            msg.sender,
            saleId
        );
    }

    /**
     *@dev Function to remove and NFT on sale from sale.
     *@param saleId Unic identifier for each sale.
     */
    function removeToken(uint256 saleId) external payable {
        Sale memory sale;
        sale = Sales[saleId];
        require(sale.seller == msg.sender, "Not seller");
        delete Sales[saleId];

        if (
            whitelistNFTs[sale.collection].tokenStandard == TokenStandard.ERC721
        ) {
            IERC721Enumerable(sale.collection).safeTransferFrom(
                address(this),
                msg.sender,
                sale.tokenId
            );
        } else {
            IERC1155(sale.collection).safeTransferFrom(
                address(this),
                msg.sender,
                sale.tokenId,
                sale.amount,
                ""
            );
        }

        emit RemoveToken(sale.collection, sale.tokenId, msg.sender, saleId);
    }

    /**
     *@dev Internal function to calculate the marketplace royalties to split the sale price.
     *@param amount Total selling price to split.
     *@return amountAfterRoyalties selling price substracting the royaltiesAmount.
     *@return royaltiesAmount amount the royaltiesCollector keeps.
     */
    function _calculateMarketplaceRoyalties(
        uint256 amount
    )
        internal
        view
        returns (uint256 amountAfterRoyalties, uint256 royaltiesAmount)
    {
        royaltiesAmount = (amount * royaltiesInBasisPoints) / (10000);
        amountAfterRoyalties = amount - royaltiesAmount;
    }

    /**
     *@dev Function to set the contract status.
     *@param _isActive Boolean value to set the contract status. (True -> Contract activated, False -> Contract not active)
     * Requirements: The caller must be set as Admin or Super Admin.
     * Note: If NOT active the sellers will still be able to remove and update their tokens sale.
     */
    function updateContractStatus(
        bool _isActive
    ) external payable onlyPrivileges {
        isActive = _isActive;
        emit ContractStatusUpdated(_isActive);
    }

    /**
     *@dev Function to add or remove NFTs contracts from the whitelist. It will allow or refuse the selling option.
     *@param collection NFT collection address.
     *@param tokenStandard ERC Standar of the NFTscontract. (ERC721 is 0 and ERC1155 is 1)
     *@param allowed Boolean value to allow the NFT of the allowed contract to be on sale. (True -> Contract allowed, False -> Contract not allowed)
     * Requirements: The caller must be set as Admin or Super Admin.
     */
    function updateCollection(
        address collection,
        TokenStandard tokenStandard,
        bool allowed
    ) external payable onlyPrivileges {
        require(
            tokenStandard == TokenStandard.ERC721 ||
                tokenStandard == TokenStandard.ERC1155,
            "Not valid tokenStandard"
        );
        whitelistNFTs[collection] = Whitelist(allowed, tokenStandard);
        emit CollectionUpdated(collection, allowed);
    }

    /**
     *@dev Function to updated the Royalties basis points
     *@param _royaltiesInBasisPoints new Royalty basis points to set.
     * Note: The amount given as parameter wil be divided between 10.000 as Solidity does not allow decimals. (e.g., 250 for 2.5%)
     * Requirements: The caller must be set as Admin or Super Admin.
     */
    function updateRoyaltiesInBasisPoints(
        uint256 _royaltiesInBasisPoints
    ) external payable onlyPrivileges {
        require(_royaltiesInBasisPoints < 10001, "number exceeds 100%");
        uint256 oldRoyalties = royaltiesInBasisPoints;
        royaltiesInBasisPoints = _royaltiesInBasisPoints;
        emit RoyaltiesInBasisPointsUpdated(
            oldRoyalties,
            royaltiesInBasisPoints
        );
    }
}
