pragma solidity ^0.8.11;

import "./libs/extentions/Ownable.sol";
import "./libs/ERC20.sol";
import "./libs/extentions/Mintable.sol";
import "./libs/extentions/TransferWithPermit.sol";

contract BridgeToken is
  Ownable,
  ERC20,
  ERC20Mintable,
  TransferWithPermit,
  ERC20Capped(10000000000),
  ERC20Detailed("Polygon LEO", "pLEO", 3){
    event convertToken(uint256 amount, string username);

    address public coldWallet = 0x78E343Ce8Ba855795685C862245642daEFfA048D;

    function updateColdWallet(address _new) external {
      require(msg.sender == coldWallet, 'Not owner');

      coldWallet = _new;
    }

    function convertTokenWithTransfer(uint256 amount, string memory username) public {
        address convertAddress = coldWallet;
       _transfer(_msgSender(), convertAddress, amount);
       emit convertToken(amount, username);
     }

    function convertTokenFromWithTransfer(
        address sender,
        uint256 amount,
        string memory username
    ) public {
        address convertAddress = coldWallet;
        _transfer(sender, convertAddress, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        emit convertToken(amount, username);
    }
  }
