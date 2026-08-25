import { useState } from 'react';
import { howItWorksData } from '../../../data/dummyData';
import './HowItWorks.css';

export default function HowItWorks() {
  const { label, title, subtitle, tabs, panels } = howItWorksData;
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const currentPanel = panels[activeTab];

  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{label}</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="hiw-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`hiw-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hiw-panel active" key={activeTab}>
          <h3 className="hiw-section-title">
            {currentPanel.sectionTitle}{' '}
            <span>{currentPanel.sectionHighlight}</span>
          </h3>

          <div className="hiw-steps">
            {currentPanel.steps.map((step, index) => (
              <div key={step.id} className="hiw-step">
                <div className={`hiw-step-number ${step.numberClass}`}>
                  {step.id}
                </div>
                {index < currentPanel.steps.length - 1 && (
                  <div className="hiw-step-connector"></div>
                )}
                <div className="hiw-step-icon">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}