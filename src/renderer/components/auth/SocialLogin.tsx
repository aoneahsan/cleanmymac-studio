import React from 'react';
import { Button } from '@renderer/components/ui/button';
import { Chrome, Apple } from 'lucide-react';

interface SocialLoginProps {
  onSuccess: () => void;
}

export function SocialLogin({ onSuccess }: SocialLoginProps) {
  const handleGoogleLogin = async () => {
    // TODO: Implement Google login
    console.log('Google login not implemented yet');
  };

  const handleAppleLogin = async () => {
    // TODO: Implement Apple login
    console.log('Apple login not implemented yet');
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAppleLogin}
      >
        <Apple className="mr-2 h-4 w-4" />
        Continue with Apple
      </Button>
    </div>
  );
}