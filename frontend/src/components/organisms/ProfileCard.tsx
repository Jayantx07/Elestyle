import React from 'react';

export interface ProfileCardProps {
  name: string;
  avatarUrl: string;
  verificationProgress: number; // 0 to 100
  onEditProfile?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  avatarUrl,
  verificationProgress,
  onEditProfile
}) => {
  return (
    <div className="relative pt-16">
      {/* Avatar Container (Positioned absolutely to overflow the card) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-sm ring-4 ring-[#EAF3EB]" style={{ backgroundColor: 'var(--bg-page)' }}>
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Main Card */}
      <div 
        className="w-full rounded-[32px] p-6 pt-20 border shadow-sm relative overflow-hidden" 
        style={{ 
          backgroundColor: '#F3F8F3', // Light greenish/white tint mimicking glassmorphism
          borderColor: 'rgba(0,0,0,0.03)' 
        }}
      >
        {/* Soft glassmorphism gradient effect overlay */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        {/* Top Row: Name and Edit Button */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h1 
            className="font-fraunces font-medium text-2xl md:text-3xl" 
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </h1>
          <button 
            onClick={onEditProfile}
            aria-label="Edit Profile"
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Verification Progress */}
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-sans text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Identity verification
            </span>
            <span className="font-sans text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {verificationProgress}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
            <div 
              className="h-full bg-black rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
