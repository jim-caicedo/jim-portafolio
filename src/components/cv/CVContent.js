import React from 'react';
import './CVContent.css';

/**
 * Componente de contenido del CV.
 * Responsable solo de renderizar los datos - sin lógica de 3D ni escena.
 * Los datos vienen del JSON para mantener separación de responsabilidades.
 */
function CVContent({ data }) {
  if (!data) return null;

  const { personal, experience, education, skills, projects } = data;

  return (
    <div className="cv-content">
      {/* Header */}
      <header className="cv-header">
        <h1 className="cv-name">{personal.name}</h1>
        <p className="cv-title">{personal.title}</p>
        <div className="cv-contact">
          <span>{personal.email}</span>
          <span>•</span>
          <span>{personal.phone}</span>
          <span>•</span>
          <span>{personal.location}</span>
        </div>
        {personal.summary && (
          <p className="cv-summary">{personal.summary}</p>
        )}
      </header>

      {/* Experiencia */}
      <section className="cv-section">
        <h2 className="cv-section-title">Experiencia</h2>
        {experience?.map((job, index) => (
          <div key={index} className="cv-experience-item">
            <div className="cv-experience-header">
              <h3 className="cv-job-role">{job.role}</h3>
              <span className="cv-job-period">{job.period}</span>
            </div>
            <p className="cv-company">{job.company}</p>
            {job.description && (
              <p className="cv-job-description">{job.description}</p>
            )}
            {job.highlights?.length > 0 && (
              <ul className="cv-highlights">
                {job.highlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Educación */}
      {education?.length > 0 && (
        <section className="cv-section">
          <h2 className="cv-section-title">Educación</h2>
          {education.map((edu, index) => (
            <div key={index} className="cv-education-item">
              <h3 className="cv-degree">{edu.degree}</h3>
              <p className="cv-institution">{edu.institution}</p>
              <span className="cv-edu-period">{edu.period}</span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="cv-section cv-section-skills">
          <h2 className="cv-section-title">Habilidades</h2>
          <div className="cv-skills-grid">
            {skills.technical?.length > 0 && (
              <div className="cv-skill-group">
                <h4>Técnicas</h4>
                <div className="cv-skill-tags">
                  {skills.technical.map((skill, i) => (
                    <span key={i} className="cv-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div className="cv-skill-group">
                <h4>Soft skills</h4>
                <div className="cv-skill-tags">
                  {skills.soft.map((skill, i) => (
                    <span key={i} className="cv-skill-tag cv-skill-soft">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Proyectos */}
      {projects?.length > 0 && (
        <section className="cv-section">
          <h2 className="cv-section-title">Proyectos</h2>
          {projects.map((project, index) => (
            <div key={index} className="cv-project-item">
              <h3 className="cv-project-name">{project.name}</h3>
              {project.description && (
                <p className="cv-project-description">{project.description}</p>
              )}
              {project.tech?.length > 0 && (
                <div className="cv-project-tech">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="cv-tech-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default CVContent;
