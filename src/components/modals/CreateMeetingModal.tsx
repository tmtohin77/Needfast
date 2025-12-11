import React, { useState } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { XIcon, CopyIcon, CheckIcon, VideoIcon, LinkIcon } from '@/components/icons/Icons';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onStart,
}) => {
  const { currentUser, createMeeting, joinMeeting } = useMeeting();
  const [title, setTitle] = useState('');
  const [createdMeeting, setCreatedMeeting] = useState<{ code: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const meeting = await createMeeting(title || 'NeetFast Meeting');
      if (meeting) {
        setCreatedMeeting({ code: meeting.meeting_code, id: meeting.id });
      } else {
        setError('Failed to create meeting. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdMeeting) return;
    const link = `${window.location.origin}/join/${createdMeeting.code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async () => {
    if (!createdMeeting) return;
    await navigator.clipboard.writeText(createdMeeting.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartNow = async () => {
    if (!createdMeeting || !currentUser) return;
    setLoading(true);
    
    const success = await joinMeeting(createdMeeting.code, currentUser.display_name);
    if (success) {
      onStart();
    } else {
      setError('Failed to join meeting. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-600 to-purple-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XIcon size={20} className="text-white" />
          </button>
          <h2 className="text-xl font-bold text-white mb-1">
            {createdMeeting ? 'Meeting Created!' : 'Create New Meeting'}
          </h2>
          <p className="text-indigo-200 text-sm">
            {createdMeeting
              ? 'Share the link or code with participants'
              : 'Set up your meeting details'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {!createdMeeting ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="My Meeting"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Meeting'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Meeting code */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Meeting Code</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                    {createdMeeting.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckIcon size={20} className="text-green-500" />
                    ) : (
                      <CopyIcon size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Meeting link */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Meeting Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <LinkIcon size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {window.location.origin}/join/{createdMeeting.code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors font-medium text-sm"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleStartNow}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <VideoIcon size={20} />
                  {loading ? 'Starting...' : 'Start Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
