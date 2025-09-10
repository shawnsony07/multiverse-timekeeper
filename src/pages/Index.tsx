import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MultiverseTimekeeper } from '@/components/MultiverseTimekeeper';
import { Button } from '@/components/ui/button';
import { User, LogOut, LogIn } from 'lucide-react';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (user) {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out action failed:', error);
        // The sign out function already handles errors internally, 
        // so this is just an extra safety net
      }
    } else {
      navigate('/auth');
    }
  };

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-foreground-secondary font-orbitron">Initializing Multiverse Timekeeper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sign In Button Only */}
      <header className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-white bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          
          <Button
            variant={user ? "outline" : "default"}
            size="sm"
            onClick={handleAuthAction}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-orbitron font-bold"
          >
            {user ? (
              <>
                <LogOut className="h-4 w-4" />
                Sign Out
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <MultiverseTimekeeper />
      </main>
    </div>
  );
};

export default Index;
