
import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { useWallet } from './useWallet';
import { TOKENS } from '../utils/constants';
import { randomNumber } from '../utils/helpers';

// Token interface
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
  network: string;
}

// Balance interface
export interface TokenBalance {
  token: Token;
  balance: number;
}

interface TokensContextProps {
  tokens: Token[];
  balances: TokenBalance[];
  loading: boolean;
  getBalance: (token: Token) => number;
  refreshBalances: () => Promise<void>;
  prices: Record<string, number>;
}

const TokensContext = createContext<TokensContextProps>({
  tokens: [],
  balances: [],
  loading: false,
  getBalance: () => 0,
  refreshBalances: async () => {},
  prices: {},
});

export function TokensProvider({ children }: { children: ReactNode }) {
  const { account, currentNetwork, isConnected } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Initialize tokens based on network
  useEffect(() => {
    const networkTokens = Object.values(TOKENS).filter(
      token => token.network === currentNetwork
    );
    
    // Always include Mega ETH for bridging showcase
    if (currentNetwork === 'SEPOLIA' && !networkTokens.find(t => t.symbol === 'METH')) {
      networkTokens.push(TOKENS.MEGA_ETH);
    }
    
    setTokens(networkTokens);
  }, [currentNetwork]);

  // Simulate prices (in a real app, this would come from an API or blockchain)
  useEffect(() => {
    if (tokens.length === 0) return;
    
    const simulatePrices = () => {
      const newPrices: Record<string, number> = {};
      
      // Set base prices
      newPrices['ETH'] = randomNumber(1800, 2200);
      newPrices['TUSD'] = 1; // Stablecoin
      newPrices['METH'] = newPrices['ETH'] * randomNumber(0.98, 1.02); // Slight variation from ETH
      newPrices['GOV'] = randomNumber(2, 5);
      
      setPrices(newPrices);
    };
    
    // Initial prices
    simulatePrices();
    
    // Update prices every 30 seconds
    const interval = setInterval(simulatePrices, 30000);
    return () => clearInterval(interval);
  }, [tokens]);

  // Fetch real balances when possible, otherwise simulate them
  const refreshBalances = async () => {
    if (!isConnected || !account) {
      setBalances([]);
      return;
    }
    
    setLoading(true);
    try {
      // First look for existing balances to preserve them when possible
      const existingBalances = [...balances];
      const newBalances: TokenBalance[] = [];
      
      for (const token of tokens) {
        // Find existing balance if available
        const existing = existingBalances.find(b => b.token.symbol === token.symbol);
        let balance = 0;
        
        if (token.symbol === 'ETH' || token.symbol === 'METH') {
          try {
            // For native tokens, get balance from provider
            if (window.ethereum && account) {
              const result = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
              });
              
              // Convert from wei to ETH (18 decimals)
              balance = parseInt(result, 16) / 1e18;
            }
          } catch (error) {
            console.error(`Error fetching ${token.symbol} balance:`, error);
            // Fall back to existing or random balance
            balance = existing ? existing.balance : randomNumber(0.5, 2);
          }
        } else if (token.address !== 'NATIVE') {
          // For ERC20 tokens, we would call the contract's balanceOf method
          // This is a simplified version without actual contract calls
          
          // Placeholder for ERC20 balance calls
          // In a real implementation, we would use ethers.js or web3.js to call the token contract
          balance = existing ? existing.balance : 
            token.symbol === 'TUSD' ? randomNumber(100, 1000) : randomNumber(10, 100);
        }
        
        newBalances.push({ token, balance });
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get balance for a specific token
  const getBalance = (token: Token): number => {
    const tokenBalance = balances.find(b => b.token.symbol === token.symbol);
    return tokenBalance ? tokenBalance.balance : 0;
  };

  // Refresh balances when account or network changes
  useEffect(() => {
    refreshBalances();
    
    // Set up interval to refresh balances
    const interval = setInterval(refreshBalances, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, [account, currentNetwork, tokens]);

  return (
    <TokensContext.Provider
      value={{
        tokens,
        balances,
        loading,
        getBalance,
        refreshBalances,
        prices,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
}

export const useTokens = () => useContext(TokensContext);
