import React, { useRef, useEffect } from 'react';
import { Participant } from '@/types/meeting';
import { MicOffIcon, VideoOffIcon } from '@/components/icons/Icons';

interface VideoTileProps {
  participant: Participant;
  stream?: MediaStream | null;
  isLocal?: boolean;
  isScreenShare?: boolean;
  [key: string]: any; 
}

const VideoTile: React.FC<VideoTileProps> = ({ participant, stream, isLocal, isScreenShare }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      videoEl.srcObject = stream;
      // খুব গুরুত্বপূর্ণ: ভিডিও লোড হওয়ার সাথে সাথে প্লে করা
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(e => console.error("Auto-play failed:", e));
      };
    }
  }, [stream]);

  const name = participant.display_name || 'Guest';
  // ভিডিও আছে কিনা চেক করা (ভিডিও অফ থাকলেও যাতে ট্র্যাক থাকে)
  const hasVideo = stream && stream.getVideoTracks().length > 0 && !participant.is_video_off;

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-lg aspect-video ${isScreenShare ? 'col-span-2 row-span-2' : ''}`}>
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline // মোবাইলের জন্য দরকারি
          muted={isLocal} // নিজের অডিও যাতে নিজেকেই ডিস্টার্ব না করে
          className={`w-full h-full object-cover ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Info Bar */}
      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-lg text-white text-sm flex items-center gap-2 backdrop-blur-sm">
        <span className="font-medium truncate max-w-[150px]">
          {name} {isLocal && '(You)'}
        </span>
        {participant.is_muted && <MicOffIcon size={14} className="text-red-500" />}
      </div>
    </div>
  );
};

export default VideoTile;