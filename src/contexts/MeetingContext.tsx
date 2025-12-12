import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Meeting, Participant, ChatMessage, MeetingState } from '@/types/meeting';
import { useWebRTC } from '@/hooks/useWebRTC';

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
  kickParticipant: (pid: string) => Promise<void>;
  muteParticipant: (pid: string) => Promise<void>;
  muteAll: () => Promise<void>;
  lockMeeting: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  remoteStreams: Map<string, MediaStream>; 
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
  
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const subscriptionRef = useRef<any>(null);

  const { joinMeeting: joinWebRTC, leaveMeeting: leaveWebRTC, replaceTrack } = useWebRTC({
    meetingId: meeting?.id || '',
    userId: currentUser?.id || '',
    localStream: isScreenSharing ? screenStream : localStream,
    onRemoteStream: (uid, stream) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(uid, stream);
        return newMap;
      });
    },
    onPeerDisconnected: (uid) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(uid);
        return newMap;
      });
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(p => !p), []);

  const setupMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsVideoOff(false);
      setIsMuted(false);
      return stream;
    } catch {
      try {
        const audio = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setLocalStream(audio);
        setIsVideoOff(true);
        return audio;
      } catch { return null; }
    }
  };

  const subscribeToMeeting = (meetingId: string) => {
    if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
    const channel = supabase.channel(`room:${meetingId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_participants', filter: `meeting_id=eq.${meetingId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants(p => p.find(x => x.id === payload.new.id) ? p : [...p, payload.new as Participant]);
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(p => {
            const u = payload.new as Participant;
            return u.left_at ? p.filter(x => x.id !== u.id) : p.map(x => x.id === u.id ? u : x);
          });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `meeting_id=eq.${meetingId}` }, (payload) => {
        setMessages(p => [...p, payload.new as ChatMessage]);
      })
      .subscribe();
    subscriptionRef.current = channel;
  };

  const joinMeeting = useCallback(async (code: string, name: string): Promise<boolean> => {
    const { data: mData } = await supabase.from('meetings').select('*').eq('meeting_code', code.toLowerCase()).single();
    if (!mData || mData.is_locked) return false;

    let user = currentUser;
    const finalName = name || currentUser?.display_name || 'Guest';

    if (!user) {
      const { data: newUser } = await supabase.from('users').insert({ display_name: finalName, is_guest: true }).select().single();
      if (newUser) { user = newUser; setCurrentUser(newUser); }
    } else if (user.display_name !== finalName) {
        await supabase.from('users').update({ display_name: finalName }).eq('id', user.id);
        user.display_name = finalName;
    }
    if (!user) return false;

    const { data: existing } = await supabase.from('meeting_participants').select('*').eq('meeting_id', mData.id).eq('user_id', user.id).is('left_at', null).single();
    if (!existing) {
        await supabase.from('meeting_participants').insert({ meeting_id: mData.id, user_id: user.id, display_name: finalName, is_host: mData.host_id === user.id });
    }

    await setupMediaStream();
    setMeeting(mData);
    
    const { data: pData } = await supabase.from('meeting_participants').select('*').eq('meeting_id', mData.id).is('left_at', null);
    if (pData) setParticipants(pData);

    const { data: msData } = await supabase.from('chat_messages').select('*').eq('meeting_id', mData.id).order('created_at', { ascending: true });
    if (msData) setMessages(msData);

    subscribeToMeeting(mData.id);
    await joinWebRTC();
    return true;
  }, [currentUser]);

  const createMeeting = useCallback(async (title?: string): Promise<Meeting | null> => {
    if (!currentUser) return null;
    const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 5);
    const { data } = await supabase.from('meetings').insert({ meeting_code: code, title: title || 'New Meeting', host_id: currentUser.id, is_active: true }).select().single();
    return data;
  }, [currentUser]);

  const leaveMeeting = useCallback(async () => {
    if (meeting && currentUser) {
      await supabase.from('meeting_participants').update({ left_at: new Date().toISOString() }).eq('meeting_id', meeting.id).eq('user_id', currentUser.id);
      leaveWebRTC();
    }
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
    
    setMeeting(null); setParticipants([]); setMessages([]); setLocalStream(null); setIsScreenSharing(false); setRemoteStreams(new Map());
  }, [meeting, currentUser, localStream, screenStream]);

  const toggleMute = () => {
    if (localStream) {
        const track = localStream.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
            replaceTrack(track);
            if(meeting && currentUser) supabase.from('meeting_participants').update({ is_muted: !track.enabled }).eq('meeting_id', meeting.id).eq('user_id', currentUser.id).then();
        }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
        const track = localStream.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideoOff(!track.enabled);
            replaceTrack(track);
            if(meeting && currentUser) supabase.from('meeting_participants').update({ is_video_off: !track.enabled }).eq('meeting_id', meeting.id).eq('user_id', currentUser.id).then();
        }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null); setIsScreenSharing(false);
      const cam = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
      setLocalStream(cam);
      replaceTrack(cam.getVideoTracks()[0]);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream); setIsScreenSharing(true);
        const track = stream.getVideoTracks()[0];
        replaceTrack(track);
        track.onended = async () => {
            setScreenStream(null); setIsScreenSharing(false);
            const cam = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            setLocalStream(cam);
            replaceTrack(cam.getVideoTracks()[0]);
        };
      } catch (e) { console.error(e); }
    }
  };

  const toggleChat = () => { setIsChatOpen(p => !p); if(!isChatOpen) setIsParticipantsOpen(false); };
  const toggleParticipants = () => { setIsParticipantsOpen(p => !p); if(!isParticipantsOpen) setIsChatOpen(false); };
  
  const sendMessage = async (msg: string, file?: File) => {
    if (!meeting || !currentUser) return;
    let url = null, name = null, type = null;
    if (file) {
        const path = `${meeting.id}/${Date.now()}_${file.name}`;
        const { data } = await supabase.storage.from('meeting-files').upload(path, file);
        if (data) { url = supabase.storage.from('meeting-files').getPublicUrl(path).data.publicUrl; name = file.name; type = file.type; }
    }
    await supabase.from('chat_messages').insert({ meeting_id: meeting.id, user_id: currentUser.id, sender_name: currentUser.display_name, message: msg || '', file_url: url, file_name: name, file_type: type });
  };
  
  const kickParticipant = async (pid: string) => { await supabase.from('meeting_participants').update({ left_at: new Date().toISOString() }).eq('id', pid); };
  const muteParticipant = async (pid: string) => { await supabase.from('meeting_participants').update({ is_muted: true }).eq('id', pid); };
  const muteAll = async () => { if(meeting) await supabase.from('meeting_participants').update({ is_muted: true }).eq('meeting_id', meeting.id).neq('user_id', currentUser?.id); };
  const lockMeeting = async () => { if(meeting) await supabase.from('meetings').update({ is_locked: !meeting.is_locked }).eq('id', meeting.id); };

  // --- এই জায়গাটি ঠিক করা হয়েছে ---
  return (
    <MeetingContext.Provider value={{
      currentUser, setCurrentUser, meeting, participants, messages,
      localStream, screenStream, isScreenSharing, isMuted, isVideoOff,
      isChatOpen, isParticipantsOpen, isDarkMode, toggleDarkMode,
      createMeeting, joinMeeting, leaveMeeting, toggleMute, toggleVideo,
      toggleScreenShare, toggleChat, toggleParticipants, sendMessage,
      kickParticipant, muteParticipant, muteAll, lockMeeting,
      remoteStreams
    }}>
      {children}
    </MeetingContext.Provider>
  );
};