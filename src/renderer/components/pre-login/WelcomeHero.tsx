import React from 'react';
import { Search, Shield, Zap, HardDrive } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { Card } from '@renderer/components/ui/card';

interface WelcomeHeroProps {
  onStartScan: () => void;
}

export function WelcomeHero({ onStartScan }: WelcomeHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <HardDrive className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            CleanMyMac Pro+
          </h1>
          
          <p className="text-2xl text-gray-600 dark:text-gray-400">
            Is Your Mac Running Slow? Free Up Space in Minutes
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={onStartScan}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200"
            variant="gradient"
          >
            <Search className="mr-3 h-5 w-5" />
            Analyze My Mac for Free
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            No account required • 100% safe • Read-only analysis
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center space-y-3">
              <Shield className="w-10 h-10 text-green-500" />
              <h3 className="font-semibold text-lg">100% Safe</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Read-only scan, never deletes without permission
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center space-y-3">
              <Zap className="w-10 h-10 text-yellow-500" />
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Complete system scan in under 60 seconds
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center space-y-3">
              <HardDrive className="w-10 h-10 text-blue-500" />
              <h3 className="font-semibold text-lg">Deep Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Finds hidden junk files taking up space
              </p>
            </div>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mt-8">
          <span>✓ No credit card required</span>
          <span>✓ Works on macOS 10.15+</span>
          <span>✓ Privacy focused</span>
        </div>
      </div>
    </div>
  );
}