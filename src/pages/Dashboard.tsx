
import { WalletProvider } from '@/hooks/useWallet';
import { TokensProvider } from '@/hooks/useTokens';
import { LiquidityProvider } from '@/hooks/useLiquidity';
import { StakingProvider } from '@/hooks/useStaking';
import Header from '@/components/Header';
import UserDashboard from '@/components/UserDashboard';

const Dashboard = () => {
  return (
    <WalletProvider>
      <TokensProvider>
        <LiquidityProvider>
          <StakingProvider>
            <div className="min-h-screen flex flex-col bg-dex-dark">
              <Header />
              
              <main className="flex-1 container px-4 py-12">
                <UserDashboard />
              </main>
            </div>
          </StakingProvider>
        </LiquidityProvider>
      </TokensProvider>
    </WalletProvider>
  );
};

export default Dashboard;
