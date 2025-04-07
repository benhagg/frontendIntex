import React, { useState, useEffect } from 'react';
import { privacyService } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

interface PrivacySection {
  title: string;
  content: string;
}

interface PrivacyPolicy {
  title: string;
  lastUpdated: string;
  sections: PrivacySection[];
}

const Privacy: React.FC = () => {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const data = await privacyService.getPrivacyPolicy();
        setPolicy(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        toast.error('Failed to load privacy policy. Please try again later.');
        setIsLoading(false);
      }
    };

    // Check if cookie consent has been given
    const hasConsented = localStorage.getItem('cookieConsent') === 'true';
    setShowCookieConsent(!hasConsented);

    fetchPrivacyPolicy();
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieConsent(false);
    toast.success('Cookie preferences saved!');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!policy) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Privacy Policy Not Available</h2>
          <p>We're having trouble loading our privacy policy. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">{policy.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: {policy.lastUpdated}
        </p>

        <div className="space-y-8">
          {policy.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p>{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cookie Consent Banner */}
        {showCookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0 md:mr-4">
                <p>
                  This website uses cookies to ensure you get the best experience on our website. By
                  continuing to use this site, you consent to our use of cookies in accordance with
                  our Privacy Policy.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAcceptCookies}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Privacy;
