import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { useWallet } from './useWallet';
import { useTokens, Token } from './useTokens';
import { calculatePriceImpact, randomNumber } from '../utils/helpers';

interface SwapContextProps {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  priceImpact: number;
  swapping: boolean;
  txHash: string | null;
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  executeSwap: () => Promise<void>;
  resetState: () => void;
  getExchangeRate: () => number;
}

const SwapContext = createContext<SwapContextProps>({
  fromToken: null,
  toToken: null,
  fromAmount: '',
  toAmount: '',
  slippage: 0.5,
  priceImpact: 0,
  swapping: false,
  txHash: null,
  setFromToken: () => {},
  setToToken: () => {},
  setFromAmount: () => {},
  setToAmount: () => {},
  setSlippage: () => {},
  executeSwap: async () => {},
  resetState: () => {},
  getExchangeRate: () => 0,
});

export function SwapProvider({ children }: { children: ReactNode }) {
  const { isConnected, account, currentNetwork } = useWallet();
  const { prices, refreshBalances } = useTokens();
  
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5); // Default 0.5%
  const [priceImpact, setPriceImpact] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txConfirmed, setTxConfirmed] = useState(false);

  // Calculate exchange rate between tokens
  const getExchangeRate = (): number => {
    if (!fromToken || !toToken) return 0;
    
    // Get prices from context
    const fromPrice = prices[fromToken.symbol] || 0;
    const toPrice = prices[toToken.symbol] || 0;
    
    // Avoid division by zero
    if (fromPrice === 0) return 0;
    
    return toPrice / fromPrice;
  };

  // Update toAmount when fromAmount or tokens change
  const updateToAmount = (amount: string) => {
    if (!fromToken || !toToken || !amount) {
      setToAmount('');
      setPriceImpact(0);
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setToAmount('');
      setPriceImpact(0);
      return;
    }
    
    const rate = getExchangeRate();
    
    // Calculate base output amount
    let outputAmount = parsedAmount * rate;
    
    // Simulate price impact based on size of transaction
    // In a real AMM, this would be calculated based on pool reserves
    const simulatedImpact = calculatePriceImpact(
      parsedAmount,
      outputAmount,
      rate
    );
    
    // Apply the price impact to the output amount
    outputAmount = outputAmount * (1 - simulatedImpact / 100);
    
    setPriceImpact(simulatedImpact);
    setToAmount(outputAmount.toString());
  };

  // Update fromAmount when toAmount is manually changed
  const updateFromAmount = (amount: string) => {
    if (!fromToken || !toToken || !amount) {
      setFromAmount('');
      setPriceImpact(0);
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFromAmount('');
      setPriceImpact(0);
      return;
    }
    
    const rate = getExchangeRate();
    if (rate === 0) return;
    
    // Calculate input amount needed
    const inputAmount = parsedAmount / rate;
    
    // Simulate price impact based on size of transaction
    const simulatedImpact = calculatePriceImpact(
      inputAmount,
      parsedAmount,
      rate
    );
    
    setPriceImpact(simulatedImpact);
    setFromAmount(inputAmount.toString());
  };

  // Check transaction status
  const checkTransactionStatus = async (hash: string) => {
    if (!window.ethereum) return;
    
    try {
      // Wait for the transaction to be mined
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });
      
      if (receipt) {
        // Transaction has been mined
        const success = receipt.status === '0x1';
        setTxConfirmed(true);
        
        if (success) {
          toast.success('Transaction confirmed!', {
            description: `Your swap has been confirmed on the blockchain.`,
          });
          refreshBalances(); // Refresh balances after successful transaction
        } else {
          toast.error('Transaction failed', {
            description: 'The transaction was mined but failed to execute.',
          });
        }
        
        return success;
      }
      
      // If receipt is null, transaction is still pending
      return null;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  };

  // Poll for transaction status
  const pollTransactionStatus = async (hash: string) => {
    // Poll until we get a receipt
    let attempts = 0;
    const maxAttempts = 30; // Try for about 5 minutes (10s intervals)
    
    const interval = setInterval(async () => {
      attempts++;
      const status = await checkTransactionStatus(hash);
      
      // If we have a status or have tried too many times, stop polling
      if (status !== null || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 10000); // Check every 10 seconds
    
    // Initial check immediately
    await checkTransactionStatus(hash);
    
    return () => clearInterval(interval);
  };

  // Execute the swap using actual MetaMask transaction
  const executeSwap = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    if (!fromToken || !toToken) {
      toast.error('Select tokens', {
        description: 'Please select both tokens to swap',
      });
      return;
    }
    
    const parsedAmount = parseFloat(fromAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount to swap',
      });
      return;
    }
    
    // In the cross-chain swap case, make sure the network matches the token
    if (
      (fromToken.symbol === 'ETH' && currentNetwork !== 'SEPOLIA') ||
      (fromToken.symbol === 'METH' && currentNetwork !== 'MEGA')
    ) {
      toast.error('Network mismatch', {
        description: `Please switch to ${fromToken.network} network to use ${fromToken.symbol}`,
      });
      return;
    }
    
    // For signing the transaction
    setSwapping(true);
    setTxHash(null);
    setTxConfirmed(false);
    
    try {
      toast.info('Processing swap...', {
        description: `Swapping ${parsedAmount} ${fromToken.symbol} to ${toToken.symbol}`,
      });
      
      // Check if we're dealing with ETH or an ERC20 token
      if (fromToken.symbol === 'ETH' || fromToken.symbol === 'METH') {
        // For native token (ETH) transfer
        // In a real app, this would be a swap contract interaction
        
        // Convert the amount to wei (multiply by 10^18) and convert to hex
        const amountInWei = BigInt(Math.floor(parsedAmount * 1e18)).toString(16);
        
        // Dummy recipient address (in a real app, this would be the swap contract)
        const recipientAddress = "0xc7a78BFFb60BEc6Cea1287FfB95210D9c7fce071";
        
        const transactionParameters = {
          from: account,
          to: recipientAddress,
          value: `0x${amountInWei}`, // Hex-encoded wei value
          // In a real DEX, you'd include contract method data
          gas: '0x5208', // 21000 gas in hex
        };
        
        // Send the transaction using MetaMask
        const hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
        
        setTxHash(hash);
        toast.success('Transaction submitted!', {
          description: 'Your transaction has been submitted to the blockchain',
        });
        
        // Start polling for transaction status
        pollTransactionStatus(hash);
      } else {
        // For ERC20 tokens, we would use a contract call
        // This requires the token's smart contract ABI and address
        toast.error('Token swaps not implemented', {
          description: 'This demo only supports ETH transactions for now',
        });
      }
    } catch (error: any) {
      console.error('Swap error:', error);
      toast.error('Transaction failed', {
        description: error.message || 'An error occurred during the swap',
      });
      setSwapping(false);
    }
  };

  // Reset swap state
  const resetState = () => {
    setFromToken(null);
    setToToken(null);
    setFromAmount('');
    setToAmount('');
    setPriceImpact(0);
    setTxHash(null);
    setTxConfirmed(false);
  };

  return (
    <SwapContext.Provider
      value={{
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippage,
        priceImpact,
        swapping,
        txHash,
        setFromToken,
        setToToken,
        setFromAmount: (amount: string) => {
          setFromAmount(amount);
          updateToAmount(amount);
        },
        setToAmount: (amount: string) => {
          setToAmount(amount);
          updateFromAmount(amount);
        },
        setSlippage,
        executeSwap,
        resetState,
        getExchangeRate,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}

export const useSwap = () => useContext(SwapContext);
