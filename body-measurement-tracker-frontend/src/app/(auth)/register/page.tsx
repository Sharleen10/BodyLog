import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Register - Body Measurement Tracker',
  description: 'Create a new account',
}

export default function RegisterPage() {
  return <RegisterForm />
}