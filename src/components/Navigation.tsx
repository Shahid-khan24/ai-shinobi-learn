import { Button } from "@/components/ui/button";
import { Brain, Home, TrendingUp, Settings, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">AI Shinobi</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/quiz-history" className="text-sm font-medium hover:text-primary transition-colors">
            History
          </Link>
          <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
            Leaderboard
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