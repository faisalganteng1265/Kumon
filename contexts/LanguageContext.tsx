'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    'nav.pages': 'Halaman',
    'nav.features': 'Fitur',
    'nav.peerconnect': 'PeerConnect',
    'nav.aboutUs': 'Tentang Kami',
    'nav.login': 'Masuk',
    'nav.logout': 'Keluar',
    
    // Page titles
    'page.aiCampusGuide': 'AI Campus Guide',
    'page.eventRecommender': 'Event Recommender',
    'page.smartScheduleBuilder': 'Smart Schedule Builder',
    'page.peerConnectAI': 'Peer Connect AI',
    'page.smartTaskManager': 'Smart Task Manager',
    'page.projectCollaboration': 'Project Collaboration',
    
    // Hero Section
    'hero.empowering': 'Memberdayakan Mahasiswa dengan AI',
    'hero.companion': 'Teman Kampus Pintar Anda',
    'hero.navigate': 'Navigasi Kehidupan Kampus dengan Lancar',
    'hero.learn': 'Belajar Lebih Cerdas, Terhubung Lebih Baik, Raih Lebih Banyak',
    
    // Features Section
    'features.title': 'Fitur Unggulan Kami',
    'features.subtitle': 'Temukan berbagai fitur inovatif yang dirancang khusus untuk meningkatkan pengalaman kampus Anda',
    'features.aiCampusGuide': 'AI Campus Guide Chatbot',
    'features.aiCampusGuideDesc': 'Tanya apa saja tentang kampus! Dari cara mengisi KRS, lokasi gedung, info dosen, hingga prosedur beasiswa. AI siap membantu 24/7.',
    'features.eventRecommender': 'Event Recommender',
    'features.eventRecommenderDesc': 'Dapatkan rekomendasi kegiatan yang sesuai dengan minatmu! Seminar, lomba, UKM, volunteering - semua disesuaikan untukmu.',
    'features.smartSchedule': 'Smart Schedule Builder',
    'features.smartScheduleDesc': 'AI bantu atur jadwal kuliah dan kegiatanmu agar seimbang. Tidak ada lagi bentrok jadwal atau overload kegiatan!',
    'features.peerConnect': 'Peer Connect AI',
    'features.peerConnectDesc': 'Temukan teman atau mentor dengan minat yang sama! AI mencocokkan kamu dengan orang-orang yang tepat untuk berkembang bersama.',
    'features.taskManager': 'Smart Task Manager',
    'features.taskManagerDesc': 'Kelola tugas dan deadline dengan mudah! AI akan prioritaskan tugasmu dan ingatkan kamu sebelum terlambat.',
    'features.projectCollab': 'Project Collaboration',
    'features.projectCollabDesc': 'Kolaborasi project jadi lebih mudah! Buat tim, bagikan tugas, dan pantau progress bersama dalam satu platform.',
    
    // Stats
    'stats.activeStudents': 'Mahasiswa Aktif',
    'stats.eventsPerMonth': 'Event per Bulan',
    'stats.userSatisfaction': 'Kepuasan Pengguna',
    'stats.aiSupport': 'AI Support',
    
    // FAQ Section
    'faq.title': 'FAQs',
    'faq.welcome': 'Halo! Saya AI Assistant untuk aplikasi web AICAMPUS. Saya siap membantu menjawab pertanyaan seputar aplikasi AICAMPUS. Silakan pilih pertanyaan cepat di bawah atau ketik pertanyaan Anda sendiri!',
    'faq.q1': 'Apakah saya harus login untuk menggunakan fitur-fitur AICAMPUS?',
    'faq.a1': 'Ya, Anda perlu membuat akun dan login untuk menggunakan semua fitur AICAMPUS. Proses registrasi sangat mudah dan cepat - cukup gunakan email kampus Anda atau login dengan akun Google. Setelah login, Anda bisa langsung menikmati semua fitur seperti AI Campus Guide, Event Recommender, Smart Schedule Builder, dan lainnya.',
    'faq.q2': 'Bagaimana cara menggunakan fitur AI Campus Guide?',
    'faq.a2': 'Setelah login dan atur ptofile dimana Anda memasukan asal universtas atau bisa langsung masuk tanpa mengatur profile, klik page "AI Campus Guide" di dashboard. klik pertanyaan Anda tentang kampus atau bisa menannyakan selain yang ada pada pilihan di mode general, lalu AI akan memberikan jawaban yang akurat.',
    'faq.q3': 'Bagaimana cara menggunakan Smart Schedule Builder?',
    'faq.a3': 'Klik menu "Smart Schedule Builder", lalu masukkan mata kuliah dan kegiatan Anda dengan menekan tombol "Jadwal Kuliah" atau "Kegiatan Lain". Isi detail seperti nama, hari, dan waktu. Setelah selesai menambahkan semua jadwal, klik "Generate Jadwal Optimal" dan AI akan menyusun jadwal terbaik yang menghindari bentrok dan memaksimalkan waktu istirahat Anda. ini juga telah ter integrasi dengan google kalender.',
    'faq.q4': 'Bagaimana cara menggunakan Event Recommender?',
    'faq.a4': 'Buka menu "Event Recommender" di dashboard. Pertama kali, Anda di perlihatkan event event yang ada, tetapi apabila anda ingin mengikuti event tertentu maka anda dapat menggunakan filter yang ada di bagian sebelah kiri. Setelah itu, sistem akan otomatis merekomendasikan event yang sesuai. Anda bisa mendaftar langsung, atau melihat detail event seperti waktu, lokasi, dan persyaratan.',
    'faq.q5': 'Bagaimana cara menggunakan Peer Connect AI?',
    'faq.a5': 'Masuk ke menu "Peer Connect AI" dan lengkapi profil Anda (jurusan, minat, skills, tujuan). AI akan mencocokkan Anda dengan mahasiswa atau mentor yang compatible. Anda bisa melihat profil match, mengirim request connect, dan mulai berkomunikasi. Fitur ini sangat berguna untuk mencari study partner atau mentor untuk bimbingan karir juga dapat menggunakan video call.',
    'faq.q6': 'Bagaimana cara menggunakan Smart Task Manager?',
    'faq.a6': 'Buka menu "Smart Task Manager" dan tambahkan tugas-tugas Anda dengan deadline masing-masing. AI akan otomatis memprioritaskan tugas berdasarkan tingkat urgensi dan deadline. Anda akan mendapat notifikasi reminder sebelum deadline, dan bisa tracking progress tugas dalam satu dashboard yang mudah dipahami.',
    'faq.q7': 'Bagaimana cara menggunakan Project Collaboration?',
    'faq.a7': 'Klik "Project Collaboration", buat project baru, dan undang anggota tim Anda. Anda bisa assign task ke masing-masing anggota, upload file project, melakukan real-time collaboration, dan tracking progress project.',
    'faq.q8': 'Apakah AI Campus Guide bisa menjawab semua pertanyaan tentang kampus?',
    'faq.a8': 'Ya! AI Campus Guide kami dirancang untuk menjawab berbagai pertanyaan seputar kehidupan kampus, mulai dari cara mengisi KRS, lokasi gedung, info dosen, prosedur beasiswa, jadwal kuliah, hingga informasi UKM. AI kami terus belajar dan diperbarui untuk memberikan jawaban yang akurat dan relevan.',
    'faq.q9': 'Apakah data pribadi saya aman?',
    'faq.a9': 'Keamanan data Anda adalah prioritas utama kami. Semua informasi pribadi dienkripsi dan disimpan dengan standar keamanan tingkat enterprise. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin Anda. Platform kami juga mematuhi regulasi perlindungan data yang berlaku.',
    'faq.q10': 'Apakah layanan ini berbayar?',
    'faq.a10': 'Kami menyediakan paket gratis dengan fitur dasar yang sudah sangat lengkap untuk mendukung kehididupan kampus Anda. Untuk fitur premium seperti mentoring prioritas, analitik mendalam, dan rekomendasi yang lebih personal, tersedia paket berlangganan dengan harga terjangkau khusus untuk mahasiswa.',
    
    // PeerConnect Section
    'peerconnect.title': 'PeerConnect',
    'peerconnect.subtitle': 'Terhubung dengan teman sekelas dan dosen melalui platform komunikasi terintegrasi kami',
    'peerconnect.groupChat': 'Grup Chat',
    'peerconnect.groupChatDesc': 'Buat dan bergabung dengan grup chat untuk diskusi kelas, proyek kelompok, atau komunitas kampus.',
    'peerconnect.groupFeature1': 'Bagikan file dan dokumen penting',
    'peerconnect.groupFeature2': 'Diskusi real-time dengan anggota grup',
    'peerconnect.groupFeature3': 'Notifikasi untuk pesan penting',
    'peerconnect.privateChat': 'Private Chat',
    'peerconnect.privateChatDesc': 'Komunikasi langsung dan pribadi dengan teman sekelas atau dosen untuk diskusi yang lebih fokus.',
    'peerconnect.privateFeature1': 'Pesan end-to-end encryption',
    'peerconnect.privateFeature2': 'Bagikan file dan media secara aman',
    'peerconnect.privateFeature3': 'Status online untuk melihat ketersediaan',
    'peerconnect.videoCall': 'Video Call',
    'peerconnect.videoCallDesc': 'Lakukan panggilan video dengan kualitas tinggi untuk meeting online, konsultasi, atau belajar bersama.',
    'peerconnect.videoFeature1': 'Video HD dengan audio jernih',
    'peerconnect.videoFeature2': 'Screen sharing untuk presentasi',
    'peerconnect.videoFeature3': 'Record meeting untuk dokumentasi',

    // AI Campus Section
    'aicampus.title': 'AI Campus Chatbot',
    'aicampus.subtitle': 'Asisten virtual cerdas untuk menjawab pertanyaan seputar kampus',
    'aicampus.campusMode': 'Mode Kampus',
    'aicampus.campusModeDesc': 'Tanya tentang informasi kampus, KRS, gedung, dosen, beasiswa, dan segala hal terkait kampus',
    'aicampus.campusFeature1': 'Informasi KRS, mata kuliah, dan jadwal',
    'aicampus.campusFeature2': 'Data dosen, gedung, dan fasilitas kampus',
    'aicampus.campusFeature3': 'Info beasiswa dan program akademik',
    'aicampus.generalMode': 'Mode General',
    'aicampus.generalModeDesc': 'Tanya apapun! AI siap membantu menjawab pertanyaan umum, tugas, atau hal lainnya',
    'aicampus.generalFeature1': 'Bantuan mengerjakan tugas dan PR',
    'aicampus.generalFeature2': 'Penjelasan konsep dan materi pelajaran',
    'aicampus.generalFeature3': 'Pertanyaan umum tentang apapun',

    // Event Reminder Section
    'eventreminder.title': 'Event Reminder',
    'eventreminder.subtitle': 'Rekomendasi event kampus yang sesuai dengan minat dan kebutuhanmu',
    'eventreminder.recommendations': 'Rekomendasi Event',
    'eventreminder.recommendationsDesc': 'Dapatkan rekomendasi event kampus yang sesuai dengan minat dan kebutuhanmu',
    'eventreminder.feature1': 'Notifikasi acara berdasarkan preferensi',
    'eventreminder.feature2': 'Kalender terintegrasi untuk pelacakan',
    'eventreminder.feature3': 'Konfirmasi dan pendaftaran langsung',

    // Smart Schedule Section
    'smartschedule.title': 'Smart Schedule',
    'smartschedule.subtitle': 'Kelola jadwal kuliah, tugas, dan aktivitas kampus dengan cerdas',
    'smartschedule.optimization': 'Optimalisasi Jadwal',
    'smartschedule.optimizationDesc': 'Kelola dan optimalkan jadwal kuliah, tugas, dan aktivitas kampus dengan cerdas',
    'smartschedule.optimizationFeature1': 'Optimasi jadwal berbasis AI',
    'smartschedule.optimizationFeature2': 'Pengingat otomatis untuk tenggat waktu',
    'smartschedule.optimizationFeature3': 'Tampilan visual jadwal mingguan',
    'smartschedule.integration': 'Integrasi ke Kalender',
    'smartschedule.integrationDesc': 'Sinkronisasi jadwal dengan Kalender Google dan platform lainnya',
    'smartschedule.integrationFeature1': 'Sinkronisasi dengan Kalender Google',
    'smartschedule.integrationFeature2': 'Ekspor jadwal ke berbagai format',
    'smartschedule.integrationFeature3': 'Sinkronisasi otomatis secara real-time',

    // Task Manager Section
    'taskmanager.title': 'Task Manager',
    'taskmanager.subtitle': 'Kelola tugas kuliah dan proyek dengan sistem manajemen yang efektif',
    'taskmanager.manageTasks': 'Kelola Tugas',
    'taskmanager.manageTasksDesc': 'Kelola tugas kuliah dan proyek dengan sistem manajemen yang efektif',
    'taskmanager.feature1': 'Daftar tugas dengan sistem prioritas',
    'taskmanager.feature2': 'Pelacakan kemajuan untuk setiap tugas',
    'taskmanager.feature3': 'Kolaborasi tim untuk proyek kelompok',

    // Collaboration Section
    'collaboration.title': 'Project Collaboration',
    'collaboration.subtitle': 'Terhubung dengan teman sekelas dan dosen melalui platform komunikasi terintegrasi',
    'collaboration.project': 'Kolaborasi Project',
    'collaboration.projectDesc': 'Platform kolaborasi untuk proyek kelompok yang lebih produktif',
    'collaboration.feature1': 'Alat kolaborasi secara real-time',
    'collaboration.feature2': 'Berbagi file dan kontrol versi',
    'collaboration.feature3': 'Pembagian tugas untuk anggota tim',
  },
  en: {
    // Navigation
    'nav.pages': 'Pages',
    'nav.features': 'Features',
    'nav.peerconnect': 'PeerConnect',
    'nav.aboutUs': 'About Us',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Page titles
    'page.aiCampusGuide': 'AI Campus Guide',
    'page.eventRecommender': 'Event Recommender',
    'page.smartScheduleBuilder': 'Smart Schedule Builder',
    'page.peerConnectAI': 'Peer Connect AI',
    'page.smartTaskManager': 'Smart Task Manager',
    'page.projectCollaboration': 'Project Collaboration',
    
    // Hero Section
    'hero.empowering': 'Empowering Students with AI',
    'hero.companion': 'Your Smart Campus Companion',
    'hero.navigate': 'Navigate Campus Life Seamlessly',
    'hero.learn': 'Learn Smarter, Connect Better, Achieve More',
    
    // Features Section
    'features.title': 'Our Featured Features',
    'features.subtitle': 'Discover various innovative features specifically designed to enhance your campus experience',
    'features.aiCampusGuide': 'AI Campus Guide Chatbot',
    'features.aiCampusGuideDesc': 'Ask anything about campus! From how to fill KRS, building locations, lecturer info, to scholarship procedures. AI is ready to help 24/7.',
    'features.eventRecommender': 'Event Recommender',
    'features.eventRecommenderDesc': 'Get activity recommendations that match your interests! Seminars, competitions, student organizations, volunteering - all tailored for you.',
    'features.smartSchedule': 'Smart Schedule Builder',
    'features.smartScheduleDesc': 'AI helps arrange your class and activity schedule to be balanced. No more schedule conflicts or activity overload!',
    'features.peerConnect': 'Peer Connect AI',
    'features.peerConnectDesc': 'Find friends or mentors with similar interests! AI matches you with the right people to grow together.',
    'features.taskManager': 'Smart Task Manager',
    'features.taskManagerDesc': 'Manage tasks and deadlines easily! AI will prioritize your tasks and remind you before it\'s too late.',
    'features.projectCollab': 'Project Collaboration',
    'features.projectCollabDesc': 'Project collaboration becomes easier! Create teams, share tasks, and monitor progress together in one platform.',
    
    // Stats
    'stats.activeStudents': 'Active Students',
    'stats.eventsPerMonth': 'Events per Month',
    'stats.userSatisfaction': 'User Satisfaction',
    'stats.aiSupport': 'AI Support',
    
    // FAQ Section
    'faq.title': 'FAQs',
    'faq.welcome': 'Hello! I am the AI Assistant for the AICAMPUS web application. I am ready to help answer questions about the AICAMPUS application. Please select a quick question below or type your own question!',
    'faq.q1': 'Do I need to login to use AICAMPUS features?',
    'faq.a1': 'Yes, you need to create an account and login to use all AICAMPUS features. The registration process is very easy and fast - just use your campus email or login with a Google account. After logging in, you can immediately enjoy all features like AI Campus Guide, Event Recommender, Smart Schedule Builder, and others.',
    'faq.q2': 'How to use the AI Campus Guide feature?',
    'faq.a2': 'After logging in and setting up your profile where you enter your university or you can directly enter without setting up a profile, click the "AI Campus Guide" page in the dashboard. Click your question about campus or you can ask questions other than those in the general mode options, then AI will provide accurate answers.',
    'faq.q3': 'How to use Smart Schedule Builder?',
    'faq.a3': 'Click the "Smart Schedule Builder" menu, then enter your courses and activities by pressing the "Class Schedule" or "Other Activities" button. Fill in details like name, day, and time. After adding all schedules, click "Generate Optimal Schedule" and AI will arrange the best schedule that avoids conflicts and maximizes your rest time. This is also integrated with Google Calendar.',
    'faq.q4': 'How to use Event Recommender?',
    'faq.a4': 'Open the "Event Recommender" menu in the dashboard. The first time, you are shown existing events, but if you want to follow a specific event, you can use the filters on the left side. After that, the system will automatically recommend suitable events. You can register directly, or view event details like time, location, and requirements.',
    'faq.q5': 'How to use Peer Connect AI?',
    'faq.a5': 'Go to the "Peer Connect AI" menu and complete your profile (major, interests, skills, goals). AI will match you with compatible students or mentors. You can see match profiles, send connect requests, and start communicating. This feature is very useful for finding study partners or mentors for career guidance and can also use video calls.',
    'faq.q6': 'How to use Smart Task Manager?',
    'faq.a6': 'Open the "Smart Task Manager" menu and add your tasks with their respective deadlines. AI will automatically prioritize tasks based on urgency level and deadline. You will receive reminder notifications before deadlines, and can track task progress in one easy-to-understand dashboard.',
    'faq.q7': 'How to use Project Collaboration?',
    'faq.a7': 'Click "Project Collaboration", create a new project, and invite your team members. You can assign tasks to each member, upload project files, do real-time collaboration, and track project progress.',
    'faq.q8': 'Can AI Campus Guide answer all questions about campus?',
    'faq.a8': 'Yes! Our AI Campus Guide is designed to answer various questions about campus life, from how to fill KRS, building locations, lecturer info, scholarship procedures, class schedules, to student organization information. Our AI continues to learn and is updated to provide accurate and relevant answers.',
    'faq.q9': 'Is my personal data secure?',
    'faq.a9': 'Your data security is our top priority. All personal information is encrypted and stored with enterprise-level security standards. We will not share your data with third parties without your permission. Our platform also complies with applicable data protection regulations.',
    'faq.q10': 'Is this service paid?',
    'faq.a10': 'We provide a free package with basic features that are already very complete to support your campus life. For premium features like priority mentoring, in-depth analytics, and more personalized recommendations, subscription packages are available at affordable prices specifically for students.',
    
    // PeerConnect Section
    'peerconnect.title': 'PeerConnect',
    'peerconnect.subtitle': 'Connect with classmates and lecturers through our integrated communication platform',
    'peerconnect.groupChat': 'Group Chat',
    'peerconnect.groupChatDesc': 'Create and join group chats for class discussions, group projects, or campus communities.',
    'peerconnect.groupFeature1': 'Share important files and documents',
    'peerconnect.groupFeature2': 'Real-time discussions with group members',
    'peerconnect.groupFeature3': 'Notifications for important messages',
    'peerconnect.privateChat': 'Private Chat',
    'peerconnect.privateChatDesc': 'Direct and personal communication with classmates or lecturers for more focused discussions.',
    'peerconnect.privateFeature1': 'End-to-end encrypted messages',
    'peerconnect.privateFeature2': 'Secure file and media sharing',
    'peerconnect.privateFeature3': 'Online status to see availability',
    'peerconnect.videoCall': 'Video Call',
    'peerconnect.videoCallDesc': 'Make high-quality video calls for online meetings, consultations, or study sessions together.',
    'peerconnect.videoFeature1': 'HD video with clear audio',
    'peerconnect.videoFeature2': 'Screen sharing for presentations',
    'peerconnect.videoFeature3': 'Record meetings for documentation',

    // AI Campus Section
    'aicampus.title': 'AI Campus Chatbot',
    'aicampus.subtitle': 'Smart virtual assistant to answer questions about campus',
    'aicampus.campusMode': 'Campus Mode',
    'aicampus.campusModeDesc': 'Ask about campus information, KRS, buildings, lecturers, scholarships, and everything related to campus',
    'aicampus.campusFeature1': 'KRS information, courses, and schedules',
    'aicampus.campusFeature2': 'Lecturer data, buildings, and campus facilities',
    'aicampus.campusFeature3': 'Scholarship and academic program info',
    'aicampus.generalMode': 'General Mode',
    'aicampus.generalModeDesc': 'Ask anything! AI is ready to help answer general questions, assignments, or anything else',
    'aicampus.generalFeature1': 'Help with homework and assignments',
    'aicampus.generalFeature2': 'Explanation of concepts and learning materials',
    'aicampus.generalFeature3': 'General questions about anything',

    // Event Reminder Section
    'eventreminder.title': 'Event Reminder',
    'eventreminder.subtitle': 'Campus event recommendations that match your interests and needs',
    'eventreminder.recommendations': 'Event Recommendations',
    'eventreminder.recommendationsDesc': 'Get campus event recommendations that match your interests and needs',
    'eventreminder.feature1': 'Event notifications based on preferences',
    'eventreminder.feature2': 'Integrated calendar for tracking',
    'eventreminder.feature3': 'Direct confirmation and registration',

    // Smart Schedule Section
    'smartschedule.title': 'Smart Schedule',
    'smartschedule.subtitle': 'Manage class schedules, assignments, and campus activities smartly',
    'smartschedule.optimization': 'Schedule Optimization',
    'smartschedule.optimizationDesc': 'Manage and optimize class schedules, assignments, and campus activities smartly',
    'smartschedule.optimizationFeature1': 'AI-based schedule optimization',
    'smartschedule.optimizationFeature2': 'Automatic reminders for deadlines',
    'smartschedule.optimizationFeature3': 'Visual display of weekly schedule',
    'smartschedule.integration': 'Calendar Integration',
    'smartschedule.integrationDesc': 'Synchronize schedule with Google Calendar and other platforms',
    'smartschedule.integrationFeature1': 'Synchronization with Google Calendar',
    'smartschedule.integrationFeature2': 'Export schedule to various formats',
    'smartschedule.integrationFeature3': 'Automatic real-time synchronization',

    // Task Manager Section
    'taskmanager.title': 'Task Manager',
    'taskmanager.subtitle': 'Manage college assignments and projects with an effective management system',
    'taskmanager.manageTasks': 'Manage Tasks',
    'taskmanager.manageTasksDesc': 'Manage college assignments and projects with an effective management system',
    'taskmanager.feature1': 'Task list with priority system',
    'taskmanager.feature2': 'Progress tracking for each task',
    'taskmanager.feature3': 'Team collaboration for group projects',

    // Collaboration Section
    'collaboration.title': 'Project Collaboration',
    'collaboration.subtitle': 'Connect with classmates and lecturers through an integrated communication platform',
    'collaboration.project': 'Project Collaboration',
    'collaboration.projectDesc': 'Collaboration platform for more productive group projects',
    'collaboration.feature1': 'Real-time collaboration tools',
    'collaboration.feature2': 'File sharing and version control',
    'collaboration.feature3': 'Task assignment for team members',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with localStorage value or default to 'id'
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
        return savedLanguage;
      }
    }
    return 'id';
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}