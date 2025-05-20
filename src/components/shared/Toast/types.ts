export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}