/**
 * Theme Initialization Script
 *
 * Prevents flash of unstyled content (FOUC) by applying theme before React hydration
 * This script should be inlined in the <head> tag
 */

export const themeInitScript = `
(function() {
  try {
    const storageKey = 'dynamic-website-theme';
    const theme = localStorage.getItem(storageKey) || 'system';

    const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

    // Apply theme class immediately
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.setAttribute('data-theme', resolvedTheme);

    // Apply CSS custom properties
    const tokens = resolvedTheme === 'dark' ? {
      '--color-primary': '#00C8FF',
      '--color-secondary': '#0A1930',
      '--color-accent': '#AA6C39',
      '--color-success': '#22C55E',
      '--color-error': '#EF4444',
      '--color-warning': '#FBBF24',
      '--color-info': '#38BDF8',
      '--color-background': '#0A1930',
      '--color-foreground': '#F9FAFB',
      '--color-muted': '#9CA3AF',
      '--color-border': '#374151',
    } : {
      '--color-primary': '#00C8FF',
      '--color-secondary': '#0A1930',
      '--color-accent': '#AA6C39',
      '--color-success': '#198038',
      '--color-error': '#DA1E28',
      '--color-warning': '#F59E0B',
      '--color-info': '#00C8FF',
      '--color-background': '#FFFFFF',
      '--color-foreground': '#111827',
      '--color-muted': '#6B7280',
      '--color-border': '#E5E7EB',
    };

    Object.entries(tokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  } catch (e) {
    console.error('Theme initialization failed:', e);
  }
})();
`
