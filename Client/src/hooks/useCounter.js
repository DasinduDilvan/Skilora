import { useEffect, useState } from 'react';

/**
 * Animates a number from 0 to `target` when `start` is true.
 *
 * @param {number}  target   – final number
 * @param {boolean} start    – begin animation when true
 * @param {number}  duration – ms
 * @returns {number} current animated value
 */
export default function useCounter(target, start = false, duration = 1600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let animationFrameId;
    let startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(target * eased));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    }

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, start, duration]);

  return count;
}