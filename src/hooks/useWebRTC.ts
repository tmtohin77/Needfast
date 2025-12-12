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

// Google এর ফ্রি এবং শক্তিশালী সার্ভার
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
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
  // কানেকশন বাফার (নেট স্লো থাকলে কাজে দেবে)
  const candidatesQueue = useRef<Map<string, RTCIceCandidate[]>>(new Map());

  // ১. কানেকশন তৈরি
  const createPeerConnection = useCallback((peerId: string, initiateOffer: boolean = false) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!.connection;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // লোকাল স্ট্রিম পাঠানো
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    // রিমোট স্ট্রিম রিসিভ করা (Video/Audio)
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log(`🎥 Stream received from ${peerId}`);
        onRemoteStream(peerId, event.streams[0]);
      }
    };

    // ICE Candidate পাঠানো
    pc.onicecandidate = async (event) => {
      if (event.candidate && channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'ice-candidate', candidate: event.candidate, senderId: userId, targetId: peerId }
        });
      }
    };

    // ডিসকানেক্ট হলে
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
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

  // ২. অফার তৈরি
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

  // ৩. সিগনাল হ্যান্ডলিং
  const handleSignal = useCallback(async (payload: any) => {
    if (payload.senderId === userId || (payload.targetId && payload.targetId !== userId)) return;
    const { type, senderId } = payload;
    
    const pc = peersRef.current.get(senderId)?.connection || createPeerConnection(senderId, false);

    try {
      if (type === 'new-peer') {
         // নতুন কেউ আসলে আমি তাকে কল করব
         createPeerConnection(senderId, true);
      }
      else if (type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // বাফারে থাকা ক্যান্ডিডেট অ্যাড করা
        const queue = candidatesQueue.current.get(senderId) || [];
        queue.forEach(c => pc.addIceCandidate(c));
        candidatesQueue.current.delete(senderId);

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
        const queue = candidatesQueue.current.get(senderId) || [];
        queue.forEach(c => pc.addIceCandidate(c));
        candidatesQueue.current.delete(senderId);
      } 
      else if (type === 'ice-candidate') {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } else {
          const queue = candidatesQueue.current.get(senderId) || [];
          queue.push(payload.candidate);
          candidatesQueue.current.set(senderId, queue);
        }
      }
    } catch (err) { console.error("Signal Error:", err); }
  }, [createPeerConnection, userId]);

  // ৪. জয়েন করা
  const joinMeeting = useCallback(async () => {
    const channel = supabase.channel(`meeting_room:${meetingId}`, { config: { broadcast: { self: false } } });
    channel
      .on('broadcast', { event: 'signal' }, ({ payload }) => handleSignal(payload))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // জয়েন করেই সবাইকে হ্যালো বলা
          await channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'new-peer', senderId: userId } });
        }
      });
    channelRef.current = channel;
  }, [meetingId, userId, handleSignal]);

  const leaveMeeting = useCallback(async () => {
    peersRef.current.forEach(({ connection }) => connection.close());
    peersRef.current.clear();
    if (channelRef.current) await supabase.removeChannel(channelRef.current);
  }, []);

  // ৫. ট্র্যাক রিপ্লেস (ভিডিও/স্ক্রিন চেঞ্জ হলে)
  const replaceTrack = useCallback((newTrack: MediaStreamTrack) => {
    peersRef.current.forEach(({ connection }) => {
      const sender = connection.getSenders().find(s => s.track?.kind === newTrack.kind);
      if (sender) sender.replaceTrack(newTrack);
    });
  }, []);

  return { joinMeeting, leaveMeeting, replaceTrack };
};

export default useWebRTC;