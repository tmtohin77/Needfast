import React, { useState } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ScreenShareIcon,
  ScreenShareOffIcon,
  ChatIcon,
  UsersIcon,
  PhoneOffIcon,
  MoreVerticalIcon,
  LockIcon,
  UnlockIcon,
  CopyIcon,
  CheckIcon,
} from '@/components/icons/Icons';

interface ControlBarProps {
  onLeave: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ onLeave }) => {
  const {
    meeting,
    currentUser,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isChatOpen,
    isParticipantsOpen,
    participants,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    toggleChat,
    toggleParticipants,
    lockMeeting,
    muteAll,
  } = useMeeting();

  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = meeting?.host_id === currentUser?.id;

  const copyMeetingLink = async () => {
    const link = `${window.location.origin}/join/${meeting?.meeting_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const unreadMessages = 0; // You could track this in context

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Meeting info bar */}
        <div className="flex items-center justify-center mb-3 gap-4">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3">
            <span className="text-white text-sm font-medium">{meeting?.meeting_code}</span>
            <button
              onClick={copyMeetingLink}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              title="Copy meeting link"
            >
              {copied ? (
                <CheckIcon size={16} className="text-green-400" />
              ) : (
                <CopyIcon size={16} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {/* Mic toggle */}
          <button
            onClick={toggleMute}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700/90 hover:bg-gray-600/90 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOffIcon size={24} /> : <MicIcon size={24} />}
          </button>

          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 ${
              isVideoOff
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700/90 hover:bg-gray-600/90 text-white'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOffIcon size={24} /> : <VideoIcon size={24} />}
          </button>

          {/* Screen share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 hidden sm:block ${
              isScreenSharing
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-700/90 hover:bg-gray-600/90 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? <ScreenShareOffIcon size={24} /> : <ScreenShareIcon size={24} />}
          </button>

          {/* Participants */}
          <button
            onClick={toggleParticipants}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 relative ${
              isParticipantsOpen
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                : 'bg-gray-700/90 hover:bg-gray-600/90 text-white'
            }`}
            title="Participants"
          >
            <UsersIcon size={24} />
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {participants.filter(p => !p.left_at).length}
            </span>
          </button>

          {/* Chat */}
          <button
            onClick={toggleChat}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 relative ${
              isChatOpen
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                : 'bg-gray-700/90 hover:bg-gray-600/90 text-white'
            }`}
            title="Chat"
          >
            <ChatIcon size={24} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>

          {/* More options (host only) */}
          {isHost && (
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="p-3 sm:p-4 rounded-full bg-gray-700/90 hover:bg-gray-600/90 text-white transition-all duration-200"
                title="More options"
              >
                <MoreVerticalIcon size={24} />
              </button>

              {showMore && (
                <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 min-w-[180px]">
                  <button
                    onClick={() => {
                      lockMeeting();
                      setShowMore(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    {meeting?.is_locked ? <UnlockIcon size={18} /> : <LockIcon size={18} />}
                    {meeting?.is_locked ? 'Unlock meeting' : 'Lock meeting'}
                  </button>
                  <button
                    onClick={() => {
                      muteAll();
                      setShowMore(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <MicOffIcon size={18} />
                    Mute all participants
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Leave/End call */}
          <button
            onClick={onLeave}
            className="p-3 sm:p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 ml-2"
            title={isHost ? 'End meeting' : 'Leave meeting'}
          >
            <PhoneOffIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
