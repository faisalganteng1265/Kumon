'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavbarVisibility } from '@/contexts/NavbarVisibilityContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  nama: string;
  universitas: string;
  jurusan: string;
  minat: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { showNavbar } = useNavbarVisibility();
  const [activeTab, setActiveTab] = useState<'account' | 'profile'>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Account data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile data
  const [userData, setUserData] = useState<UserData>({
    nama: '',
    universitas: '',
    jurusan: '',
    minat: '',
  });

  useEffect(() => {
    if (user && isOpen) {
      // Load user data
      setEmail(user.email || '');
      setUsername(user.user_metadata?.username || '');
      loadUserProfile();
      loadUserData();
    }
  }, [user, isOpen]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        setAvatarPreview(data.avatar_url);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading user data:', error);
      }

      if (data) {
        setUserData({
          nama: data.nama || '',
          universitas: data.universitas || '',
          jurusan: data.jurusan || '',
          minat: data.minat || '',
        });
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploadingAvatar(true);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      throw new Error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
      }

      // Update email if changed
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
      }

      // Update username
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username: username },
      });
      if (metadataError) throw metadataError;

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
        setNewPassword('');
        setConfirmPassword('');
      }

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          email,
          avatar_url: newAvatarUrl,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update local state
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);

      setSuccess('Account updated successfully!');

      // Reload page after 1 second to refresh UserProfile component
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if user data exists
      const { data: existingData } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (existingData) {
        // Update existing data
        const { error } = await supabase
          .from('user_data')
          .update({
            nama: userData.nama,
            universitas: userData.universitas,
            jurusan: userData.jurusan,
            minat: userData.minat,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Insert new data
        const { error } = await supabase.from('user_data').insert([
          {
            user_id: user?.id,
            nama: userData.nama,
            universitas: userData.universitas,
            jurusan: userData.jurusan,
            minat: userData.minat,
          },
        ]);

        if (error) throw error;
      }

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      showNavbar();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    showNavbar();
  };

  const getInitial = () => {
    return username.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      style={{ zIndex: 99999 }}
    >
      <div className="bg-[#fef9ed] rounded-3xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] overflow-y-auto" style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f7d050] via-yellow-500 to-[#f7d050] animate-pulse"></div>

        {/* Close button */}
        <div className="absolute top-6 right-6 z-50">
          <button
            type="button"
            onClick={handleCloseClick}
            className="text-gray-900 hover:text-gray-700 transition-all duration-300 hover:rotate-90 bg-white rounded-full p-2 hover:bg-gray-100 cursor-pointer border-2 border-black"
            style={{
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 9999,
              boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 p-10">
          {/* Title with logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <Image
                src="/logo1.png"
                alt="AICAMPUS"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 p-1 bg-white rounded-xl" style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}>
            <button
              onClick={() => {
                setActiveTab('account');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'account'
                  ? 'bg-[#f7d050] text-gray-900 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={activeTab === 'account' ? { boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)' } : {}}
            >
              Account
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-[#f7d050] text-gray-900 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={activeTab === 'profile' ? { boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)' } : {}}
            >
              Data Diri
            </button>
          </div>

          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleUpdateAccount} className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Profile Picture</label>

                {/* Avatar Preview */}
                <div className="relative mb-6 group">
                  {avatarPreview ? (
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#f7d050]" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)' }}>
                      <Image
                        src={avatarPreview}
                        alt="Avatar"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative w-40 h-40 rounded-full bg-[#f7d050] flex items-center justify-center text-gray-900 font-bold text-6xl" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)' }}>
                      {getInitial()}
                    </div>
                  )}

                  {/* Camera Icon Button */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 text-gray-900 p-3 rounded-full cursor-pointer transition-all hover:scale-110 border-2 border-black"
                    style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <p className="text-sm text-gray-600 text-center">
                  Click the camera icon to upload a new avatar<br />
                  <span className="text-xs text-gray-500">(Max 2MB, JPG/PNG/GIF)</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all"
                      placeholder="Enter username"
                      required
                      style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all"
                      placeholder="Enter email"
                      required
                      style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Changing email will require verification
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#f7d050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all"
                        placeholder="Enter new password (min 6 characters)"
                        minLength={6}
                        style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all"
                        placeholder="Confirm new password"
                        minLength={6}
                        style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || uploadingAvatar}
                className="w-full bg-[#f7d050] hover:bg-yellow-400 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg border-2 border-black"
                style={{ boxShadow: '5px 5px 0px rgba(0, 0, 0, 1)' }}
              >
                {uploadingAvatar ? 'Uploading Avatar...' : loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f7d050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={userData.nama}
                    onChange={(e) => setUserData({ ...userData, nama: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all"
                    placeholder="Masukkan nama lengkap"
                    required
                    style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f7d050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Universitas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <select
                    value={userData.universitas}
                    onChange={(e) => setUserData({ ...userData, universitas: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all appearance-none cursor-pointer"
                    required
                    style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                  >
                    <option value="">Pilih Universitas</option>
                    <option value="Universitas Sebelas Maret (UNS)">Universitas Sebelas Maret (UNS)</option>
                    <option value="Universitas Gadjah Mada (UGM)">Universitas Gadjah Mada (UGM)</option>
                    <option value="Institut Teknologi Bandung (ITB)">Institut Teknologi Bandung (ITB)</option>
                    <option value="Universitas Indonesia (UI)">Universitas Indonesia (UI)</option>
                    <option value="Institut Teknologi Sepuluh Nopember (ITS)">Institut Teknologi Sepuluh Nopember (ITS)</option>
                    <option value="Universitas Brawijaya (UB)">Universitas Brawijaya (UB)</option>
                    <option value="Universitas Diponegoro (UNDIP)">Universitas Diponegoro (UNDIP)</option>
                    <option value="Universitas Airlangga (UNAIR)">Universitas Airlangga (UNAIR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f7d050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Jurusan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={userData.jurusan}
                    onChange={(e) => setUserData({ ...userData, jurusan: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all"
                    placeholder="Contoh : Teknik Informatika"
                    required
                    style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#f7d050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Minat
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <textarea
                    value={userData.minat}
                    onChange={(e) => setUserData({ ...userData, minat: e.target.value })}
                    rows={5}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f7d050] transition-all resize-none"
                    placeholder="Contoh: Web Development, AI, Machine Learning"
                    required
                    style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#f7d050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tuliskan minat atau bidang yang kamu minati
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f7d050] hover:bg-yellow-400 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg border-2 border-black"
                style={{ boxShadow: '5px 5px 0px rgba(0, 0, 0, 1)' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Chrome, Safari, Edge */
        div[class*="rounded-3xl"]::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        div[class*="rounded-3xl"]::-webkit-scrollbar-track {
          background: rgba(247, 208, 80, 0.2);
          border-radius: 10px;
        }

        div[class*="rounded-3xl"]::-webkit-scrollbar-thumb {
          background: #f7d050;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }

        div[class*="rounded-3xl"]::-webkit-scrollbar-thumb:hover {
          background: #e5c040;
          border: 1px solid rgba(0, 0, 0, 0.5);
        }

        /* Firefox */
        div[class*="rounded-3xl"] {
          scrollbar-width: thin;
          scrollbar-color: #f7d050 rgba(247, 208, 80, 0.2);
        }

        /* Textarea specific scrollbar */
        textarea::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        textarea::-webkit-scrollbar-track {
          background: rgba(247, 208, 80, 0.2);
          border-radius: 10px;
        }

        textarea::-webkit-scrollbar-thumb {
          background: #f7d050;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: #e5c040;
          border: 1px solid rgba(0, 0, 0, 0.5);
        }

        textarea {
          scrollbar-width: thin;
          scrollbar-color: #f7d050 rgba(247, 208, 80, 0.2);
        }

        /* Select specific scrollbar */
        select::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        select::-webkit-scrollbar-track {
          background: rgba(247, 208, 80, 0.2);
          border-radius: 10px;
        }

        select::-webkit-scrollbar-thumb {
          background: #f7d050;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }

        select::-webkit-scrollbar-thumb:hover {
          background: #e5c040;
          border: 1px solid rgba(0, 0, 0, 0.5);
        }

        select {
          scrollbar-width: thin;
          scrollbar-color: #f7d050 rgba(247, 208, 80, 0.2);
        }
      `}</style>
    </div>
  );
}
