// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISwapRouter} from '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import {TransferHelper} from '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract SwapContract {
    address payable owner;

    // Events
    event SwapInitiated(ISwapRouter.ExactInputSingleParams params);
    event SwapFinished(uint256 amountOut);
    event InputSet(address indexed token, address indexed spender, uint256 amount);

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
    external returns (uint256 amountOut)
    {
        ISwapRouter swapRouter = ISwapRouter(_swapRouter);
        IERC20 tokenIn = IERC20(_tokenIn);

        // This transaction needs to be approved by the msg.sender
        // It shall do tokenIn.approve(SwapContractAddress, _amount) before calling this function
        tokenIn.transferFrom(msg.sender, address(this), _amount);

        tokenIn.approve(_swapRouter, _amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: _poolFee,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: _amount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });

        emit SwapInitiated(params);

        amountOut = swapRouter.exactInputSingle(params);

        emit SwapFinished(amountOut);

        return amountOut;
    }
}
