import React from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useRegister } from '../hooks/useRegister';

export function RegisterForm() {
  const { handleSubmit, register, errors, isLoading } = useRegister();

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Create an Account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Username"
          icon={<User className="w-5 h-5" />}
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Email"
          type="email"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          icon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Input
          label="Handicap"
          type="number"
          step="0.1"
          min={-10}
          max={54}
          error={errors.handicap?.message}
          {...register('handicap', { 
            valueAsNumber: true,
            setValueAs: v => v === '' ? null : parseFloat(v)
          })}
        />

        <label className="flex items-start">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 text-accent focus:ring-accent"
            {...register('terms')}
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms" className="text-accent hover:text-accent/80">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-accent hover:text-accent/80">
              Privacy Policy
            </a>
          </span>
        </label>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-accent hover:text-accent/80">
          Sign in
        </a>
      </p>
    </div>
  );
}