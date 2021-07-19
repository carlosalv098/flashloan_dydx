
const hre = require("hardhat");

async function main() {

  const DyDxFlashloan = await hre.ethers.getContractFactory("DyDxFlashloan");
  const dydxFlashloan = await DyDxFlashloan.deploy();

  await dydxFlashloan.deployed();

  console.log("Contract deployed to:", dydxFlashloan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });