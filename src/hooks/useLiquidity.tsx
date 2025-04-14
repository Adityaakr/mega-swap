
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { useWallet } from './useWallet';
import { useTokens, Token } from './useTokens';
import { simulateTransaction, calculateLpTokens, randomNumber } from '../utils/helpers';

// Pool interface
export interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  balance0: number;
  balance1: number;
  lpToken: number;
  share: number;
}

interface LiquidityContextProps {
  pools: Pool[];
  loadingPools: boolean;
  selectedPool: Pool | null;
  token0Amount: string;
  token1Amount: string;
  addingLiquidity: boolean;
  removingLiquidity: boolean;
  removePercent: number;
  txHash: string | null;
  loadUserPools: () => Promise<void>;
  setSelectedPool: (pool: Pool | null) => void;
  setToken0Amount: (amount: string) => void;
  setToken1Amount: (amount: string) => void;
  setRemovePercent: (percent: number) => void;
  addLiquidity: () => Promise<void>;
  removeLiquidity: () => Promise<void>;
}

const LiquidityContext = createContext<LiquidityContextProps>({
  pools: [],
  loadingPools: false,
  selectedPool: null,
  token0Amount: '',
  token1Amount: '',
  addingLiquidity: false,
  removingLiquidity: false,
  removePercent: 50,
  txHash: null,
  loadUserPools: async () => {},
  setSelectedPool: () => {},
  setToken0Amount: () => {},
  setToken1Amount: () => {},
  setRemovePercent: () => {},
  addLiquidity: async () => {},
  removeLiquidity: async () => {},
});

// Mock pool data - in a real app this would come from contracts
const MOCK_POOL_RESERVES = {
  'eth-tusd': {
    reserve0: 250, // ETH
    reserve1: 450000, // TUSD
    totalSupply: 10000, // Total LP tokens
  },
};

export function LiquidityProvider({ children }: { children: ReactNode }) {
  const { isConnected, account } = useWallet();
  const { tokens, prices, refreshBalances } = useTokens();
  
  const [pools, setPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [addingLiquidity, setAddingLiquidity] = useState(false);
  const [removingLiquidity, setRemovingLiquidity] = useState(false);
  const [removePercent, setRemovePercent] = useState(50);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Load user's liquidity positions
  const loadUserPools = async () => {
    if (!isConnected) {
      setPools([]);
      return;
    }
    
    setLoadingPools(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the ETH and TUSD tokens
      const ethToken = tokens.find(t => t.symbol === 'ETH');
      const tusdToken = tokens.find(t => t.symbol === 'TUSD');
      
      if (!ethToken || !tusdToken) return;
      
      // For the demo, simulate whether the user has LP position with 50% probability
      const hasLpPositions = Math.random() > 0.5;
      
      if (hasLpPositions) {
        // Simulate realistic LP positions
        const balance0 = randomNumber(0.1, 5); // ETH 
        const balance1 = balance0 * (prices['TUSD'] / prices['ETH']); // TUSD
        const totalReserve0 = MOCK_POOL_RESERVES['eth-tusd'].reserve0;
        const totalSupply = MOCK_POOL_RESERVES['eth-tusd'].totalSupply;
        
        // Calculate LP share
        const lpToken = (balance0 / totalReserve0) * totalSupply;
        const share = (balance0 / totalReserve0) * 100;
        
        setPools([
          {
            id: 'eth-tusd',
            token0: ethToken,
            token1: tusdToken,
            balance0,
            balance1,
            lpToken,
            share,
          },
        ]);
      } else {
        // No LP positions yet
        setPools([]);
      }
    } catch (error) {
      console.error('Error loading pools:', error);
      toast.error('Failed to load liquidity positions');
    } finally {
      setLoadingPools(false);
    }
  };

  // Update token1 amount based on token0 input (maintaining price ratio)
  const updateToken1Amount = (amount0: string) => {
    if (!selectedPool || !amount0) {
      setToken1Amount('');
      return;
    }
    
    const num0 = parseFloat(amount0);
    if (isNaN(num0) || num0 <= 0) {
      setToken1Amount('');
      return;
    }
    
    // Calculate token1 amount based on current prices
    const token0Price = prices[selectedPool.token0.symbol] || 0;
    const token1Price = prices[selectedPool.token1.symbol] || 0;
    
    if (token0Price === 0 || token1Price === 0) {
      setToken1Amount('');
      return;
    }
    
    const amount1 = num0 * (token0Price / token1Price);
    setToken1Amount(amount1.toString());
  };

  // Update token0 amount based on token1 input
  const updateToken0Amount = (amount1: string) => {
    if (!selectedPool || !amount1) {
      setToken0Amount('');
      return;
    }
    
    const num1 = parseFloat(amount1);
    if (isNaN(num1) || num1 <= 0) {
      setToken0Amount('');
      return;
    }
    
    // Calculate token0 amount based on current prices
    const token0Price = prices[selectedPool.token0.symbol] || 0;
    const token1Price = prices[selectedPool.token1.symbol] || 0;
    
    if (token0Price === 0 || token1Price === 0) {
      setToken0Amount('');
      return;
    }
    
    const amount0 = num1 * (token1Price / token0Price);
    setToken0Amount(amount0.toString());
  };

  // Add liquidity
  const addLiquidity = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    if (!selectedPool) {
      toast.error('No pool selected', {
        description: 'Please select a liquidity pool',
      });
      return;
    }
    
    const amount0 = parseFloat(token0Amount);
    const amount1 = parseFloat(token1Amount);
    
    if (isNaN(amount0) || amount0 <= 0 || isNaN(amount1) || amount1 <= 0) {
      toast.error('Invalid amounts', {
        description: 'Please enter valid token amounts',
      });
      return;
    }
    
    setAddingLiquidity(true);
    setTxHash(null);
    
    try {
      toast.info('Adding liquidity...', {
        description: `Adding ${amount0} ${selectedPool.token0.symbol} and ${amount1} ${selectedPool.token1.symbol}`,
      });
      
      // Simulate blockchain transaction
      const { success, hash } = await simulateTransaction();
      
      if (success) {
        setTxHash(hash);
        toast.success('Liquidity added!', {
          description: `Successfully added liquidity to ${selectedPool.token0.symbol}-${selectedPool.token1.symbol} pool`,
        });
        
        // Reset input fields
        setToken0Amount('');
        setToken1Amount('');
        
        // Refresh user pools and balances
        await Promise.all([loadUserPools(), refreshBalances()]);
      } else {
        toast.error('Transaction failed', {
          description: 'Failed to add liquidity. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Add liquidity error:', error);
      toast.error('Add liquidity error', {
        description: error.message || 'An error occurred while adding liquidity',
      });
    } finally {
      setAddingLiquidity(false);
    }
  };

  // Remove liquidity
  const removeLiquidity = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    if (!selectedPool) {
      toast.error('No pool selected', {
        description: 'Please select a liquidity pool',
      });
      return;
    }
    
    if (removePercent <= 0 || removePercent > 100) {
      toast.error('Invalid percentage', {
        description: 'Please enter a valid percentage to remove',
      });
      return;
    }
    
    setRemovingLiquidity(true);
    setTxHash(null);
    
    try {
      const amount0ToRemove = (selectedPool.balance0 * removePercent) / 100;
      const amount1ToRemove = (selectedPool.balance1 * removePercent) / 100;
      
      toast.info('Removing liquidity...', {
        description: `Removing ${removePercent}% of your liquidity`,
      });
      
      // Simulate blockchain transaction
      const { success, hash } = await simulateTransaction();
      
      if (success) {
        setTxHash(hash);
        toast.success('Liquidity removed!', {
          description: `Successfully removed ${amount0ToRemove.toFixed(6)} ${selectedPool.token0.symbol} and ${amount1ToRemove.toFixed(2)} ${selectedPool.token1.symbol}`,
        });
        
        // Reset state
        setRemovePercent(50);
        
        // Refresh user pools and balances
        await Promise.all([loadUserPools(), refreshBalances()]);
      } else {
        toast.error('Transaction failed', {
          description: 'Failed to remove liquidity. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Remove liquidity error:', error);
      toast.error('Remove liquidity error', {
        description: error.message || 'An error occurred while removing liquidity',
      });
    } finally {
      setRemovingLiquidity(false);
    }
  };

  return (
    <LiquidityContext.Provider
      value={{
        pools,
        loadingPools,
        selectedPool,
        token0Amount,
        token1Amount,
        addingLiquidity,
        removingLiquidity,
        removePercent,
        txHash,
        loadUserPools,
        setSelectedPool,
        setToken0Amount: (amount: string) => {
          setToken0Amount(amount);
          updateToken1Amount(amount);
        },
        setToken1Amount: (amount: string) => {
          setToken1Amount(amount);
          updateToken0Amount(amount);
        },
        setRemovePercent,
        addLiquidity,
        removeLiquidity,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
}

export const useLiquidity = () => useContext(LiquidityContext);
