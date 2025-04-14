
import { WalletProvider } from '@/hooks/useWallet';
import { TokensProvider } from '@/hooks/useTokens';
import { LiquidityProvider } from '@/hooks/useLiquidity';
import Header from '@/components/Header';
import LiquidityInterface from '@/components/LiquidityInterface';

const Liquidity = () => {
  return (
    <WalletProvider>
      <TokensProvider>
        <LiquidityProvider>
          <div className="min-h-screen flex flex-col bg-dex-dark">
            <Header />
            
            <main className="flex-1 container px-4 py-12">
              <LiquidityInterface />
            </main>
          </div>
        </LiquidityProvider>
      </TokensProvider>
    </WalletProvider>
  );
};

export default Liquidity;
