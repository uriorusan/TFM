// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISwapRouter} from '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import {TransferHelper} from '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import "@aave/periphery-v3/contracts/misc/WrappedTokenGatewayV3.sol";
// import IVariableDebtToken
import '@aave/core-v3/contracts/interfaces/IAToken.sol';
import '@aave/core-v3/contracts/interfaces/IStableDebtToken.sol';
import '@aave/core-v3/contracts/interfaces/IVariableDebtToken.sol';