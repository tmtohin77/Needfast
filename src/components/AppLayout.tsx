import React, { useState, useEffect } from 'react';
import { MeetingProvider, useMeeting } from '@/contexts/MeetingContext';
import Header from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import DevicesSection from '@/components/home/DevicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/home/Footer';
import AuthModal from '@/components/modals/AuthModal';
import CreateMeetingModal from '@/components/modals/CreateMeetingModal';
import JoinMeetingModal from '@/components/modals/JoinMeetingModal';
import MeetingRoom from '@/components/meeting/MeetingRoom';
import { ToastContainer, useToast } from '@/components/common/Toast';

const AppContent: React.FC = () => {
  const { currentUser, meeting, isDarkMode } = useMeeting();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const { toasts, removeToast, success } = useToast();

  // Check for meeting code in URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/join\/([a-z]{3}-[a-z]{3}-[a-z]{3})/i);
    if (match) {
      setJoinCode(match[1]);
      if (currentUser) {
        setShowJoinModal(true);
      } else {
        setPendingAction('join');
        setShowAuthModal(true);
      }
    }
  }, [currentUser]);

  const handleStartMeeting = () => {
    if (currentUser) {
      setShowCreateModal(true);
    } else {
      setPendingAction('create');
      setShowAuthModal(true);
    }
  };

  const handleJoinMeeting = (code: string) => {
    setJoinCode(code);
    if (currentUser) {
      setShowJoinModal(true);
    } else {
      setPendingAction('join');
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    success('Welcome to NeetFast!');
    if (pendingAction === 'create') {
      setShowCreateModal(true);
    } else if (pendingAction === 'join') {
      setShowJoinModal(true);
    }
    setPendingAction(null);
  };

  const handleMeetingStart = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
  };

  const handleLeaveMeeting = () => {
    // Clear URL if it has meeting code
    if (window.location.pathname.includes('/join/')) {
      window.history.pushState({}, '', '/');
    }
  };

  // If in a meeting, show meeting room
  if (meeting) {
    return (
      <>
        <MeetingRoom onLeave={handleLeaveMeeting} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <Header onSignIn={() => setShowAuthModal(true)} />
        
        <main>
          <HeroSection
            onStartMeeting={handleStartMeeting}
            onJoinMeeting={handleJoinMeeting}
          />
          <FeaturesSection />
          <HowItWorksSection />
          <DevicesSection />
          <TestimonialsSection />
          <FAQSection />
          <PricingSection />
          <CTASection onStartMeeting={handleStartMeeting} />
        </main>

        <Footer />

        {/* Modals */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
        />

        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onStart={handleMeetingStart}
        />

        <JoinMeetingModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setJoinCode('');
          }}
          onJoin={handleMeetingStart}
          initialCode={joinCode}
        />

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <MeetingProvider>
      <AppContent />
    </MeetingProvider>
  );
};

export default AppLayout;
