'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Home,
  Activity,
  User,
  Settings,
  BarChart3,
  Calendar,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SidebarProps {
  className?: string
}

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Measurements',
    icon: Activity,
    href: '/measurements',
    color: 'text-violet-500',
  },
  {
    label: 'Progress',
    icon: BarChart3,
    href: '/progress',
    color: 'text-pink-500',
  },
  {
    label: 'Goals',
    icon: Target,
    href: '/goals',
    color: 'text-orange-500',
  },
  {
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar',
    color: 'text-green-500',
  },
  {
    label: 'Profile',
    icon: User,
    href: '/profile',
    color: 'text-blue-500',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-500',
  },
]

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('space-y-4 py-4 flex flex-col h-full bg-card border-r', className)}>
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">BodyTracker</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                pathname === route.href && 'bg-secondary'
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}