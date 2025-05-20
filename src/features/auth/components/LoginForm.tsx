import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const { handleSubmit, register, errors, isLoading } = useLogin();

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Welcome Back
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-accent focus:ring-accent"
              {...register('remember')}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          
          <a 
            href="/forgot-password"
            className="text-sm text-accent hover:text-accent/80"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/register" className="text-accent hover:text-accent/80">
          Sign up
        </a>
      </p>
    </div>
  );
}