import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MultiverseTimekeeper } from '@/components/MultiverseTimekeeper';
import { Button } from '@/components/ui/button';
import { User, LogOut, LogIn } from 'lucide-react';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Floating Auth Button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant={user ? "outline" : "default"}
          size="sm"
          onClick={handleAuthAction}
          disabled={loading}
          className="gap-2 bg-black/40 backdrop-blur-md border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
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

      {/* User Info */}
      {user && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 text-sm text-cyan-300 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
      )}

      {/* Main Content */}
      <main>
        <MultiverseTimekeeper />
      </main>
    </div>
  );
};

export default Index;
