'use client';

import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { createStaticStyles } from 'antd-style';
import { memo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';

import QuestionPanel from './QuestionPanel';

const styles = createStaticStyles(({ css, cssVar }) => ({
  divider: css`
    cursor: col-resize;
    width: 4px;
    background: ${cssVar.colorBorderSecondary};
    flex-shrink: 0;
    transition: background 0.15s;

    &:hover {
      background: ${cssVar.colorPrimary};
    }
  `,
  root: css`
    display: flex;
    height: 100%;
    overflow: hidden;
    width: 100%;
  `,
  leftPanel: css`
    background: ${cssVar.colorBgContainer};
    border-right: 1px solid ${cssVar.colorBorderSecondary};
    display: flex;
    flex-direction: column;
    min-width: 280px;
    overflow-y: auto;
  `,
  rightPanel: css`
    background: ${cssVar.colorBgLayout};
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 320px;
    overflow: hidden;
  `,
}));

interface InterviewChatProps {
  children: ReactNode;
}

const LEFT_DEFAULT = 380;
const LEFT_MIN = 280;
const LEFT_MAX_RATIO = 0.55;

const InterviewChat = memo<InterviewChatProps>(({ children }) => {
  const [leftWidth, setLeftWidth] = useState(LEFT_DEFAULT);
  const dragging = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const w = Math.max(LEFT_MIN, Math.min(e.clientX - rect.left, rect.width * LEFT_MAX_RATIO));
      setLeftWidth(w);
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.leftPanel} style={{ width: leftWidth }}>
        <QuestionPanel />
      </div>
      <div className={styles.divider} onMouseDown={onMouseDown} />
      <div className={styles.rightPanel}>{children}</div>
    </div>
  );
});

/** Hook: check if the active agent is the interviewer */
export const useIsInterviewerAgent = (): boolean => {
  const activeAgentId = useChatStore((s) => s.activeAgentId);
  return useAgentStore((s) => {
    if (!activeAgentId) return false;
    return agentSelectors.getAgentSlugById(activeAgentId)(s) === BUILTIN_AGENT_SLUGS.interviewer;
  });
};

export default InterviewChat;
