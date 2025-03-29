import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Home page component for the application
 */
const HomePage: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const securityFeatures = [
    {
      id: 'content-security',
      title: 'Content Security Policy',
      description: 'Strict CSP implementation to prevent XSS attacks and other code injection vulnerabilities.'
    },
    {
      id: 'secure-storage',
      title: 'Secure Storage',
      description: 'Encrypted storage for sensitive application data with secure key management.'
    },
    {
      id: 'network-safety',
      title: 'Safe Network Requests',
      description: 'Secure HTTP client with input validation, response validation, and timeouts.'
    },
    {
      id: 'resource-integrity',
      title: 'Resource Integrity',
      description: 'Verification of application resources to prevent tampering and ensure authenticity.'
    },
    {
      id: 'fs-security',
      title: 'File System Security',
      description: 'Secure file system access with path validation and permission checks.'
    }
  ];

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Tauri Security Boilerplate</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          A production-ready template for building secure, cross-platform desktop applications
          with Tauri, React, and TypeScript.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Security Features</h2>
          <ul className="space-y-4">
            {securityFeatures.map((feature) => (
              <li key={feature.id}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                    selectedFeature === feature.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <h3 className="font-medium">{feature.title}</h3>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Feature Details</h2>
          {selectedFeature ? (
            <div>
              <h3 className="text-xl font-bold mb-2">
                {securityFeatures.find(f => f.id === selectedFeature)?.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {securityFeatures.find(f => f.id === selectedFeature)?.description}
              </p>
              <div className="mt-6">
                <Link
                  to="/security"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Demo
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              Select a feature to view details
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md p-8 my-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Production</h2>
          <p className="text-xl mb-6">
            Start building your secure desktop application today with our battle-tested template.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100">
              Get Started
            </button>
            <a 
              href="https://github.com/tauri-apps/tauri" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 