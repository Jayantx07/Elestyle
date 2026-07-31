import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '../components/organisms/ProfileCard';
import { ProfileSettingsList, type SettingItem } from '../components/organisms/ProfileSettingsList';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const ProfilePage: React.FC = () => {
  const { user, accessToken, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setIsSaving(true);
    setEditError('');

    try {
      const data = await authService.updateProfile({ name: editName, phone: editPhone }, accessToken);
      if (data.success && data.user) {
        updateUser(data.user);
        setIsEditing(false);
      } else {
        setEditError(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setEditError(err.message || 'An error occurred updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // SVG Icons for the settings
  const EmailIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const PhoneIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const NotificationIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const LogoutIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const settingsItems: SettingItem[] = [
    { 
      id: 'email', 
      label: `Email: ${user?.email || 'N/A'}`, 
      icon: EmailIcon, 
      type: 'link',
      onClick: () => {}
    },
    { 
      id: 'phone', 
      label: `Phone: ${user?.phone || 'Not provided'}`, 
      icon: PhoneIcon, 
      type: 'link',
      onClick: () => setIsEditing(true)
    },
    { 
      id: 'notification', 
      label: 'Notification', 
      icon: NotificationIcon, 
      type: 'toggle', 
      isActive: notificationsEnabled 
    },
    { 
      id: 'logout', 
      label: 'Sign Out', 
      icon: LogoutIcon, 
      type: 'link',
      onClick: handleLogout
    },
  ];

  const handleToggleChange = (id: string, newValue: boolean) => {
    if (id === 'notification') {
      setNotificationsEnabled(newValue);
    }
  };

  const verificationProgress = user?.isEmailVerified ? 100 : 50;

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 px-4 md:px-8 bg-[#EAF3EB]">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Title */}
        <div className="flex items-center justify-between md:justify-start gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <h1 className="font-fraunces font-medium text-2xl md:text-4xl text-center flex-1 md:flex-none" style={{ color: 'var(--text-primary)' }}>
            Profile
          </h1>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Profile Card */}
          <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-32">
            <ProfileCard 
              name={user?.name || 'User'}
              email={user?.email}
              phone={user?.phone}
              avatarUrl={user?.profileImage || ''}
              verificationProgress={verificationProgress}
              onEditProfile={() => setIsEditing(true)}
            />
          </div>

          {/* Right Column: Settings List */}
          <div className="md:col-span-7 lg:col-span-8 md:pt-16">
            <ProfileSettingsList 
              items={settingsItems} 
              onToggleChange={handleToggleChange} 
            />
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-fraunces text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
