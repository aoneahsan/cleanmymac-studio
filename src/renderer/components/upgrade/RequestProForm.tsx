import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import { Textarea } from '@renderer/components/ui/textarea';
import { Select } from '@renderer/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group';
import { Badge } from '@renderer/components/ui/badge';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { Crown, MessageCircle, Phone, Mail, Send, Loader2, CheckCircle } from 'lucide-react';
import { useProRequest } from '@renderer/hooks/useProRequest';

interface RequestProFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RequestProForm({ onSuccess, onCancel }: RequestProFormProps) {
  const { submitRequest, isSubmitting } = useProRequest();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    country: '',
    preferredContact: 'email' as 'email' | 'phone' | 'whatsapp',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await submitRequest(formData);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-md w-full mx-auto">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-semibold">Request Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We'll contact you within 24 hours with Pro plan options.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg w-full mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Request Pro Plan Access</CardTitle>
          <Badge variant="premium">
            <Crown className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        </div>
        <CardDescription>
          Fill out the form below and we'll contact you with Pro plan options
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email - Required */}
          <div className="space-y-2">
            <Label htmlFor="pro-email">Email *</Label>
            <Input
              id="pro-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="pro-phone">Phone Number</Label>
            <div className="flex gap-2">
              <Select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-[140px]"
                disabled={isSubmitting}
              >
                <option value="">Country</option>
                <option value="+1">🇺🇸 USA (+1)</option>
                <option value="+44">🇬🇧 UK (+44)</option>
                <option value="+91">🇮🇳 India (+91)</option>
                <option value="+86">🇨🇳 China (+86)</option>
                <option value="+81">🇯🇵 Japan (+81)</option>
                <option value="+49">🇩🇪 Germany (+49)</option>
                <option value="+33">🇫🇷 France (+33)</option>
                <option value="+61">🇦🇺 Australia (+61)</option>
              </Select>
              <Input
                id="pro-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="123-456-7890"
                className="flex-1"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="pro-whatsapp">WhatsApp Number</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pro-whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                placeholder="WhatsApp number (if different)"
                className="flex-1"
                disabled={isSubmitting}
              />
              <Badge variant="outline" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Optional
              </Badge>
            </div>
          </div>
          
          {/* Preferred Contact Method */}
          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <RadioGroup 
              value={formData.preferredContact} 
              onValueChange={(v) => setFormData({...formData, preferredContact: v as any})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" />
                <Label htmlFor="pref-email" className="flex items-center cursor-pointer">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" />
                <Label htmlFor="pref-phone" className="flex items-center cursor-pointer">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" />
                <Label htmlFor="pref-whatsapp" className="flex items-center cursor-pointer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="pro-message">Additional Information</Label>
            <Textarea
              id="pro-message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Tell us about your needs (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Pro Plan Request
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          We'll contact you within 24 hours with Pro plan options
        </p>
      </CardContent>
    </Card>
  );
}