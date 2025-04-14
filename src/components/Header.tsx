
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Droplets, CoinsIcon, VoteIcon, LayoutDashboard, Menu, X } from "lucide-react";
import WalletConnect from './WalletConnect';

const Header = () => {
  const location = useLocation();
  const { isConnected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const routes = [
    { path: '/swap', label: 'Swap', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { path: '/liquidity', label: 'Liquidity', icon: <Droplets className="h-4 w-4" /> },
    { path: '/staking', label: 'Staking', icon: <CoinsIcon className="h-4 w-4" /> },
    { path: '/governance', label: 'Governance', icon: <VoteIcon className="h-4 w-4" /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="border-b border-border bg-dex-dark/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-6">
            <span className="font-bold text-xl dex-gradient-text">MegaSwap</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`px-3 py-2 text-sm rounded-md flex items-center space-x-1 transition-colors
                  ${
                    location.pathname === route.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {route.icon}
                <span>{route.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Wallet */}
        <div className="flex items-center space-x-2">
          <WalletConnect />
          
          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-dex-dark/95 backdrop-blur-sm">
          <nav className="flex flex-col p-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`px-4 py-3 rounded-md flex items-center space-x-2 transition-colors
                  ${
                    location.pathname === route.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {route.icon}
                <span>{route.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
