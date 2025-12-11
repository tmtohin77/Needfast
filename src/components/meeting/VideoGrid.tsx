import React, { useMemo } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import VideoTile from './VideoTile';

const VideoGrid: React.FC = () => {
  const {
    participants,
    localStream,
    screenStream,
    isScreenSharing,
    currentUser,
    meeting,
    kickParticipant,
    muteParticipant,
  } = useMeeting();

  const activeParticipants = participants.filter(p => !p.left_at);
  const isHost = meeting?.host_id === currentUser?.id;

  // Calculate grid layout based on participant count
  const gridClass = useMemo(() => {
    const count = activeParticipants.length + (isScreenSharing ? 1 : 0);
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 sm:grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-3 sm:grid-cols-4';
  }, [activeParticipants.length, isScreenSharing]);

  // Find current user's participant record
  const currentParticipant = activeParticipants.find(p => p.user_id === currentUser?.id);

  return (
    <div className="h-full w-full p-4 pb-32 overflow-y-auto">
      <div className={`grid ${gridClass} gap-3 sm:gap-4 auto-rows-fr max-w-7xl mx-auto`}>
        {/* Screen share tile (if active) */}
        {isScreenSharing && screenStream && (
          <VideoTile
            participant={{
              id: 'screen-share',
              meeting_id: meeting?.id || '',
              user_id: currentUser?.id || '',
              display_name: `${currentUser?.display_name}'s screen`,
              is_host: false,
              is_muted: false,
              is_video_off: false,
              joined_at: new Date().toISOString(),
            }}
            stream={screenStream}
            isScreenShare={true}
          />
        )}

        {/* Local user tile */}
        {currentParticipant && (
          <VideoTile
            participant={currentParticipant}
            stream={localStream}
            isLocal={true}
            isHost={currentParticipant.user_id === meeting?.host_id}
          />
        )}

        {/* Other participants */}
        {activeParticipants
          .filter(p => p.user_id !== currentUser?.id)
          .map((participant) => (
            <VideoTile
              key={participant.id}
              participant={participant}
              stream={null} // In a real app, you'd get the remote stream via WebRTC
              isHost={participant.user_id === meeting?.host_id}
              canManage={isHost}
              onKick={() => kickParticipant(participant.id)}
              onMute={() => muteParticipant(participant.id)}
            />
          ))}
      </div>

      {/* Empty state */}
      {activeParticipants.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">Waiting for participants to join...</p>
            <p className="text-sm mt-2">Share the meeting code: {meeting?.meeting_code}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
