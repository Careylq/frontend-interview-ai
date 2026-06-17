'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import InterviewChat, { useIsInterviewerAgent } from '@/features/InterviewChat';

import Conversation from './features/Conversation';
import ChatHydration from './features/Conversation/ChatHydration';
import TelemetryNotification from './features/TelemetryNotification';

const ChatPage = memo(() => {
  const isInterview = useIsInterviewerAgent();

  return (
    <>
      <ChatHydration />
      {isInterview ? (
        <InterviewChat>
          <Conversation />
        </InterviewChat>
      ) : (
        <Flexbox
          height={'100%'}
          style={{ minHeight: 0, overflow: 'hidden', position: 'relative' }}
          width={'100%'}
        >
          <Conversation />
        </Flexbox>
      )}
      <TelemetryNotification mobile={false} />
    </>
  );
});

export default ChatPage;
