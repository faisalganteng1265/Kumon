'use client';

import { useState, useEffect, useRef } from 'react';
import { Atom } from 'react-loading-indicators';
import StaggeredMenu from './StaggeredMenu';
import Particles from './Particles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import VideoCallModal from './VideoCallModal';
import UserProfileModal from './UserProfileModal';

// ====================================
// TypeScript Interfaces
// ====================================

interface Peer {
  id: string; // UUID from auth.users
  name: string; // From profiles.username
  avatar: string | null; // From profiles.avatar_url
  interests: string[]; // Parsed from user_data.minat
  online: boolean;
}

interface Message {
  id: string; // UUID from group_messages
  senderId: string; // UUID
  senderName: string;
  senderAvatar: string | null;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

interface GroupChat {
  id: string; // From interest_groups.id
  name: string;
  interest: string; // interest_category
  icon: string;
  description: string;
  memberCount: number;
  members: Peer[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  messages: Message[];
}

// ====================================
// Interest Options with Icons
// ====================================

const interestOptions = [
  { value: 'teknologi', label: 'Teknologi & IT', icon: '/ICONKOMPUTER.png' },
  { value: 'bisnis', label: 'Bisnis & Entrepreneurship', icon: '/ICONBISNIS.png' },
  { value: 'seni', label: 'Seni & Kreatif', icon: '/SENIICON.png' },
  { value: 'sosial', label: 'Sosial & Volunteering', icon: '/SOSIALICON.png' },
  { value: 'akademik', label: 'Akademik & Penelitian', icon: '/AKADEMIKICON.png' },
  { value: 'olahraga', label: 'Olahraga & Kesehatan', icon: '/OLAHRAGAICON.png' },
  { value: 'leadership', label: 'Leadership & Organisasi', icon: '/ORGANISASIICON.png' },
  { value: 'lingkungan', label: 'Lingkungan & Sustainability', icon: '/LINGKUNGANICON.png' },
];

// ====================================
// Helper Functions
// ====================================

const parseInterests = (minatText: string): string[] => {
  const minat = minatText.toLowerCase().trim();
  const detectedInterests: string[] = [];

  const interestKeywords: { [key: string]: string[] } = {
    teknologi: ['teknologi', 'it', 'programming', 'coding', 'software', 'web', 'ai', 'machine learning', 'data', 'komputer', 'developer'],
    bisnis: ['bisnis', 'business', 'entrepreneur', 'startup', 'marketing', 'manajemen', 'wirausaha'],
    seni: ['seni', 'art', 'design', 'creative', 'kreatif', 'musik', 'film', 'fotografi', 'gambar'],
    sosial: ['sosial', 'social', 'volunteer', 'komunitas', 'charity', 'kemanusiaan'],
    akademik: ['akademik', 'research', 'penelitian', 'science', 'sains', 'study', 'belajar', 'ilmu'],
    olahraga: ['olahraga', 'sport', 'fitness', 'kesehatan', 'health', 'futsal', 'basket', 'lari'],
    leadership: ['leadership', 'leader', 'organisasi', 'organization', 'management', 'pemimpin', 'ketua'],
    lingkungan: ['lingkungan', 'environment', 'sustainability', 'eco', 'green', 'alam'],
  };

  Object.entries(interestKeywords).forEach(([interestValue, keywords]) => {
    if (keywords.some(keyword => minat.includes(keyword))) {
      detectedInterests.push(interestValue);
    }
  });

  return detectedInterests.length > 0 ? detectedInterests : ['teknologi', 'akademik'];
};

const getInterestIcon = (interestCategory: string): string => {
  const iconMap: { [key: string]: string } = {
    teknologi: '/ICONKOMPUTER.png',
    bisnis: '/ICONBISNIS.png',
    seni: '/SENIICON.png',
    sosial: '/SOSIALICON.png',
    akademik: '/AKADEMIKICON.png',
    olahraga: '/OLAHRAGAICON.png',
    leadership: '/ORGANISASIICON.png',
    lingkungan: '/LINGKUNGANICON.png',
  };

  return iconMap[interestCategory] || '/ICONKOMPUTER.png';
};

// ====================================
// Main Component
// ====================================

export default function PeerConnect() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [chatMode, setChatMode] = useState<'group' | 'private'>('group');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [privateChatHistory, setPrivateChatHistory] = useState<{[key: string]: Message[]}>({});
  const [activePrivateChats, setActivePrivateChats] = useState<Peer[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('Memuat data autentikasi...');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [showGroupChats, setShowGroupChats] = useState(true); // State for group chat dropdown
  const [showPrivateChats, setShowPrivateChats] = useState(true); // State for private chat dropdown
  const [selectedUserProfile, setSelectedUserProfile] = useState<Peer | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ====================================
  // Database Functions
  // ====================================

  // Fetch groups where user is a member
  const fetchUserGroups = async (userId: string): Promise<GroupChat[]> => {
    try {
      // Get groups where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          interest_groups (
            id,
            name,
            interest_category,
            description,
            avatar_url
          )
        `)
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      if (!membershipData || membershipData.length === 0) {
        console.log('PeerConnect: User has no groups');
        return [];
      }

      // For each group, fetch members and messages
      const groupsWithData = await Promise.all(
        membershipData.map(async (membership: any) => {
          const group = membership.interest_groups;
          if (!group) return null;

          // Fetch member count
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // Fetch members
          const members = await fetchGroupMembers(group.id);

          // Fetch messages
          const groupMessages = await fetchGroupMessages(group.id, 50);

          // Get last message
          const lastMsg = groupMessages[groupMessages.length - 1];

          return {
            id: group.id,
            name: group.name,
            interest: group.interest_category,
            icon: getInterestIcon(group.interest_category),
            description: group.description || '',
            memberCount: memberCount || 0,
            members,
            lastMessage: lastMsg?.text,
            lastMessageTime: lastMsg?.timestamp,
            unreadCount: 0,
            messages: groupMessages,
          } as GroupChat;
        })
      );

      return groupsWithData.filter(g => g !== null) as GroupChat[];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  };

  // Fetch members of a group
  const fetchGroupMembers = async (groupId: string): Promise<Peer[]> => {
    try {
      console.log('[fetchGroupMembers] Fetching for group:', groupId);

      // Step 1: Get user IDs from group_members
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (memberError) {
        console.error('[fetchGroupMembers] Error fetching group_members:', memberError);
        throw memberError;
      }

      if (!memberData || memberData.length === 0) {
        console.log('[fetchGroupMembers] No members in group');
        return [];
      }

      const userIds = memberData.map((m: any) => m.user_id);
      console.log('[fetchGroupMembers] User IDs:', userIds);

      // Step 2: Fetch profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      if (profileError) {
        console.error('[fetchGroupMembers] Error fetching profiles:', profileError);
      }

      console.log('[fetchGroupMembers] Profile data:', profileData);

      // Step 3: Fetch user_data for interests
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('user_id, minat')
        .in('user_id', userIds);

      if (userDataError) {
        console.error('[fetchGroupMembers] Error fetching user_data:', userDataError);
      }

      console.log('[fetchGroupMembers] User data:', userData);

      // Create maps
      const profileMap = new Map((profileData || []).map((p: any) => [p.id, p]));
      const userDataMap = new Map((userData || []).map((ud: any) => [ud.user_id, ud.minat || '']));

      console.log('[fetchGroupMembers] Profile map:', profileMap);

      // Build peers
      const peers: Peer[] = userIds.map((userId: string) => {
        const profile = profileMap.get(userId);
        const minat = userDataMap.get(userId) || '';

        console.log(`[fetchGroupMembers] Building peer for ${userId}:`, { profile, minat });

        return {
          id: userId,
          name: profile?.username || profile?.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url || null,
          interests: parseInterests(minat),
          online: true,
        };
      });

      console.log('[fetchGroupMembers] Built peers:', peers.length);
      return peers;
    } catch (error: any) {
      console.error('[fetchGroupMembers] Error:', error);
      return [];
    }
  };

  // Fetch messages from a group
  const fetchGroupMessages = async (groupId: string, limit = 50): Promise<Message[]> => {
    try {
      console.log('[fetchGroupMessages] Fetching for group:', groupId);

      // Step 1: Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('group_messages')
        .select('id, content, created_at, user_id')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (messagesError) {
        console.error('[fetchGroupMessages] Error:', messagesError);
        throw messagesError;
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('[fetchGroupMessages] No messages in group');
        return [];
      }

      // Step 2: Get unique user IDs
      const userIds = [...new Set(messagesData.map((m: any) => m.user_id))];
      console.log('[fetchGroupMessages] Fetching profiles for:', userIds);

      // Step 3: Fetch profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      if (profileError) {
        console.error('[fetchGroupMessages] Error fetching profiles:', profileError);
      }

      // Create profile map
      const profileMap = new Map((profileData || []).map((p: any) => [p.id, p]));

      // Build messages
      const messages: Message[] = messagesData.map((msg: any) => {
        const profile = profileMap.get(msg.user_id);

        return {
          id: msg.id,
          senderId: msg.user_id,
          senderName: profile?.username || profile?.email?.split('@')[0] || 'User',
          senderAvatar: profile?.avatar_url || null,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          isMe: msg.user_id === user?.id,
        };
      });

      console.log('[fetchGroupMessages] Fetched messages:', messages.length);
      return messages;
    } catch (error: any) {
      console.error('[fetchGroupMessages] Error:', error);
      return [];
    }
  };

  // Send message to group
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedGroup || !user) return;

    try {
      setIsSending(true);

      // Insert message to database
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: selectedGroup.id,
          user_id: user.id,
          content: inputMessage.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .single();

      if (error) throw error;

      // Get current user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, email')
        .eq('id', user.id)
        .single();

      // Add to local messages
      const newMessage: Message = {
        id: data.id,
        senderId: data.user_id,
        senderName: profileData?.username || profileData?.email?.split('@')[0] || 'You',
        senderAvatar: profileData?.avatar_url || null,
        text: data.content,
        timestamp: new Date(data.created_at),
        isMe: true,
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');

      // Update group's last message
      setGroups(prevGroups =>
        prevGroups.map(g =>
          g.id === selectedGroup.id
            ? { ...g, lastMessage: newMessage.text, lastMessageTime: newMessage.timestamp }
            : g
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ====================================
  // Realtime Subscription
  // ====================================

  // Realtime subscription for group messages
  useEffect(() => {
    if (!selectedGroup || !user) return;

    // Subscribe to new messages in current group
    const channel = supabase
      .channel(`group-${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        async (payload) => {
          console.log('[Realtime] New message received:', payload);

          try {
            // Use payload.new directly (contains all INSERT data)
            const msgData = payload.new;

            // Fetch sender profile with maybeSingle (won't throw if not found)
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, email')
              .eq('id', msgData.user_id)
              .maybeSingle();

            console.log('[Realtime] Profile:', profileData);

            const newMessage: Message = {
              id: msgData.id,
              senderId: msgData.user_id,
              senderName: profileData?.username || profileData?.email?.split('@')[0] || 'User',
              senderAvatar: profileData?.avatar_url || null,
              text: msgData.content,
              timestamp: new Date(msgData.created_at),
              isMe: msgData.user_id === user.id,
            };

            console.log('[Realtime] Processed message:', newMessage);

            // Only add if not from current user (already added optimistically)
            if (!newMessage.isMe) {
              setMessages(prev => [...prev, newMessage]);

              // Update group's last message
              setGroups(prevGroups =>
                prevGroups.map(g =>
                  g.id === selectedGroup.id
                    ? { ...g, lastMessage: newMessage.text, lastMessageTime: newMessage.timestamp }
                    : g
                )
              );
            }
          } catch (error) {
            console.error('[Realtime] Error:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup, user]);

  // Realtime subscription for private messages
  useEffect(() => {
    if (!user) return;

    // Subscribe to all incoming private messages
    const channel = supabase
      .channel('private-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('[Realtime] New private message received:', payload);

          try {
            const msgData = payload.new;

            // Fetch sender profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, email')
              .eq('id', msgData.sender_id)
              .maybeSingle();

            console.log('[Realtime] Sender profile:', profileData);

            const newMessage: Message = {
              id: msgData.id,
              senderId: msgData.sender_id,
              senderName: profileData?.username || profileData?.email?.split('@')[0] || 'User',
              senderAvatar: profileData?.avatar_url || null,
              text: msgData.content,
              timestamp: new Date(msgData.created_at),
              isMe: false,
            };

            // Update messages if chat is currently open with this user
            if (selectedPeer?.id === msgData.sender_id) {
              setMessages(prev => [...prev, newMessage]);
            }

            // Update private chat history
            setPrivateChatHistory(prev => ({
              ...prev,
              [msgData.sender_id]: [...(prev[msgData.sender_id] || []), newMessage],
            }));

            // Add sender to active private chats if not already there
            if (!activePrivateChats.some(p => p.id === msgData.sender_id)) {
              // Fetch full peer data
              const { data: userData } = await supabase
                .from('user_data')
                .select('minat')
                .eq('user_id', msgData.sender_id)
                .maybeSingle();

              const newPeer: Peer = {
                id: msgData.sender_id,
                name: profileData?.username || profileData?.email?.split('@')[0] || 'User',
                avatar: profileData?.avatar_url || null,
                interests: parseInterests(userData?.minat || ''),
                online: true,
              };

              setActivePrivateChats(prev => [newPeer, ...prev]);
            }
          } catch (error) {
            console.error('[Realtime] Private message error:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedPeer, activePrivateChats]);

  // ====================================
  // Initialize: Fetch User Data & Groups
  // ====================================

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Memuat data autentikasi...');
      return;
    }

    if (hasInitialized) return;

    const initializePeerConnect = async () => {
      setHasInitialized(true);

      if (!user) {
        setLoadingMessage('Kamu belum login. Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      try {
        setLoadingMessage('Memuat data minat dari profil kamu...');

        // Fetch user's minat
        const { data: userData, error: userDataError } = await supabase
          .from('user_data')
          .select('minat')
          .eq('user_id', user.id)
          .single();

        if (userDataError) {
          if (userDataError.code === 'PGRST116') {
            setLoadingMessage('Profil belum lengkap. Redirecting...');
            setTimeout(() => {
              alert('Silakan lengkapi profil kamu terlebih dahulu (khususnya minat) untuk menggunakan Peer Connect!');
              window.location.href = '/';
            }, 2000);
            return;
          }
          throw userDataError;
        }

        if (!userData || !userData.minat || userData.minat.trim() === '') {
          setLoadingMessage('Minat belum diisi. Redirecting...');
          setTimeout(() => {
            alert('Silakan isi minat kamu di profil untuk menggunakan Peer Connect!');
            window.location.href = '/';
          }, 2000);
          return;
        }

        setLoadingMessage('Memeriksa grup yang kamu ikuti...');

        // Auto-join user to groups based on interests
        await supabase.rpc('auto_join_interest_groups', {
          p_user_id: user.id,
          p_minat: userData.minat,
        });

        setLoadingMessage('Memuat grup dan pesan...');

        // Fetch user's groups
        const userGroups = await fetchUserGroups(user.id);

        if (userGroups.length === 0) {
          setLoadingMessage('Tidak ada grup ditemukan. Redirecting...');
          setTimeout(() => {
            alert('Tidak ada grup yang sesuai dengan minat kamu. Silakan update minat di profil.');
            window.location.href = '/';
          }, 2000);
          return;
        }

        setGroups(userGroups);

        // Fetch active private chats
        setLoadingMessage('Memuat riwayat chat pribadi...');
        const privateChats = await fetchActivePrivateChats(user.id);
        setActivePrivateChats(privateChats);

        // Auto-select first group
        if (userGroups.length > 0) {
          handleGroupSelect(userGroups[0]);
        }

        setIsLoading(false);
        setShowChat(true);
      } catch (error: any) {
        console.error('PeerConnect: Error initializing:', error);
        setLoadingMessage('Terjadi kesalahan. Redirecting...');
        setTimeout(() => {
          alert(`Terjadi kesalahan: ${error.message}. Silakan coba lagi.`);
          window.location.href = '/';
        }, 2000);
      }
    };

    initializePeerConnect();
  }, [user, loading, hasInitialized]);

  // ====================================
  // Event Handlers
  // ====================================

  const handleGroupSelect = async (group: GroupChat) => {
    setSelectedGroup(group);
    setChatMode('group');
    setSelectedPeer(null);

    // Fetch fresh messages from database
    const freshMessages = await fetchGroupMessages(group.id);
    setMessages(freshMessages);

    // Update the group's messages in state
    setGroups(prevGroups =>
      prevGroups.map(g =>
        g.id === group.id ? { ...g, messages: freshMessages } : g
      )
    );
  };

  // Fetch list of users who have private chat history with current user
  const fetchActivePrivateChats = async (userId: string): Promise<Peer[]> => {
    try {
      console.log('[fetchActivePrivateChats] Fetching for user:', userId);

      // Get all private messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('private_messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) {
        console.error('[fetchActivePrivateChats] Error:', error);
        return [];
      }

      if (!messages || messages.length === 0) {
        console.log('[fetchActivePrivateChats] No private messages found');
        return [];
      }

      // Get unique user IDs (excluding current user)
      const otherUserIds = new Set<string>();
      messages.forEach(msg => {
        if (msg.sender_id !== userId) otherUserIds.add(msg.sender_id);
        if (msg.receiver_id !== userId) otherUserIds.add(msg.receiver_id);
      });

      const userIds = Array.from(otherUserIds);
      console.log('[fetchActivePrivateChats] Found chat partners:', userIds);

      if (userIds.length === 0) return [];

      // Fetch profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      // Fetch user_data for interests
      const { data: userData } = await supabase
        .from('user_data')
        .select('user_id, minat')
        .in('user_id', userIds);

      const profileMap = new Map((profileData || []).map(p => [p.id, p]));
      const userDataMap = new Map((userData || []).map(ud => [ud.user_id, ud.minat || '']));

      const peers: Peer[] = userIds.map(id => {
        const profile = profileMap.get(id);
        const minat = userDataMap.get(id) || '';

        return {
          id,
          name: profile?.username || profile?.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url || null,
          interests: parseInterests(minat),
          online: true,
        };
      });

      console.log('[fetchActivePrivateChats] Built peers:', peers.length);
      return peers;
    } catch (error) {
      console.error('[fetchActivePrivateChats] Error:', error);
      return [];
    }
  };

  // Fetch private messages between current user and another user
  const fetchPrivateMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      console.log('[fetchPrivateMessages] Fetching with:', otherUserId);

      const { data, error } = await supabase
        .from('private_messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[fetchPrivateMessages] Error:', error);
        return;
      }

      console.log('[fetchPrivateMessages] Fetched:', data?.length || 0);

      // Get sender profiles
      const senderIds = [...new Set(data?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .in('id', senderIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const messages: Message[] = (data || []).map(msg => {
        const profile = profileMap.get(msg.sender_id);
        return {
          id: msg.id,
          senderId: msg.sender_id,
          senderName: profile?.username || profile?.email?.split('@')[0] || 'User',
          senderAvatar: profile?.avatar_url || null,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          isMe: msg.sender_id === user.id,
        };
      });

      setMessages(messages);
      setPrivateChatHistory(prev => ({ ...prev, [otherUserId]: messages }));
    } catch (error) {
      console.error('[fetchPrivateMessages] Error:', error);
    }
  };

  const handlePeerSelect = async (peer: Peer) => {
    setSelectedPeer(peer);
    setChatMode('private');
    setSelectedGroup(null);

    // Load private chat history from database
    await fetchPrivateMessages(peer.id);

    // Add to active private chats if not already there
    if (!activePrivateChats.some(p => p.id === peer.id)) {
      setActivePrivateChats(prev => [...prev, peer]);
    }
  };

  const handleUserProfileClick = async (senderId: string, senderName: string) => {
    // Don't show profile for own messages
    if (senderId === user?.id) return;

    try {
      // Fetch full user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', senderId)
        .single();

      if (profileError) throw profileError;

      // Fetch user interests
      const { data: userDataArray } = await supabase
        .from('user_data')
        .select('user_id, minat')
        .eq('user_id', senderId);

      // Get first item from array
      const userData = userDataArray && userDataArray.length > 0 ? userDataArray[0] : null;

      // Parse interests if available
      const minat = userData?.minat || '';
      const interests = minat ? parseInterests(minat) : [];

      // Set profile data and open modal
      setSelectedUserProfile({
        id: profileData.id,
        name: profileData.username || senderName,
        avatar: profileData.avatar_url,
        interests: interests,
        online: true, // You can add online status logic later
      });
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('[handleUserProfileClick] Error:', error);
    }
  };

  const handleSendMessageFromProfile = () => {
    if (selectedUserProfile) {
      handlePeerSelect(selectedUserProfile);
    }
  };

  const handleSendPrivateMessage = async () => {
    if (!inputMessage.trim() || !selectedPeer || !user) return;

    try {
      setIsSending(true);

      // Insert message to database
      const { data, error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedPeer.id,
          content: inputMessage.trim(),
        })
        .select('id, sender_id, receiver_id, content, created_at')
        .single();

      if (error) throw error;

      // Get current user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, email')
        .eq('id', user.id)
        .single();

      // Add to local messages
      const newMessage: Message = {
        id: data.id,
        senderId: data.sender_id,
        senderName: profileData?.username || profileData?.email?.split('@')[0] || 'You',
        senderAvatar: profileData?.avatar_url || null,
        text: data.content,
        timestamp: new Date(data.created_at),
        isMe: true,
      };

      setMessages(prev => [...prev, newMessage]);
      setPrivateChatHistory(prev => ({
        ...prev,
        [selectedPeer.id]: [...(prev[selectedPeer.id] || []), newMessage],
      }));
      setInputMessage('');
    } catch (error) {
      console.error('[handleSendPrivateMessage] Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatMode === 'group') {
        handleSendMessage();
      } else {
        handleSendPrivateMessage();
      }
    }
  };

  // ====================================
  // Render: Loading State
  // ====================================

  if (isLoading) {
    return (
      <div className="relative h-screen bg-black overflow-hidden flex items-center justify-center">
        <Particles />
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <Atom color="#84cc16" size="medium" text="" textColor="#84cc16" />
          </div>
          <p
            className="text-white text-2xl font-semibold"
            style={{
              textShadow: '0 0 20px rgba(132, 204, 22, 0.9), 0 0 40px rgba(132, 204, 22, 0.6)'
            }}
          >
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      <Particles />

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Event Recomend', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4',  color: '#22c55e' },
          { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5' },
          { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6' }
        ]}
         logoUrl=""
        displaySocials={false}
        displayItemNumbering={true}
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
      />
      {showChat && (
        <div className="relative z-10 h-screen flex flex-col">
          {/* Top Header */}
          <div className="bg-black/50 backdrop-blur-md border-b border-gray-700 p-4">
            <h1 className="text-3xl font-bold text-white text-left flex items-center justify-start">
              <Image
                src="/AICAMPUS.png"
                alt="Peer Connect Icon"
                width={40}
                height={40}
                className="mr-3"
              />
              <span>Peer Connect - Real Group Chat</span>
            </h1>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Group & Private Chat List */}
            <div className="w-80 bg-black/40 backdrop-blur-xl overflow-y-auto custom-scrollbar border-r border-gray-700/30">
              {/* Group Chats Section */}
              <div className="p-4 border-b border-black/50">
                <button
                  className="w-full flex items-center justify-between text-white font-bold mb-3"
                  onClick={() => setShowGroupChats(!showGroupChats)}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src="/TEXTICON.png"
                      alt="Group Chat Icon"
                      width={15}
                      height={15}
                    />
                    <h2>Group Chats ({groups.length})</h2>
                  </div>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      showGroupChats ? 'rotate-0' : '-rotate-90'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {showGroupChats && (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] group ${
                          selectedGroup?.id === group.id
                            ? 'bg-gradient-to-r from-lime-500/20 to-green-500/20 border border-lime-500/50 shadow-lg shadow-lime-500/20'
                            : 'bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-lime-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Image
                              src={group.icon}
                              alt={group.name}
                              width={40}
                              height={40}
                              className="rounded-full ring-2 ring-lime-500/30 group-hover:ring-lime-500/60 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-lime-400 rounded-full border-2 border-black animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{group.name}</p>
                            <p className="text-gray-400 text-xs truncate">
                              {group.memberCount} members
                            </p>
                          </div>
                        </div>
                        {group.lastMessage && (
                          <p className="text-gray-500 text-xs mt-2 truncate">{group.lastMessage}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Private Chats Section */}
              {activePrivateChats.length > 0 && (
               <div className="p-4 border-b border-black/50">
                  <button
                    className="w-full flex items-center justify-between text-white font-bold mb-3"
                    onClick={() => setShowPrivateChats(!showPrivateChats)}
                  >
                    <div className="flex items-center gap-2">
                    <Image
                      src="/ORGICON.png"
                      alt="Private Chat Icon"
                      width={15}
                      height={15}
                    />
                                         <h2>Private Chats ({activePrivateChats.length})</h2>
                    </div>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        showPrivateChats ? 'rotate-0' : '-rotate-90'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  <h2 className="text-white font-bold mb-3">
                  </h2>
                  {showPrivateChats && (
                    <div className="space-y-2">
                      {activePrivateChats.map(peer => (
                        <button
                          key={peer.id}
                          onClick={() => handlePeerSelect(peer)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] group ${
                            selectedPeer?.id === peer.id
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                              : 'bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {peer.avatar ? (
                              <Image
                                src={peer.avatar}
                                alt={peer.name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all duration-300"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all duration-300 shadow-lg shadow-blue-500/50">
                                {peer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-white font-semibold">{peer.name}</p>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    peer.online ? 'bg-green-400' : 'bg-gray-500'
                                  }`}
                                ></span>
                                <p className="text-gray-400 text-xs">
                                  {peer.online ? 'Online' : 'Offline'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              {(selectedGroup || selectedPeer) && (
                <div className="bg-black/50 backdrop-blur-md border-b border-gray-700 p-4">
                  {chatMode === 'group' && selectedGroup && (
                    <div className="flex items-center gap-4">
                      <Image
                        src={selectedGroup.icon}
                        alt={selectedGroup.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h2 className="text-white font-bold text-xl">{selectedGroup.name}</h2>
                        <p className="text-gray-400 text-sm">
                          {selectedGroup.memberCount} members • {selectedGroup.description}
                        </p>
                      </div>
                    </div>
                  )}
                  {chatMode === 'private' && selectedPeer && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        {selectedPeer.avatar ? (
                          <Image
                            src={selectedPeer.avatar}
                            alt={selectedPeer.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                            {selectedPeer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h2 className="text-white font-bold text-xl">{selectedPeer.name}</h2>
                          <p className="text-gray-400 text-sm flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                selectedPeer.online ? 'bg-lime-400' : 'bg-gray-500'
                              }`}
                            ></span>
                            {selectedPeer.online ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      {/* Video Call Button */}
                      <button
                        onClick={() => setIsVideoCallOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-green-500/50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Video Call
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-transparent p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center animate-fade-in">
                      <div className="mb-4">
                        <svg className="w-20 h-20 mx-auto text-gray-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-lg mb-2 font-semibold">No messages yet</p>
                      <p className="text-gray-600 text-sm">Be the first to send a message!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isMe ? 'justify-end' : 'justify-start'} animate-slide-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {!message.isMe && (
                        <div
                          className="flex-shrink-0 cursor-pointer hover:scale-110 hover:rotate-3 transition-all duration-300 group"
                          onClick={() => handleUserProfileClick(message.senderId, message.senderName)}
                        >
                          {message.senderAvatar ? (
                            <div className="relative">
                              <Image
                                src={message.senderAvatar}
                                alt={message.senderName}
                                width={40}
                                height={40}
                                className="rounded-full object-cover ring-2 ring-lime-500/30 group-hover:ring-lime-500/60 transition-all duration-300"
                              />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse-glow"></div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center text-white font-bold ring-2 ring-lime-500/30 group-hover:ring-lime-500/60 transition-all duration-300 shadow-lg shadow-lime-500/50">
                                {message.senderName.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse-glow"></div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`max-w-lg ${message.isMe ? 'items-end' : 'items-start'}`}>
                        {!message.isMe && (
                          <p
                            className="text-lime-400 text-sm font-semibold mb-1 cursor-pointer hover:text-lime-300 transition-colors duration-200 hover:scale-105 inline-block"
                            onClick={() => handleUserProfileClick(message.senderId, message.senderName)}
                          >
                            {message.senderName}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-5 py-3 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
                            message.isMe
                              ? 'bg-gradient-to-br from-lime-600 to-green-600 text-white shadow-lg shadow-lime-500/30 border border-lime-400/30 hover:shadow-lime-500/50'
                              : 'bg-gray-800/80 text-white border border-gray-600/50 shadow-lg shadow-black/30 hover:border-gray-500/70 hover:bg-gray-800/90'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                          <p className="text-gray-500 text-xs">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {message.isMe && (
                            <svg className="w-3 h-3 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {(selectedGroup || selectedPeer) && (
                <div className="bg-black/60 backdrop-blur-xl p-4 border-t border-gray-700/50">
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          chatMode === 'group'
                            ? `Send a message to ${selectedGroup?.name}...`
                            : `Send a private message to ${selectedPeer?.name}...`
                        }
                        className="w-full bg-gray-800/70 text-white rounded-full px-6 py-4 border-2 border-gray-600/50 focus:outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 transition-all duration-300 placeholder-gray-500 group-hover:border-gray-500/70"
                        disabled={isSending}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {inputMessage.trim() && (
                          <span className="text-xs text-gray-400 animate-fade-in">
                            Press Enter to send
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={chatMode === 'group' ? handleSendMessage : handleSendPrivateMessage}
                      disabled={!inputMessage.trim() || isSending}
                      className="relative bg-gradient-to-r from-lime-500 to-green-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-lime-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isSending ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending
                          </>
                        ) : (
                          <>
                            Send
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Members List */}
            {selectedGroup && (
              <div className="w-64 bg-black/40 backdrop-blur-xl overflow-y-auto custom-scrollbar border-l border-gray-700/30">
                <div className="p-4">
                  <h2 className="text-white font-bold mb-4">
                    Members ({selectedGroup.memberCount})
                  </h2>
                  <div className="space-y-2">
                    {selectedGroup.members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => handlePeerSelect(member)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] group ${
                          selectedPeer?.id === member.id
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : 'bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all duration-300"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all duration-300 shadow-lg shadow-purple-500/50">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-white font-semibold">{member.name}</p>
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  member.online ? 'bg-green-400' : 'bg-gray-500'
                                }`}
                              ></span>
                              <p className="text-gray-400 text-xs">
                                {member.online ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Scrollbar & Animation Styles */}
      <style jsx>{`
        /* Chrome, Safari, Edge */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(132, 204, 22, 0.4);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(132, 204, 22, 0.7);
          box-shadow: 0 0 10px rgba(132, 204, 22, 0.5);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(132, 204, 22, 0.4) rgba(0, 0, 0, 0.2);
        }

        /* Message Animations */
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(132, 204, 22, 0.5);
          }
          50% {
            box-shadow: 0 0 15px rgba(132, 204, 22, 0.8);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Gradient Text Animation */
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .gradient-text {
          background: linear-gradient(90deg, #84cc16, #22c55e, #84cc16);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>

      {/* Video Call Modal */}
      {selectedPeer && user && (
        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          roomName={`aicampus-private-${[user.id, selectedPeer.id].sort().join('-')}`}
          userName={user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
          userAvatar={user.user_metadata?.avatar_url}
        />
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserProfile(null);
        }}
        user={selectedUserProfile}
        onSendMessage={handleSendMessageFromProfile}
      />
    </div>
  );
}
