// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISwapRouter} from '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import {TransferHelper} from '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract SwapContract {
    address payable owner;

    constructor() {
        owner = payable(msg.sender); // make the deployer of the contract the owner
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function swapSingle(
        address _tokenIn,
        address _tokenOut,
        address _swapRouter,
        uint256 _amount,
        uint24 _poolFee
        )
        external onlyOwner
        returns (uint256 amountOut)
        {
        ISwapRouter swapRouter = ISwapRouter(_swapRouter);

        // The msg.sender must approve of this token to be spent by the router.

        // Transfer the specified amount of token to this contract.
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amount);

        // Approve the router to spend token.
        TransferHelper.safeApprove(_tokenIn, address(swapRouter), _amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: _poolFee,
                recipient: msg.sender,
                deadline: block.number,
                amountIn: _amount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountOut = swapRouter.exactInputSingle(params);

        return amountOut;
    }
}