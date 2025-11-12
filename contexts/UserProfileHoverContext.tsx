'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfileHoverContextType {
  isUserProfileHovered: boolean;
  setIsUserProfileHovered: (isHovered: boolean) => void;
}

const UserProfileHoverContext = createContext<UserProfileHoverContextType | undefined>(undefined);

export function UserProfileHoverProvider({ children }: { children: ReactNode }) {
  const [isUserProfileHovered, setIsUserProfileHovered] = useState(false);

  return (
    <UserProfileHoverContext.Provider value={{ isUserProfileHovered, setIsUserProfileHovered }}>
      {children}
    </UserProfileHoverContext.Provider>
  );
}

export function useUserProfileHover() {
  const context = useContext(UserProfileHoverContext);
  if (context === undefined) {
    throw new Error('useUserProfileHover must be used within a UserProfileHoverProvider');
  }
  return context;
}
