import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/helpers';
import { TOKENS } from '@/utils/constants';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, ChevronDown, LogOut, ExternalLink, SwitchCamera, PlusCircle } from "lucide-react";
import { NETWORKS } from '@/utils/constants';

const WalletConnect = () => {
  const { account, connectWallet, disconnectWallet, isConnected, isConnecting, currentNetwork, switchNetwork, isSwitchingNetwork } = useWallet();
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false);

  const handleNetworkDialog = () => {
    setNetworkDialogOpen(true);
  };

  const handleSwitchNetwork = async (network: 'SEPOLIA' | 'MEGA') => {
    await switchNetwork(network);
    setNetworkDialogOpen(false);
  };

  const getNetworkColor = () => {
    return currentNetwork === 'SEPOLIA' ? 'text-blue-400' : 'text-purple-400';
  };

  const renderNetworkName = () => {
    return currentNetwork === 'SEPOLIA' ? 'Sepolia' : 'Mega Testnet';
  };

  const handleConnect = () => {
    if (isConnected) return;
    connectWallet();
  };

  const addTUSDToken = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return;
    }

    const tusdToken = TOKENS.TUSD;

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tusdToken.address,
            symbol: tusdToken.symbol,
            decimals: tusdToken.decimals,
            // You can add a token logo if available
            // image: tusdToken.logo
          },
        },
      });

      if (wasAdded) {
        toast.success('TUSD token added to MetaMask');
      } else {
        toast.error('Token not added');
      }
    } catch (error) {
      console.error('Error adding TUSD token:', error);
      toast.error('Failed to add TUSD token');
    }
  };

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`hidden sm:flex items-center gap-1 ${getNetworkColor()}`}
            onClick={handleNetworkDialog}
          >
            <span className={`h-2 w-2 rounded-full animate-ping-slow bg-current opacity-75`}></span>
            <span>{renderNetworkName()}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">{truncateAddress(account)}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleNetworkDialog} className="sm:hidden">
                <SwitchCamera className="h-4 w-4 mr-2" />
                <span>Switch Network</span>
                <span className={`ml-auto ${getNetworkColor()}`}>{renderNetworkName()}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${account}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span>View on Explorer</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={disconnectWallet}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Disconnect</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addTUSDToken}>
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Add TUSD to Wallet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting}>
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}

      <Dialog open={networkDialogOpen} onOpenChange={setNetworkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Network</DialogTitle>
            <DialogDescription>
              Select a network to continue using the DEX
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant={currentNetwork === 'SEPOLIA' ? 'default' : 'outline'}
              className="flex items-center justify-between"
              onClick={() => handleSwitchNetwork('SEPOLIA')}
              disabled={isSwitchingNetwork || currentNetwork === 'SEPOLIA'}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-blue-500 mr-2"></div>
                <span>Sepolia Testnet</span>
              </div>
              {currentNetwork === 'SEPOLIA' && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Active</span>
              )}
            </Button>
            <Button
              variant={currentNetwork === 'MEGA' ? 'default' : 'outline'}
              className="flex items-center justify-between"
              onClick={() => handleSwitchNetwork('MEGA')}
              disabled={isSwitchingNetwork || currentNetwork === 'MEGA'}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-purple-500 mr-2"></div>
                <span>Mega Testnet</span>
              </div>
              {currentNetwork === 'MEGA' && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Active</span>
              )}
            </Button>
          </div>
          {isSwitchingNetwork && <p className="text-center text-muted-foreground text-sm">Switching networks...</p>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnect;
