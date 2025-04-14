
import { WalletProvider } from '@/hooks/useWallet';
import { TokensProvider } from '@/hooks/useTokens';
import { LiquidityProvider } from '@/hooks/useLiquidity';
import { StakingProvider } from '@/hooks/useStaking';
import Header from '@/components/Header';
import StakingInterface from '@/components/StakingInterface';

const Staking = () => {
  return (
    <WalletProvider>
      <TokensProvider>
        <LiquidityProvider>
          <StakingProvider>
            <div className="min-h-screen flex flex-col bg-dex-dark">
              <Header />
              
              <main className="flex-1 container px-4 py-12">
                <StakingInterface />
              </main>
            </div>
          </StakingProvider>
        </LiquidityProvider>
      </TokensProvider>
    </WalletProvider>
  );
};

export default Staking;
