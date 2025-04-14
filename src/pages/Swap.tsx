
import { WalletProvider } from '@/hooks/useWallet';
import { TokensProvider } from '@/hooks/useTokens';
import { SwapProvider } from '@/hooks/useSwap';
import Header from '@/components/Header';
import SwapInterface from '@/components/SwapInterface';
import { useEffect } from 'react';

const Swap = () => {
  // Force Sepolia network when component mounts
  useEffect(() => {
    if (window.ethereum) {
      const switchToSepolia = async () => {
        try {
          // Check current network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const sepoliaChainId = '0xaa36a7'; // Sepolia network chain ID
          
          if (chainId !== sepoliaChainId) {
            // Switch to Sepolia if not already on it
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: sepoliaChainId }],
            });
            console.log('Switched to Sepolia network');
          }
        } catch (error) {
          console.error('Error switching to Sepolia:', error);
        }
      };
      
      switchToSepolia();
    }
  }, []);

  return (
    <WalletProvider>
      <TokensProvider>
        <SwapProvider>
          <div className="min-h-screen flex flex-col bg-dex-dark">
            <Header />
            
            <main className="flex-1 container px-4 py-12">
              <SwapInterface />
            </main>
          </div>
        </SwapProvider>
      </TokensProvider>
    </WalletProvider>
  );
};

export default Swap;
