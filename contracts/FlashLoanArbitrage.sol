// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import "hardhat/console.sol";

interface ISwapContractUniV3 {
    function swapSingle(
        address _from,
        address _to,
        address _router,
        uint256 _amount,
        uint24 _poolFee
    ) external returns (uint256);
}

interface ISwapContractUniV2 {
    function swapSingle(
        address _from,
        address _to,
        address _router,
        uint256 _amount
    ) external returns (uint256);
}

contract FlashLoanArbitrage is FlashLoanSimpleReceiverBase {
    address payable owner;
    ISwapContractUniV3 swapContractV3;
    ISwapContractUniV2 swapContractV2;

    enum SwapDirection {
        V2ThenV3,
        V3ThenV2
    }

    struct requestFlashLoanArbitrageSimpleParams {
        uint256 amount;
        address[] tokens;
        address[] swapRouters;
        uint24[] poolFees;
        SwapDirection direction;
    }

    requestFlashLoanArbitrageSimpleParams public storedParams;
    ISwapContractUniV3 private swapContract;

    constructor(
        address _addressProvider,
        address _addressSwapContractV3,
        address _addressSwapContractV2
    )
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) // Initialize the parent contract with the address provider
    {
        owner = payable(msg.sender); // make the deployer of the contract the owner
        swapContractV3 = ISwapContractUniV3(_addressSwapContractV3);
        swapContractV2 = ISwapContractUniV2(_addressSwapContractV2);
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
        require(
            asset == storedParams.tokens[0],
            "Asset must match the loan token"
        );
        params; // to silence the warning

        if (storedParams.direction == SwapDirection.V3ThenV2) {
            TransferHelper.safeApprove(asset, address(swapContractV3), amount);

            uint256 amountOut = swapContractV3.swapSingle(
                storedParams.tokens[0],
                storedParams.tokens[1],
                storedParams.swapRouters[0],
                amount,
                storedParams.poolFees[0]
            );

            TransferHelper.safeApprove(
                storedParams.tokens[1],
                address(swapContractV3),
                amountOut
            );

            amountOut = swapContractV2.swapSingle(
                storedParams.tokens[1],
                storedParams.tokens[0],
                storedParams.swapRouters[1],
                amountOut
            );
        } else {
            TransferHelper.safeApprove(
                storedParams.tokens[0],
                address(swapContractV2),
                amount
            );

            uint256 amountOut = swapContractV2.swapSingle(
                storedParams.tokens[0],
                storedParams.tokens[1],
                storedParams.swapRouters[0],
                amount
            );

            TransferHelper.safeApprove(
                storedParams.tokens[1],
                address(swapContractV3),
                amountOut
            );

            amountOut = swapContractV3.swapSingle(
                storedParams.tokens[1],
                storedParams.tokens[0],
                storedParams.swapRouters[1],
                amountOut,
                storedParams.poolFees[1]
            );
        }

        // Calculate the total amount owed including the premium
        uint256 amountOwed = amount + premium;
        TransferHelper.safeApprove(address(POOL), asset, amountOwed);

        // send the rest to the owner
        TransferHelper.safeTransfer(
            asset,
            address(owner),
            IERC20(asset).balanceOf(address(this)) - amountOwed
        );

        return true;
    }

    /**
     * requestFlashLoanArbitrageSimple is the entry point for the contract.
     * it will store the arbitrage details and initiate the flash loan
     * @param _params - requestFlashLoanArbitrageSimpleParams
     */
    function requestFlashLoanArbitrageSimple(
        requestFlashLoanArbitrageSimpleParams calldata _params
    ) public onlyOwner {
        require(_params.tokens.length == 2, "Array length must be 2");
        require(
            _params.tokens.length == _params.swapRouters.length &&
                _params.tokens.length == _params.poolFees.length,
            "Array lengths must match"
        );

        // Store the details for use in executeOperation
        storedParams = _params;

        // Initiate flash loan request
        POOL.flashLoanSimple(
            address(this),
            storedParams.tokens[0],
            storedParams.amount,
            "",
            0
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
