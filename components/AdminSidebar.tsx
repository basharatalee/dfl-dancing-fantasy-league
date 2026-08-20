'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3, Users, Trophy, Settings, Home } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const adminLinks = [
    { href: '/admin', label: 'Admin Panel', icon: Home },
    { href: '/admin/contestants', label: 'Contestants', icon: Users },
    { href: '/admin/results', label: 'Results & Scoring', icon: BarChart3 },
    { href: '/admin/season', label: 'Season Management', icon: Trophy },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-serif font-bold text-primary">Admin Panel</h2>
        <p className="text-xs text-muted-foreground mt-1">{user?.name ?? user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full text-xs">
            Back to Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full text-xs text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
