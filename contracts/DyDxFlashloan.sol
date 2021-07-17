// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../interfaces/DyDxFlashloanBase.sol';
import '../interfaces/ICallee.sol';

contract DyDxFlashloanBase is DydxFlashloanBase, ICallee {

    address private constant SOLO = 0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e;
    address public user;

    event Log(string message, uint val);

    struct Data {
        address token;
        uint repayAmount;
    }

    // call dydx and ask for the flashloan
    function initiateFlashloan(address _token, uint _amount) external {
        ISoloMargin solo = ISoloMargin(SOLO);
        uint marketID = _getMarketIdFromTokenAddress(SOLO, _token);

        // calculate repay amount
        uint repay_amount = _getRepaymentAmountInternal(_amount);
        IERC20(_token).approve(SOLO, repay_amount);

        Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

        operations[0] = _getWithdrawAction(marketID, _amount);
        operations[1] = _getCallAction(abi.encode(Data({token: _token, repayAmount: repay_amount})));
        operations[2] = _getDepositAction(marketID, repay_amount);

        Account.Info[] memory accountInfos = new Account.Info[](1);

        accountInfos[0] = _getAccountInfo();

        solo.operate(accountInfos, operations);
    }
        
    // this function receives the flashloan, dydx will call this function
    function callFunction(
        address sender, 
        Account.Info memory account,
        bytes memory data
    ) public override {
        require(msg.sender == SOLO, 'the caller to this function is not SOLO');
        require(sender == address(this), 'sender of the flashloan is not this address');
        
        Data memory data_decoded = abi.decode(data, (Data));
        uint repay_amount = data_decoded.repayAmount;

        uint balance = IERC20(data_decoded.token).balanceOf(address(this));
        require(balance >= repay_amount, 'balance has to be higher than repay amount');

        user = sender;
        emit Log('balance', balance);
        emit Log('repay amount', repay_amount);
        emit Log('balance - repay amount', balance - repay_amount);
    }

}