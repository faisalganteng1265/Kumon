import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleCalendarProvider } from "@/context/GoogleCalendarContext";
import { NavbarVisibilityProvider } from "@/contexts/NavbarVisibilityContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileHoverProvider } from "@/contexts/UserProfileHoverContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Import custom font via CDN in Head (we'll use Link in layout)

export const metadata: Metadata = {
  title: "AICAMPUS",
  description: "AI-powered campus community platform",
  icons: {
    icon: "/LOGOSVG.svg",
    shortcut: "/LOGOSVG.svg",
    apple: "/LOGOSVG.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/LOGOSVG.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <NavbarVisibilityProvider>
            <UserProfileHoverProvider>
              <AuthProvider>
                <GoogleCalendarProvider>
                  {children}
                </GoogleCalendarProvider>
              </AuthProvider>
            </UserProfileHoverProvider>
          </NavbarVisibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
