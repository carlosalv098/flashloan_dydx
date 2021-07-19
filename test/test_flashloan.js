const BN = require('bn.js');
const { assert } = require('chai');
const IERC20 = artifacts.require('IERC20');
const DyDxFlashloan = artifacts.require('DyDxFlashloan');

const SOLO = '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e';

contract('DyDxFlashloan', accounts => {

    const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';   
    const DAI_WHALE = '0x16463c0fdB6BA9618909F5b120ea1581618C1b9E';
    const DECIMALS = 6;

    const FUND_AMOUNT =  new BN(10).pow(new BN(18)).mul(new BN(200))
    const BORROW_AMOUNT = new BN(10).pow(new BN(18)).mul(new BN(1000000))
       
    let dydxFlashloan, token, flashloan_user, user;

    beforeEach(async () => {
        token = await IERC20.at(DAI);
        dydxFlashloan = await DyDxFlashloan.new();
        flashloan_user= accounts[0]

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE],
        });

        console.log(`contract address is: ${dydxFlashloan.address}`)

        const whale_balance = await token.balanceOf(DAI_WHALE);
        assert(whale_balance.gte(FUND_AMOUNT), 'Whale DAI balance has to be higher than FUND AMOUNT');
        await token.transfer(dydxFlashloan.address, FUND_AMOUNT, { from: DAI_WHALE });

        const solo_balance = await token.balanceOf(SOLO);
        assert(solo_balance.gte(BORROW_AMOUNT), 'Solo balance has to be higher than BORROW AMOUNT');
        console.log(`SOLO balance is: ${solo_balance}`);
    });

    it('flash loan functionality works correctly' , async () => {
        
        const tx = await dydxFlashloan.initiateFlashloan(token.address, BORROW_AMOUNT, { from: flashloan_user });
        
        user = await dydxFlashloan.user();
        
        for(const log of tx.logs) {
            console.log(log.args.message, log.args.val.toString());
        }
        
        assert.equal(user, dydxFlashloan.address, 
            'user has to be set correctly to the address of dydxFlashloan');
    })
})