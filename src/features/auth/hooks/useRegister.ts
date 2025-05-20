import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/shared/Toast/useToast';
import { registerSchema } from '../schemas';
import { useAuth } from './useAuth';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export function useRegister() {
  const { addToast } = useToast();
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const handleSubmit = handleFormSubmit(async (data) => {
    try {
      await registerUser(data);
      addToast('success', 'Account created successfully!');
    } catch (error) {
      addToast('error', 'Failed to create account');
    }
  });

  return {
    register,
    handleSubmit,
    errors,
    isLoading: isSubmitting
  };
}