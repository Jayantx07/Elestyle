import React, { useState, useEffect } from 'react';
import { ProfileCard } from '../components/organisms/ProfileCard';
import { ProfileSettingsList, type SettingItem } from '../components/organisms/ProfileSettingsList';
import { Typography } from '../components/atoms/Typography';

const DUMMY_USER = {
  name: "James",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  verificationProgress: 80,
};

const ProfilePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const AddressIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const LanguageIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  const settingsItems: SettingItem[] = [
    { id: 'email', label: 'Email', icon: EmailIcon, type: 'link' },
    { id: 'phone', label: 'Phone', icon: PhoneIcon, type: 'link' },
    { id: 'notification', label: 'Notification', icon: NotificationIcon, type: 'toggle', isActive: notificationsEnabled },
    { id: 'address', label: 'Saved address', icon: AddressIcon, type: 'link' },
    { id: 'language', label: 'Select language', icon: LanguageIcon, type: 'link' },
  ];

  const handleToggleChange = (id: string, newValue: boolean) => {
    if (id === 'notification') {
      setNotificationsEnabled(newValue);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 px-4 md:px-8 bg-[#EAF3EB]">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Title (Visible on mobile like the image, positioned cleanly on desktop) */}
        <div className="flex items-center justify-between md:justify-start gap-4 mb-8">
          <button className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <h1 className="font-fraunces font-medium text-2xl md:text-4xl text-center flex-1 md:flex-none" style={{ color: 'var(--text-primary)' }}>
            Profile
          </h1>
          
          <button className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          
          {/* Left Column (Mobile Top): Profile Card */}
          <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-32">
            <ProfileCard 
              name={DUMMY_USER.name}
              avatarUrl={DUMMY_USER.avatarUrl}
              verificationProgress={DUMMY_USER.verificationProgress}
              onEditProfile={() => alert('Edit Profile clicked')}
            />
          </div>

          {/* Right Column (Mobile Bottom): Settings List */}
          <div className="md:col-span-7 lg:col-span-8 md:pt-16">
            <ProfileSettingsList 
              items={settingsItems} 
              onToggleChange={handleToggleChange} 
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
