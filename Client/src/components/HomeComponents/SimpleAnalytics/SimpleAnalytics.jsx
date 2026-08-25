import { analyticsData } from '../../../data/dummyData';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import useCounter from '../../../hooks/useCounter';
import './SimpleAnalytics.css';

function StatItem({ stat }) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.4,
    triggerOnce: true,
  });

  const count = useCounter(stat.target, isVisible, 1600);

  const formatted = `${stat.prefix}${count.toLocaleString()}${stat.suffix}`;

  return (
    <div ref={ref} className="stat-item">
      <h3>{formatted}</h3>
      <p>{stat.label}</p>
    </div>
  );
}

export default function SimpleAnalytics() {
  return (
    <section className="stats-section" id="stats">
      <div className="container">
        <div className="stats-grid">
          {analyticsData.map((stat) => (
            <StatItem key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}