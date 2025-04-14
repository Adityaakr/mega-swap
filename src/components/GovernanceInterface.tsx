
import { useEffect } from 'react';
import { useGovernance, Proposal } from '@/hooks/useGovernance';
import { useWallet } from '@/hooks/useWallet';
import { useTokens } from '@/hooks/useTokens';
import { formatNumber, timeRemaining } from '@/utils/helpers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteIcon, ThumbsDown, ThumbsUp, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import TransactionStatus from './TransactionStatus';

const GovernanceInterface = () => {
  const { isConnected } = useWallet();
  const { getBalance } = useTokens();
  const {
    proposals,
    loadingProposals,
    selectedProposal,
    voting,
    txHash,
    loadProposals,
    setSelectedProposal,
    vote,
  } = useGovernance();
  
  // Load proposals when component mounts
  useEffect(() => {
    loadProposals();
  }, [isConnected]);
  
  // Filter active and closed proposals
  const activeProposals = proposals.filter(p => p.status === 'active');
  const closedProposals = proposals.filter(p => p.status === 'closed');
  
  // Calculate voting power
  const getVotingPower = () => {
    // Simplified: In a real dApp, voting power might be based on token balance snapshot
    // For this demo, we'll use the current GOV token balance
    return getBalance({ symbol: 'GOV', name: '', address: '', decimals: 18, logo: '', network: 'SEPOLIA' });
  };
  
  // Calculate vote percentage
  const calculatePercentage = (proposal: Proposal) => {
    const total = proposal.votesFor + proposal.votesAgainst;
    if (total === 0) return { for: 0, against: 0 };
    
    return {
      for: (proposal.votesFor / total) * 100,
      against: (proposal.votesAgainst / total) * 100,
    };
  };
  
  // Check if user can vote
  const canVote = (proposal: Proposal) => {
    if (!isConnected) return false;
    if (proposal.status !== 'active') return false;
    if (proposal.userVote) return false;
    
    const votingPower = getVotingPower();
    return votingPower > 0;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-border bg-secondary/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Governance</CardTitle>
          <CardDescription>Vote on proposals with your GOV tokens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="mb-4 p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Your Voting Power</h4>
                <p className="text-xs text-muted-foreground">Based on your GOV token balance</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{formatNumber(getVotingPower(), 2)}</div>
                <div className="text-xs text-muted-foreground">GOV tokens</div>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-secondary/50 rounded-lg text-center">
              <Button onClick={() => window.location.href = '/'}>
                Connect Wallet to Vote
              </Button>
            </div>
          )}
          
          <Tabs defaultValue="active">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="active">
                <Clock className="h-4 w-4 mr-2" />
                Active Proposals ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                <CheckCircle className="h-4 w-4 mr-2" />
                Closed Proposals ({closedProposals.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activeProposals.length > 0 ? (
                <div className="space-y-4">
                  {activeProposals.map((proposal) => {
                    const percentages = calculatePercentage(proposal);
                    const timeLeft = timeRemaining(proposal.endTime);
                    
                    return (
                      <div
                        key={proposal.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          selectedProposal?.id === proposal.id
                            ? 'border-primary bg-secondary/50'
                            : 'border-border hover:border-secondary cursor-pointer'
                        }`}
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">#{proposal.id}: {proposal.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                          </div>
                          <div className="flex items-center text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeLeft}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>For: {formatNumber(proposal.votesFor, 0)}</span>
                            <span>Against: {formatNumber(proposal.votesAgainst, 0)}</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 float-left rounded-l-full"
                              style={{ width: `${percentages.for}%` }}
                            ></div>
                            <div
                              className="h-full bg-red-500 float-right rounded-r-full"
                              style={{ width: `${percentages.against}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {selectedProposal?.id === proposal.id && (
                          <div className="mt-4">
                            <div className="border-t border-border pt-4 flex justify-between">
                              {proposal.userVote ? (
                                <div className="text-sm flex items-center text-muted-foreground">
                                  You voted {proposal.userVote === 'for' ? (
                                    <span className="flex items-center text-green-500 ml-1">
                                      <ThumbsUp className="h-3 w-3 mr-1" /> For
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-red-500 ml-1">
                                      <ThumbsDown className="h-3 w-3 mr-1" /> Against
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-24"
                                    disabled={!canVote(proposal) || voting}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      vote(proposal.id, 'against');
                                    }}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                    Against
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-24"
                                    disabled={!canVote(proposal) || voting}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      vote(proposal.id, 'for');
                                    }}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    For
                                  </Button>
                                </div>
                              )}
                              <div className="flex items-center text-sm">
                                <VoteIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {formatNumber(proposal.votesFor + proposal.votesAgainst, 0)} votes
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Transaction Status */}
                  <TransactionStatus
                    txHash={txHash}
                    loading={voting}
                    title="Vote Submitted"
                    description={selectedProposal 
                      ? `Successfully voted on proposal "${selectedProposal.title}"`
                      : 'Your vote has been recorded'
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <VoteIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Active Proposals</h3>
                  <p className="text-muted-foreground">There are currently no active proposals to vote on.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="closed">
              {closedProposals.length > 0 ? (
                <div className="space-y-4">
                  {closedProposals.map((proposal) => {
                    const percentages = calculatePercentage(proposal);
                    
                    return (
                      <div
                        key={proposal.id}
                        className="p-4 border border-border rounded-lg bg-secondary/20"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">#{proposal.id}: {proposal.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                          </div>
                          <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                            proposal.result === 'passed' 
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {proposal.result === 'passed' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {proposal.result === 'passed' ? 'Passed' : 'Failed'}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>For: {formatNumber(proposal.votesFor, 0)}</span>
                            <span>Against: {formatNumber(proposal.votesAgainst, 0)}</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 float-left rounded-l-full"
                              style={{ width: `${percentages.for}%` }}
                            ></div>
                            <div
                              className="h-full bg-red-500 float-right rounded-r-full"
                              style={{ width: `${percentages.against}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {proposal.userVote && (
                          <div className="mt-4 pt-2 border-t border-border">
                            <div className="text-sm flex items-center text-muted-foreground">
                              You voted {proposal.userVote === 'for' ? (
                                <span className="flex items-center text-green-500 ml-1">
                                  <ThumbsUp className="h-3 w-3 mr-1" /> For
                                </span>
                              ) : (
                                <span className="flex items-center text-red-500 ml-1">
                                  <ThumbsDown className="h-3 w-3 mr-1" /> Against
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <VoteIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Closed Proposals</h3>
                  <p className="text-muted-foreground">There are no closed proposals yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceInterface;
