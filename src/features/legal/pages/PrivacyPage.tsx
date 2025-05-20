import React from 'react';
import { Mail, Shield, Database, UserX, Lock } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Privacy Policy
        </h1>

        <p className="text-lg text-gray-600 mb-12 text-center">
          At ForeFun Golf, we prioritize your privacy. Here's what you should know about how we handle your information.
        </p>

        {/* Privacy Sections */}
        <div className="space-y-8">
          <PrivacySection
            icon={Database}
            title="Basic User Information"
            description="We collect minimal information, such as your name and email, to help you manage your account and connect with friends."
          />

          <PrivacySection
            icon={Shield}
            title="Data Usage"
            description="Your data is used only to provide the app's features and improve your experience. We do not sell or share your data with third parties."
          />

          <PrivacySection
            icon={UserX}
            title="Account Deletion"
            description={
              <>
                If you wish to delete your account and associated data, simply email us at{' '}
                <a 
                  href="mailto:info@forefun.golf" 
                  className="text-accent hover:text-accent/80 inline-flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  info@forefun.golf
                </a>
                , and we'll handle your request promptly.
              </>
            }
          />

          <PrivacySection
            icon={Lock}
            title="Secure Storage"
            description="We take appropriate measures to ensure your data is stored securely."
          />
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            By using ForeFun Golf, you agree to this simple and transparent approach to privacy. 
            If you have any questions or concerns, feel free to reach out to us at{' '}
            <a 
              href="mailto:info@forefun.golf" 
              className="text-accent hover:text-accent/80 inline-flex items-center"
            >
              <Mail className="w-4 h-4 mr-1" />
              info@forefun.golf
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

interface PrivacySectionProps {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
}

function PrivacySection({ icon: Icon, title, description }: PrivacySectionProps) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-6 h-6 text-accent" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}