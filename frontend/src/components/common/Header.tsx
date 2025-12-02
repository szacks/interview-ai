import type { FC } from 'react';
import type { User } from '../../stores/authStore';
import { Code2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: FC<HeaderProps> = ({ user, onLogout }) => {
  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">InterviewAI</h1>
              <p className="text-xs text-muted-foreground">Acme Inc.</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {user?.email ? getInitials(user.email) : 'U'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="size-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
