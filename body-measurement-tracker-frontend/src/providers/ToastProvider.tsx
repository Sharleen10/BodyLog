'use client'

import { ToastProvider as RadixToastProvider } from '@/components/ui/Toast'
import { Toaster } from '@/components/ui/Toaster'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToastProvider>
      {children}
      <Toaster />
    </RadixToastProvider>
  )
}