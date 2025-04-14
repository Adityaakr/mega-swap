import { useEffect, useState } from 'react';
import { useLiquidity, Pool } from '@/hooks/useLiquidity';
import { useWallet } from '@/hooks/useWallet';
import { useTokens, Token } from '@/hooks/useTokens';
import { POOLS } from '@/utils/constants';
import { formatNumber } from '@/utils/helpers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Droplets, ArrowRight, PlusSquare, Trash2, AlertCircle } from 'lucide-react';
import TokenModal from './TokenModal';
import TransactionStatus from './TransactionStatus';

const LiquidityInterface = () => {
  const { isConnected } = useWallet();
  const { tokens, getBalance, prices } = useTokens();
  const {
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
    setToken0Amount,
    setToken1Amount,
    setRemovePercent,
    addLiquidity,
    removeLiquidity,
  } = useLiquidity();
  
  const [activeTab, setActiveTab] = useState('add');
  
  useEffect(() => {
    loadUserPools();
    
    if (tokens.length > 0 && !selectedPool) {
      const ethToken = tokens.find(t => t.symbol === 'ETH');
      const tusdToken = tokens.find(t => t.symbol === 'TUSD');
      
      if (ethToken && tusdToken) {
        const initialPool: Pool = {
          id: 'eth-tusd',
          token0: ethToken,
          token1: tusdToken,
          balance0: 0,
          balance1: 0,
          lpToken: 0,
          share: 0,
        };
        
        setSelectedPool(initialPool);
      }
    }
  }, [tokens]);
  
  const isAddLiquidityValid = () => {
    if (!isConnected || !selectedPool || !token0Amount || !token1Amount) return false;
    
    const amount0 = parseFloat(token0Amount);
    const amount1 = parseFloat(token1Amount);
    
    if (isNaN(amount0) || amount0 <= 0 || isNaN(amount1) || amount1 <= 0) return false;
    
    const balance0 = getBalance(selectedPool.token0);
    const balance1 = getBalance(selectedPool.token1);
    
    if (amount0 > balance0 || amount1 > balance1) return false;
    
    return true;
  };
  
  const isRemoveLiquidityValid = () => {
    if (!isConnected || !selectedPool || !selectedPool.lpToken || removePercent <= 0) return false;
    return true;
  };
  
  const handleMaxToken0 = () => {
    if (!selectedPool) return;
    const balance = getBalance(selectedPool.token0);
    setToken0Amount(balance.toString());
  };
  
  const handleMaxToken1 = () => {
    if (!selectedPool) return;
    const balance = getBalance(selectedPool.token1);
    setToken1Amount(balance.toString());
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-border bg-secondary/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Liquidity Pool</CardTitle>
          <CardDescription>Add or remove liquidity to earn fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="add" disabled={addingLiquidity || removingLiquidity}>
                <PlusSquare className="h-4 w-4 mr-2" />
                Add
              </TabsTrigger>
              <TabsTrigger value="remove" disabled={addingLiquidity || removingLiquidity || pools.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Token 1</span>
                  {selectedPool && (
                    <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={handleMaxToken0}>
                      Balance: {formatNumber(getBalance(selectedPool.token0), 6)}
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                    {selectedPool ? selectedPool.token0.symbol.substring(0, 2) : 'T1'}
                  </div>
                  <div className="flex-grow">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={token0Amount}
                      onChange={(e) => setToken0Amount(e.target.value)}
                    />
                  </div>
                </div>
                {selectedPool && token0Amount && (
                  <div className="text-xs text-muted-foreground text-right">
                    ${formatNumber(parseFloat(token0Amount) * (prices[selectedPool.token0.symbol] || 0), 2)}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Token 2</span>
                  {selectedPool && (
                    <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={handleMaxToken1}>
                      Balance: {formatNumber(getBalance(selectedPool.token1), 6)}
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                    {selectedPool ? selectedPool.token1.symbol.substring(0, 2) : 'T2'}
                  </div>
                  <div className="flex-grow">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={token1Amount}
                      onChange={(e) => setToken1Amount(e.target.value)}
                    />
                  </div>
                </div>
                {selectedPool && token1Amount && (
                  <div className="text-xs text-muted-foreground text-right">
                    ${formatNumber(parseFloat(token1Amount) * (prices[selectedPool.token1.symbol] || 0), 2)}
                  </div>
                )}
              </div>
              
              {selectedPool && (
                <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium">Pool Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs text-muted-foreground">
                      <span>Pool:</span>
                    </div>
                    <div className="text-xs text-right">
                      <span>{selectedPool.token0.symbol}-{selectedPool.token1.symbol}</span>
                    </div>
                    
                    {selectedPool.lpToken > 0 && (
                      <>
                        <div className="text-xs text-muted-foreground">
                          <span>Your liquidity:</span>
                        </div>
                        <div className="text-xs text-right">
                          <span>{formatNumber(selectedPool.lpToken, 4)} LP</span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <span>Your pool share:</span>
                        </div>
                        <div className="text-xs text-right">
                          <span>{formatNumber(selectedPool.share, 4)}%</span>
                        </div>
                      </>
                    )}
                    
                    {token0Amount && token1Amount && parseFloat(token0Amount) > 0 && parseFloat(token1Amount) > 0 && (
                      <>
                        <div className="text-xs text-muted-foreground">
                          <span>You will receive:</span>
                        </div>
                        <div className="text-xs text-right">
                          <span>~{formatNumber(parseFloat(token0Amount), 4)} LP</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <TransactionStatus
                txHash={txHash}
                loading={addingLiquidity}
                title="Liquidity Added"
                description={selectedPool 
                  ? `Successfully added liquidity to ${selectedPool.token0.symbol}-${selectedPool.token1.symbol} pool`
                  : 'Transaction completed successfully'
                }
              />
            </TabsContent>
            
            <TabsContent value="remove" className="space-y-4">
              {pools.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">Your Liquidity Position</h4>
                    {pools.map((pool) => (
                      <div 
                        key={pool.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPool?.id === pool.id 
                            ? 'border-primary bg-secondary' 
                            : 'border-transparent hover:border-secondary'
                        }`}
                        onClick={() => setSelectedPool(pool)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex -space-x-2">
                              <div className="h-6 w-6 rounded-full bg-primary z-10 flex items-center justify-center text-xs font-bold">
                                {pool.token0.symbol.substring(0, 2)}
                              </div>
                              <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                                {pool.token1.symbol.substring(0, 2)}
                              </div>
                            </div>
                            <span className="ml-2 font-medium">{pool.token0.symbol}-{pool.token1.symbol}</span>
                          </div>
                          <span className="text-sm">{formatNumber(pool.lpToken, 4)} LP</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="text-muted-foreground">Pool Share:</div>
                          <div className="text-right">{formatNumber(pool.share, 4)}%</div>
                          
                          <div className="text-muted-foreground">{pool.token0.symbol}:</div>
                          <div className="text-right">{formatNumber(pool.balance0, 6)}</div>
                          
                          <div className="text-muted-foreground">{pool.token1.symbol}:</div>
                          <div className="text-right">{formatNumber(pool.balance1, 2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedPool && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Remove Amount: {removePercent}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setRemovePercent(100)}
                        >
                          Max
                        </Button>
                      </div>
                      <Slider
                        value={[removePercent]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setRemovePercent(value[0])}
                      />
                      
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">You Will Receive</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold mr-2">
                                {selectedPool.token0.symbol.substring(0, 2)}
                              </div>
                              <span className="text-sm">{selectedPool.token0.symbol}</span>
                            </div>
                            <span>
                              {formatNumber((selectedPool.balance0 * removePercent) / 100, 6)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-xs font-bold mr-2">
                                {selectedPool.token1.symbol.substring(0, 2)}
                              </div>
                              <span className="text-sm">{selectedPool.token1.symbol}</span>
                            </div>
                            <span>
                              {formatNumber((selectedPool.balance1 * removePercent) / 100, 6)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <TransactionStatus
                    txHash={txHash}
                    loading={removingLiquidity}
                    title="Liquidity Removed"
                    description={selectedPool 
                      ? `Successfully removed ${removePercent}% of liquidity from ${selectedPool.token0.symbol}-${selectedPool.token1.symbol} pool`
                      : 'Transaction completed successfully'
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Droplets className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Liquidity Found</h3>
                  <p className="text-muted-foreground mb-4">You haven't added liquidity to any pools yet.</p>
                  <Button onClick={() => setActiveTab('add')}>
                    Add Liquidity
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {activeTab === 'add' ? (
            <Button
              className="w-full"
              disabled={!isAddLiquidityValid() || addingLiquidity}
              onClick={addLiquidity}
            >
              {!isConnected
                ? 'Connect Wallet'
                : !token0Amount || !token1Amount || parseFloat(token0Amount) <= 0 || parseFloat(token1Amount) <= 0
                ? 'Enter Amounts'
                : selectedPool && (parseFloat(token0Amount) > getBalance(selectedPool.token0) || parseFloat(token1Amount) > getBalance(selectedPool.token1))
                ? 'Insufficient Balance'
                : addingLiquidity
                ? 'Adding Liquidity...'
                : 'Add Liquidity'}
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!isRemoveLiquidityValid() || removingLiquidity}
              onClick={removeLiquidity}
            >
              {!isConnected
                ? 'Connect Wallet'
                : !selectedPool
                ? 'Select a Position'
                : removePercent <= 0
                ? 'Select Amount'
                : removingLiquidity
                ? 'Removing Liquidity...'
                : `Remove ${removePercent}% Liquidity`}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LiquidityInterface;
