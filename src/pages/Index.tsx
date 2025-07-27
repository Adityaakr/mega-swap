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
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                    MegaSwap DEX
                  </h1>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                    A beginner-friendly decentralized exchange for swapping, providing liquidity, 
                    farming, and governance on Ethereum Sepolia and Mega testnets.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="bg-gray-800 text-white hover:bg-gray-700">
                      <Link to="/swap">Launch App</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-200 hover:bg-gray-800">
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
                    className="bg-gray-900 rounded-xl p-6 shadow hover:scale-105 transition-transform group border border-gray-800"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                        <ArrowLeftRight className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-white transition-colors">Swap Tokens</h3>
                    </div>
                    <p className="text-gray-400">
                      Easily swap between Sepolia ETH, TestUSD, and Mega ETH with low slippage and real-time price updates.
                    </p>
                  </Link>
                  
                  <Link 
                    to="/liquidity" 
                    className="bg-gray-900 rounded-xl p-6 shadow hover:scale-105 transition-transform group border border-gray-800"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                        <Droplets className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-white transition-colors">Provide Liquidity</h3>
                    </div>
                    <p className="text-gray-400">
                      Add liquidity to pools and earn trading fees. Easily manage your positions and track your rewards.
                    </p>
                  </Link>
                  
                  <Link 
                    to="/staking" 
                    className="bg-gray-900 rounded-xl p-6 shadow hover:scale-105 transition-transform group border border-gray-800"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                        <CoinsIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-white transition-colors">Stake LP Tokens</h3>
                    </div>
                    <p className="text-gray-400">
                      Stake your LP tokens to earn GOV tokens. Track your staking positions and harvest rewards.
                    </p>
                  </Link>
                  
                  <Link 
                    to="/governance" 
                    className="bg-gray-900 rounded-xl p-6 shadow hover:scale-105 transition-transform group border border-gray-800"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                        <VoteIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-medium group-hover:text-white transition-colors">Governance</h3>
                    </div>
                    <p className="text-gray-400">
                      Vote on proposals with your GOV tokens. Help shape the future of the protocol.
                    </p>
                  </Link>
                </div>
                
                {/* Dashboard CTA */}
                <div className="bg-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between text-white border border-gray-700">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-medium mb-2">Track Your Portfolio</h3>
                    <p>
                      View all your balances, positions, and rewards in one place with the Dashboard.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="whitespace-nowrap bg-gray-900 text-white hover:bg-gray-700">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>View Dashboard</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </main>
            
            <footer className="border-t border-gray-800 py-4">
              <div className="container px-4 text-center text-sm text-gray-500">
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
