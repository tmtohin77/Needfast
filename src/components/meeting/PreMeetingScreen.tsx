import React, { useState, useRef, useEffect } from 'react';
import { VideoIcon, VideoOffIcon, MicIcon, MicOffIcon, SettingsIcon } from '@/components/icons/Icons';

interface PreMeetingScreenProps {
  displayName: string;
  onJoin: (settings: { video: boolean; audio: boolean }) => void;
  onCancel: () => void;
}

const PreMeetingScreen: React.FC<PreMeetingScreenProps> = ({
  displayName,
  onJoin,
  onCancel,
}) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<{ video: MediaDeviceInfo[]; audio: MediaDeviceInfo[] }>({
    video: [],
    audio: [],
  });
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get media devices
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          video: deviceList.filter(d => d.kind === 'videoinput'),
          audio: deviceList.filter(d => d.kind === 'audioinput'),
        });
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    // Get preview stream
    const getStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error getting media stream:', error);
        setVideoEnabled(false);
      }
    };

    getDevices();
    getStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
      });
    }
  }, [videoEnabled, stream]);

  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = audioEnabled;
      });
    }
  }, [audioEnabled, stream]);

  const handleJoin = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onJoin({ video: videoEnabled, audio: audioEnabled });
  };

  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Ready to join?</h1>
          <p className="text-gray-400">Check your audio and video before joining</p>
        </div>

        {/* Video preview */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-6">
          {videoEnabled && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-4xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Name badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="text-white text-sm font-medium">{displayName}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-4 rounded-full transition-all ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {audioEnabled ? <MicIcon size={24} /> : <MicOffIcon size={24} />}
          </button>

          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-4 rounded-full transition-all ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {videoEnabled ? <VideoIcon size={24} /> : <VideoOffIcon size={24} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
          >
            <SettingsIcon size={24} />
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-white font-medium mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Camera</label>
                <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {devices.video.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.video.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Microphone</label>
                <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {devices.audio.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${devices.audio.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreMeetingScreen;
