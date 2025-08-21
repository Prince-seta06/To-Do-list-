import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { ConfettiShape } from '../contexts/ConfettiContext';

interface TaskCompletionConfettiProps {
  show: boolean;
  duration?: number;
  colors?: string[];
  numberOfPieces?: number;
  recycle?: boolean;
  shape?: ConfettiShape;
  onComplete?: () => void;
}

const TaskCompletionConfetti = ({
  show,
  duration = 3000,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  numberOfPieces = 200,
  recycle = false,
  shape = 'square',
  onComplete
}: TaskCompletionConfettiProps) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to handle the duration timer
  useEffect(() => {
    let timer: number | undefined;
    
    // If not recycling and there's a duration, set a timer to call onComplete
    if (show && !recycle && duration > 0 && onComplete) {
      timer = window.setTimeout(() => {
        onComplete();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, recycle, duration, onComplete]);

  if (!show) return null;

  // Custom draw function for different shapes
  const drawShape = (ctx: CanvasRenderingContext2D) => {
    const width = 15;
    const height = 15;
    const x = 0;
    const y = 0;
    const color = ctx.fillStyle;
    
    ctx.save();

    switch (shape) {
      case 'circle':
        // Draw a circle
        ctx.beginPath();
        const radius = Math.min(width, height) / 2;
        ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'star':
        // Draw a 5-point star
        const spikes = 5;
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius / 2;
        const cx = x + width / 2;
        const cy = y + height / 2;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(
            cx + Math.cos(rot) * outerRadius,
            cy + Math.sin(rot) * outerRadius
          );
          rot += step;
          ctx.lineTo(
            cx + Math.cos(rot) * innerRadius,
            cy + Math.sin(rot) * innerRadius
          );
          rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
        break;
      case 'heart':
        // Draw a heart shape
        const size = Math.min(width, height);
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + size / 5);
        
        // Top left curve
        ctx.bezierCurveTo(
          x, y, 
          x, y + size / 2, 
          x + size / 2, y + size
        );
        
        // Bottom right curve
        ctx.bezierCurveTo(
          x + size, y + size / 2, 
          x + size, y, 
          x + size / 2, y + size / 5
        );
        
        ctx.closePath();
        ctx.fill();
        break;
      case 'diamond':
        // Draw a diamond
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'triangle':
        // Draw a triangle
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        // Default square shape - just fill the rectangle
        ctx.fillRect(x, y, width, height);
    }

    ctx.restore();
  };

  return (
    <Confetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      numberOfPieces={numberOfPieces}
      recycle={recycle}
      colors={colors}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
      drawShape={drawShape}
    />
  );
};

export default TaskCompletionConfetti;