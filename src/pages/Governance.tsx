
import { WalletProvider } from '@/hooks/useWallet';
import { TokensProvider } from '@/hooks/useTokens';
import { GovernanceProvider } from '@/hooks/useGovernance';
import Header from '@/components/Header';
import GovernanceInterface from '@/components/GovernanceInterface';

const Governance = () => {
  return (
    <WalletProvider>
      <TokensProvider>
        <GovernanceProvider>
          <div className="min-h-screen flex flex-col bg-dex-dark">
            <Header />
            
            <main className="flex-1 container px-4 py-12">
              <GovernanceInterface />
            </main>
          </div>
        </GovernanceProvider>
      </TokensProvider>
    </WalletProvider>
  );
};

export default Governance;
