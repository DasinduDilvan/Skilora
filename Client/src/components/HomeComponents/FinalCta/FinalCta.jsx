import { Link } from 'react-router-dom';
import { finalCtaData } from '../../../data/dummyData';
import './FinalCta.css';

export default function FinalCta() {
  const { title, description, primaryCta, secondaryCta } = finalCtaData;

  return (
    <section className="final-cta">
      <div className="container">
        <div className="cta-card">
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="cta-buttons">
            <Link to={primaryCta.path} className="btn btn-cta-primary">
              {primaryCta.label}
            </Link>
            <Link to={secondaryCta.path} className="btn btn-cta-secondary">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}