import { Link } from 'react-router-dom';
import { footerData } from '../../../data/dummyData';
import './Footer.css';

export default function Footer() {
  const { brand, columns, bottomLinks, copyright } = footerData;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="Skillora Logo" className="logo-img" />
              {brand.name}
            </Link>
            <p>{brand.description}</p>
          </div>

          {columns.map((col) => (
            <div key={col.id}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map((link, i) => (
                  <li key={i}>
                    {link.path.startsWith('mailto:') ||
                    link.path.startsWith('#') ? (
                      <a href={link.path}>{link.label}</a>
                    ) : (
                      <Link to={link.path}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>{copyright}</p>
          <div className="footer-bottom-links">
            {bottomLinks.map((link, i) => (
              <a key={i} href={link.path}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}