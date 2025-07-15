import React from 'react';
import { Search, Shield, Zap, HardDrive } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { Card } from '@renderer/components/ui/card';

interface WelcomeHeroProps {
  onStartScan: () => void;
}

export function WelcomeHero({ onStartScan }: WelcomeHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 animate-in">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2rem] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <HardDrive className="w-14 h-14 text-white" />
            </div>
          </div>
          
          <h1 className="text-7xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">CleanMyMac</span>
            <span className="text-foreground"> Pro+</span>
          </h1>
          
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Is Your Mac Running Slow? Free Up Space in Minutes
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={onStartScan}
            className="text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            variant="gradient"
          >
            <Search className="mr-3 h-6 w-6" />
            Analyze My Mac for Free
          </Button>
          
          <p className="text-sm text-muted-foreground/70">
            No account required • 100% safe • Read-only analysis
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="card-vibrancy p-8 hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">100% Safe</h3>
              <p className="text-sm text-muted-foreground text-center">
                Read-only scan, never deletes without permission
              </p>
            </div>
          </Card>

          <Card className="card-vibrancy p-8 hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground text-center">
                Complete system scan in under 60 seconds
              </p>
            </div>
          </Card>

          <Card className="card-vibrancy p-8 hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardDrive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Deep Analysis</h3>
              <p className="text-sm text-muted-foreground text-center">
                Finds hidden junk files taking up space
              </p>
            </div>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center flex-wrap gap-6 text-sm text-muted-foreground mt-12">
          <span className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✓</span> No credit card required
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✓</span> Works on macOS 10.15+
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✓</span> Privacy focused
          </span>
        </div>
      </div>
    </div>
  );
}