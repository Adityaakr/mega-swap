
import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useWallet } from './useWallet';
import { useTokens } from './useTokens';
import { simulateTransaction } from '../utils/helpers';
import { PROPOSALS } from '../utils/constants';

// Proposal interface
export interface Proposal {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'closed';
  votesFor: number;
  votesAgainst: number;
  endTime: number;
  result?: 'passed' | 'failed';
  userVote?: 'for' | 'against';
}

interface GovernanceContextProps {
  proposals: Proposal[];
  loadingProposals: boolean;
  selectedProposal: Proposal | null;
  voting: boolean;
  txHash: string | null;
  loadProposals: () => Promise<void>;
  setSelectedProposal: (proposal: Proposal | null) => void;
  vote: (proposalId: number, voteType: 'for' | 'against') => Promise<void>;
}

const GovernanceContext = createContext<GovernanceContextProps>({
  proposals: [],
  loadingProposals: false,
  selectedProposal: null,
  voting: false,
  txHash: null,
  loadProposals: async () => {},
  setSelectedProposal: () => {},
  vote: async () => {},
});

export function GovernanceProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();
  const { refreshBalances } = useTokens();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [voting, setVoting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Load proposals on initial load
  useEffect(() => {
    loadProposals();
  }, [isConnected]);

  // Load governance proposals
  const loadProposals = async () => {
    if (!isConnected) {
      setProposals([]);
      return;
    }
    
    setLoadingProposals(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process the proposals from constants
      const processedProposals: Proposal[] = PROPOSALS.map(proposal => {
        // For simulation, randomly assign a vote if the proposal is active
        let userVote: 'for' | 'against' | undefined = undefined;
        
        if (proposal.status === 'active' && Math.random() > 0.5) {
          userVote = Math.random() > 0.5 ? 'for' : 'against';
        }
        
        return {
          ...proposal,
          userVote,
        } as Proposal;
      });
      
      setProposals(processedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load governance proposals');
    } finally {
      setLoadingProposals(false);
    }
  };

  // Vote on a proposal
  const vote = async (proposalId: number, voteType: 'for' | 'against') => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to continue',
      });
      return;
    }
    
    const proposal = proposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      toast.error('Proposal not found', {
        description: 'The selected proposal could not be found',
      });
      return;
    }
    
    if (proposal.status !== 'active') {
      toast.error('Proposal not active', {
        description: 'You can only vote on active proposals',
      });
      return;
    }
    
    if (proposal.userVote) {
      toast.error('Already voted', {
        description: 'You have already voted on this proposal',
      });
      return;
    }
    
    setVoting(true);
    setTxHash(null);
    
    try {
      toast.info('Submitting vote...', {
        description: `Voting ${voteType} proposal #${proposalId}`,
      });
      
      // Simulate blockchain transaction
      const { success, hash } = await simulateTransaction();
      
      if (success) {
        setTxHash(hash);
        toast.success('Vote submitted!', {
          description: `Successfully voted ${voteType} proposal "${proposal.title}"`,
        });
        
        // Update the proposals list with the new vote
        setProposals(prevProposals =>
          prevProposals.map(p => {
            if (p.id === proposalId) {
              return {
                ...p,
                userVote: voteType,
                votesFor: voteType === 'for' ? p.votesFor + 1000 : p.votesFor,
                votesAgainst: voteType === 'against' ? p.votesAgainst + 1000 : p.votesAgainst,
              };
            }
            return p;
          })
        );
        
        // If the selected proposal is the one we voted on, update it
        if (selectedProposal?.id === proposalId) {
          setSelectedProposal({
            ...selectedProposal,
            userVote: voteType,
            votesFor: voteType === 'for' ? selectedProposal.votesFor + 1000 : selectedProposal.votesFor,
            votesAgainst: voteType === 'against' ? selectedProposal.votesAgainst + 1000 : selectedProposal.votesAgainst,
          });
        }
        
        // Refresh balances to simulate GOV token usage
        await refreshBalances();
      } else {
        toast.error('Transaction failed', {
          description: 'Failed to submit vote. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Voting error:', error);
      toast.error('Voting error', {
        description: error.message || 'An error occurred while voting',
      });
    } finally {
      setVoting(false);
    }
  };

  return (
    <GovernanceContext.Provider
      value={{
        proposals,
        loadingProposals,
        selectedProposal,
        voting,
        txHash,
        loadProposals,
        setSelectedProposal,
        vote,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
}

export const useGovernance = () => useContext(GovernanceContext);
