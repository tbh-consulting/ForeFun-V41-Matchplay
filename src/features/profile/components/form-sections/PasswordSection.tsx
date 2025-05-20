import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { ProfileFormSection } from '../ProfileFormSection';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      addToast('error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      addToast('error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);

      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword
      });

      if (signInError) {
        addToast('error', 'Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      addToast('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      addToast('error', 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileFormSection title="Change Password">
      <div className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          icon={<Lock className="w-5 h-5" />}
        />
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          icon={<Lock className="w-5 h-5" />}
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          icon={<Lock className="w-5 h-5" />}
        />
        <Button
          onClick={handlePasswordChange}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          Update Password
        </Button>
      </div>
    </ProfileFormSection>
  );
}