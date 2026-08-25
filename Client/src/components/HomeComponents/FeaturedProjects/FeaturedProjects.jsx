import { Link } from 'react-router-dom';
import { featuredProjectsData } from '../../../data/dummyData';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import './FeaturedProjects.css';

function ProjectCard({ project, delay }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`project-card reveal${isVisible ? ' visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="project-card-header">
        <span className={`project-category-tag ${project.categoryClass}`}>
          {project.category}
        </span>
        <span className="project-budget-tag">{project.budget}</span>
      </div>

      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-meta">
          <span className="project-meta-item">📅 {project.deadline}</span>
          <span className="project-meta-item">👥 {project.proposals}</span>
        </div>
      </div>

      <div className="project-card-footer">
        <div className="project-client">
          <div className="client-avatar">{project.client.initials}</div>
          <span className="client-name">{project.client.name}</span>
        </div>
        <Link to="/projects" className="btn btn-primary btn-sm">
          View Project
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const { label, title, subtitle, projects } = featuredProjectsData;

  return (
    <section className="section projects-section" id="projects">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{label}</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              delay={index * 90}
            />
          ))}
        </div>

        <div className="section-cta">
          <Link to="/projects" className="btn btn-secondary">
            View All Projects →
          </Link>
        </div>
      </div>
    </section>
  );
}