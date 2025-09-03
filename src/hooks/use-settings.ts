
"use client";

import { useAppContext } from '@/context/app-context';

export interface AppSettings {
  isRegistrationEnabled: boolean;
  isDriveConnected: boolean;
  appName: string;
  institutionName: string;
  logoUrl: string;
  primaryColor: string;
}

export function useSettings() {
  const { settings, setSettings } = useAppContext();

  return {
    settings,
    setSettings,
  };
}
