'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';

const styles = createStaticStyles(({ css, cssVar }) => ({
  bar: css`
    background: ${cssVar.colorFillSecondary};
    border-radius: 3px;
    height: 6px;
    overflow: hidden;
    width: 100%;
  `,
  barFill: css`
    background: ${cssVar.colorPrimary};
    border-radius: 3px;
    height: 100%;
    transition: width 0.3s ease;
  `,
  card: css`
    background: ${cssVar.colorBgContainer};
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 10px;
    padding: 16px;
  `,
  dimensionLabel: css`
    color: ${cssVar.colorText};
    font-size: 13px;
    font-weight: 500;
    min-width: 60px;
  `,
  header: css`
    border-bottom: 1px solid ${cssVar.colorBorderSecondary};
    margin-bottom: 12px;
    padding-bottom: 10px;
  `,
  headerTitle: css`
    color: ${cssVar.colorText};
    font-size: 14px;
    font-weight: 600;
  `,
  score: css`
    color: ${cssVar.colorTextSecondary};
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    min-width: 32px;
    text-align: right;
  `,
  total: css`
    color: ${cssVar.colorPrimary};
    font-size: 20px;
    font-weight: 700;
    text-align: center;
  `,
  totalLabel: css`
    color: ${cssVar.colorTextTertiary};
    font-size: 12px;
  `,
}));

interface DimensionScore {
  label: string;
  score: number;
  comment: string;
}

interface ScoreCardProps {
  dimensions: DimensionScore[];
  questionNumber?: number;
  total: number;
}

const MAX_SCORE = 5;

const ScoreCard = memo<ScoreCardProps>(({ dimensions, questionNumber, total }) => {
  return (
    <div className={styles.card}>
      {/* Header */}
      <Flexbox className={styles.header} horizontal justify="space-between">
        <span className={styles.headerTitle}>
          {questionNumber ? `📊 问题 ${questionNumber} 评分` : '📊 评分'}
        </span>
      </Flexbox>

      {/* Dimensions */}
      <Flexbox gap={10}>
        {dimensions.map((d) => (
          <Flexbox gap={4} key={d.label}>
            <Flexbox horizontal justify="space-between">
              <span className={styles.dimensionLabel}>{d.label}</span>
              <span className={styles.score}>
                {d.score}/{MAX_SCORE}
              </span>
            </Flexbox>
            <div className={styles.bar}>
              <div
                className={styles.barFill}
                style={{ width: `${(d.score / MAX_SCORE) * 100}%` }}
              />
            </div>
            <span style={{ color: 'var(--colorTextTertiary)', fontSize: 12 }}>{d.comment}</span>
          </Flexbox>
        ))}
      </Flexbox>

      {/* Total */}
      <Flexbox align="center" gap={2} style={{ marginTop: 12 }}>
        <span className={styles.totalLabel}>总分</span>
        <span className={styles.total}>{total.toFixed(1)}</span>
      </Flexbox>
    </div>
  );
});

export default ScoreCard;
