# NeetFast - Professional Video Meeting Platform

A free, cross-platform video conferencing application built with React, TypeScript, and Supabase. NeetFast provides a seamless meeting experience similar to Zoom or Google Meet, completely free and user-friendly.

## Features

### Core Features
- **Video Calls**: HD video calls for 1:1 and group meetings (up to 50 participants)
- **Audio Calls**: Crystal-clear audio with noise cancellation
- **Screen Sharing**: Share your entire screen or specific windows
- **Real-time Chat**: Text messages, emojis, and file sharing during meetings
- **Meeting Management**: Create meetings with unique codes, share links, join via code
- **Host Controls**: Mute participants, kick users, lock meetings, rename participants

### UI/UX Features
- Clean, modern, responsive design
- Works on mobile, tablet, laptop, and TV
- Grid layout for participants with adaptive sizing
- Floating control buttons
- Chat panel overlay
- Dark mode support

### Security
- Secure meeting codes
- Meeting lock functionality
- Host-only controls
- Encrypted communications

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Edge Functions + Storage)
- **Real-time**: WebRTC for video/audio, Supabase Realtime for chat
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Toast, etc.)
│   ├── home/            # Landing page sections
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── DevicesSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   ├── icons/           # Custom SVG icons
│   ├── meeting/         # Meeting room components
│   │   ├── MeetingRoom.tsx
│   │   ├── VideoGrid.tsx
│   │   ├── VideoTile.tsx
│   │   ├── ControlBar.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── ParticipantsPanel.tsx
│   │   └── PreMeetingScreen.tsx
│   ├── modals/          # Modal dialogs
│   │   ├── AuthModal.tsx
│   │   ├── CreateMeetingModal.tsx
│   │   └── JoinMeetingModal.tsx
│   └── AppLayout.tsx    # Main app layout
├── contexts/
│   └── MeetingContext.tsx  # Meeting state management
├── hooks/
│   └── useWebRTC.ts     # WebRTC connection hook
├── types/
│   └── meeting.ts       # TypeScript interfaces
└── lib/
    └── supabase.ts      # Supabase client
```

## Database Schema

### Tables

- **users**: User accounts (id, email, display_name, avatar_url, is_guest)
- **meetings**: Meeting rooms (id, meeting_code, title, host_id, is_active, is_locked)
- **meeting_participants**: Participants in meetings (meeting_id, user_id, display_name, is_host, is_muted)
- **chat_messages**: Chat messages (meeting_id, user_id, sender_name, message, file_url)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

The Supabase configuration is already set up in `src/lib/supabase.ts`.

## Usage

### Creating a Meeting

1. Click "New Meeting" on the homepage
2. Sign in or continue as a guest
3. Optionally add a meeting title
4. Click "Create Meeting"
5. Share the meeting code or link with participants
6. Click "Start Now" to join

### Joining a Meeting

1. Enter the meeting code in the input field
2. Click "Join"
3. Sign in or continue as a guest
4. Configure your camera and microphone
5. Click "Join Meeting"

### During a Meeting

- **Toggle Microphone**: Click the mic button
- **Toggle Camera**: Click the camera button
- **Share Screen**: Click the screen share button
- **Open Chat**: Click the chat button
- **View Participants**: Click the participants button
- **Leave Meeting**: Click the red phone button

### Host Controls

- **Mute All**: Mute all participants at once
- **Lock Meeting**: Prevent new participants from joining
- **Remove Participant**: Kick a participant from the meeting
- **Mute Participant**: Mute a specific participant

## Responsive Design

NeetFast is designed to work on all devices:

- **Mobile**: Single-column layout, touch-friendly controls
- **Tablet**: 2-column grid, optimized for landscape/portrait
- **Laptop/Desktop**: Multi-column grid, full feature set
- **TV**: Large buttons, remote-friendly navigation

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - Free for personal and commercial use.

## Support

For questions or issues, please open an issue on GitHub or contact support.

---

Built with ❤️ by the NeetFast team
