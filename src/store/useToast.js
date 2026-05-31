import { create } from 'zustand';

// Lightweight toast notification store (replaces window.alert).
// Usage: import { toast } from '../store/useToast'; toast.success('Done');
let counter = 0;

export const useToast = create((set, get) => ({
  toasts: [],
  push: ({ message, type = 'info', duration = 4000 }) => {
    const id = ++counter;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers usable outside React components.
export const toast = {
  success: (message) => useToast.getState().push({ message, type: 'success' }),
  error: (message) => useToast.getState().push({ message, type: 'error', duration: 6000 }),
  info: (message) => useToast.getState().push({ message, type: 'info' }),
};
