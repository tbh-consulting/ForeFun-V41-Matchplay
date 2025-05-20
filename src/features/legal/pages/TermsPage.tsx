import React from 'react';
import { Mail } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Terms of Service
        </h1>

        {/* Welcome Section */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            Welcome to ForeFun Golf! By using our app, you agree to the following simple terms:
          </p>

          {/* What We Do Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-gray-600">
              ForeFun Golf is a social app designed to help you manage your golf activities, 
              including creating scorecards, tracking games, connecting with friends, and 
              sharing your golfing experiences.
            </p>
          </section>

          {/* Responsibility Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Responsibility
            </h2>
            <p className="text-gray-600">
              Use the app respectfully and responsibly to enjoy its features and connect 
              with other users in the golfing community.
            </p>
          </section>

          {/* Data and Privacy Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Data and Privacy
            </h2>
            <p className="text-gray-600">
              We value your privacy. If you ever want to delete your account or have your 
              data removed, you can contact us at{' '}
              <a 
                href="mailto:info@forefun.golf" 
                className="text-accent hover:text-accent/80 inline-flex items-center"
              >
                <Mail className="w-4 h-4 mr-1" />
                info@forefun.golf
              </a>
              , and we will process your request promptly.
            </p>
          </section>

          {/* Feedback Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Feedback and Suggestions
            </h2>
            <p className="text-gray-600">
              We welcome your feedback to improve the app. Feel free to share your suggestions 
              via the same email address:{' '}
              <a 
                href="mailto:info@forefun.golf" 
                className="text-accent hover:text-accent/80 inline-flex items-center"
              >
                <Mail className="w-4 h-4 mr-1" />
                info@forefun.golf
              </a>
            </p>
          </section>

          {/* Thank You Note */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              Thank you for being a part of the ForeFun Golf community. 
              Enjoy your time on the course!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}