'use client';

import { useState, useEffect } from 'react';
import { Atom } from 'react-loading-indicators';
import StaggeredMenu from './StaggeredMenu';
import Particles from './Particles';

interface Peer {
  id: number;
  name: string;
  avatar: string;
  interests: string[];
  online: boolean;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

interface GroupChat {
  id: string;
  name: string;
  interest: string;
  icon: string;
  memberCount: number;
  members: Peer[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  messages: Message[];
}

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

// Mock data untuk peers
const mockPeers: Peer[] = [
  {
    id: 1,
    name: 'Andi Pratama',
    avatar: '/FOTO2.jpg',
    interests: ['teknologi', 'bisnis'],
    online: true,
    lastMessage: 'Halo! Aku juga tertarik dengan AI',
    unreadCount: 2,
  },
  {
    id: 2,
    name: 'Sarah Wijaya',
    avatar: '/FOTO3.jpg',
    interests: ['seni', 'akademik'],
    online: true,
    lastMessage: 'Tertarik join event bareng?',
    unreadCount: 1,
  },
  {
    id: 3,
    name: 'Budi Santoso',
    avatar: '/FOTO4.jpg',
    interests: ['olahraga', 'sosial'],
    online: false,
    lastMessage: 'Oke, nanti kita chat lagi ya',
  },
  {
    id: 4,
    name: 'Dina Lestari',
    avatar: '/FOTO5.png',
    interests: ['leadership', 'bisnis'],
    online: true,
    lastMessage: 'Ada info lomba business plan nih',
    unreadCount: 3,
  },
  {
    id: 5,
    name: 'Eko Prasetyo',
    avatar: '/FOTO2.jpg',
    interests: ['teknologi', 'akademik'],
    online: true,
  },
  {
    id: 6,
    name: 'Rina Maharani',
    avatar: '/FOTO3.jpg',
    interests: ['seni', 'sosial'],
    online: true,
  },
  {
    id: 7,
    name: 'Fajar Nugroho',
    avatar: '/FOTO4.jpg',
    interests: ['teknologi', 'akademik'],
    online: false,
  },
  {
    id: 8,
    name: 'Siti Rahmawati',
    avatar: '/FOTO5.png',
    interests: ['bisnis', 'leadership'],
    online: true,
  },
];

// Mock data untuk grup chat berdasarkan minat
const generateGroupChats = (selectedInterests: string[]): GroupChat[] => {
  const now = new Date();
  const groups: GroupChat[] = [];

  selectedInterests.forEach((interest) => {
    const interestOption = interestOptions.find(opt => opt.value === interest);
    if (!interestOption) return;

    // Filter peers yang punya interest yang sama
    const groupMembers = mockPeers.filter(peer =>
      peer.interests.includes(interest)
    );

    if (groupMembers.length === 0) return;

    // Generate past conversations untuk grup ini
    const pastMessages: Message[] = [];
    const randomMembersForChat = groupMembers.slice(0, Math.min(4, groupMembers.length));

    // Generate 5-8 pesan past conversation
    const messageCount = Math.floor(Math.random() * 4) + 5;
    const conversationStarters: { [key: string]: string[] } = {
      teknologi: [
        'Ada yang udah coba framework baru yang lagi hype?',
        'Sharing dong tips belajar programming yang efektif',
        'Guys, ada rekomendasi course online yang bagus?',
        'Lagi develop project apa nih sekarang?',
        'Ada yang pernah join hackathon? Gimana pengalamannya?',
      ],
      bisnis: [
        'Ada yang tertarik bikin startup bareng?',
        'Sharing tips pitching ke investor dong',
        'Lagi mikir ide bisnis yang sustainable nih',
        'Ada info lomba business plan gak?',
        'Gimana caranya validate ide bisnis ya?',
      ],
      seni: [
        'Ada exhibition art yang menarik minggu ini?',
        'Lagi ngerjain project design apa nih?',
        'Sharing portfolio kalian dong!',
        'Ada yang mau collab project creative?',
        'Tips overcome creative block dong',
      ],
      sosial: [
        'Ada kegiatan volunteer weekend ini?',
        'Yuk organize kegiatan sosial bareng!',
        'Sharing pengalaman volunteer kalian dong',
        'Ada yang mau join donasi untuk anak yatim?',
        'Mari kita buat impact untuk komunitas!',
      ],
      akademik: [
        'Ada yang lagi research tentang AI?',
        'Sharing paper menarik yang kalian baca dong',
        'Tips nulis paper yang bagus gimana ya?',
        'Ada yang mau diskusi tentang penelitian?',
        'Lagi ngerjain skripsi/thesis apa nih?',
      ],
      olahraga: [
        'Yuk main futsal weekend ini!',
        'Ada yang mau join lari pagi?',
        'Sharing tips fitness routine dong',
        'Ada turnamen olahraga yang seru nih',
        'Gimana cara maintain healthy lifestyle?',
      ],
      leadership: [
        'Sharing pengalaman lead organisasi dong',
        'Tips manage tim yang efektif gimana ya?',
        'Ada training leadership yang recommended?',
        'Gimana cara develop leadership skill?',
        'Sharing best practice project management dong',
      ],
      lingkungan: [
        'Yuk kita mulai campaign zero waste!',
        'Ada yang tertarik urban farming?',
        'Sharing tips hidup sustainable dong',
        'Gimana cara reduce carbon footprint kita?',
        'Ada program environmental yang bisa kita join?',
      ],
    };

    const responses: string[] = [
      'Wah menarik nih! Count me in!',
      'Setuju banget! Aku juga lagi mikirin hal yang sama',
      'Boleh nih, aku tertarik join!',
      'Good idea! Kapan kita execute?',
      'Aku punya pengalaman soal ini, bisa sharing nanti',
      'Yes! Finally ada yang sepemikiran',
      'Aku bisa bantu nih kalo mau',
      'Mantap! Langsung action yuk',
      'Aku ada beberapa ide juga nih',
      'Let\'s go! Aku support banget',
    ];

    let messageId = 1;
    const starters = conversationStarters[interest] || conversationStarters.teknologi;

    for (let i = 0; i < messageCount; i++) {
      const member = randomMembersForChat[i % randomMembersForChat.length];
      const isStarter = i % 3 === 0; // Setiap 3 pesan ada yang mulai topik baru
      const text = isStarter
        ? starters[Math.floor(Math.random() * starters.length)]
        : responses[Math.floor(Math.random() * responses.length)];

      pastMessages.push({
        id: messageId++,
        senderId: member.id,
        senderName: member.name,
        senderAvatar: member.avatar,
        text,
        timestamp: new Date(now.getTime() - (messageCount - i) * 300000), // 5 menit interval
        isMe: false,
      });
    }

    const lastMsg = pastMessages[pastMessages.length - 1];

    groups.push({
      id: `group-${interest}`,
      name: `Grup ${interestOption.label}`,
      interest,
      icon: interestOption.icon,
      memberCount: groupMembers.length,
      members: groupMembers,
      lastMessage: lastMsg?.text,
      lastMessageTime: lastMsg?.timestamp,
      unreadCount: Math.floor(Math.random() * 5) + 1,
      messages: pastMessages,
    });
  });

  return groups;
};

export default function PeerConnect() {
  const [showInterestPopup, setShowInterestPopup] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [chatMode, setChatMode] = useState<'group' | 'private'>('group');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [privateChatHistory, setPrivateChatHistory] = useState<{[key: number]: Message[]}>({});
  const [activePrivateChats, setActivePrivateChats] = useState<Peer[]>([]); // Track active private chats

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleStartConnect = () => {
    if (selectedInterests.length === 0) {
      alert('Pilih minimal 1 minat untuk mulai connect!');
      return;
    }

    setShowInterestPopup(false);
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      // Generate groups berdasarkan selected interests
      const generatedGroups = generateGroupChats(selectedInterests);
      setGroups(generatedGroups);

      // Auto select first group
      if (generatedGroups.length > 0) {
        handleGroupSelect(generatedGroups[0]);
      }

      setIsLoading(false);
      setShowChat(true);
    }, 3000);
  };

  const handleGroupSelect = (group: GroupChat) => {
    setSelectedGroup(group);
    setChatMode('group');
    setSelectedPeer(null);
    setMessages(group.messages);
  };

  const handleMemberClick = (member: Peer) => {
    setChatMode('private');
    setSelectedPeer(member);
    setSelectedGroup(null);

    // Add to active private chats if not already there
    if (!activePrivateChats.find(p => p.id === member.id)) {
      setActivePrivateChats(prev => [...prev, member]);
    }

    // Load private chat history atau create new
    if (privateChatHistory[member.id]) {
      setMessages(privateChatHistory[member.id]);
    } else {
      // Initialize private chat dengan greeting
      const initialMessages: Message[] = [
        {
          id: 1,
          senderId: member.id,
          senderName: member.name,
          senderAvatar: member.avatar,
          text: `Halo! Saya ${member.name}. Senang bisa chat pribadi dengan kamu!`,
          timestamp: new Date(Date.now() - 60000),
          isMe: false,
        },
      ];
      setMessages(initialMessages);
      setPrivateChatHistory(prev => ({
        ...prev,
        [member.id]: initialMessages,
      }));
    }
  };

  const handlePrivateChatSelect = (peer: Peer) => {
    setChatMode('private');
    setSelectedPeer(peer);
    setSelectedGroup(null);
    setMessages(privateChatHistory[peer.id] || []);
  };

  const getLastMessage = (peer: Peer) => {
    const history = privateChatHistory[peer.id];
    if (!history || history.length === 0) return 'Belum ada pesan';
    return history[history.length - 1].text;
  };

  const getLastMessageTime = (peer: Peer) => {
    const history = privateChatHistory[peer.id];
    if (!history || history.length === 0) return null;
    return history[history.length - 1].timestamp;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    if (!selectedPeer && !selectedGroup) return;

    const userMessage: Message = {
      id: messages.length + 1,
      senderId: 0,
      text: inputMessage,
      timestamp: new Date(),
      isMe: true,
    };

    const currentMessage = inputMessage;
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    setInputMessage('');
    setIsSending(true);

    try {
      if (chatMode === 'private' && selectedPeer) {
        // Private chat - balasan dari peer yang dipilih
        const response = await fetch('/api/peer-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            peerId: selectedPeer.id,
            message: currentMessage,
            chatHistory: currentMessages.slice(-10),
          }),
        });

        const data = await response.json();

        if (data.success && data.reply) {
          const aiMessage: Message = {
            id: currentMessages.length + 1,
            senderId: selectedPeer.id,
            senderName: selectedPeer.name,
            senderAvatar: selectedPeer.avatar,
            text: data.reply,
            timestamp: new Date(),
            isMe: false,
          };
          const updatedMessages = [...currentMessages, aiMessage];
          setMessages(updatedMessages);

          // Save to private chat history
          setPrivateChatHistory(prev => ({
            ...prev,
            [selectedPeer.id]: updatedMessages,
          }));
        } else {
          throw new Error('Failed to get response');
        }
      } else if (chatMode === 'group' && selectedGroup) {
        // Group chat - balasan acak dari member grup
        const onlineMembers = selectedGroup.members.filter(m => m.online);
        if (onlineMembers.length === 0) {
          throw new Error('No online members');
        }

        // Pilih random member untuk balas
        const randomMember = onlineMembers[Math.floor(Math.random() * onlineMembers.length)];

        const response = await fetch('/api/peer-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            peerId: randomMember.id,
            message: currentMessage,
            chatHistory: currentMessages.slice(-10),
            isGroupChat: true,
            groupTopic: selectedGroup.interest,
          }),
        });

        const data = await response.json();

        if (data.success && data.reply) {
          const aiMessage: Message = {
            id: currentMessages.length + 1,
            senderId: randomMember.id,
            senderName: randomMember.name,
            senderAvatar: randomMember.avatar,
            text: data.reply,
            timestamp: new Date(),
            isMe: false,
          };
          const updatedMessages = [...currentMessages, aiMessage];
          setMessages(updatedMessages);

          // Update group messages
          setGroups(prev => prev.map(g =>
            g.id === selectedGroup.id
              ? { ...g, messages: updatedMessages, lastMessage: data.reply, lastMessageTime: new Date() }
              : g
          ));
        } else {
          throw new Error('Failed to get response');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback message
      const fallbackSender = chatMode === 'private' && selectedPeer
        ? selectedPeer
        : selectedGroup?.members[0];

      if (fallbackSender) {
        const errorMessage: Message = {
          id: currentMessages.length + 1,
          senderId: fallbackSender.id,
          senderName: fallbackSender.name,
          senderAvatar: fallbackSender.avatar,
          text: 'Waduh, koneksi error nih. Coba lagi ya!',
          timestamp: new Date(),
          isMe: false,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleCount={1500}
          particleSpread={15}
          speed={0.15}
          particleColors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#e5e5e5', '#d4d4d4', '#84cc16']}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={150}
          sizeRandomness={1.5}
          cameraDistance={25}
          disableRotation={false}
        />
      </div>

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Guide', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Event Recomend', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        logoUrl="/AICAMPUS.png"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
      />

      {/* Interest Popup */}
      {showInterestPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-neutral-900 rounded-3xl p-8 max-w-3xl w-full border-2 border-lime-500/30 shadow-2xl shadow-lime-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl bg-lime-500/60 rounded-full"></div>
                  <img
                    src="/SOSIALICON.png"
                    alt="Peer Connect Icon"
                    className="w-20 h-20 object-contain relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 15px rgba(132, 204, 22, 1)) drop-shadow(0 0 30px rgba(132, 204, 22, 0.8))'
                    }}
                  />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 0 20px rgba(132, 204, 22, 0.8)' }}>
                PEER CONNECT AI
              </h2>
              <p className="text-gray-300 text-lg">
                Ceritakan minatmu, dan kami akan mencarikan teman yang cocok!
              </p>
            </div>

            {/* Interest Selection */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4 text-lg">Pilih Minat Kamu:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border ${
                      selectedInterests.includes(interest.value)
                        ? 'bg-lime-500 text-white border-lime-500 shadow-lg shadow-lime-500/50'
                        : 'bg-gray-800/50 text-gray-200 border-gray-700 hover:bg-lime-500/80 hover:text-white hover:border-lime-500'
                    }`}
                  >
                    <img src={interest.icon} alt={interest.label} className="w-8 h-8 object-contain" />
                    <span className="text-xs font-medium text-center">{interest.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Count */}
            <div className="text-center mb-6">
              <p className="text-gray-400">
                {selectedInterests.length > 0
                  ? `${selectedInterests.length} minat dipilih`
                  : 'Belum ada minat yang dipilih'}
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartConnect}
              disabled={selectedInterests.length === 0}
              className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/50 hover:shadow-xl hover:shadow-lime-500/60"
            >
              Mulai Connect dengan Peers
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Atom color="#84cc16" size="medium" text="" textColor="#84cc16" />
            </div>
            <p
              className="text-white text-2xl font-semibold"
              style={{
                textShadow: '0 0 20px rgba(132, 204, 22, 0.9), 0 0 40px rgba(132, 204, 22, 0.6)'
              }}
            >
              AI sedang mencarikan peers yang cocok untukmu...
            </p>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && !isLoading && (
        <div className="relative z-10 h-screen flex flex-col">
          {/* Header */}
          <div className="py-6 px-6 border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-lime-500/40 rounded-full"></div>
                  <img
                    src="/SOSIALICON.png"
                    alt="Icon"
                    className="w-12 h-12 object-contain relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(132, 204, 22, 0.8))'
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 15px rgba(132, 204, 22, 0.6)' }}>
                    PEER CONNECT AI
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {groups.length} grup ditemukan berdasarkan minatmu
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full px-6 py-6">
              <div className="grid grid-cols-12 gap-6 h-full">
                {/* Chat List (Groups + Private Chats) */}
                <div className="col-span-4 bg-neutral-900/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-800/50">
                    <h2 className="text-white font-semibold text-lg">Chats</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Groups Section */}
                    <div className="px-3 py-2 bg-gray-800/30">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Grup Chat</p>
                    </div>
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className={`p-4 border-b border-gray-800/30 hover:bg-lime-500/10 cursor-pointer transition-all ${
                          selectedGroup?.id === group.id && chatMode === 'group' ? 'bg-lime-500/20 border-l-4 border-l-lime-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 rounded-full flex items-center justify-center">
                              <img
                                src={group.icon}
                                alt={group.name}
                                className="w-7 h-7 object-contain"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-semibold text-sm truncate">{group.name}</h3>
                              {group.unreadCount && group.unreadCount > 0 && (
                                <span className="bg-lime-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {group.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs truncate">
                              {group.lastMessage || 'Belum ada pesan'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {group.memberCount} members
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Private Chats Section */}
                    {activePrivateChats.length > 0 && (
                      <>
                        <div className="px-3 py-2 bg-gray-800/30 mt-2">
                          <p className="text-xs text-gray-400 font-semibold uppercase">Chat Pribadi</p>
                        </div>
                        {activePrivateChats.map((peer) => (
                          <div
                            key={`private-${peer.id}`}
                            onClick={() => handlePrivateChatSelect(peer)}
                            className={`p-4 border-b border-gray-800/30 hover:bg-lime-500/10 cursor-pointer transition-all ${
                              selectedPeer?.id === peer.id && chatMode === 'private' ? 'bg-lime-500/20 border-l-4 border-l-lime-500' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={peer.avatar}
                                  alt={peer.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                {peer.online && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-white font-semibold text-sm truncate">{peer.name}</h3>
                                </div>
                                <p className="text-gray-400 text-xs truncate">
                                  {getLastMessage(peer)}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {peer.online ? 'Online' : 'Offline'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="col-span-8 bg-neutral-900/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm flex flex-col overflow-hidden">
                  {(selectedGroup && chatMode === 'group') || (selectedPeer && chatMode === 'private') ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-800/50">
                        {chatMode === 'group' && selectedGroup ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-green-600 rounded-full flex items-center justify-center">
                                <img
                                  src={selectedGroup.icon}
                                  alt={selectedGroup.name}
                                  className="w-6 h-6 object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold">{selectedGroup.name}</h3>
                                <p className="text-xs text-gray-400">{selectedGroup.memberCount} members</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const detailText = selectedGroup.members.map(m => `• ${m.name} ${m.online ? '(Online)' : '(Offline)'}`).join('\n');
                                alert(`Member Grup:\n\n${detailText}`);
                              }}
                              className="text-xs text-lime-500 hover:text-lime-400 underline"
                            >
                              Lihat Members
                            </button>
                          </div>
                        ) : selectedPeer && chatMode === 'private' ? (
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={selectedPeer.avatar}
                                alt={selectedPeer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              {selectedPeer.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{selectedPeer.name}</h3>
                              <p className="text-xs text-gray-400">
                                {selectedPeer.online ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!message.isMe && chatMode === 'group' && message.senderAvatar && (
                              <div className="flex-shrink-0 mr-2">
                                <img
                                  src={message.senderAvatar}
                                  alt={message.senderName}
                                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-lime-500 transition-all"
                                  onClick={() => {
                                    const member = selectedGroup?.members.find(m => m.id === message.senderId);
                                    if (member) {
                                      handleMemberClick(member);
                                    }
                                  }}
                                  title={`Klik untuk chat dengan ${message.senderName}`}
                                />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] rounded-2xl p-3 ${
                                message.isMe
                                  ? 'bg-lime-500 text-black'
                                  : 'bg-gray-800 text-white'
                              }`}
                            >
                              {!message.isMe && chatMode === 'group' && message.senderName && (
                                <p className="text-xs font-semibold text-lime-400 mb-1">
                                  {message.senderName}
                                </p>
                              )}
                              <p className="text-sm">{message.text}</p>
                              <p className={`text-xs mt-1 ${message.isMe ? 'text-black/60' : 'text-gray-400'}`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Typing indicator */}
                        {isSending && (
                          <div className="flex justify-start">
                            <div className="bg-gray-800 text-white rounded-2xl p-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-gray-800/50">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                            placeholder="Ketik pesan..."
                            disabled={isSending}
                            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-50"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={isSending}
                            className="bg-lime-500 hover:bg-lime-400 text-black font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSending ? 'Mengirim...' : 'Kirim'}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-bold text-white mb-2">Pilih Grup untuk Mulai Chat</h3>
                        <p className="text-gray-400">Klik salah satu grup di sebelah kiri untuk memulai percakapan</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(132, 204, 22, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(132, 204, 22, 0.5);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(132, 204, 22, 0.3) rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
