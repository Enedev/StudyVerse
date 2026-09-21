import {
  BookOpen,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListTodo,
  Settings,
  Shapes,
  type LucideIcon,
} from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks', href: '/tasks', icon: ListTodo },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Whiteboards', href: '/whiteboards', icon: Shapes },
  { label: 'Library', href: '/library', icon: BookOpen },
  { label: 'Documents', href: '/documents', icon: FileText },
];

export const settingsItem: NavigationItem = {
  label: 'Settings',
  href: '/settings',
  icon: Settings,
};
