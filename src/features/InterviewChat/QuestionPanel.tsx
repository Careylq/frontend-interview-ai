'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { Code2Icon, LightbulbIcon } from 'lucide-react';
import { memo, useMemo } from 'react';

import { useConversationStore } from '@/features/Conversation/store';
import { dataSelectors } from '@/features/Conversation/store/slices/data/selectors';

const styles = createStaticStyles(({ css, cssVar }) => ({
  codeEditor: css`
    background: #1e1e2e;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 8px;
    color: #cdd6f4;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    line-height: 1.6;
    min-height: 180px;
    outline: none;
    padding: 16px;
    resize: vertical;
    width: 100%;

    &::placeholder {
      color: #6c7086;
    }
  `,
  header: css`
    border-bottom: 1px solid ${cssVar.colorBorderSecondary};
    padding: 16px 20px;
  `,
  headerLabel: css`
    color: ${cssVar.colorTextSecondary};
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  `,
  panel: css`
    display: flex;
    flex-direction: column;
    height: 100%;
  `,
  questionArea: css`
    color: ${cssVar.colorText};
    font-size: 14px;
    line-height: 1.8;
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  `,
  questionText: css`
    color: ${cssVar.colorText};
    font-size: 14px;
    line-height: 1.8;
    white-space: pre-wrap;
  `,
  placeholder: css`
    color: ${cssVar.colorTextTertiary};
    font-size: 14px;
    line-height: 1.8;
    text-align: center;
    padding: 40px 20px;
  `,
  section: css`
    padding: 0 20px 20px;
  `,
  sectionLabel: css`
    align-items: center;
    color: ${cssVar.colorTextSecondary};
    display: flex;
    font-size: 12px;
    font-weight: 500;
    gap: 6px;
    margin-bottom: 8px;
  `,
}));

/**
 * Extract the current interview question from the AI message text.
 * Matches patterns: "📝 问题 N" | "📝 Question N" | "题目：" | "**题目**"
 */
const extractQuestion = (text: string): string | null => {
  // "📝 第X题" or "📝 Question N"
  let m = text.match(/📝\s*(?:第[一二三四五六七八九十\d]+题|Question\s*\d+)\s*\n([\s\S]*?)(?=\n📝|\n📊|\n💡|\n*$)/);
  if (m?.[1]?.trim()) return m[1].trim();

  // "题目：" or "**题目**"
  m = text.match(/(?:题目|Topic)[：:\*]*\s*\n?([\s\S]*?)(?=\n📝|\n📊|\n\n(?:请|Please)|\n*$)/);
  if (m?.[1]?.trim()) return m[1].trim();

  // Fallback: return up to 300 chars of the text without score card
  const withoutScore = text.split(/📊|💡/)[0];
  if (withoutScore.trim().length < 300) return withoutScore.trim();

  return text.slice(0, 300);
};

/** Get the latest assistant message from conversation display messages */
const useLatestQuestion = (): string | null => {
  const messages = useConversationStore(dataSelectors.displayMessages);

  return useMemo(() => {
    if (!messages || messages.length === 0) return null;

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        // msg.content could be a string or an array of content blocks
        let content = '';
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          content = msg.content.map((block: any) => block.text || '').join('\n');
        }
        if (content) return extractQuestion(content);
      }
    }
    return null;
  }, [messages]);
};

const QuestionPanel = memo(() => {
  const question = useLatestQuestion();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>当前题目</span>
      </div>

      <div className={styles.questionArea}>
        {question ? (
          <div className={styles.questionText}>{question}</div>
        ) : (
          <p className={styles.placeholder}>
            AI 面试官将在对话中出题，
            <br />
            题目内容会自动展示在这里。
            <br />
            <br />
            请在右侧对话框中作答。
          </p>
        )}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>
          <Code2Icon size={14} />
          代码编辑器
        </span>
        <textarea
          className={styles.codeEditor}
          placeholder="// 在这里编写你的代码&#10;// 例如：实现一个防抖函数 debounce&#10;&#10;function debounce(fn, delay) {&#10;  // your code...&#10;}"
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>
          <LightbulbIcon size={14} />
          提示
        </span>
        <Flexbox gap={6}>
          {['先思考再作答，面试官会关注你的思路', '代码写完后可以口头解释关键逻辑', '遇到不确定的地方，可以说出你的推测'].map(
            (tip) => (
              <Flexbox align="flex-start" gap={8} horizontal key={tip}>
                <span style={{ color: 'var(--colorTextTertiary)', flexShrink: 0 }}>•</span>
                <span style={{ color: 'var(--colorTextTertiary)', fontSize: 13, lineHeight: 1.6 }}>
                  {tip}
                </span>
              </Flexbox>
            ),
          )}
        </Flexbox>
      </div>
    </div>
  );
});

export default QuestionPanel;
