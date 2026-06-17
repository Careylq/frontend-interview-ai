'use client';

import { Flexbox, Icon } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import {
  BracesIcon,
  BugIcon,
  GlobeIcon,
  LayersIcon,
  NetworkIcon,
  PlayIcon,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- Data ----

interface InterviewDomain {
  description: string;
  examples: string[];
  icon: typeof BracesIcon;
  key: string;
  label: string;
}

const DOMAINS: InterviewDomain[] = [
  {
    description: '原型链、闭包、Event Loop、Promise、ES6+',
    examples: ['闭包与作用域', 'Promise 微任务执行顺序', '原型继承'],
    icon: BracesIcon,
    key: 'javascript',
    label: 'JavaScript',
  },
  {
    description: 'Virtual DOM、Fiber、Hooks、状态管理、SSR',
    examples: ['Fiber 调度原理', 'useEffect 与 useLayoutEffect', 'React 18 并发特性'],
    icon: LayersIcon,
    key: 'react',
    label: 'React',
  },
  {
    description: '渲染管线、重排重绘、XSS/CSRF、HTTP 协议',
    examples: ['浏览器渲染流程', '跨域与 CORS', 'HTTP/2 多路复用'],
    icon: GlobeIcon,
    key: 'browser',
    label: '浏览器与网络',
  },
  {
    description: 'Flexbox、Grid、BFC、响应式、动画性能',
    examples: ['Flexbox vs Grid 选型', 'BFC 触发条件', 'CSS 动画 vs JS 动画'],
    icon: BugIcon,
    key: 'css',
    label: 'CSS 与布局',
  },
  {
    description: '排序、双指针、DFS/BFS、动态规划基础',
    examples: ['最大子序和', '二叉树层序遍历', 'LRU 缓存实现'],
    icon: NetworkIcon,
    key: 'algorithm',
    label: '算法与数据结构',
  },
];

// ---- Styles ----

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    cursor: pointer;
    background: ${cssVar.colorBgContainer};
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 12px;
    padding: 24px;
    transition: all 0.2s ease;
    min-width: 220px;
    flex: 1 1 220px;
    max-width: 280px;

    &:hover {
      border-color: ${cssVar.colorPrimary};
      transform: translateY(-2px);
      box-shadow: 0 4px 20px ${cssVar.colorPrimaryBg}40;
    }
  `,
  cardActive: css`
    border-color: ${cssVar.colorPrimary};
    background: ${cssVar.colorPrimaryBg};
    box-shadow: 0 2px 12px ${cssVar.colorPrimaryBg};
  `,
  cardBody: css`
    color: ${cssVar.colorTextSecondary};
    font-size: 13px;
    line-height: 1.6;
  `,
  cardIcon: css`
    color: ${cssVar.colorPrimary};
    margin-bottom: 12px;
  `,
  cardTitle: css`
    color: ${cssVar.colorText};
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  `,
  container: css`
    max-width: 960px;
    margin: 0 auto;
    padding: 48px 24px;
    width: 100%;
  `,
  exampleTag: css`
    background: ${cssVar.colorFillSecondary};
    border-radius: 6px;
    color: ${cssVar.colorTextTertiary};
    font-size: 11px;
    padding: 2px 8px;
  `,
  startButton: css`
    cursor: pointer;
    background: ${cssVar.colorPrimary};
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    margin-top: 32px;
    padding: 14px 40px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.88;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  `,
  subtitle: css`
    color: ${cssVar.colorTextTertiary};
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 40px;
    text-align: center;
  `,
  title: css`
    color: ${cssVar.colorText};
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 12px;
    text-align: center;
  `,
}));

// ---- Component ----

const InterviewHome = memo(() => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    if (!selectedDomain) return;
    // Navigate to the interviewer agent with the selected domain as a param
    navigate(
      `/agent/interviewer?domain=${selectedDomain}`,
    );
  }, [selectedDomain, navigate]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <h1 className={styles.title}>前端面试工作台</h1>
      <p className={styles.subtitle}>
        选择你想练习的技术方向，AI 面试官将根据大厂面试标准进行模拟面试，
        <br />
        包含自适应出题、多维度评分和错题复盘。
      </p>

      {/* Domain Cards */}
      <Flexbox gap={16} horizontal style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {DOMAINS.map((domain) => {
          const isActive = selectedDomain === domain.key;
          return (
            <Flexbox
              align="flex-start"
              className={[styles.card, isActive && styles.cardActive].filter(Boolean).join(' ')}
              gap={12}
              key={domain.key}
              onClick={() => setSelectedDomain(domain.key)}
            >
              <span className={styles.cardIcon}>
                <Icon icon={domain.icon} size={{ fontSize: 24 }} />
              </span>
              <span className={styles.cardTitle}>{domain.label}</span>
              <p className={styles.cardBody}>{domain.description}</p>
              <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
                {domain.examples.map((ex) => (
                  <span className={styles.exampleTag} key={ex}>
                    {ex}
                  </span>
                ))}
              </Flexbox>
            </Flexbox>
          );
        })}
      </Flexbox>

      {/* Start Button */}
      <Flexbox align="center">
        <button
          className={styles.startButton}
          disabled={!selectedDomain}
          onClick={handleStart}
        >
          <Flexbox align="center" gap={8} horizontal>
            <Icon icon={PlayIcon} size={{ fontSize: 18 }} />
            {selectedDomain
              ? `开始 ${DOMAINS.find((d) => d.key === selectedDomain)?.label} 面试`
              : '请先选择技术方向'}
          </Flexbox>
        </button>
      </Flexbox>
    </div>
  );
});

export default InterviewHome;
