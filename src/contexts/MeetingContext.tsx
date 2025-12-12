import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Meeting, Participant, ChatMessage, MeetingState } from '@/types/meeting';
import { useWebRTC } from '@/hooks/useWebRTC';

// Interface Update: remoteStreams যোগ করা হয়েছে
interface MeetingContextType extends MeetingState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  createMeeting: (title?: string) => Promise<Meeting | null>;
  joinMeeting: (code: string, displayName: string) => Promise<boolean>;
  leaveMeeting: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleChat: () => void;
  toggleParticipants: () => void;
  sendMessage: (message: string, file?: File) => Promise<void>;
  kickParticipant: (participantId: string) => Promise<void>;
  muteParticipant: (participantId: string) => Promise<void>;
  muteAll: () => Promise<void>;
  lockMeeting: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  remoteStreams: Map<string, MediaStream>; // নতুন: ভিডিও স্টোরেজ
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // নতুন: রিমোট স্ট্রিম রাখার স্টেট
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const subscriptionRef = useRef<any>(null);

  // WebRTC Hook Integration (Updated)
  const { 
    joinMeeting: joinWebRTC, 
    leaveMeeting: leaveWebRTC,
    replaceTrack 
  } = useWebRTC({
    meetingId: meeting?.id || '',
    userId: currentUser?.id || '',
    localStream: isScreenSharing ? screenStream : localStream,
    
    // FIX: ভিডিও আসলে এখানে জমা হবে
    onRemoteStream: (userId, stream) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, stream);
        return newMap;
      });
    },
    // FIX: কেউ চলে গেলে ভিডিও ডিলিট হবে
    onPeerDisconnected: (userId) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const generateMeetingCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      if (i < 2) code += '-';
    }
    return code;
  };

  const setupMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: true 
      });
      setLocalStream(stream);
      setIsVideoOff(false);
      setIsMuted(false);
      return stream;
    } catch (error) {
      console.error('Media Access Error:', error);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setLocalStream(audioStream);
        setIsVideoOff(true);
        return audioStream;
      } catch (err) {
        console.error('No audio/video permissions');
        return null;
      }
    }
  };

  const subscribeToMeeting = (meetingId: string) => {
    if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);

    const channel = supabase.channel(`room:${meetingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meeting_participants',
        filter: `meeting_id=eq.${meetingId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants(prev => {
            if (prev.find(p => p.id === payload.new.id)) return prev;
            return [...prev, payload.new as Participant];
          });
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(prev => {
            const updated = payload.new as Participant;
            if (updated.left_at) {
              return prev.filter(p => p.id !== updated.id);
            }
            return prev.map(p => p.id === updated.id ? updated : p);
          });
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `meeting_id=eq.${meetingId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    subscriptionRef.current = channel;
  };

  const joinMeeting = useCallback(async (code: string, displayNameInput: string): Promise<boolean> => {
    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_code', code.toLowerCase())
      .single();

    if (meetingError || !meetingData) return false;
    if (meetingData.is_locked) return false;

    let user = currentUser;
    const finalName = displayNameInput || currentUser?.display_name || 'Guest';

    if (!user) {
      const { data: newUser } = await supabase.from('users').insert({
        display_name: finalName,
        is_guest: true
      }).select().single();
      
      if (newUser) {
        user = newUser;
        setCurrentUser(newUser);
      }
    } else {
        if (user.display_name !== finalName) {
           await supabase.from('users').update({ display_name: finalName }).eq('id', user.id);
           user.display_name = finalName;
        }
    }

    if (!user) return false;

    const { data: existing } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingData.id)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

    if (!existing) {
        await supabase.from('meeting_participants').insert({
            meeting_id: meetingData.id,
            user_id: user.id,
            display_name: finalName,
            is_host: meetingData.host_id === user.id,
            joined_at: new Date().toISOString()
        });
    }

    await setupMediaStream();
    setMeeting(meetingData);
    
    const { data: pData } = await supabase
      .from('meeting_participants')
      .select('*')
      .eq('meeting_id', meetingData.id)
      .is('left_at', null);
    
    if (pData) setParticipants(pData);

    const { data: mData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('meeting_id', meetingData.id)
      .order('created_at', { ascending: true });
    
    if (mData) setMessages(mData);

    subscribeToMeeting(meetingData.id);
    await joinWebRTC();

    return true;
  }, [currentUser]);

  const createMeeting = useCallback(async (title?: string): Promise<Meeting | null> => {
    if (!currentUser) return null;
    const meetingCode = generateMeetingCode();
    
    const { data, error } = await supabase.from('meetings').insert({
      meeting_code: meetingCode,
      title: title || 'New Meeting',
      host_id: currentUser.id,
      is_active: true
    }).select().single();

    if (error) return null;
    return data;
  }, [currentUser]);

  const leaveMeeting = useCallback(async () => {
    if (meeting && currentUser) {
      await supabase
        .from('meeting_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('meeting_id', meeting.id)
        .eq('user_id', currentUser.id);

      leaveWebRTC();
    }

    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);

    setMeeting(null);
    setParticipants([]);
    setMessages([]);
    setLocalStream(null);
    setIsScreenSharing(false);
    setRemoteStreams(new Map()); // Reset streams
  }, [meeting, currentUser, localStream, screenStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
            replaceTrack(audioTrack); 
            
            if(meeting && currentUser) {
                supabase.from('meeting_participants')
                .update({ is_muted: !audioTrack.enabled })
                .eq('meeting_id', meeting.id)
                .eq('user_id', currentUser.id).then();
            }
        }
    }
  }, [localStream, meeting, currentUser, replaceTrack]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
            replaceTrack(videoTrack);

            if(meeting && currentUser) {
                supabase.from('meeting_participants')
                .update({ is_video_off: !videoTrack.enabled })
                .eq('meeting_id', meeting.id)
                .eq('user_id', currentUser.id).then();
            }
        }
    }
  }, [localStream, meeting, currentUser, replaceTrack]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      
      const cam = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
      setLocalStream(cam);
      const videoTrack = cam.getVideoTracks()[0];
      replaceTrack(videoTrack);

    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        const screenTrack = stream.getVideoTracks()[0];
        replaceTrack(screenTrack);
        
        screenTrack.onended = async () => {
            setScreenStream(null);
            setIsScreenSharing(false);
            const cam = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setLocalStream(cam);
            replaceTrack(cam.getVideoTracks()[0]);
        };
      } catch (e) { console.error(e); }
    }
  }, [isScreenSharing, screenStream, replaceTrack]);

  const toggleChat = () => { setIsChatOpen(p => !p); if(!isChatOpen) setIsParticipantsOpen(false); };
  const toggleParticipants = () => { setIsParticipantsOpen(p => !p); if(!isParticipantsOpen) setIsChatOpen(false); };
  const sendMessage = async (message: string, file?: File) => {
    if (!meeting || !currentUser) return;
    let fileUrl = null, fileName = null, fileType = null;
    if (file) {
      const filePath = `${meeting.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('meeting-files').upload(filePath, file);
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('meeting-files').getPublicUrl(filePath);
        fileUrl = urlData.publicUrl; fileName = file.name; fileType = file.type;
      }
    }
    await supabase.from('chat_messages').insert({
      meeting_id: meeting.id, user_id: currentUser.id, sender_name: currentUser.display_name,
      message: message || '', file_url: fileUrl, file_name: fileName, file_type: fileType
    });
  };
  
  const kickParticipant = async (pid: string) => { await supabase.from('meeting_participants').update({ left_at: new Date().toISOString() }).eq('id', pid); };
  const muteParticipant = async (pid: string) => { await supabase.from('meeting_participants').update({ is_muted: true }).eq('id', pid); };
  const muteAll = async () => { if(meeting) await supabase.from('meeting_participants').update({ is_muted: true }).eq('meeting_id', meeting.id).neq('user_id', currentUser?.id); };
  const lockMeeting = async () => { if(meeting) { await supabase.from('meetings').update({ is_locked: !meeting.is_locked }).eq('id', meeting.id); setMeeting(p => p ? {...p, is_locked: !p.is_locked} : null); }};

  return (
    <MeetingContext.Provider value={{
      currentUser, setCurrentUser, meeting, participants, messages,
      localStream, screenStream, isScreenSharing, isMuted, isVideoOff,
      isChatOpen, isParticipantsOpen, isDarkMode, toggleDarkMode,
      createMeeting, joinMeeting, leaveMeeting, toggleMute, toggleVideo,
      toggleScreenShare, toggleChat, toggleParticipants, sendMessage,
      kickParticipant, muteParticipant, muteAll, lockMeeting,
      remoteStreams // Exporting streams
    }}>
      {children}
    </MeetingContext.Provider>
  );
};