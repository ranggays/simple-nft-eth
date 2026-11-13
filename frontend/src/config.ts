import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { parseAbi } from 'viem'

export const config = getDefaultConfig({
  appName: 'Locketing MVP',
  projectId: 'cba8c286d774d841185d759018ce27c1', // Dapatkan gratis di cloud.walletconnect.com atau kosongkan string random untuk tes lokal
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
})

export const CONTRACT_ADDRESS = "0x93751F56319471Da3fD68b8e15c6D844dad7a53E"

export const CONTRACT_ABI = parseAbi([
  "function mintTicket(uint256 _id, uint256 _amount) external payable",
  "function checkIn(address _user, uint256 _id) external",
  "function withdraw() external",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function entriesUsed(address account, uint256 id) view returns (uint256)",
  "function tickets(uint256 id) view returns (uint256 price, uint256 maxSupply, uint256 sold, bool isActive)"
]);