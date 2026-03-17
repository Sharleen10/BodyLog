'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'
import {
  Home,
  Activity,
  User,
  Settings,
  BarChart3,
  Calendar,
  Target,
  X,
} from 'lucide-react'

interface MobileNavProps {
  open: boolean
  onClose: () => void
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

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">BodyTracker</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="mt-4 space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                pathname === route.href && 'bg-secondary'
              )}
              asChild
              onClick={onClose}
            >
              <Link href={route.href}>
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}