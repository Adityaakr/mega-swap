import { Token } from '@/hooks/useTokens';

export const TOKENS: Record<string, Token> = {
  SEPOLIA_ETH: {
    symbol: 'ETH',
    name: 'Sepolia Ethereum',
    address: 'NATIVE', // Native token doesn't have an address
    decimals: 18,
    logo: '/sepolia-eth.png',
    network: 'SEPOLIA',
  },
  TUSD: {
    symbol: 'TUSD',
    name: 'Test USD',
    address: '0xc7a78BFFb60BEc6Cea1287FfB95210D9c7fce071', // Updated with provided address
    decimals: 18,
    logo: '/tusd.png',
    network: 'SEPOLIA',
  },
  MEGA_ETH: {
    symbol: 'METH',
    name: 'Mega Ethereum',
    address: 'NATIVE', // Native token doesn't have an address
    decimals: 18,
    logo: '/mega-eth.png',
    network: 'MEGA',
  },
  GOV: {
    symbol: 'GOV',
    name: 'Governance Token',
    address: '0x6f7600000000000000000000000000000000000', // Placeholder address
    decimals: 18,
    logo: '/gov.png',
    network: 'SEPOLIA',
  },
};

export const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  MEGA: {
    chainId: '0x18c6', // placeholder - replace with actual Mega Testnet chainId
    chainName: 'MEGA Testnet',
    nativeCurrency: null,
    rpcUrls: ['https://carrot.megaeth.com/rpc'], // placeholder
    blockExplorerUrls: null, // placeholder
  },  
};

export const POOLS = {
  ETH_TUSD: {
    id: 'eth-tusd',
    name: 'ETH-TUSD',
    token0: TOKENS.SEPOLIA_ETH,
    token1: TOKENS.TUSD,
    apr: 5.2,
    tvl: 1245000,
  },
};

export const LINKS = {
  SEPOLIA_FAUCET: 'https://sepoliafaucet.com/',
  MEGA_FAUCET: 'https://faucet.megachain.xyz', // placeholder
  SEPOLIA_EXPLORER: 'https://sepolia.etherscan.io',
  MEGA_EXPLORER: 'https://explorer-testnet.megachain.xyz', // placeholder
};

export const PROPOSALS = [
  {
    id: 1,
    title: 'Add New Pool: TUSD-GOV',
    description: 'Proposal to add a new liquidity pool for TUSD-GOV pair with 0.3% swap fee.',
    status: 'active',
    votesFor: 340000,
    votesAgainst: 120000,
    endTime: Date.now() + 86400000 * 3, // 3 days from now
  },
  {
    id: 2,
    title: 'Increase Rewards for ETH-TUSD Pool',
    description: 'Increase the GOV token rewards for ETH-TUSD liquidity providers by 20%.',
    status: 'active',
    votesFor: 420000,
    votesAgainst: 180000,
    endTime: Date.now() + 86400000 * 5, // 5 days from now
  },
  {
    id: 3,
    title: 'Implement Flash Loans Protocol',
    description: 'Add flash loan capability to the protocol with a 0.09% fee.',
    status: 'closed',
    votesFor: 650000,
    votesAgainst: 350000,
    endTime: Date.now() - 86400000 * 2, // 2 days ago
    result: 'passed',
  },
];
