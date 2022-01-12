const { expect } = require("chai");
const { ethers } = require("hardhat");
const sigUtil = require("eth-sig-util")
const web3 = require("web3")

let CHAIN_ID = 31337
let TOKEN_CONTRACT_ADDRESS;

let signer = "0xB88F40F363cfB547714756e6692FF36F24a6c538";
let privateKey = "0xa536f79440d2d914e090e97611db95a8261eb04b802e1ecb24ce3f1981bffd76"

describe("Bridgable Token", function () {
  let accounts;
  let bridgeToken;

  async function init(){
    accounts = await ethers.getSigners();

    const BridgeToken = await hre.ethers.getContractFactory("BridgeToken");
    bridgeToken = await BridgeToken.deploy("Polygon LEO", "pLEO", 100000000000, 3);
    TOKEN_CONTRACT_ADDRESS = bridgeToken.address
    await bridgeToken.deployed();

    let mint = await bridgeToken.mint(signer, 1000)
    await mint.wait()
  }

  it("Should transfer with signature", async () => {
    await init();

    let signature = await prepareSignature(signer, "0x000000000000000000000000000000000000dead", 1000, 0);

    let send = await bridgeToken.transferWithPermit(signer, "0x000000000000000000000000000000000000dead", 1000, signature, 0)
    await send.wait()

    let balance = await bridgeToken.balanceOf("0x000000000000000000000000000000000000dead")

    expect(balance.toString()).equals("1000")
  })

  it("Should fail with same nonce", async () => {
    let signature = await prepareSignature(signer, "0x000000000000000000000000000000000000dead", 1000, 0);

    let error;
    try {
      let send = await bridgeToken.transferWithPermit(signer, "0x000000000000000000000000000000000000dead", 1000, signature, 0)
      await send.wait()
    } catch (e) {
      error = e.message;
    }

    expect(error).equal("VM Exception while processing transaction: reverted with reason string 'Nonce already used'")
  })

  it("Should fail with invalid signature", async () => {
    let signature = await prepareSignature(signer, "0x000000000000000000000000000000000000aaaa", 1000, 0);

    let error;
    try {
      let send = await bridgeToken.transferWithPermit(signer, "0x000000000000000000000000000000000000dead", 1000, signature, 1)
      await send.wait()
    } catch (e) {
      error = e.message;
    }

    expect(error).equal("VM Exception while processing transaction: reverted with reason string 'Invalid signature!'")
  })
});

function prepareSignature(from, to, amount, nonce){
  return new Promise(async (resolve, reject) => {
    let msgHash = await web3.utils.soliditySha3(from, to, amount, nonce, TOKEN_CONTRACT_ADDRESS, CHAIN_ID);
    let msgParams = {
      data: msgHash
    }

    if (!privateKey.startsWith('0x')) privateKey = '0x' + privateKey

    let signature = await sigUtil.personalSign(ethers.utils.arrayify(privateKey), msgParams)
    resolve(signature);
  })
}
