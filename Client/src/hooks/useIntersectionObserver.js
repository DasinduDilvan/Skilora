import { useEffect, useRef, useState } from 'react';

/**
 * Observes when a DOM element enters the viewport.
 *
 * @param {Object}  options
 * @param {number}  options.threshold  – 0‑1, how much of the element must be visible
 * @param {string}  options.rootMargin – CSS-style margin around root
 * @param {boolean} options.triggerOnce – stop observing after first intersection
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export default function useIntersectionObserver({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}