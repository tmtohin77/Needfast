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

// শক্তিশালী ফ্রি সার্ভার লিস্ট
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

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

  const createPeerConnection = useCallback((peerId: string, initiateOffer: boolean = false) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!.connection;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // ১. লোকাল ভিডিও/অডিও ট্র্যাক যোগ করা
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    // ২. রিমোট ভিডিও আসলে হ্যান্ডেল করা
    pc.ontrack = (event) => {
      console.log(`🎥 Remote Stream received from ${peerId}`);
      if (event.streams && event.streams[0]) {
        onRemoteStream(peerId, event.streams[0]);
      }
    };

    // ৩. নেটওয়ার্ক রুট (Candidate) খুঁজে পেলে পাঠানো
    pc.onicecandidate = async (event) => {
      if (event.candidate && channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'ice-candidate', candidate: event.candidate, senderId: userId, targetId: peerId }
        });
      }
    };

    // ৪. কেউ ডিসকানেক্ট হলে
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log(`User ${peerId} disconnected`);
        onPeerDisconnected(peerId);
        peersRef.current.delete(peerId);
      }
    };

    peersRef.current.set(peerId, { id: peerId, connection: pc });

    if (initiateOffer) {
        createOffer(pc, peerId);
    }

    return pc;
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
    } catch (err) { console.error("Offer Error:", err); }
  };

  const handleSignal = useCallback(async (payload: any) => {
    // নিজের সিগনাল ইগনোর করা
    if (payload.senderId === userId || (payload.targetId && payload.targetId !== userId)) return;
    
    const { type, senderId } = payload;
    const pc = peersRef.current.get(senderId)?.connection || createPeerConnection(senderId, false);

    try {
      if (type === 'new-peer') {
         // নতুন কেউ আসলে কানেকশন শুরু করা
         console.log("New peer joined:", senderId);
         createPeerConnection(senderId, true);
      }
      else if (type === 'offer') {
        console.log("Received Offer from:", senderId);
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
        console.log("Received Answer from:", senderId);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } 
      else if (type === 'ice-candidate') {
        try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
            console.error("Error adding ice candidate", e);
        }
      }
    } catch (err) { console.error("Signal Error:", err); }
  }, [createPeerConnection, userId]);

  const joinMeeting = useCallback(async () => {
    const channel = supabase.channel(`meeting_room:${meetingId}`, { config: { broadcast: { self: false } } });
    
    channel
      .on('broadcast', { event: 'signal' }, ({ payload }) => handleSignal(payload))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Connected to Signaling Server");
          setIsConnected(true);
          // সবাইকে জানানো যে আমি জয়েন করেছি
          await channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'new-peer', senderId: userId } });
        }
      });
    
    channelRef.current = channel;
  }, [meetingId, userId, handleSignal]);

  const leaveMeeting = useCallback(async () => {
    peersRef.current.forEach(({ connection }) => connection.close());
    peersRef.current.clear();
    if (channelRef.current) await supabase.removeChannel(channelRef.current);
    setIsConnected(false);
  }, []);

  // ভিডিও বা স্ক্রিন শেয়ার পাল্টালে ট্র্যাক আপডেট করা
  const replaceTrack = useCallback((newTrack: MediaStreamTrack) => {
    peersRef.current.forEach(({ connection }) => {
      const sender = connection.getSenders().find(s => s.track?.kind === newTrack.kind);
      if (sender) sender.replaceTrack(newTrack);
    });
  }, []);

  useEffect(() => { return () => { leaveMeeting(); }; }, []);

  return { isConnected, joinMeeting, leaveMeeting, replaceTrack };
};

export default useWebRTC;