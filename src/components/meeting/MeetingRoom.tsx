import React, { useEffect, useState } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';

interface MeetingRoomProps {
  onLeave: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ onLeave }) => {
  const { meeting, isChatOpen, isParticipantsOpen, leaveMeeting } = useMeeting();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeave = async () => {
    await leaveMeeting();
    onLeave();
  };

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!meeting) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col overflow-hidden">
      {/* Meeting title bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <div>
            <h1 className="text-white font-medium text-sm sm:text-base leading-tight">{meeting.title}</h1>
            <p className="text-gray-400 text-xs font-mono opacity-80">{meeting.meeting_code}</p>
          </div>
        </div>
        
        {meeting.is_locked && (
          <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
            Locked
          </span>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 relative overflow-hidden">
          <VideoGrid />
        </div>
        
        {/* Side panels (Overlay on Mobile, Sidebar on Desktop if needed) */}
        {/* The user's provided panel code uses fixed/absolute positioning, 
            so we just render them here and they will handle their own layout. */}
        {isChatOpen && <ChatPanel />}
        {isParticipantsOpen && <ParticipantsPanel />}
      </div>

      {/* Control bar */}
      <div className="flex-shrink-0 z-40">
        <ControlBar onLeave={() => setShowLeaveConfirm(true)} />
      </div>

      {/* Leave confirmation modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700 transform scale-100 transition-transform">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Leave meeting?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Are you sure you want to end this session? You can rejoin later using the same code.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-semibold shadow-lg shadow-red-500/30"
              >
                Leave Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;