pragma solidity ^0.8.11;

import "../ERC20.sol";
import "./MinterRoles.sol";

contract ERC20Mintable is ERC20, MinterRole {
    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }

    function removeMinter(address account) public onlyOwner {
        _removeMinter(account);
    }
}
