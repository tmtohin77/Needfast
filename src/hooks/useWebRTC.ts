import { useRef, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
}

interface UseWebRTCProps {
  meetingId: string;
  userId: string;
  localStream: MediaStream | null;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onPeerDisconnected: (userId: string) => void;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useWebRTC = ({
  meetingId,
  userId,
  localStream,
  onRemoteStream,
  onPeerDisconnected,
}: UseWebRTCProps) => {
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const channelRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // পিয়ার কানেকশন তৈরি
  const createPeerConnection = useCallback((peerId: string, initiateOffer: boolean = false) => {
    if (peersRef.current.has(peerId)) {
        return peersRef.current.get(peerId)!.connection;
    }

    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        onRemoteStream(peerId, remoteStream);
      }
    };

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate && channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'ice-candidate', candidate: event.candidate, senderId: userId, targetId: peerId }
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        onPeerDisconnected(peerId);
        peersRef.current.delete(peerId);
      }
    };

    peersRef.current.set(peerId, { id: peerId, connection: peerConnection });

    if (initiateOffer) {
        createOffer(peerConnection, peerId);
    }

    return peerConnection;
  }, [localStream, onRemoteStream, onPeerDisconnected, userId]);

  const createOffer = async (pc: RTCPeerConnection, targetId: string) => {
      try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          if(channelRef.current) {
              await channelRef.current.send({
                  type: 'broadcast',
                  event: 'signal',
                  payload: { type: 'offer', offer: offer, senderId: userId, targetId: targetId }
              });
          }
      } catch (error) { console.error(error); }
  };

  const handleSignal = useCallback(async (payload: any) => {
      if (payload.senderId === userId || (payload.targetId && payload.targetId !== userId)) return;
      const { type, senderId } = payload;
      const pc = peersRef.current.get(senderId)?.connection || createPeerConnection(senderId, false);

      try {
          if (type === 'new-peer') {
             // কেউ নতুন জয়েন করলে আমি অফার পাঠাব
             createPeerConnection(senderId, true);
          }
          else if (type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              if (channelRef.current) {
                await channelRef.current.send({
                    type: 'broadcast',
                    event: 'signal',
                    payload: { type: 'answer', answer: answer, senderId: userId, targetId: senderId }
                });
              }
          } 
          else if (type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          } 
          else if (type === 'ice-candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          }
      } catch (error) { console.error(error); }
  }, [createPeerConnection, userId]);

  const joinMeeting = useCallback(async () => {
    const channel = supabase.channel(`meeting_room:${meetingId}`, { config: { broadcast: { self: false } } });

    channel
        .on('broadcast', { event: 'signal' }, ({ payload }) => handleSignal(payload))
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true);
                // জয়েন করার সাথে সাথে সবাইকে জানাই "আমি এসেছি"
                await channel.send({
                    type: 'broadcast',
                    event: 'signal',
                    payload: { type: 'new-peer', senderId: userId }
                });
            }
        });

    channelRef.current = channel;
  }, [meetingId, userId, handleSignal]);

  const leaveMeeting = useCallback(async () => {
    peersRef.current.forEach(({ connection }) => connection.close());
    peersRef.current.clear();
    if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // --- FIX: ভিডিও টগল করলে ট্র্যাক রিপ্লেস করা ---
  const replaceTrack = useCallback((newTrack: MediaStreamTrack) => {
    peersRef.current.forEach(({ connection }) => {
        const sender = connection.getSenders().find(s => s.track?.kind === newTrack.kind);
        if (sender) {
            sender.replaceTrack(newTrack);
        }
    });
  }, []);

  useEffect(() => {
    return () => { leaveMeeting(); };
  }, []); 

  return {
    isConnected,
    joinMeeting,
    leaveMeeting,
    replaceTrack, // নতুন ফাংশন এক্সপোর্ট
    createOffer: async () => {}, 
  };
};

export default useWebRTC;