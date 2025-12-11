import React, { useState } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { XIcon, LinkIcon, VideoIcon, MicIcon, VideoOffIcon, MicOffIcon } from '@/components/icons/Icons';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  initialCode?: string;
}

const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialCode = '',
}) => {
  const { currentUser, joinMeeting, toggleMute, toggleVideo } = useMeeting();
  
  const [meetingCode, setMeetingCode] = useState(initialCode);
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // প্রিভিউ স্টেট
  const [previewVideo, setPreviewVideo] = useState(true);
  const [previewAudio, setPreviewAudio] = useState(true);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // ভ্যালিডেশন
    if (!meetingCode.trim()) {
      setError('Please enter a meeting code');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // ১. মিটিংয়ে জয়েন করা (নামসহ)
      const success = await joinMeeting(meetingCode.trim(), displayName.trim());
      
      if (success) {
        // ২. প্রিভিউ সেটিংস অ্যাপ্লাই করা
        // যদি ইউজার মাইক অফ করে জয়েন করতে চায়
        if (!previewAudio) {
           setTimeout(() => toggleMute(), 500); // একটু দেরি করে কল করা যাতে স্ট্রিম রেডি থাকে
        }
        // যদি ইউজার ভিডিও অফ করে জয়েন করতে চায়
        if (!previewVideo) {
           setTimeout(() => toggleVideo(), 500);
        }

        onJoin();
        onClose(); // সফল হলে মোডাল বন্ধ হবে
      } else {
        setError('Meeting not found or is locked. Please check the code.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while joining.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-cyan-600 to-indigo-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XIcon size={20} className="text-white" />
          </button>
          <h2 className="text-xl font-bold text-white mb-1">Join Meeting</h2>
          <p className="text-cyan-200 text-sm">Enter the meeting code to join</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {/* Meeting code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Code
              </label>
              <div className="relative">
                <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. abc-def-ghi"
                />
              </div>
            </div>

            {/* Display name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter your name"
              />
            </div>

            {/* Preview settings */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Join options:
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPreviewVideo(!previewVideo)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                    previewVideo
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {previewVideo ? <VideoIcon size={18} /> : <VideoOffIcon size={18} />}
                  <span className="text-sm font-medium">Camera {previewVideo ? 'On' : 'Off'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPreviewAudio(!previewAudio)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                    previewAudio
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {previewAudio ? <MicIcon size={18} /> : <MicOffIcon size={18} />}
                  <span className="text-sm font-medium">Mic {previewAudio ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !meetingCode.trim() || !displayName.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Joining Meeting...' : 'Join Meeting'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinMeetingModal;