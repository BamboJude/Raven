'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/components/LanguageProvider';
import { ChevronRight, Globe, LogOut, User } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  userEmail?: string;
  userName?: string;
}

export function DashboardHeader({ breadcrumbs = [], userEmail, userName }: DashboardHeaderProps) {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const handleLogout = () => {
    // Clear session and redirect to login
    localStorage.removeItem('supabase.auth.token');
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'fr' : 'en');
  };

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : userEmail
    ? userEmail[0].toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          <a
            href="/dashboard"
            className="text-gray-500 hover:text-navy-900 transition-colors"
          >
            {t('dashboard')}
          </a>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {item.href ? (
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-navy-900 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-medium text-navy-900">{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-gray-600 hover:text-navy-900"
          >
            <Globe className="h-4 w-4 mr-2" />
            {lang === 'en' ? 'FR' : 'EN'}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-navy-100">
                  <AvatarFallback className="bg-navy-100 text-navy-900 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  {userName && <p className="text-sm font-medium">{userName}</p>}
                  {userEmail && (
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
