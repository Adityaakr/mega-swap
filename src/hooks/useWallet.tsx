
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { NETWORKS } from '../utils/constants';

type Network = 'SEPOLIA' | 'MEGA';

interface WalletContextProps {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  currentNetwork: Network;
  switchNetwork: (network: Network) => Promise<void>;
  isSwitchingNetwork: boolean;
}

const WalletContext = createContext<WalletContextProps>({
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
  isConnecting: false,
  currentNetwork: 'SEPOLIA',
  switchNetwork: async () => {},
  isSwitchingNetwork: false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<Network>('SEPOLIA');
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Check if ethereum object is available (MetaMask)
  const hasProvider = (): boolean => {
    return window.ethereum !== undefined;
  };

  // Initialize wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      if (hasProvider()) {
        try {
          // Check for existing connections
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Check current network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId === NETWORKS.SEPOLIA.chainId) {
              setCurrentNetwork('SEPOLIA');
            } else if (chainId === NETWORKS.MEGA.chainId) {
              setCurrentNetwork('MEGA');
            }
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (hasProvider()) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        if (chainId === NETWORKS.SEPOLIA.chainId) {
          setCurrentNetwork('SEPOLIA');
        } else if (chainId === NETWORKS.MEGA.chainId) {
          setCurrentNetwork('MEGA');
        }
        
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      });
    }

    // Cleanup listeners
    return () => {
      if (hasProvider()) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!hasProvider()) {
      toast.error('MetaMask not detected', {
        description: 'Please install MetaMask to use this application',
        action: {
          label: 'Install',
          onClick: () => window.open('https://metamask.io/download.html', '_blank'),
        },
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // If not on Sepolia, prompt to switch
      if (chainId !== NETWORKS.SEPOLIA.chainId) {
        await switchNetwork('SEPOLIA');
      }
      
      toast.success('Wallet connected!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error('Connection failed', {
        description: error.message || 'Could not connect to wallet',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet (local state only as MetaMask doesn't support programmatic disconnect)
  const disconnectWallet = () => {
    setAccount(null);
    toast.info('Wallet disconnected');
  };

  // Switch network
  const switchNetwork = async (network: Network) => {
    if (!hasProvider() || !account) return;
    
    setIsSwitchingNetwork(true);
    try {
      const targetNetwork = NETWORKS[network];
      
      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetNetwork.chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetNetwork.chainId,
                chainName: targetNetwork.chainName,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: targetNetwork.rpcUrls,
                blockExplorerUrls: targetNetwork.blockExplorerUrls,
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
      
      setCurrentNetwork(network);
      toast.success(`Switched to ${targetNetwork.chainName}`);
    } catch (error: any) {
      console.error('Error switching network:', error);
      toast.error('Network switch failed', {
        description: error.message || 'Could not switch networks',
      });
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        isConnected: !!account,
        isConnecting,
        currentNetwork,
        switchNetwork,
        isSwitchingNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);

// Type declaration for ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
