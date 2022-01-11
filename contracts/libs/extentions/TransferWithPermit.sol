pragma solidity ^0.8.11;

contract TransferWithPermit {
  mapping (address => mapping (uint256 => bool)) public nonces;

  function transferWithPermit(address from, address account, uint256 amount, bytes signature, uint256 nonce) public returns (bool) {
    require(nonces[from][nonce] == false, 'Nonce already used');

    uint256 chainId = getChainID();
    bytes32 messageHash = getEthereumMessageHash(keccak256(abi.encodePacked(from, account, amount, nonce, address(this), chainId)));
    address signer = recoverSigner(messageHash, signature);
    require(signer == from, 'Invalid signature!');

    nonces[signer][nonce] = true;

    _transfer(from, account, amount);
    return true;
  }

  function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    if (signature.length != 65) {
        return (address(0));
    }

    assembly {
        r := mload(add(signature, 0x20))
        s := mload(add(signature, 0x40))
        v := byte(0, mload(add(signature, 0x60)))
    }

    if (v < 27) {
        v += 27;
    }

    if (v != 27 && v != 28) {
        return (address(0));
    } else {
        return ecrecover(hash, v, r, s);
    }
  }

  function getEthereumMessageHash(bytes32 hash) public pure returns(bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
  }

  function getChainID() external view returns (uint256) {
    uint256 id;
    assembly {
        id := chainid()
    }
    return id;
  }
}
