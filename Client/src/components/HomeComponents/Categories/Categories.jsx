import { categoriesData } from '../../../data/dummyData';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import './Categories.css';

function CategoryCard({ item, delay }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`category-card reveal${isVisible ? ' visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`category-icon ${item.iconClass}`}>{item.icon}</div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="category-count">{item.count}</div>
    </div>
  );
}

export default function Categories() {
  const { label, title, subtitle, items } = categoriesData;

  return (
    <section className="section" id="categories">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{label}</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="categories-grid">
          {items.map((item, index) => (
            <CategoryCard key={item.id} item={item} delay={index * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}