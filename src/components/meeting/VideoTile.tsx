import React, { useRef, useEffect, useState } from 'react';
import { Participant } from '@/types/meeting';
import { MicOffIcon, VideoOffIcon, MoreVerticalIcon, UserMinusIcon, VolumeXIcon } from '@/components/icons/Icons';

interface VideoTileProps {
  participant: Participant;
  stream?: MediaStream | null;
  isLocal?: boolean;
  isHost?: boolean;
  canManage?: boolean;
  onKick?: () => void;
  onMute?: () => void;
  isSpeaking?: boolean;
  isScreenShare?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal = false,
  isHost = false,
  canManage = false,
  onKick,
  onMute,
  isSpeaking = false,
  isScreenShare = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some(track => track.enabled);

  // --- FIX START: নামের সেফটি চেক ---
  // যদি participant.display_name না থাকে, তবে 'Guest' দেখাবে। এতে অ্যাপ আর ক্রাশ করবে না।
  const displayName = participant?.display_name || (participant as any)?.name || 'Guest';
  // --- FIX END ---

  return (
    <div
      className={`relative bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden aspect-video transition-all duration-300 ${
        isSpeaking ? 'ring-4 ring-green-500' : ''
      } ${isScreenShare ? 'col-span-2 row-span-2' : ''}`}
    >
      {stream && hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
            {/* এখানে আমরা displayName ভেরিয়েবল ব্যবহার করছি */}
            {displayName.charAt(0)?.toUpperCase() || 'G'}
          </div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Name and status */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]">
            {/* এখানেও displayName ব্যবহার করা হয়েছে */}
            {displayName}
            {isLocal && ' (You)'}
            {isHost && !isLocal && ' (Host)'}
          </span>
          {participant.is_muted && (
            <span className="p-1 bg-red-500/80 rounded-full">
              <MicOffIcon size={12} className="text-white" />
            </span>
          )}
        </div>
      </div>

      {/* Video off indicator */}
      {participant.is_video_off && (
        <div className="absolute top-2 right-2 p-1.5 bg-gray-800/80 rounded-full">
          <VideoOffIcon size={16} className="text-white" />
        </div>
      )}

      {/* Host controls menu */}
      {canManage && !isLocal && (
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition-colors"
          >
            <MoreVerticalIcon size={16} className="text-white" />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
              <button
                onClick={() => {
                  onMute?.();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <VolumeXIcon size={16} />
                Mute
              </button>
              <button
                onClick={() => {
                  onKick?.();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <UserMinusIcon size={16} />
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoTile;