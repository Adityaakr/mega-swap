
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useWallet } from '@/hooks/useWallet';
import { getExplorerTxUrl } from '@/utils/helpers';

interface TransactionStatusProps {
  txHash: string | null;
  loading: boolean;
  success?: boolean;
  title: string;
  description: string;
  errorTitle?: string;
  errorDescription?: string;
}

const TransactionStatus = ({
  txHash,
  loading,
  success = true,
  title,
  description,
  errorTitle = 'Transaction Failed',
  errorDescription = 'Something went wrong with your transaction.'
}: TransactionStatusProps) => {
  const { currentNetwork } = useWallet();
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'failed'>(loading ? 'pending' : success ? 'success' : 'failed');
  
  useEffect(() => {
    if (loading) {
      setTxStatus('pending');
    } else if (txHash) {
      // If we have a txHash, check the transaction status
      const checkTxStatus = async () => {
        if (!window.ethereum || !txHash) return;
        
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });
          
          if (receipt) {
            // Transaction has been mined
            setTxStatus(receipt.status === '0x1' ? 'success' : 'failed');
          }
        } catch (error) {
          console.error('Error checking transaction status:', error);
        }
      };
      
      // Check status immediately
      checkTxStatus();
      
      // Then check every 5 seconds if it's still pending
      const interval = setInterval(() => {
        if (txStatus === 'pending') {
          checkTxStatus();
        } else {
          clearInterval(interval);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    } else {
      setTxStatus(success ? 'success' : 'failed');
    }
  }, [loading, txHash, success, txStatus]);
  
  if (!loading && !txHash) return null;
  
  const explorerUrl = txHash ? getExplorerTxUrl(currentNetwork, txHash) : '';
  const networkName = currentNetwork === 'SEPOLIA' ? 'Sepolia Testnet' : 'Mega Testnet';
  
  return (
    <Alert 
      variant={txStatus === 'pending' ? "default" : txStatus === 'success' ? "default" : "destructive"} 
      className={`mt-4 border-2 ${
        txStatus === 'pending' ? 'border-primary/20' : 
        txStatus === 'success' ? 'border-green-500/30' : 
        'border-destructive/30'
      }`}
    >
      <div className="flex items-start">
        {txStatus === 'pending' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : txStatus === 'success' ? (
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 mr-2" />
        )}
        <div className="flex-1">
          <AlertTitle className="font-medium">
            {txStatus === 'pending' ? 'Processing Transaction' : 
             txStatus === 'success' ? title : errorTitle}
            <span className="text-xs ml-2 text-muted-foreground">({networkName})</span>
          </AlertTitle>
          <AlertDescription className="mt-1">
            {txStatus === 'pending' ? 
              'Please wait while your transaction is being processed on the blockchain...' : 
              txStatus === 'success' ? description : errorDescription}
          </AlertDescription>
          {txHash && (
            <div className="mt-3 flex items-center">
              <span className="text-xs font-mono text-muted-foreground overflow-hidden text-ellipsis mr-2">
                TX: {txHash.substring(0, 14)}...{txHash.substring(txHash.length - 4)}
              </span>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs flex items-center" 
                onClick={() => window.open(explorerUrl, '_blank')}
              >
                View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default TransactionStatus;
