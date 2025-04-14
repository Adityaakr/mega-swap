
import { useState, useEffect } from 'react';
import { useSwap } from '@/hooks/useSwap';
import { useWallet } from '@/hooks/useWallet';
import { useTokens } from '@/hooks/useTokens';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, ArrowDown, Settings, AlertCircle } from 'lucide-react';
import TokenModal from './TokenModal';
import TransactionStatus from './TransactionStatus';
import { formatNumber } from '@/utils/helpers';

const SwapInterface = () => {
  const { isConnected } = useWallet();
  const { tokens, getBalance, prices } = useTokens();
  const {
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
    setFromAmount,
    setToAmount,
    setSlippage,
    executeSwap,
    getExchangeRate,
  } = useSwap();
  
  const [fromModalOpen, setFromModalOpen] = useState(false);
  const [toModalOpen, setToModalOpen] = useState(false);
  
  // Initialize tokens when component mounts
  useEffect(() => {
    if (tokens.length > 0 && !fromToken && !toToken) {
      // Default to ETH and TUSD
      const ethToken = tokens.find(t => t.symbol === 'ETH');
      const tusdToken = tokens.find(t => t.symbol === 'TUSD');
      
      if (ethToken) setFromToken(ethToken);
      if (tusdToken) setToToken(tusdToken);
    }
  }, [tokens, fromToken, toToken]);

  // Swap the from and to tokens
  const handleSwapDirection = () => {
    if (!fromToken || !toToken) return;
    
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    
    // Also swap the amounts
    if (fromAmount && toAmount) {
      const tempAmount = fromAmount;
      setFromAmount(toAmount);
      setToAmount(tempAmount);
    }
  };

  // Set max amount
  const handleMaxAmount = () => {
    if (!fromToken) return;
    
    const balance = getBalance(fromToken);
    setFromAmount(balance.toString());
  };

  // Check if swap is valid
  const isSwapValid = () => {
    if (!isConnected || !fromToken || !toToken || !fromAmount || !toAmount) return false;
    
    const parsedAmount = parseFloat(fromAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return false;
    
    const balance = getBalance(fromToken);
    if (parsedAmount > balance) return false;
    
    return true;
  };

  // Format the exchange rate display
  const formatExchangeRate = () => {
    if (!fromToken || !toToken) return '';
    
    const rate = getExchangeRate();
    if (!rate) return '';
    
    return `1 ${fromToken.symbol} = ${formatNumber(rate, 6)} ${toToken.symbol}`;
  };
  
  // Display USD value
  const getUsdValue = (token: any, amount: string) => {
    if (!token || !amount) return '$0.00';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return '$0.00';
    
    const price = prices[token.symbol] || 0;
    const value = parsedAmount * price;
    
    return `$${formatNumber(value, 2)}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-border bg-secondary/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Swap Tokens</CardTitle>
          <CardDescription>Exchange between tokens with low slippage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>From</span>
              {fromToken && (
                <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={handleMaxAmount}>
                  Balance: {formatNumber(getBalance(fromToken), 6)}
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="w-32"
                onClick={() => setFromModalOpen(true)}
              >
                {fromToken ? (
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold mr-2">
                      {fromToken.symbol.substring(0, 2)}
                    </div>
                    <span>{fromToken.symbol}</span>
                  </div>
                ) : (
                  <span>Select token</span>
                )}
              </Button>
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1"
              />
            </div>
            {fromToken && fromAmount && (
              <div className="text-xs text-muted-foreground text-right">
                {getUsdValue(fromToken, fromAmount)}
              </div>
            )}
          </div>
          
          {/* Swap Direction */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-secondary"
              onClick={handleSwapDirection}
              disabled={!fromToken || !toToken}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          
          {/* To Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>To</span>
              {toToken && (
                <span className="text-xs text-muted-foreground">
                  Balance: {formatNumber(getBalance(toToken), 6)}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="w-32"
                onClick={() => setToModalOpen(true)}
              >
                {toToken ? (
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold mr-2">
                      {toToken.symbol.substring(0, 2)}
                    </div>
                    <span>{toToken.symbol}</span>
                  </div>
                ) : (
                  <span>Select token</span>
                )}
              </Button>
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="flex-1"
              />
            </div>
            {toToken && toAmount && (
              <div className="text-xs text-muted-foreground text-right">
                {getUsdValue(toToken, toAmount)}
              </div>
            )}
          </div>
          
          {/* Exchange Rate */}
          {fromToken && toToken && fromAmount && toAmount && (
            <div className="flex justify-between items-center text-sm text-muted-foreground p-2 rounded-md bg-secondary/30">
              <span>Rate</span>
              <div className="flex items-center">
                <span>{formatExchangeRate()}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Slippage Settings */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <Settings className="h-3 w-3 mr-1" />
                <span>Slippage Tolerance</span>
              </div>
              <span className="text-sm font-medium">{slippage}%</span>
            </div>
            <Slider
              value={[slippage]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={(value) => setSlippage(value[0])}
            />
          </div>
          
          {/* Price Impact Warning */}
          {priceImpact > 1 && (
            <div className={`flex items-center text-sm p-2 rounded-md ${
              priceImpact > 5 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
            }`}>
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>
                Price impact: {priceImpact.toFixed(2)}% 
                {priceImpact > 5 ? ' (High impact!)' : ''}
              </span>
            </div>
          )}
          
          {/* Transaction Status - improved visibility */}
          {(swapping || txHash) && (
            <TransactionStatus
              txHash={txHash}
              loading={swapping}
              title="Swap Successful"
              description={fromToken && toToken 
                ? `Successfully swapped ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}`
                : 'Transaction completed successfully'
              }
            />
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!isSwapValid() || swapping}
            onClick={executeSwap}
          >
            {!isConnected
              ? 'Connect Wallet'
              : !fromToken || !toToken
              ? 'Select Tokens'
              : !fromAmount || parseFloat(fromAmount) <= 0
              ? 'Enter Amount'
              : parseFloat(fromAmount) > getBalance(fromToken)
              ? 'Insufficient Balance'
              : swapping
              ? 'Swapping...'
              : 'Swap'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Token Selection Modals */}
      <TokenModal
        isOpen={fromModalOpen}
        onClose={() => setFromModalOpen(false)}
        onSelect={setFromToken}
        excludeToken={toToken}
        tokenType="from"
      />
      <TokenModal
        isOpen={toModalOpen}
        onClose={() => setToModalOpen(false)}
        onSelect={setToToken}
        excludeToken={fromToken}
        tokenType="to"
      />
    </div>
  );
};

export default SwapInterface;
