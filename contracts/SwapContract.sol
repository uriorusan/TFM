// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISwapRouter} from '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import {TransferHelper} from '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract SwapContract {
    address payable owner;

    // Events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event SwapInitiated(address indexed tokenIn, address indexed tokenOut, uint256 amountIn);
    event SwapFinished(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    event ApprovalSet(address indexed token, address indexed spender, uint256 amount);
    event TransferPerformed(address indexed token, address indexed from, address indexed to, uint256 amount);

    constructor() {
        owner = payable(msg.sender); // make the deployer of the contract the owner
        emit OwnershipTransferred(address(0), msg.sender);
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
    external onlyOwner returns (uint256 amountOut)
    {
        ISwapRouter swapRouter = ISwapRouter(_swapRouter);

        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amount);
        emit TransferPerformed(_tokenIn, msg.sender, address(this), _amount);

        TransferHelper.safeApprove(_tokenIn, address(swapRouter), _amount);
        emit ApprovalSet(_tokenIn, address(swapRouter), _amount);

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
        emit SwapInitiated(_tokenIn, _tokenOut, _amount);

        amountOut = swapRouter.exactInputSingle(params);
        emit SwapFinished(_tokenIn, _tokenOut, _amount, amountOut);
        return amountOut;
    }
}
