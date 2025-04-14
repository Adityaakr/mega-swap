import { WalletProvider } from '@/hooks/useWallet';
import { TokensProvider } from '@/hooks/useTokens';
import { SwapProvider } from '@/hooks/useSwap';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Droplets, CoinsIcon, VoteIcon, LayoutDashboard } from 'lucide-react';
import Header from '@/components/Header';

const Index = () => {
  return (
    <WalletProvider>
      <TokensProvider>
        <SwapProvider>
          <div className="min-h-screen flex flex-col bg-dex-dark">
            <Header />
            
            <main className="flex-1 container px-4 py-12">
              <div className="max-w-4xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 dex-gradient-text">
                    MegaSwap DEX
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    A beginner-friendly decentralized exchange for swapping, providing liquidity, 
                    farming, and governance on Ethereum Sepolia and Mega testnets.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="bg-dex-gradient from-dex-purple to-dex-blue">
                      <Link to="/swap">Launch App</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer">
                        Get Testnet ETH
                      </a>
                    </Button>
                  </div>
                </div>
                
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                  <Link 
                    to="/swap" 
                    className="dex-card hover-scale group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-dex-gradient from-dex-purple to-dex-blue flex items-center justify-center mr-3">
                        <ArrowLeftRight className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-primary transition-colors">Swap Tokens</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Easily swap between Sepolia ETH, TestUSD, and Mega ETH with low slippage and real-time price updates.
                    </p>
                  </Link>
                  
                  <Link 
                    to="/liquidity" 
                    className="dex-card hover-scale group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-dex-gradient from-dex-purple to-dex-blue flex items-center justify-center mr-3">
                        <Droplets className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-primary transition-colors">Provide Liquidity</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Add liquidity to pools and earn trading fees. Easily manage your positions and track your rewards.
                    </p>
                  </Link>
                  
                  <Link 
                    to="/staking" 
                    className="dex-card hover-scale group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-dex-gradient from-dex-purple to-dex-blue flex items-center justify-center mr-3">
                        <CoinsIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-primary transition-colors">Stake LP Tokens</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Stake your LP tokens to earn GOV tokens. Track your staking positions and harvest rewards.
                    </p>
                  </Link>
                  
                  <Link 
                    to="/governance" 
                    className="dex-card hover-scale group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-dex-gradient from-dex-purple to-dex-blue flex items-center justify-center mr-3">
                        <VoteIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-primary transition-colors">Governance</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Vote on proposals with your GOV tokens. Help shape the future of the protocol.
                    </p>
                  </Link>
                </div>
                
                {/* Dashboard CTA */}
                <div className="dex-card bg-dex-gradient from-dex-purple to-dex-blue text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-medium mb-2">Track Your Portfolio</h3>
                      <p>
                        View all your balances, positions, and rewards in one place with the Dashboard.
                      </p>
                    </div>
                    <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>View Dashboard</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </main>
            
            <footer className="border-t border-border py-4">
              <div className="container px-4 text-center text-sm text-muted-foreground">
                <p>
                  MegaSwap is a demo DEX for educational purposes only. All tokens and transactions use testnets.
                </p>
              </div>
            </footer>
          </div>
        </SwapProvider>
      </TokensProvider>
    </WalletProvider>
  );
};

export default Index;
