import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, Database, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: <Database className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Information You Provide',
          items: [
            'Account information (name, email address)',
            'License and subscription information',
            'Support requests and feedback',
            'Payment information (processed securely by third-party providers)',
          ],
        },
        {
          subtitle: 'Information Collected Automatically',
          items: [
            'Application usage statistics',
            'System information for compatibility',
            'Crash reports and error logs',
            'Performance metrics',
          ],
        },
      ],
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: <Eye className="w-6 h-6" />,
      content: [
        {
          subtitle: 'We use your information to:',
          items: [
            'Provide and improve CleanMyMac Pro+ services',
            'Process transactions and send related information',
            'Send technical notices and support messages',
            'Respond to your comments and questions',
            'Analyze usage patterns to improve our application',
            'Detect and prevent fraud or technical issues',
          ],
        },
      ],
    },
    {
      id: 'data-protection',
      title: 'Data Protection',
      icon: <Lock className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'End-to-end encryption for sensitive data',
            'Secure HTTPS connections for all communications',
            'Regular security audits and updates',
            'Limited access to personal information by employees',
            'Compliance with industry security standards',
          ],
        },
      ],
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      icon: <Globe className="w-6 h-6" />,
      content: [
        {
          subtitle: 'We do not sell your personal information',
          items: [
            'Service providers who assist in our operations',
            'Legal requirements and law enforcement requests',
            'Protection of rights and safety',
            'Business transfers or acquisitions (with notice)',
          ],
        },
      ],
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: <CheckCircle className="w-6 h-6" />,
      content: [
        {
          subtitle: 'You have the right to:',
          items: [
            'Access your personal information',
            'Correct inaccurate information',
            'Request deletion of your data',
            'Opt-out of marketing communications',
            'Export your data in a portable format',
            'Lodge a complaint with supervisory authorities',
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Mail className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Data Protection Officer',
          items: [
            'Email: privacy@cleanmymacpro.com',
            'Phone: +92 304 661 9706',
            'Address: Privacy Department, CleanMyMac Pro+',
            'Response time: Within 30 days',
          ],
        },
      ],
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
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="shadow-xl">
          <div className="p-8">
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              At CleanMyMac Pro+, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our macOS application. Please read 
              this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the application.
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
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                </div>
                
                {section.content.map((subsection, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      {subsection.subtitle}
                    </h3>
                    <ul className="space-y-2">
                      {subsection.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
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

        {/* Data Retention */}
        <Card className="shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Data Retention
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your personal information only for as long as necessary to provide you with our services 
              and as described in this Privacy Policy. However, we may also be required to retain this information 
              to comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  Account data: Retained for the duration of your account
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  Usage analytics: Anonymized after 90 days
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  Support tickets: Retained for 2 years
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              CleanMyMac Pro+ is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are under 13, please do not provide any 
              information to us.
            </p>
          </div>
        </Card>

        {/* Updates */}
        <Card className="shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Policy Updates
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
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
            label="Contact Us"
            icon="pi pi-envelope"
            severity="info"
            onClick={() => navigate({ to: '/contact' })}
          />
        </div>

        {/* Developer Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
          <p>Developed by Ahsan Mahmood</p>
          <p>
            <a 
              href="https://linkedin.com/in/aoneahsan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              linkedin.com/in/aoneahsan
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}