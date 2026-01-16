import { computed, watchEffect } from 'vue';
import { useSettings } from '../stores/settings';

const { settings, setTheme } = useSettings();

export const currentTheme = computed(() => settings.theme);

export function toggleTheme() {
  setTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(`theme-${currentTheme.value}`);
    }
  });

  return {
    theme: currentTheme,
    toggleTheme
  };
}
