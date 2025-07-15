import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { motion } from 'framer-motion';
import { Mail, Phone, Globe, MessageSquare, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';
import { useProgressiveAction } from '@renderer/hooks/useProgressiveAction';
import { showNotification } from '@renderer/lib/notifications';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { label: 'Technical Support', value: 'technical' },
    { label: 'Billing & Subscription', value: 'billing' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'Bug Report', value: 'bug' },
    { label: 'General Inquiry', value: 'general' },
    { label: 'Partnership', value: 'partnership' },
  ];

  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email',
      value: 'aoneahsan@gmail.com',
      description: 'For general inquiries and support',
      action: () => window.location.href = 'mailto:aoneahsan@gmail.com',
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Phone',
      value: '+92 304 661 9706',
      description: 'Available Mon-Fri, 9AM-5PM PST',
      action: () => window.location.href = 'tel:+923046619706',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'LinkedIn',
      value: 'linkedin.com/in/aoneahsan',
      description: 'Connect with the developer',
      action: () => window.open('https://linkedin.com/in/aoneahsan', '_blank'),
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = useProgressiveAction(
    async () => {
      if (!validateForm()) {
        throw new Error('Please fill in all required fields correctly');
      }
      
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would send this to your backend
      console.log('Form submitted:', formData);
      
      setSubmitted(true);
      showNotification('success', 'Your message has been sent successfully!');
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
        });
        setSubmitted(false);
      }, 5000);
    },
    {
      simulateProgress: true,
      successMessage: 'Message sent successfully!',
      errorMessage: 'Failed to send message',
    }
  );

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Card className="shadow-xl">
            <div className="p-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex p-6 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 mb-6"
              >
                <CheckCircle className="w-16 h-16 text-green-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Thank You!
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Your message has been sent successfully. We'll get back to you within 24-48 hours.
              </p>
              
              <Button
                label="Back to Dashboard"
                icon="pi pi-arrow-left"
                severity="secondary"
                onClick={() => navigate({ to: '/dashboard' })}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions about CleanMyMac Pro+? Need technical support? We're here to help! 
            Choose your preferred contact method or fill out the form below.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={method.action}
              >
                <div className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-4">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">{method.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Send us a Message
            </h2>
            
            <form onSubmit={(e) => { e.preventDefault(); submitForm.execute(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <InputText
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <small className="p-error">{errors.name}</small>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <InputText
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <small className="p-error">{errors.email}</small>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <InputText
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full ${errors.subject ? 'p-invalid' : ''}`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <small className="p-error">{errors.subject}</small>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <Dropdown
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.value)}
                    options={categories}
                    className={`w-full ${errors.category ? 'p-invalid' : ''}`}
                    placeholder="Select a category"
                  />
                  {errors.category && (
                    <small className="p-error">{errors.category}</small>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <InputTextarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className={`w-full ${errors.message ? 'p-invalid' : ''}`}
                  placeholder="Please describe your issue or question in detail..."
                  rows={6}
                />
                {errors.message && (
                  <small className="p-error">{errors.message}</small>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Message 
                  severity="info" 
                  text="We typically respond within 24-48 hours"
                  icon={() => <Clock className="w-5 h-5" />}
                />
                
                <div className="flex gap-4">
                  <Button
                    label="Cancel"
                    severity="secondary"
                    onClick={() => navigate({ to: '/dashboard' })}
                    type="button"
                  />
                  <Button
                    label="Send Message"
                    icon="pi pi-send"
                    severity="success"
                    type="submit"
                    loading={submitForm.isLoading}
                  />
                </div>
              </div>
            </form>
          </div>
        </Card>

        {/* FAQ Link */}
        <Card className="shadow-lg">
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Looking for quick answers?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Check out our frequently asked questions for instant help with common issues.
            </p>
            <Button
              label="View FAQ"
              icon="pi pi-question-circle"
              severity="info"
              onClick={() => navigate({ to: '/settings' })}
            />
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center pt-4">
          <Button
            label="Back to Dashboard"
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            onClick={() => navigate({ to: '/dashboard' })}
          />
        </div>
      </motion.div>
    </div>
  );
}