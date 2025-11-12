'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface GoogleCalendarContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  syncToGoogleCalendar: (events: CalendarEvent[]) => Promise<SyncResult>;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  syncedEvents?: Array<{
    localId: string;
    googleEventId: string;
    htmlLink: string;
  }>;
  errors?: Array<{
    event: string;
    error: string;
  }>;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  type?: string;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

function GoogleCalendarProviderInner({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('google_calendar_token');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      setIsAuthenticated(true);
      localStorage.setItem('google_calendar_token', tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('google_calendar_token');
  };

  const syncToGoogleCalendar = async (events: CalendarEvent[]): Promise<SyncResult> => {
    if (!accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          events,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Google Calendar');
      }

      const data: SyncResult = await response.json();
      return data;
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      throw error;
    }
  };

  return (
    <GoogleCalendarContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        login,
        logout,
        syncToGoogleCalendar,
      }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  );
}

export function GoogleCalendarProvider({ children }: { children: React.ReactNode }) {
  // Replace with your Google OAuth Client ID
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.warn('Google Client ID not found. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleCalendarProviderInner>{children}</GoogleCalendarProviderInner>
    </GoogleOAuthProvider>
  );
}

export function useGoogleCalendar() {
  const context = useContext(GoogleCalendarContext);
  if (context === undefined) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
}
