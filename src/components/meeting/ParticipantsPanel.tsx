import React from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { XIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, UserMinusIcon, VolumeXIcon } from '@/components/icons/Icons';

const ParticipantsPanel: React.FC = () => {
  const {
    participants,
    meeting,
    currentUser,
    toggleParticipants,
    kickParticipant,
    muteParticipant,
  } = useMeeting();

  const isHost = meeting?.host_id === currentUser?.id;
  // সেফটি চেক: participants অ্যারে আছে কিনা নিশ্চিত করা
  const activeParticipants = (participants || []).filter(p => !p.left_at);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Participants ({activeParticipants.length})
        </h2>
        <button
          onClick={toggleParticipants}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeParticipants.map((participant) => {
          const isCurrentUser = participant.user_id === currentUser?.id;
          const isParticipantHost = participant.user_id === meeting?.host_id;
          
          // --- FIX: নামের সেফটি চেক (CRASH FIX) ---
          const displayName = participant.display_name || (participant as any).name || 'Guest';
          const firstChar = displayName.charAt(0)?.toUpperCase() || 'U';
          // ---------------------------------------

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-semibold shadow-sm">
                  {firstChar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                    {isCurrentUser && ' (You)'}
                  </p>
                  {isParticipantHost && (
                    <span className="text-xs text-indigo-500 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">Host</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status indicators */}
                <div className="flex items-center gap-1">
                  {participant.is_muted ? (
                    <span className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500">
                      <MicOffIcon size={14} />
                    </span>
                  ) : (
                    <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-500">
                      <MicIcon size={14} />
                    </span>
                  )}
                  {participant.is_video_off ? (
                    <span className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500">
                      <VideoOffIcon size={14} />
                    </span>
                  ) : (
                    <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-500">
                      <VideoIcon size={14} />
                    </span>
                  )}
                </div>

                {/* Host controls */}
                {isHost && !isCurrentUser && (
                  <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => muteParticipant(participant.id)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                      title="Mute participant"
                    >
                      <VolumeXIcon size={16} />
                    </button>
                    <button
                      onClick={() => kickParticipant(participant.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors text-red-500"
                      title="Remove participant"
                    >
                      <UserMinusIcon size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Maximum {meeting?.max_participants || 50} participants allowed
        </p>
      </div>
    </div>
  );
};

export default ParticipantsPanel;