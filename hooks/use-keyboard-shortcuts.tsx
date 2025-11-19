'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

const shortcuts: ShortcutConfig[] = [
  {
    key: 'n',
    ctrl: true,
    description: 'New Analysis',
    action: () => {},
  },
  {
    key: 'd',
    ctrl: true,
    description: 'Dashboard',
    action: () => {},
  },
  {
    key: 'a',
    ctrl: true,
    shift: true,
    description: 'All Deals',
    action: () => {},
  },
  {
    key: 's',
    ctrl: true,
    shift: true,
    description: 'Settings',
    action: () => {},
  },
];

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => {
        const keyMatch = s.key.toLowerCase() === e.key.toLowerCase();
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = s.alt ? e.altKey : !e.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        e.preventDefault();

        // Execute navigation
        if (shortcut.key === 'n' && shortcut.ctrl) {
          router.push('/analyze');
        } else if (shortcut.key === 'd' && shortcut.ctrl) {
          router.push('/dashboard');
        } else if (shortcut.key === 'a' && shortcut.ctrl && shortcut.shift) {
          router.push('/deals');
        } else if (shortcut.key === 's' && shortcut.ctrl && shortcut.shift) {
          router.push('/settings');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return shortcuts;
}

export function KeyboardShortcutsHelp() {
  const shortcuts = useKeyboardShortcuts();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
      <div className="space-y-1 text-sm">
        {shortcuts.map((shortcut, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-muted-foreground">{shortcut.description}</span>
            <kbd className="px-2 py-1 text-xs bg-muted border rounded">
              {shortcut.ctrl && 'Ctrl + '}
              {shortcut.shift && 'Shift + '}
              {shortcut.alt && 'Alt + '}
              {shortcut.key.toUpperCase()}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
