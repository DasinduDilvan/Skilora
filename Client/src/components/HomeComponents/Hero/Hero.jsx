import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { heroData } from '../../../data/dummyData';
import './Hero.css';

export default function Hero() {
  const barRef = useRef(null);
  const {
    badgeCount,
    badgeText,
    titleLine1,
    titleHighlight,
    titleLine2,
    description,
    primaryCta,
    secondaryCta,
    stats,
    profileCard,
    floatingCards,
  } = heroData;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${profileCard.jobSuccess}%`;
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [profileCard.jobSuccess]);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <strong>{badgeCount}</strong> {badgeText}
          </div>

          <h1>
            {titleLine1}{' '}
            <span className="text-gradient">{titleHighlight}</span>{' '}
            {titleLine2}
          </h1>

          <p className="hero-description">{description}</p>

          <div className="hero-ctas">
            <Link to={primaryCta.path} className="btn btn-primary">
              {primaryCta.label}
            </Link>
            <Link to={secondaryCta.path} className="btn btn-secondary">
              {secondaryCta.label}
            </Link>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.id} className="hero-stat">
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-wrapper">
            {/* Top-right floating card */}
            <div className="hero-float-card top-right">
              <div className="float-icon">{floatingCards.topRight.icon}</div>
              <div className="float-text">
                <strong>{floatingCards.topRight.title}</strong>
                <span>{floatingCards.topRight.subtitle}</span>
              </div>
            </div>

            {/* Main profile card */}
            <div className="hero-card-main">
              <div className="hero-card-header">
                <div className="hero-card-avatar">
                  {profileCard.initials}
                </div>
                <div className="hero-card-info">
                  <h4>{profileCard.name}</h4>
                  <span>{profileCard.role}</span>
                </div>
              </div>

              <div className="hero-card-skills">
                {profileCard.skills.map((skill, i) => (
                  <span
                    key={i}
                    className={`hero-card-skill${
                      skill.highlight ? ' highlight' : ''
                    }`}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>

              <div className="hero-card-bar">
                <div
                  ref={barRef}
                  className="hero-card-bar-fill"
                  style={{ width: 0 }}
                ></div>
              </div>
              <div className="hero-card-bar-label">
                <span>Job Success</span>
                <span>{profileCard.jobSuccess}%</span>
              </div>
            </div>

            {/* Bottom-left floating card */}
            <div className="hero-float-card bottom-left">
              <div className="float-icon">
                {floatingCards.bottomLeft.icon}
              </div>
              <div className="float-text">
                <strong>{floatingCards.bottomLeft.title}</strong>
                <span>{floatingCards.bottomLeft.subtitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}