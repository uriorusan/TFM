// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IDexInteraction {
    function executeTrades(
        address[] memory loanTokens,
        address[] memory loanPools,
        uint256[] memory loanAmounts,
        bool[] memory tradeDirections
    ) external returns (bool success);
}

contract FlashLoan_2 is FlashLoanSimpleReceiverBase {
    address payable owner;
    // Arrays to store loan details
    uint256[] public loanAmounts;
    address[] public loanTokens;
    bool[] public tradeDirections;
    address[] public loanPools;
    IDexInteraction private dexContract;

    constructor(address _addressProvider, address _dexContractAddress)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        owner = payable(msg.sender); // make the deployer of the contract the owner
        dexContract= IDexInteraction(_dexContractAddress);
    }

    

    /**
        This function is called after your contract has received the flash loaned amount.
        Here we execute the trades as per the directions provided.
     */
    function executeOperation(
        address asset, // address of asset borrowed
        uint256 amount, // amount borrowed
        uint256 premium, // fee to be paid
        address initiator, // initiator of the loan
        bytes calldata params // other params
    ) external override returns (bool) {
        require(initiator == address(this), "Initiator must be this contract");
        require(msg.sender == address(POOL), "Call must come from POOL");
        require(asset == loanTokens[0], "Asset must match the loan token");
        require(amount == loanAmounts[0], "Amount must match the loan amount");
        // make sure array are not empty
        // require()

        // approve the dex contract to spend the loaned amount and all other tokens
        for (uint i = 0; i < loanTokens.length; i++) {
            IERC20(loanTokens[i]).approve(address(dexContract), loanAmounts[i]);
        }
        
        dexContract.executeTrades(
            loanTokens,
            loanPools, // Assuming each pool address is also the destination token address
            loanAmounts,
            tradeDirections // Destination pool for the trade
        );

        // clear the arrays
        delete loanAmounts;
        delete loanTokens;
        delete tradeDirections;
        delete loanPools;

        // Calculate the total amount owed including the premium
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function requestFlashLoan(address[] calldata _tokens, uint256[] calldata _amounts, bool[] calldata _tradeDirections, address[] calldata _pools) onlyOwner() public {
        require(_tokens.length == _amounts.length && _amounts.length == _tradeDirections.length && _tradeDirections.length == _pools.length, "Array lengths must match");

        // Store the details for use in executeOperation
        for (uint i = 0; i < _tokens.length; i++) {
            // Storing the details for later use
            loanAmounts.push(_amounts[i]);
            tradeDirections.push(_tradeDirections[i]);
            loanPools.push(_pools[i]);
            loanTokens.push(_tokens[i]);
        }
        address receiverAddress = address(this);
        bytes memory params = ""; // Optionally, could encode and pass relevant parameters
        uint16 referralCode = 0; // if needed

        // Initiate flash loan request
        POOL.flashLoanSimple(
            receiverAddress,
            _tokens[0],
            _amounts[0],
            params,
            referralCode
        );
    }

    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    function withdraw(address _tokenAddress) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    receive() external payable {}
}
