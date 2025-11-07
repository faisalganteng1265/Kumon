'use client';

import { useEffect, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
  userAvatar?: string | null;
}

export default function VideoCallModal({
  isOpen,
  onClose,
  roomName,
  userName,
  userAvatar,
}: VideoCallModalProps) {
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCallStarted(true);
    } else {
      setCallStarted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black">
      {/* Header dengan End Call Button */}
      <div className="absolute top-0 left-0 right-0 z-[10001] bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-lime-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Video Call</p>
              <p className="text-gray-400 text-xs">Connected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            End Call
          </button>
        </div>
      </div>

      {/* Jitsi Meeting Component */}
      {callStarted && (
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            enableClosePage: false,
            disableInviteFunctions: true,
            hideConferenceTimer: false,
            hideConferenceSubject: false,
            subject: 'AICampus Video Call',
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: '#0a0a0a',
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'settings',
              'videoquality',
              'filmstrip',
              'tileview',
              'select-background',
              'mute-everyone',
              'mute-video-everyone',
            ],
          }}
          userInfo={{
            displayName: userName,
            email: userAvatar || undefined,
          }}
          onReadyToClose={onClose}
          getIFrameRef={(iframeRef) => {
            if (iframeRef) {
              iframeRef.style.height = '100vh';
              iframeRef.style.width = '100vw';
              iframeRef.style.border = 'none';
            }
          }}
        />
      )}
    </div>
  );
}
