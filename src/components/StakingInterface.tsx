
import { useEffect } from 'react';
import { useStaking, StakingPosition } from '@/hooks/useStaking';
import { useLiquidity } from '@/hooks/useLiquidity';
import { useWallet } from '@/hooks/useWallet';
import { formatNumber, formatDate } from '@/utils/helpers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoinsIcon, Calendar, Award, Clock, AlertCircle } from 'lucide-react';
import TransactionStatus from './TransactionStatus';

const StakingInterface = () => {
  const { isConnected } = useWallet();
  const { pools, loadUserPools } = useLiquidity();
  const {
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
  } = useStaking();
  
  // Load staking positions when pools change
  useEffect(() => {
    loadPositions();
  }, [pools]);
  
  // Check if staking is valid
  const isStakeValid = () => {
    if (!isConnected || pools.length === 0 || !stakeAmount) return false;
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) return false;
    
    const pool = pools[0]; // Just use the first pool for the demo
    
    if (!pool || amount > pool.lpToken) return false;
    
    return true;
  };
  
  // Handle max LP amount
  const handleMaxLP = () => {
    if (pools.length === 0) return;
    
    const pool = pools[0];
    setStakeAmount(pool.lpToken.toString());
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-border bg-secondary/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Staking</CardTitle>
          <CardDescription>Stake LP tokens to earn GOV rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue={positions.length > 0 ? "positions" : "stake"}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="stake" disabled={staking || unstaking || claiming}>
                <Award className="h-4 w-4 mr-2" />
                Stake LP
              </TabsTrigger>
              <TabsTrigger value="positions" disabled={staking || unstaking || claiming}>
                <CoinsIcon className="h-4 w-4 mr-2" />
                My Stakes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stake" className="space-y-4">
              {pools.length > 0 ? (
                <div className="space-y-4">
                  {/* Stake Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stake LP Tokens</span>
                      <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={handleMaxLP}>
                        Available: {formatNumber(pools[0].lpToken, 6)} LP
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex items-center gap-1 px-3 py-2 rounded-l-md border border-r-0 border-input bg-secondary">
                        <div className="flex -space-x-2">
                          <div className="h-5 w-5 rounded-full bg-primary z-10 flex items-center justify-center text-xs font-bold">
                            {pools[0].token0.symbol.substring(0, 2)}
                          </div>
                          <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                            {pools[0].token1.symbol.substring(0, 2)}
                          </div>
                        </div>
                        <span className="ml-1">{pools[0].token0.symbol}-{pools[0].token1.symbol} LP</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  {/* Pool Info */}
                  <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">Pool Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs text-muted-foreground">
                        <span>Pool:</span>
                      </div>
                      <div className="text-xs text-right">
                        <span>{pools[0].token0.symbol}-{pools[0].token1.symbol}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <span>Your LP tokens:</span>
                      </div>
                      <div className="text-xs text-right">
                        <span>{formatNumber(pools[0].lpToken, 6)} LP</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <span>Rewards token:</span>
                      </div>
                      <div className="text-xs text-right">
                        <span>GOV</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <span>APR:</span>
                      </div>
                      <div className="text-xs text-right text-green-500">
                        <span>12.5%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction Status */}
                  <TransactionStatus
                    txHash={txHash}
                    loading={staking}
                    title="Staking Successful"
                    description={stakeAmount 
                      ? `Successfully staked ${formatNumber(parseFloat(stakeAmount), 6)} LP tokens`
                      : 'Transaction completed successfully'
                    }
                  />
                  
                  {/* Stake Button */}
                  <Button
                    className="w-full"
                    disabled={!isStakeValid() || staking}
                    onClick={stake}
                  >
                    {!isConnected
                      ? 'Connect Wallet'
                      : pools.length === 0
                      ? 'No LP Tokens Available'
                      : !stakeAmount || parseFloat(stakeAmount) <= 0
                      ? 'Enter Amount'
                      : parseFloat(stakeAmount) > pools[0].lpToken
                      ? 'Insufficient LP Balance'
                      : staking
                      ? 'Staking...'
                      : 'Stake LP Tokens'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CoinsIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No LP Tokens Found</h3>
                  <p className="text-muted-foreground mb-4">You need to add liquidity first to get LP tokens for staking.</p>
                  <Button onClick={() => window.location.href = '/liquidity'}>
                    Add Liquidity
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="positions" className="space-y-4">
              {positions.length > 0 ? (
                <div className="space-y-4">
                  {/* Position Cards */}
                  {positions.map((position) => (
                    <div 
                      key={position.id}
                      className={`p-3 bg-secondary/50 rounded-lg space-y-3 cursor-pointer transition-colors border ${
                        selectedPosition?.id === position.id 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-secondary'
                      }`}
                      onClick={() => setSelectedPosition(position)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary z-10 flex items-center justify-center text-xs font-bold">
                              {position.pool.token0.symbol.substring(0, 2)}
                            </div>
                            <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                              {position.pool.token1.symbol.substring(0, 2)}
                            </div>
                          </div>
                          <span className="ml-2 font-medium">{position.pool.token0.symbol}-{position.pool.token1.symbol}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(position.stakingDate)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-xs text-muted-foreground">
                          <span>Staked LP:</span>
                        </div>
                        <div className="text-xs text-right">
                          <span>{formatNumber(position.stakedLpAmount, 6)} LP</span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <span>Pending rewards:</span>
                        </div>
                        <div className="text-xs text-right text-green-500">
                          <span>{formatNumber(position.pendingRewards, 4)} GOV</span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <span>APR:</span>
                        </div>
                        <div className="text-xs text-right text-green-500">
                          <span>{position.apr.toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      {position === selectedPosition && (
                        <div className="pt-2 border-t border-border mt-2 grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={unstaking || claiming}
                            onClick={(e) => {
                              e.stopPropagation();
                              unstake();
                            }}
                          >
                            {unstaking ? 'Unstaking...' : 'Unstake'}
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            disabled={position.pendingRewards <= 0 || unstaking || claiming}
                            onClick={(e) => {
                              e.stopPropagation();
                              claim();
                            }}
                          >
                            {claiming ? 'Claiming...' : 'Harvest'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Transaction Status */}
                  <TransactionStatus
                    txHash={txHash}
                    loading={unstaking || claiming}
                    title={unstaking ? "Unstaking Successful" : "Harvest Successful"}
                    description={selectedPosition 
                      ? unstaking 
                        ? `Successfully unstaked ${formatNumber(selectedPosition.stakedLpAmount, 6)} LP tokens and claimed ${formatNumber(selectedPosition.pendingRewards, 4)} GOV`
                        : `Successfully claimed ${formatNumber(selectedPosition.pendingRewards, 4)} GOV rewards`
                      : 'Transaction completed successfully'
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Active Stakes</h3>
                  <p className="text-muted-foreground mb-4">You haven't staked any LP tokens yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingInterface;
