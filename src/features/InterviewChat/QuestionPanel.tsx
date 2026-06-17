'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { Code2Icon, LightbulbIcon } from 'lucide-react';
import { memo } from 'react';

const styles = createStaticStyles(({ css, cssVar }) => ({
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
  editor: css`
    background: #1e1e2e;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 8px;
    color: #cdd6f4;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    line-height: 1.6;
    min-height: 200px;
    outline: none;
    padding: 16px;
    resize: vertical;
    width: 100%;

    &::placeholder {
      color: #6c7086;
    }
  `,
  content: css`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 24px;
    overflow-y: auto;
    padding: 20px;
  `,
  sectionLabel: css`
    align-items: center;
    color: ${cssVar.colorTextSecondary};
    display: flex;
    font-size: 12px;
    font-weight: 500;
    gap: 6px;
    margin-bottom: 10px;
  `,
  tip: css`
    color: ${cssVar.colorTextTertiary};
    font-size: 13px;
    line-height: 1.6;
  `,
  tipIntro: css`
    color: ${cssVar.colorTextSecondary};
    font-size: 13px;
    line-height: 1.8;
    margin-bottom: 12px;
  `,
}));

const TIPS = [
  '先理清思路再作答，面试官更看重推导过程',
  '代码写完后可以口头解释关键逻辑和边界情况',
  '遇到不确定的地方，说出你的推测比沉默更好',
];

const EDITOR_PLACEHOLDER =
  '// 在这里编写你的代码\n// 例如：实现一个防抖函数\n\nfunction debounce(fn, delay) {\n  let timer = null;\n  return function (...args) {\n    // your code...\n  };\n}';

const QuestionPanel = memo(() => {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>代码编辑器</span>
      </div>

      <div className={styles.content}>
        {/* Code Editor */}
        <div>
          <span className={styles.sectionLabel}>
            <Code2Icon size={14} />
            编写代码
          </span>
          <textarea className={styles.editor} placeholder={EDITOR_PLACEHOLDER} />
        </div>

        {/* Tips */}
        <div>
          <span className={styles.sectionLabel}>
            <LightbulbIcon size={14} />
            答题提示
          </span>
          <p className={styles.tipIntro}>
            面试官会在右侧对话中出题并给出评分。请在左侧编写代码，在右侧输入框作答。
          </p>
          <Flexbox gap={8}>
            {TIPS.map((tip) => (
              <span className={styles.tip} key={tip}>
                • {tip}
              </span>
            ))}
          </Flexbox>
        </div>
      </div>
    </div>
  );
});

export default QuestionPanel;
