import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@renderer/lib/firebase';
import type { ProRequest } from '@shared/types/user';

interface ProRequestData {
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  message?: string;
}

export function useProRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitRequest = async (formData: ProRequestData) => {
    setIsSubmitting(true);
    try {
      const submitProRequest = httpsCallable(functions, 'submitProRequest');
      const result = await submitProRequest(formData);
      
      return result.data;
    } catch (error) {
      console.error('Failed to submit pro request:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { submitRequest, isSubmitting };
}