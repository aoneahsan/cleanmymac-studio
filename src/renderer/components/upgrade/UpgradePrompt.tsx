import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Button } from '@renderer/components/ui/button';
import { Badge } from '@renderer/components/ui/badge';
import { Dialog, DialogContent } from '@renderer/components/ui/dialog';
import { Crown, Zap, Shield, Clock, ChevronRight } from 'lucide-react';
import { RequestProForm } from './RequestProForm';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  features?: string[];
  compact?: boolean;
}

export function UpgradePrompt({ 
  title = "Unlock Pro Features",
  description = "Get unlimited access to all features and maximize your Mac's performance",
  features = [
    "Unlimited cleanup (no 500MB limit)",
    "Advanced system optimization",
    "Priority support",
    "Scheduled automatic cleanup"
  ],
  compact = false
}: UpgradePromptProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);

  if (compact) {
    return (
      <>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">Upgrade to Pro for unlimited access</span>
          </div>
          <Button 
            size="sm" 
            variant="gradient"
            onClick={() => setShowRequestForm(true)}
          >
            Upgrade Now
          </Button>
        </div>

        <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
          <DialogContent className="max-w-lg p-0">
            <RequestProForm 
              onSuccess={() => setShowRequestForm(false)}
              onCancel={() => setShowRequestForm(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Card className="card-vibrancy bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gradient-text">{title}</CardTitle>
            <Badge variant="premium" className="text-sm px-3 py-1">
              <Crown className="w-4 h-4 mr-1" />
              PRO
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const icons = [Zap, Shield, Clock, ChevronRight];
              const Icon = icons[index % icons.length];
              
              return (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm pt-2">{feature}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-3">
            <Button 
              size="lg" 
              variant="gradient"
              className="flex-1"
              onClick={() => setShowRequestForm(true)}
            >
              <Crown className="mr-2 h-4 w-4" />
              Request Pro Access
            </Button>
          </div>
          
          <p className="text-center text-xs text-gray-500">
            No automatic charges • We'll contact you with options
          </p>
        </CardContent>
      </Card>

      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-lg p-0">
          <RequestProForm 
            onSuccess={() => setShowRequestForm(false)}
            onCancel={() => setShowRequestForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}