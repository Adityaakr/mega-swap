import { useEffect } from 'react';
import { useTokens } from '@/hooks/useTokens';
import { useLiquidity } from '@/hooks/useLiquidity';
import { useStaking } from '@/hooks/useStaking';
import { useWallet } from '@/hooks/useWallet';
import { formatNumber } from '@/utils/helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CoinsIcon, Droplets, Award, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserDashboard = () => {
  const { isConnected, account } = useWallet();
  const { balances, refreshBalances, prices, loading: balanceLoading } = useTokens();
  const { pools, loadUserPools, loadingPools } = useLiquidity();
  const { positions, loadPositions, loadingPositions } = useStaking();
  
  useEffect(() => {
    if (isConnected) {
      refreshBalances();
      loadUserPools();
      loadPositions();
    }
  }, [isConnected]);
  
  const calculatePortfolioValue = () => {
    if (!balances.length) return 0;
    
    let total = 0;
    
    for (const balance of balances) {
      const price = prices[balance.token.symbol] || 0;
      total += balance.balance * price;
    }
    
    for (const pool of pools) {
      const token0Price = prices[pool.token0.symbol] || 0;
      const token1Price = prices[pool.token1.symbol] || 0;
      total += (pool.balance0 * token0Price) + (pool.balance1 * token1Price);
    }
    
    return total;
  };
  
  const calculateStakingValue = () => {
    if (!positions.length) return 0;
    
    let total = 0;
    
    for (const position of positions) {
      const token0Price = prices[position.pool.token0.symbol] || 0;
      const token1Price = prices[position.pool.token1.symbol] || 0;
      
      const lpValue = (position.pool.balance0 * token0Price * position.stakedLpAmount / position.pool.lpToken) + 
                      (position.pool.balance1 * token1Price * position.stakedLpAmount / position.pool.lpToken);
      
      const rewardValue = position.pendingRewards * (prices['GOV'] || 0);
      
      total += lpValue + rewardValue;
    }
    
    return total;
  };
  
  const handleRefresh = () => {
    refreshBalances();
    loadUserPools();
    loadPositions();
  };
  
  const renderNotConnected = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Connect your wallet</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Connect your wallet to see your dashboard with token balances, liquidity positions, and staking rewards.
      </p>
      <Button onClick={() => window.location.href = '/'}>
        Connect Wallet
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {isConnected ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-border bg-secondary/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatNumber(calculatePortfolioValue(), 2)}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">Across all tokens and positions</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-secondary/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Liquidity Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingPools ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    `$${formatNumber(
                      pools.reduce((acc, pool) => {
                        const token0Price = prices[pool.token0.symbol] || 0;
                        const token1Price = prices[pool.token1.symbol] || 0;
                        return acc + (pool.balance0 * token0Price) + (pool.balance1 * token1Price);
                      }, 0),
                      2
                    )}`
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {pools.length === 0 
                    ? 'No active liquidity positions' 
                    : `${pools.length} active pool${pools.length > 1 ? 's' : ''}`}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-secondary/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Staking Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingPositions ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    `$${formatNumber(calculateStakingValue(), 2)}`
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {positions.length === 0 
                    ? 'No active staking positions' 
                    : `${positions.length} staking position${positions.length > 1 ? 's' : ''}`}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-border bg-secondary/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Dashboard</CardTitle>
              <CardDescription>Track your tokens, positions, and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tokens">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="tokens">
                    <Wallet className="h-4 w-4 mr-2" />
                    Tokens
                  </TabsTrigger>
                  <TabsTrigger value="liquidity">
                    <Droplets className="h-4 w-4 mr-2" />
                    Liquidity
                  </TabsTrigger>
                  <TabsTrigger value="staking">
                    <Award className="h-4 w-4 mr-2" />
                    Staking
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tokens">
                  {balanceLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading token balances...</p>
                    </div>
                  ) : balances.length > 0 ? (
                    <div className="grid gap-4">
                      {balances.map((balance) => {
                        const price = prices[balance.token.symbol] || 0;
                        const usdValue = balance.balance * price;
                        
                        return (
                          <div key={balance.token.symbol} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold mr-3">
                                {balance.token.symbol.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium">{balance.token.symbol}</div>
                                <div className="text-xs text-muted-foreground">{balance.token.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div>{formatNumber(balance.balance, 6)}</div>
                              <div className="text-xs text-muted-foreground">${formatNumber(usdValue, 2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>No tokens found in your wallet</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="liquidity">
                  {loadingPools ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading liquidity positions...</p>
                    </div>
                  ) : pools.length > 0 ? (
                    <div className="space-y-4">
                      {pools.map((pool) => {
                        const token0Price = prices[pool.token0.symbol] || 0;
                        const token1Price = prices[pool.token1.symbol] || 0;
                        const totalValue = (pool.balance0 * token0Price) + (pool.balance1 * token1Price);
                        
                        return (
                          <div key={pool.id} className="p-4 border border-border rounded-lg">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => window.location.href = '/liquidity'}
                              >
                                Manage
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                              <div className="text-xs text-muted-foreground">Pool Share:</div>
                              <div className="text-xs text-right">{formatNumber(pool.share, 4)}%</div>
                              
                              <div className="text-xs text-muted-foreground">LP Tokens:</div>
                              <div className="text-xs text-right">{formatNumber(pool.lpToken, 6)}</div>
                              
                              <div className="text-xs text-muted-foreground">{pool.token0.symbol}:</div>
                              <div className="text-xs text-right">{formatNumber(pool.balance0, 6)}</div>
                              
                              <div className="text-xs text-muted-foreground">{pool.token1.symbol}:</div>
                              <div className="text-xs text-right">{formatNumber(pool.balance1, 2)}</div>
                              
                              <div className="text-xs text-muted-foreground">Value:</div>
                              <div className="text-xs text-right">${formatNumber(totalValue, 2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="mb-4">You haven't added liquidity to any pools yet</p>
                      <Button onClick={() => window.location.href = '/liquidity'}>
                        Add Liquidity
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="staking">
                  {loadingPositions ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading staking positions...</p>
                    </div>
                  ) : positions.length > 0 ? (
                    <div className="space-y-4">
                      {positions.map((position) => {
                        const pendingRewards = position.pendingRewards;
                        const rewardValue = pendingRewards * (prices['GOV'] || 0);
                        
                        return (
                          <div key={position.id} className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => window.location.href = '/staking'}
                              >
                                Manage
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                              <div className="text-xs text-muted-foreground">Staked LP:</div>
                              <div className="text-xs text-right">{formatNumber(position.stakedLpAmount, 6)}</div>
                              
                              <div className="text-xs text-muted-foreground">APR:</div>
                              <div className="text-xs text-right text-green-500">{position.apr.toFixed(2)}%</div>
                              
                              <div className="text-xs text-muted-foreground">Pending Rewards:</div>
                              <div className="text-xs text-right">{formatNumber(pendingRewards, 4)} GOV</div>
                              
                              <div className="text-xs text-muted-foreground">Reward Value:</div>
                              <div className="text-xs text-right">${formatNumber(rewardValue, 2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="mb-4">You don't have any active staking positions</p>
                      <Button onClick={() => window.location.href = '/staking'}>
                        Stake LP Tokens
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="mt-6 p-4 border border-border rounded-lg bg-secondary/30">
            <h3 className="text-lg font-medium mb-2">Testnet Resources</h3>
            <p className="text-sm text-muted-foreground mb-4">Get testnet tokens to explore the DEX:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Sepolia ETH Faucet
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => window.open('https://www.alchemy.com/faucets/ethereum-sepolia', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Alchemy Sepolia Faucet
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={() => window.open('https://infura.io/faucet/sepolia', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Infura Sepolia Faucet
              </Button>
            </div>
          </div>
        </>
      ) : (
        renderNotConnected()
      )}
    </div>
  );
};

export default UserDashboard;
