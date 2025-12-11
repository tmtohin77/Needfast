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
  const [videoActive, setVideoActive] = useState(false);

  // ভিডিও স্ট্রিম হ্যান্ডেল করা (Black Screen Fix)
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      videoEl.srcObject = stream;
      
      // ভিডিও লোড হওয়ার জন্য অপেক্ষা করা
      videoEl.onloadedmetadata = async () => {
        try {
          await videoEl.play();
          setVideoActive(true);
        } catch (err) {
          console.error("Video play failed:", err);
        }
      };
    } else {
      setVideoActive(false);
    }
  }, [stream]);

  // নামের সেফটি চেক
  const displayName = participant?.display_name || (participant as any)?.name || 'Guest';
  
  // ভিডিও ট্র্যাক আছে কিনা এবং চালু আছে কিনা চেক করা
  const hasVideoTrack = stream?.getVideoTracks().length! > 0 && !participant.is_video_off;

  return (
    <div
      className={`relative bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden aspect-video transition-all duration-300 shadow-lg ${
        isSpeaking ? 'ring-4 ring-green-500' : ''
      } ${isScreenShare ? 'col-span-2 row-span-2' : ''}`}
    >
      {/* Video Player */}
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline // মোবাইলের জন্য খুব জরুরি
          muted={isLocal} // নিজের অডিও মিউট রাখা
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            videoActive ? 'opacity-100' : 'opacity-0'
          } ${isLocal && !isScreenShare ? 'transform scale-x-[-1]' : ''}`}
        />
      ) : null}

      {/* Fallback Avatar (যদি ভিডিও না থাকে বা লোড না হয়) */}
      {(!hasVideoTrack || !videoActive) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl animate-pulse-slow">
            {displayName.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Name and Status */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="text-white text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px] drop-shadow-sm">
            {displayName}
            {isLocal && ' (You)'}
          </span>
          {participant.is_muted && (
            <MicOffIcon size={14} className="text-red-400" />
          )}
        </div>
      </div>

      {/* Host Controls */}
      {canManage && !isLocal && (
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
          >
            <MoreVerticalIcon size={18} />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-1 min-w-[140px] overflow-hidden">
              <button
                onClick={() => { onMute?.(); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <VolumeXIcon size={16} />
                Mute
              </button>
              <button
                onClick={() => { onKick?.(); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2 transition-colors"
              >
                <UserMinusIcon size={16} />
                Kick
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoTile;