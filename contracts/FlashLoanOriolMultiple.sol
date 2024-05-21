// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SwapContract} from "./SwapContract.sol";


contract FlashLoanOriolMultiple is FlashLoanSimpleReceiverBase {
    address payable owner;
    // Arrays to store loan details
    uint256 public loanAmount;
    address[] public tokens;
    address[] public swapRouters;
    uint24[] public poolFees;
    SwapContract private swapContract;

    constructor(address _addressProvider, address _dexContractAddress)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) // Initialize the parent contract with the address provider
    {
        owner = payable(msg.sender); // make the deployer of the contract the owner
        swapContract = SwapContract(_dexContractAddress);
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
        require(asset == tokens[0], "Asset must match the loan token");

        uint256 arrayLength = tokens.length;

        // approve the dex contract to spend the loaned amount and all other tokens
        uint256 amountOut = amount;
        for (uint n = 0; n < arrayLength -1; n++) {
            IERC20(tokens[n]).approve(address(swapContract), amountOut);
            amountOut = swapContract.swapSingle(
                tokens[n],
                tokens[n+1], // Assuming each pool address is also the destination token address
                swapRouters[n], // Assuming each pool address is also the router address
                amountOut, // Destination pool for the trade
                poolFees[n] // Fee for the trade
            );
        }

        // approve the dex contract to spend the loaned amount and all other tokens
        IERC20(tokens[tokens.length]).approve(address(swapContract), amountOut);

        swapContract.swapSingle(
            tokens[arrayLength],
            tokens[0], // Assuming each pool address is also the destination token address
            swapRouters[arrayLength], // Assuming each pool address is also the router address
            amountOut, // Destination pool for the trade
            poolFees[arrayLength] // Fee for the trade
        );

        // Calculate the total amount owed including the premium
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    /**
        * requestFlashLoanArbitrageMultiple is the entry point for the contract.
        * it will store the arbitrage details and initiate the flash loan
        * @param _amount amount to borrow
        * @param _tokens array of token addresses to swap. [0] will be the one loaned, traded for [1] and traded back for [0]
        * @param _swapRouters array of swap router addresses. Correlated with _tokens
        * @param _poolFees array of pool fees. Correlated with _tokens
    */
    function requestFlashLoanArbitrageMultiple(
        uint256 _amount,
        address[] calldata _tokens,
        address[] calldata _swapRouters,
        uint24[] calldata _poolFees
        )
        onlyOwner() public
        {
        require(_tokens.length > 2, "Array length must greater than 2");
        require(_tokens.length == _swapRouters.length && _tokens.length == _poolFees.length, "Array lengths must match");

        // Store the details for use in executeOperation
        loanAmount = _amount;
        tokens = _tokens;
        swapRouters = _swapRouters;
        poolFees = _poolFees;

        // prepare the rest of the data
        address receiverAddress = address(this);
        bytes memory params = ""; // Optionally, could encode and pass relevant parameters
        uint16 referralCode = 0; // if needed

        // Initiate flash loan request
        POOL.flashLoanSimple(
            receiverAddress,
            _tokens[0],
            loanAmount,
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
