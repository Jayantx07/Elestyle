import React from 'react';

export interface SettingItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: 'link' | 'toggle';
  isActive?: boolean; // For toggle type
  onClick?: () => void;
}

export interface ProfileSettingsListProps {
  title?: string;
  items: SettingItem[];
  onToggleChange?: (id: string, newValue: boolean) => void;
}

export const ProfileSettingsList: React.FC<ProfileSettingsListProps> = ({ 
  title = "Account setting", 
  items,
  onToggleChange
}) => {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <h2 className="font-sans text-sm font-medium mb-1 px-2" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </h2>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.type === 'toggle' && onToggleChange) {
                onToggleChange(item.id, !item.isActive);
              } else if (item.onClick) {
                item.onClick();
              }
            }}
            className="w-full bg-white rounded-3xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent hover:border-black/5 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="text-black/80">
                {item.icon}
              </div>
              <span className="font-sans text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {item.label}
              </span>
            </div>

            <div className="flex items-center">
              {item.type === 'link' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ) : (
                <div 
                  className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${
                    item.isActive ? 'bg-[#34C759]' : 'bg-gray-200'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                      item.isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
