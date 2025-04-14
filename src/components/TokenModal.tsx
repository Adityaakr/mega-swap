
import { useState } from 'react';
import { useTokens, Token } from '@/hooks/useTokens';
import { formatNumber } from '@/utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token | null;
  tokenType?: 'from' | 'to';
}

const TokenModal = ({ isOpen, onClose, onSelect, excludeToken, tokenType }: TokenModalProps) => {
  const { tokens, getBalance, prices } = useTokens();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tokens based on search and excluded token
  const filteredTokens = tokens.filter(token => {
    // Filter out the excluded token
    if (excludeToken && token.symbol === excludeToken.symbol) {
      return false;
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handle token selection
  const handleSelect = (token: Token) => {
    onSelect(token);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or symbol"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Token list */}
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-1">
            {filteredTokens.map((token) => {
              const balance = getBalance(token);
              const price = prices[token.symbol] || 0;
              
              return (
                <button
                  key={token.symbol}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => handleSelect(token)}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold mr-3">
                      {token.symbol.substring(0, 2)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(balance, 6)}</div>
                    <div className="text-xs text-muted-foreground">
                      ${formatNumber(balance * price, 2)}
                    </div>
                  </div>
                </button>
              );
            })}
            
            {filteredTokens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found matching "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TokenModal;
