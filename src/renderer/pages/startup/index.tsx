import React, { useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';
import { startupLoadingProgress } from '@/renderer/bridge';
import { IpcRendererEventCallback } from '@/types/ipc/events';

const StartupAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const drawProgressBar = (
    ctx: CanvasRenderingContext2D,
    progress: number,
    timestamp: number
  ) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // 进度条尺寸和位置
    const barWidth = width;
    const barHeight = height;
    const x = 0;
    const y = 0;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // 创建波纹效果
    const waveAmplitude = 0.4; // 增加波纹振幅
    const elapsed = timestamp - startTimeRef.current;

    // 创建波纹渐变
    const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
    const baseColors = [
      { color: '#00ff00', offset: 0 },
      { color: '#00ffff', offset: 0.3 },
      { color: '#0088ff', offset: 0.6 },
      { color: '#00ff00', offset: 1 },
    ];

    // 添加波纹效果到渐变色
    baseColors.forEach(({ color, offset }) => {
      const waveOffset =
        Math.sin(offset * Math.PI * 2 + elapsed * 0.003) * waveAmplitude;
      const adjustedOffset = Math.max(0, Math.min(1, offset + waveOffset));
      gradient.addColorStop(adjustedOffset, color);
    });

    // 绘制进度条
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    // 绘制边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // 添加光晕效果
    const glowGradient = ctx.createLinearGradient(
      x,
      y,
      x + barWidth * progress,
      y
    );
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = glowGradient;
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    // 添加粒子效果
    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const particleX = x + barWidth * progress;
      const particleY = y + (Math.random() - 0.5) * barHeight;
      const size = Math.random() * 2 + 1;

      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    }
  };

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawProgressBar(ctx, progressRef.current, timestamp);
    if (progressRef.current === 1) {
      window.ipcRenderer?.mainWindowReady();
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 处理窗口大小变化
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawProgressBar(ctx, progressRef.current, performance.now());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 开始动画
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    // 监听进度更新
    const handleLoadingProgress: IpcRendererEventCallback<number> = (
      _event,
      progress
    ) => {
      const validProgress = Math.max(0, Math.min(1, progress));
      progressRef.current = validProgress;
    };

    startupLoadingProgress('on', handleLoadingProgress);

    return () => {
      window.removeEventListener('resize', handleResize);
      startupLoadingProgress('off', handleLoadingProgress);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <div className={styles.startupContainer}>
      <canvas ref={canvasRef} className={styles.startupCanvas} />
    </div>
  );
};

export default StartupAnimation;
