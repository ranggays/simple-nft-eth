//SPDX-License-Identifier: MIT
pragma solidity >=0.8.3 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Locketing is ERC1155, Ownable {
    // Declare Type / Struct
    struct TicketDetail {
        uint256 price;
        uint256 maxSupply;
        uint256 sold;
        bool isActive;
    }

    // Declare State
    mapping(uint256 => TicketDetail) public tickets;
    mapping(address => mapping(uint256 => uint256)) public entriesUsed;
    uint256 public constant MAX_PER_WALLET = 2;

    // State Event
    // Event 1
    uint256 public constant CP_VIP = 1;
    uint256 public constant CP_REG = 2;
    uint256 public constant CP_COM = 3;

    // Event 2
    uint256 public constant TS_VIP = 4;
    uint256 public constant TS_REG = 5;
    uint256 public constant TS_COM = 6;

    // Event 3
    uint256 public constant CA_VIP = 7;
    uint256 public constant CA_REG = 8;
    uint256 public constant CA_COM = 9;

    // Constructor
    constructor() ERC1155("https://api.mysite.com/metadata/{id}.json") Ownable(msg.sender) {
        // Setup Event 1
        tickets[CP_VIP] = TicketDetail(0.05 ether, 10, 0, true);
        tickets[CP_REG] = TicketDetail(0.02 ether, 50, 0, true);
        tickets[CP_COM] = TicketDetail(0.01 ether, 100, 0, true);

        // Setup Event 2
        tickets[TS_VIP] = TicketDetail(0.05 ether, 10, 0, true);
        tickets[TS_REG] = TicketDetail(0.02 ether, 50, 0, true);
        tickets[TS_COM] = TicketDetail(0.01 ether, 100, 0, true);

        // Setup Event 3
        tickets[CA_VIP] = TicketDetail(0.05 ether, 10, 0, true);
        tickets[CA_REG] = TicketDetail(0.02 ether, 50, 0, true);
        tickets[CA_COM] = TicketDetail(0.01 ether, 100, 0, true);
    }

    // 1. Mint Function (Buy Ticket)
    function mintTicket(uint256 _id, uint256 _amount) external payable {
        TicketDetail storage ticket = tickets[_id];

        require(ticket.isActive, "Ticket is not active");
        require(ticket.sold + _amount <= ticket.maxSupply, "Sold Out");
        require(balanceOf(msg.sender, _id) + _amount <= MAX_PER_WALLET, "Max 2 Tickets per Wallet");
        require(msg.value >= ticket.price * _amount, "Insufficient Funds");

        _mint(msg.sender, _id, _amount, "");
        ticket.sold += _amount;
    }

    // 2. Checking Function 
    function checkIn(address _user, uint256 _id) external onlyOwner {
        uint256 userBalance = balanceOf(_user, _id);
        require(userBalance > 0, "No Ticket Found");
        require(entriesUsed[_user][_id] < userBalance, "Ticket Already Used");

        entriesUsed[_user][_id] += 1;
    }

    // 3. Withdraw Function
    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds to withdraw");
        payable(msg.sender).transfer(address(this).balance);
    }
}