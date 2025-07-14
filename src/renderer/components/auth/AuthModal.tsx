import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { SocialLogin } from './SocialLogin';
import { usePreAuthStore } from '@renderer/stores/preAuthStore';
import { formatBytes } from '@renderer/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const { scanResults } = usePreAuthStore();

  const handleSuccess = () => {
    onClose();
    // Navigate to dashboard after successful auth
    window.location.href = '/dashboard';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Login to your account to continue' 
              : 'Sign up to start cleaning your Mac'}
          </DialogDescription>
        </DialogHeader>

        {scanResults && (
          <Alert className="my-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              We'll save your scan results. Clean {formatBytes(scanResults.totalSpace)} 
              right after you {mode === 'login' ? 'login' : 'sign up'}!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {mode === 'login' ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <SignupForm onSuccess={handleSuccess} />
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SocialLogin onSuccess={handleSuccess} />

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}