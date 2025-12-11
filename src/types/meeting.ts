export interface User {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  is_guest: boolean;
  created_at: string;
}

export interface Meeting {
  id: string;
  meeting_code: string;
  title: string;
  host_id: string;
  is_active: boolean;
  is_locked: boolean;
  waiting_room_enabled: boolean;
  max_participants: number;
  created_at: string;
  ended_at?: string;
}

export interface Participant {
  id: string;
  meeting_id: string;
  user_id: string;
  display_name: string;
  is_host: boolean;
  is_muted: boolean;
  is_video_off: boolean;
  joined_at: string;
  left_at?: string;
  stream?: MediaStream;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  sender_name: string;
  message?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

export interface MeetingState {
  meeting: Meeting | null;
  participants: Participant[];
  messages: ChatMessage[];
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
}
