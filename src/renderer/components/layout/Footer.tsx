import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { motion } from 'framer-motion';
import { Shield, FileText, Mail, Globe, Heart } from 'lucide-react';
import { t } from '@renderer/lib/i18n-simple';

export function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy-policy', icon: 'pi pi-shield' },
        { label: 'Terms of Service', path: '/terms-of-service', icon: 'pi pi-file' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', path: '/contact', icon: 'pi pi-envelope' },
        { label: 'FAQ', path: '/settings', icon: 'pi pi-question-circle' },
      ],
    },
    {
      title: 'Product',
      links: [
        { label: 'Features', path: '/dashboard', icon: 'pi pi-star' },
        { label: 'Pricing', path: '/upgrade', icon: 'pi pi-tag' },
      ],
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-auto"
    >
      <Divider className="mt-8 mb-0" />
      
      <div className="bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  CleanMyMac Pro+
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The ultimate Mac cleaning and optimization tool. Keep your Mac running like new.
              </p>
              <div className="flex gap-2">
                <Button
                  icon="pi pi-linkedin"
                  severity="secondary"
                  text
                  rounded
                  onClick={() => window.open('https://linkedin.com/in/aoneahsan', '_blank')}
                  tooltip="LinkedIn"
                />
                <Button
                  icon="pi pi-envelope"
                  severity="secondary"
                  text
                  rounded
                  onClick={() => window.location.href = 'mailto:aoneahsan@gmail.com'}
                  tooltip="Email"
                />
              </div>
            </div>

            {/* Links */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <button
                        onClick={() => {
                          if (link.path === '/settings') {
                            navigate({ to: '/settings' });
                          } else if (link.path === '/privacy-policy') {
                            navigate({ to: '/privacy-policy' });
                          } else if (link.path === '/terms-of-service') {
                            navigate({ to: '/terms-of-service' });
                          } else if (link.path === '/contact') {
                            navigate({ to: '/contact' });
                          } else if (link.path === '/dashboard') {
                            navigate({ to: '/dashboard' });
                          } else if (link.path === '/upgrade') {
                            navigate({ to: '/upgrade' });
                          }
                        }}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2"
                      >
                        <i className={link.icon} />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Divider />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>&copy; {currentYear} CleanMyMac Pro+</span>
              <span>•</span>
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>com.zaions.cleanmymac_pro_plus</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>by</span>
              <a 
                href="https://linkedin.com/in/aoneahsan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                Ahsan Mahmood
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}