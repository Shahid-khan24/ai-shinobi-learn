import { Button } from "@/components/ui/button";
import { Brain, Home, TrendingUp, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50 bg-background/80" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label="AI Shinobi Home">
          <img 
            src={logo} 
            alt="AI Shinobi Logo" 
            className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_hsl(var(--primary))] group-hover:drop-shadow-[0_0_16px_hsl(var(--brand-orange))]"
            loading="eager"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-brand-orange bg-clip-text text-transparent group-hover:drop-shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-300">
            AI Shinobi
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6" role="menubar">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors" role="menuitem">
            Home
          </Link>
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors" role="menuitem">
            Dashboard
          </Link>
          <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors" role="menuitem">
            Profile
          </Link>
          <Link to="/quiz-history" className="text-sm font-medium hover:text-primary transition-colors" role="menuitem">
            History
          </Link>
          <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors" role="menuitem">
            Leaderboard
          </Link>
          <Link to="/trading" className="text-sm font-medium hover:text-primary transition-colors" role="menuitem">
            Trading
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">
                Welcome, {user.user_metadata?.display_name || user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;