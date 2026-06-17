'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { AwardIcon, BookOpenIcon, TrendingUpIcon } from 'lucide-react';
import { memo } from 'react';

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    background: ${cssVar.colorBgContainer};
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 12px;
    padding: 24px;
  `,
  divider: css`
    border-top: 1px solid ${cssVar.colorBorderSecondary};
    margin: 16px 0;
  `,
  scoreBig: css`
    color: ${cssVar.colorPrimary};
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
  `,
  scoreLabel: css`
    color: ${cssVar.colorTextTertiary};
    font-size: 13px;
  `,
  sectionTitle: css`
    color: ${cssVar.colorText};
    font-size: 13px;
    font-weight: 600;
  `,
  tag: css`
    background: ${cssVar.colorFillSecondary};
    border-radius: 6px;
    color: ${cssVar.colorTextSecondary};
    font-size: 12px;
    padding: 3px 10px;
  `,
  text: css`
    color: ${cssVar.colorTextSecondary};
    font-size: 13px;
    line-height: 1.7;
  `,
  title: css`
    color: ${cssVar.colorText};
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
  `,
}));

interface ReportCardProps {
  questionScores: { domain: string; score: number; topic: string }[];
  weakAreas: string[];
}

const ReportCard = memo<ReportCardProps>(({ questionScores, weakAreas }) => {
  const avgScore =
    questionScores.length > 0
      ? questionScores.reduce((sum, q) => sum + q.score, 0) / questionScores.length
      : 0;

  return (
    <div className={styles.card}>
      <Flexbox align="center" gap={8} horizontal className={styles.title}>
        <AwardIcon size={18} />
        面试总结报告
      </Flexbox>

      <Flexbox align="center" gap={2}>
        <span className={styles.scoreBig}>{avgScore.toFixed(1)}</span>
        <span className={styles.scoreLabel}>/ 5.0 综合评分</span>
      </Flexbox>

      <div className={styles.divider} />

      <Flexbox gap={10}>
        <span className={styles.sectionTitle}>各题得分</span>
        {questionScores.map((q, i) => (
          <Flexbox gap={4} horizontal justify="space-between" key={i}>
            <span className={styles.text}>Q{i + 1}. {q.topic}</span>
            <span className={styles.tag}>{q.domain} · {q.score}/5</span>
          </Flexbox>
        ))}
      </Flexbox>

      <div className={styles.divider} />

      <Flexbox gap={10}>
        <Flexbox gap={6} horizontal>
          <TrendingUpIcon size={14} />
          <span className={styles.sectionTitle}>薄弱环节</span>
        </Flexbox>
        {weakAreas.map((area) => (
          <span className={styles.text} key={area}>• {area}</span>
        ))}
      </Flexbox>

      <div className={styles.divider} />

      <Flexbox gap={10}>
        <Flexbox gap={6} horizontal>
          <BookOpenIcon size={14} />
          <span className={styles.sectionTitle}>建议学习方向</span>
        </Flexbox>
        <span className={styles.text}>
          根据本次面试表现，建议重点复习以上薄弱环节。可以继续使用本工具进行专项强化训练。
        </span>
      </Flexbox>
    </div>
  );
});

export default ReportCard;
