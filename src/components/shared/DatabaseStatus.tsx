import React from 'react';
import { Database, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useSupabaseStatus } from '@/hooks/useSupabaseStatus';

export function DatabaseStatus() {
  const { isConfigured, isConnected, isLoading } = useSupabaseStatus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Checking connection...</span>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 text-amber-500">
        <AlertCircle className="w-4 h-4" />
        <span>Database not configured</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <span>Connection failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-500">
      <CheckCircle className="w-4 h-4" />
      <span>Connected</span>
    </div>
  );
}