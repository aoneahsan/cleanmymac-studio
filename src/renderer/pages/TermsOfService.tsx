import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle, Ban, DollarSign, Scale, Globe, CheckCircle } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';

export function TermsOfService() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: <FileText className="w-6 h-6" />,
      content: `By downloading, installing, or using CleanMyMac Pro+ ("the Application"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Application.`,
    },
    {
      id: 'license',
      title: '2. License Grant',
      icon: <Shield className="w-6 h-6" />,
      content: `Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use CleanMyMac Pro+ for your personal, non-commercial use on devices you own or control.`,
      subsections: [
        {
          title: 'License Restrictions',
          items: [
            'You may not copy, modify, or distribute the Application',
            'You may not reverse engineer or attempt to extract source code',
            'You may not rent, lease, or sublicense the Application',
            'You may not use the Application for illegal purposes',
            'You must comply with all applicable laws and regulations',
          ],
        },
      ],
    },
    {
      id: 'subscription',
      title: '3. Subscription and Payment',
      icon: <DollarSign className="w-6 h-6" />,
      content: `CleanMyMac Pro+ offers both free and premium subscription plans. Premium features require an active subscription.`,
      subsections: [
        {
          title: 'Billing Terms',
          items: [
            'Subscriptions automatically renew unless cancelled',
            'Payment is charged at confirmation of purchase',
            'Prices may vary by region and are subject to change',
            'Refunds are subject to App Store policies',
            'You are responsible for all applicable taxes',
          ],
        },
      ],
    },
    {
      id: 'prohibited',
      title: '4. Prohibited Uses',
      icon: <Ban className="w-6 h-6" />,
      content: `You agree not to use CleanMyMac Pro+ to:`,
      subsections: [
        {
          items: [
            'Violate any laws or regulations',
            'Infringe on intellectual property rights',
            'Transmit malware or harmful code',
            'Interfere with or disrupt the Application',
            'Attempt unauthorized access to systems',
            'Engage in any fraudulent activities',
            'Collect user information without consent',
          ],
        },
      ],
    },
    {
      id: 'disclaimer',
      title: '5. Disclaimer of Warranties',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: `THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.`,
      subsections: [
        {
          title: 'We do not warrant that:',
          items: [
            'The Application will meet all your requirements',
            'The Application will be uninterrupted or error-free',
            'All defects will be corrected',
            'The Application is free of viruses or harmful components',
            'Results obtained will be accurate or reliable',
          ],
        },
      ],
    },
    {
      id: 'limitation',
      title: '6. Limitation of Liability',
      icon: <Scale className="w-6 h-6" />,
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.`,
      subsections: [
        {
          title: 'Our total liability shall not exceed:',
          items: [
            'The amount paid by you for the Application in the 12 months preceding the claim',
            'One hundred dollars ($100) if you have not made any payments',
          ],
        },
      ],
    },
    {
      id: 'indemnification',
      title: '7. Indemnification',
      icon: <Shield className="w-6 h-6" />,
      content: `You agree to indemnify, defend, and hold harmless CleanMyMac Pro+, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of the Application or violation of these Terms.`,
    },
    {
      id: 'termination',
      title: '8. Termination',
      icon: <Ban className="w-6 h-6" />,
      content: `We may terminate or suspend your access to the Application immediately, without prior notice or liability, for any reason, including breach of these Terms.`,
      subsections: [
        {
          title: 'Upon termination:',
          items: [
            'Your right to use the Application will cease immediately',
            'You must delete all copies of the Application',
            'All provisions that should survive will remain in effect',
          ],
        },
      ],
    },
    {
      id: 'governing',
      title: '9. Governing Law',
      icon: <Globe className="w-6 h-6" />,
      content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the developer resides, without regard to its conflict of law provisions.`,
    },
    {
      id: 'changes',
      title: '10. Changes to Terms',
      icon: <FileText className="w-6 h-6" />,
      content: `We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Application after changes constitutes acceptance of the modified Terms.`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 mb-4">
            <FileText className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="shadow-xl">
          <div className="p-8">
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Welcome to CleanMyMac Pro+. These Terms of Service govern your use of our macOS application 
              developed by Ahsan Mahmood. By using CleanMyMac Pro+, you agree to these terms in full. 
              If you disagree with any part of these terms, you must not use our application.
            </p>
          </div>
        </Card>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {section.content}
                </p>
                
                {section.subsections?.map((subsection, idx) => (
                  <div key={idx} className="mt-4">
                    {'title' in subsection && subsection.title && (
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        {subsection.title}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {subsection.items?.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Contact Information */}
        <Card className="shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              11. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  Email: aoneahsan@gmail.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  Phone: +92 304 661 9706
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  LinkedIn: linkedin.com/in/aoneahsan
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Agreement */}
        <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800">
          <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Your Agreement
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              By using CleanMyMac Pro+, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms of Service and our Privacy Policy.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                label="I Agree"
                icon="pi pi-check"
                severity="success"
                onClick={() => navigate({ to: '/dashboard' })}
              />
              <Button
                label="View Privacy Policy"
                icon="pi pi-shield"
                severity="info"
                onClick={() => navigate({ to: '/privacy-policy' })}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-8">
          <Button
            label="Back to App"
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => navigate({ to: '/dashboard' })}
          />
          <Button
            label="Contact Support"
            icon="pi pi-envelope"
            severity="info"
            onClick={() => navigate({ to: '/contact' })}
          />
        </div>

        {/* Developer Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
          <p>&copy; 2025 CleanMyMac Pro+ by Ahsan Mahmood. All rights reserved.</p>
          <p>App ID: com.zaions.cleanmymac_pro_plus</p>
        </div>
      </motion.div>
    </div>
  );
}