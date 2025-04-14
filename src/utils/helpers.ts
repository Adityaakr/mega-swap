
// Format a number with specified decimals and optional thousand separator
export const formatNumber = (
  value: number | string,
  decimals = 2,
  thousandSeparator = true
): string => {
  const num = Number(value);
  if (isNaN(num)) return '0';
  
  const fixed = num.toFixed(decimals);
  if (!thousandSeparator) return fixed;
  
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

// Format crypto amount with specified precision
export const formatCrypto = (
  value: number | string,
  precision = 6
): string => {
  const num = Number(value);
  if (isNaN(num)) return '0';
  
  // If very small number, show more decimals
  if (num > 0 && num < 0.000001) {
    return '< 0.000001';
  }
  
  return formatNumber(num, precision);
};

// Truncate address to format: 0x1234...5678
export const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Calculate price impact for swap
export const calculatePriceImpact = (
  inputAmount: number,
  outputAmount: number,
  spotPrice: number
): number => {
  if (!inputAmount || !outputAmount || !spotPrice) return 0;
  
  const expectedOutput = inputAmount * spotPrice;
  const impact = ((expectedOutput - outputAmount) / expectedOutput) * 100;
  return Math.max(0, impact); // Ensure it's not negative
};

// Simulate a delay to mimic blockchain transaction
export const simulateTransaction = async (): Promise<{success: boolean; hash: string}> => {
  // Random delay between 1-3 seconds
  const delay = 1000 + Math.random() * 2000;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% success rate
      const success = Math.random() > 0.1;
      const hash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      resolve({ success, hash });
    }, delay);
  });
};

// Generate a random number within range (used for simulation)
export const randomNumber = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

// Format timestamp to readable date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate time remaining from a timestamp
export const timeRemaining = (endTime: number): string => {
  const now = Date.now();
  if (now >= endTime) return 'Ended';
  
  const diffSeconds = Math.floor((endTime - now) / 1000);
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

// Get transaction explorer URL
export const getExplorerTxUrl = (network: 'SEPOLIA' | 'MEGA', txHash: string): string => {
  const baseUrl = network === 'SEPOLIA' 
    ? 'https://sepolia.etherscan.io/tx/' 
    : 'https://explorer-testnet.megachain.xyz/tx/';
  return `${baseUrl}${txHash}`;
};

// Calculate LP token amount (simplified simulation)
export const calculateLpTokens = (
  amount0: number,
  amount1: number,
  reserve0: number,
  reserve1: number,
  totalSupply: number
): number => {
  if (!reserve0 || !reserve1 || !totalSupply) return amount0; // Initial LP
  
  // Min proportion of contribution to existing reserves
  const proportion0 = amount0 / reserve0;
  const proportion1 = amount1 / reserve1;
  const proportion = Math.min(proportion0, proportion1);
  
  return totalSupply * proportion;
};
