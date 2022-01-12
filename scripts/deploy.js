const hre = require("hardhat");

async function main() {
  let BridgeToken = await hre.ethers.getContractFactory("BridgeToken");
  let bridgeToken = await BridgeToken.deploy("Polygon LEO", "pLEO", 10000000000, 3);
  await bridgeToken.deployed()
  console.log(`Deployed at: ${bridgeToken.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
