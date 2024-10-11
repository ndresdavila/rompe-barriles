// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        totalSupply = 1000000 * (10 ** uint256(decimals)); // Total de tokens en el contrato
        balanceOf[msg.sender] = totalSupply; // Asignar todos los tokens al creador del contrato
    }

    function buyTokens(uint256 amount) public {
        require(amount > 0, "Debes especificar una cantidad de tokens a comprar");
        require(balanceOf[address(this)] >= amount, "No hay suficientes tokens disponibles");

        balanceOf[address(this)] -= amount;
        balanceOf[msg.sender] += amount;

        emit Transfer(address(this), msg.sender, amount);
    }

    function getBalance() public view returns (uint256) {
        return balanceOf[msg.sender];
    }
}
