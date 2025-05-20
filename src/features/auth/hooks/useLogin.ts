import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/shared/Toast/useToast';
import { loginSchema } from '../schemas';
import { useAuth } from './useAuth';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export function useLogin() {
  const { addToast } = useToast();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const handleSubmit = handleFormSubmit(async (data) => {
    try {
      await login(data);
      addToast('success', 'Successfully logged in!');
    } catch (error) {
      addToast('error', 'Invalid email or password');
    }
  });

  return {
    register,
    handleSubmit,
    errors,
    isLoading: isSubmitting
  };
}