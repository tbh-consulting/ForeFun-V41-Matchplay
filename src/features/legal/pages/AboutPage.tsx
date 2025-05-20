import React from 'react';
import { Flag, Users, Map, Activity, Zap, Coins } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          About ForeFun Golf
        </h1>

        {/* Introduction */}
        <p className="text-lg text-gray-600 mb-12 text-center">
          Welcome to ForeFun Golf, the ultimate app for golf enthusiasts! 
          ForeFun Golf is designed to make your golfing experience more enjoyable and social.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FeatureCard
            icon={Flag}
            title="Create and Manage Scorecards"
            description="Effortlessly track your scores, add players, and customize game types like Stroke Play, Stableford, Scramble, and more."
          />
          
          <FeatureCard
            icon={Users}
            title="Connect with Friends"
            description="Add friends to your scorecards, share live updates, and collaborate on rounds in real time."
          />
          
          <FeatureCard
            icon={Map}
            title="Explore Golf Courses"
            description="Discover and manage golf courses, upload scorecards to create digital courses, and save your favorite spots."
          />
          
          <FeatureCard
            icon={Activity}
            title="Activity Feed"
            description="Share your rounds, scores, and achievements with friends and the wider community."
          />
          
          <FeatureCard
            icon={Zap}
            title="Real-Time Collaboration"
            description="Enjoy live score tracking and updates that keep everyone on the same page during a game."
          />
          
          <FeatureCard
            icon={Coins}
            title="100% Free, No Ads"
            description="ForeFun Golf is completely free to use with no ads, subscriptions, or hidden charges. We built this app purely for fun and to share our love for golf with others."
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}