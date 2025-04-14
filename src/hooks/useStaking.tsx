
import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useWallet } from './useWallet';
import { useLiquidity, Pool } from './useLiquidity';
import { simulateTransaction, randomNumber } from '../utils/helpers';
import { TOKENS } from '../utils/constants';
import { useTokens } from './useTokens';

// Staking position interface
export interface StakingPosition {
  id: string;
  pool: Pool;
  stakedLpAmount: number;
  pendingRewards: number;
  apr: number;
  stakingDate: number;
}

interface StakingContextProps {
  positions: StakingPosition[];
  loadingPositions: boolean;
  selectedPosition: StakingPosition | null;
  stakeAmount: string;
  staking: boolean;
  unstaking: boolean;
  claiming: boolean;
  txHash: string | null;
  loadPositions: () => Promise<void>;
  setSelectedPosition: (position: StakingPosition | null) => void;
  setStakeAmount: (amount: string) => void;
  stake: () => Promise<void>;
  unstake: () => Promise<void>;
  claim: () => Promise<void>;
}

const StakingContext = createContext<StakingContextProps>({
  positions: [],
  loadingPositions: false,
  selectedPosition: null,
  stakeAmount: '',
  staking: false,
  unstaking: false,
  claiming: false,
  txHash: null,
  loadPositions: async () => {},
  setSelectedPosition: () => {},
  setStakeAmount: () => {},
  stake: async () => {},
  unstake: async () => {},
  claim: async () => {},
});

export function StakingProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();
  const { pools, loadUserPools } = useLiquidity();
  const { refreshBalances } = useTokens();
  
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<StakingPosition | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Load staking positions when pools change
  useEffect(() => {
    loadPositions();
  }, [pools]);

  // Load staking positions
  const loadPositions = async () => {
    if (!isConnected || pools.length === 0) {
      setPositions([]);
      return;
    }
    
    setLoadingPositions(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, 50% chance of having staked positions if the user has LP tokens
      const hasStakedPositions = pools.length > 0 && Math.random() > 0.5;
      
      if (hasStakedPositions) {
        // Create a staking position for each pool
        const newPositions = pools.map(pool => {
          // Simulate staking between 10-90% of LP tokens
          const stakedPercent = randomNumber(10, 90);
          const stakedLpAmount = (pool.lpToken * stakedPercent) / 100;
          
          // Random APR between 5-25%
          const apr = randomNumber(5, 25);
          
          // Staking date between 1-60 days ago
          const daysAgo = Math.floor(randomNumber(1, 60));
          const stakingDate = Date.now() - daysAgo * 86400000;
          
          // Calculate rewards based on time staked and APR
          const daysFraction = daysAgo / 365;
          const pendingRewards = stakedLpAmount * (apr / 100) * daysFraction;
          
          return {
            id: `staking-${pool.id}`,
            pool,
            stakedLpAmount,
            pendingRewards,
            apr,
            stakingDate,
          };
        });
        
        setPositions(newPositions);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Error loading staking positions:', error);
      toast.error('Failed to load staking positions');
    } finally {
      setLoadingPositions(false);
    }
  };

  // Stake LP tokens
  const stake = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    if (pools.length === 0) {
      toast.error('No LP tokens available', {
        description: 'You need LP tokens to stake. Add liquidity first.',
      });
      return;
    }
    
    const stakeAmountNum = parseFloat(stakeAmount);
    if (isNaN(stakeAmountNum) || stakeAmountNum <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount to stake',
      });
      return;
    }
    
    // Find the pool to stake in (just use the first one for demo)
    const pool = pools[0];
    
    if (stakeAmountNum > pool.lpToken) {
      toast.error('Insufficient LP tokens', {
        description: `You only have ${pool.lpToken.toFixed(6)} LP tokens available`,
      });
      return;
    }
    
    setStaking(true);
    setTxHash(null);
    
    try {
      toast.info('Staking LP tokens...', {
        description: `Staking ${stakeAmountNum.toFixed(6)} LP tokens`,
      });
      
      // Simulate blockchain transaction
      const { success, hash } = await simulateTransaction();
      
      if (success) {
        setTxHash(hash);
        toast.success('Staking successful!', {
          description: `Successfully staked ${stakeAmountNum.toFixed(6)} LP tokens`,
        });
        
        // Reset input
        setStakeAmount('');
        
        // Refresh positions, pools, and balances
        await Promise.all([loadPositions(), loadUserPools(), refreshBalances()]);
      } else {
        toast.error('Transaction failed', {
          description: 'Failed to stake LP tokens. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Staking error:', error);
      toast.error('Staking error', {
        description: error.message || 'An error occurred while staking',
      });
    } finally {
      setStaking(false);
    }
  };

  // Unstake LP tokens
  const unstake = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    if (!selectedPosition) {
      toast.error('No position selected', {
        description: 'Please select a staking position to unstake',
      });
      return;
    }
    
    setUnstaking(true);
    setTxHash(null);
    
    try {
      toast.info('Unstaking LP tokens...', {
        description: `Unstaking ${selectedPosition.stakedLpAmount.toFixed(6)} LP tokens`,
      });
      
      // Simulate blockchain transaction
      const { success, hash } = await simulateTransaction();
      
      if (success) {
        setTxHash(hash);
        toast.success('Unstaking successful!', {
          description: `Successfully unstaked ${selectedPosition.stakedLpAmount.toFixed(6)} LP tokens and claimed ${selectedPosition.pendingRewards.toFixed(2)} GOV rewards`,
        });
        
        // Refresh positions, pools, and balances
        await Promise.all([loadPositions(), loadUserPools(), refreshBalances()]);
      } else {
        toast.error('Transaction failed', {
          description: 'Failed to unstake LP tokens. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Unstaking error:', error);
      toast.error('Unstaking error', {
        description: error.message || 'An error occurred while unstaking',
      });
    } finally {
      setUnstaking(false);
    }
  };

  // Claim rewards
  const claim = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    if (!selectedPosition) {
      toast.error('No position selected', {
        description: 'Please select a staking position to claim rewards',
      });
      return;
    }
    
    if (selectedPosition.pendingRewards <= 0) {
      toast.error('No rewards to claim', {
        description: 'This position has no pending rewards',
      });
      return;
    }
    
    setClaiming(true);
    setTxHash(null);
    
    try {
      toast.info('Claiming rewards...', {
        description: `Claiming ${selectedPosition.pendingRewards.toFixed(2)} GOV rewards`,
      });
      
      // Simulate blockchain transaction
      const { success, hash } = await simulateTransaction();
      
      if (success) {
        setTxHash(hash);
        toast.success('Claim successful!', {
          description: `Successfully claimed ${selectedPosition.pendingRewards.toFixed(2)} GOV tokens`,
        });
        
        // Refresh positions and balances
        await Promise.all([loadPositions(), refreshBalances()]);
      } else {
        toast.error('Transaction failed', {
          description: 'Failed to claim rewards. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Claiming error:', error);
      toast.error('Claiming error', {
        description: error.message || 'An error occurred while claiming rewards',
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <StakingContext.Provider
      value={{
        positions,
        loadingPositions,
        selectedPosition,
        stakeAmount,
        staking,
        unstaking,
        claiming,
        txHash,
        loadPositions,
        setSelectedPosition,
        setStakeAmount,
        stake,
        unstake,
        claim,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}

export const useStaking = () => useContext(StakingContext);
