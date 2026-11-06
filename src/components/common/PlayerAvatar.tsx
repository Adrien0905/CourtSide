import React, { useEffect, useState } from 'react';

interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  size?: 'sm' | 'lg';
}

const sizeClass = {
  sm: 'w-8 h-8 text-[10px] rounded',
  lg: 'w-20 h-20 text-2xl rounded-lg border-2',
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  firstName,
  lastName,
  avatarUrl,
  size = 'sm',
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const showPhoto = Boolean(avatarUrl?.trim()) && !failed;

  return (
    <div
      className={`${sizeClass[size]} shrink-0 overflow-hidden bg-gradient-to-br from-[#1A253D] to-[#121A2C] border border-[#243452] flex items-center justify-center font-bold font-mono text-amber-400`}
    >
      {showPhoto ? (
        <img
          src={avatarUrl}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
};
