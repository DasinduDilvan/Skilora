// src/components/HomeComponents/FeaturedProjects/FeaturedProjects.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/axios'; // <-- LIVE API
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
        <span className={`project-category-tag ${project.categoryClass || 'cat-design'}`}>
          {project.category || 'Project'}
        </span>
        <span className="project-budget-tag">{project.budget}</span>
      </div>

      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p>{project.description.length > 90 ? project.description.substring(0, 90) + '...' : project.description}</p>
        <div className="project-meta">
          <span className="project-meta-item">📅 {project.deadline}</span>
          <span className="project-meta-item">👥 {project.proposals || 0} Proposals</span>
        </div>
      </div>

      <div className="project-card-footer">
        <div className="project-client">
          <div className="client-avatar">{project.client?.initials || 'C'}</div>
          <span className="client-name">{project.client?.name || 'Client'}</span>
        </div>
        <Link to={`/projects/${project.id}`} className="btn btn-primary btn-sm">
          View Project
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const { label, title, subtitle, projects: dummyProjects } = featuredProjectsData;
  const [projects, setProjects] = useState(dummyProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/projects?status=open');
        if (res.data.data && res.data.data.length > 0) {
          // Map backend project schema to your UI schema
          const liveProjects = res.data.data.slice(0, 6).map(p => ({
            id: p.projectId,
            title: p.title,
            description: p.description,
            budget: `$${p.budget}`,
            deadline: new Date(p.deadline).toLocaleDateString(),
            category: 'Category', // If categoryId is populated, you'd map it here
            categoryClass: 'cat-development',
            proposals: p.tasks?.length || 0,
            client: { initials: 'CL', name: 'Skillora Client' }
          }));
          setProjects(liveProjects);
        }
      } catch (error) {
        console.error("Failed to load live projects", error);
      }
    };
    fetchProjects();
  }, []);

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