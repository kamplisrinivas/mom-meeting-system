import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import logoImg from "../assets/img/company-logo.png"; 
import sidebarBg from "../assets/img/side.jpg"; 
import bgImage from "../assets/img/backgd.webp"; 

const Layout = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div 
          style={styles.logoSection}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <div style={{
            ...styles.logoWrapper,
            transform: isLogoHovered ? 'scale(1.05) rotate(-3deg)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}>
            <img 
              src={logoImg} 
              alt="Logo" 
              style={styles.logoImage} 
              onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
            />
          </div>
          <span style={{
            ...styles.logoText,
            color: isLogoHovered ? '#60a5fa' : '#ffffff',
            transform: isLogoHovered ? 'translateX(5px)' : 'translateX(0)',
            transition: 'all 0.3s ease'
          }}>
            MOM Dashboard
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            style={{
              ...styles.logoutBtn,
              background: isLogoutHovered ? 'rgba(251, 113, 133, 0.2)' : 'rgba(251, 113, 133, 0.1)',
              borderColor: isLogoutHovered ? '#f43f5e' : 'rgba(251, 113, 133, 0.2)',
              transform: isLogoutHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isLogoutHovered ? '0 4px 12px rgba(244, 63, 94, 0.2)' : 'none',
            }} 
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            onClick={handleLogout}
          >
            <span style={{ 
              display: 'inline-block',
              transition: 'transform 0.3s ease',
              transform: isLogoutHovered ? 'rotate(20deg) scale(1.2)' : 'rotate(0)' 
            }}>👋</span> 
            Logout
          </button>
        </div>
      </header>

      <div style={styles.mainContainer}>
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            <SidebarLink to="/dashboard" label="Dashboard" icon="📊" />
            <SidebarLink to="/meetings/create" label="Meeting Create / Update" icon="➕" />
            <SidebarLink to="/meetings" label="All Meetings" icon="📋" />
            <SidebarLink to="/employee-tasks" label="My Tasks" icon="🎯" />
            <SidebarLink to="/reports" label="Reports" icon="📈" />
          </nav>
        </aside>

        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, label, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === to;
  const highlight = isActive || isHovered;

  return (
    <Link 
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.sidebarLink,
        ...(isHovered && styles.sidebarLinkHover),
        ...(isActive && styles.sidebarLinkActive),
      }}
    >
      <span style={{
        ...styles.icon,
        /* Icons pop more against the lightened image */
        color: highlight ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
        transform: isHovered ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </span>
      
      <span style={{
        ...styles.linkLabel,
        color: highlight ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: highlight ? '700' : '500',
        transition: 'all 0.3s ease'
      }}>
        {label}
      </span>

      {isActive && <span style={styles.activeIndicator}>•</span>}
    </Link>
  );
};

const styles = {
  appContainer: {
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
  header: {
    background: 'rgba(15, 23, 42, 0.75)', 
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    padding: '0.6rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
  logoWrapper: { 
    height: '42px', width: '42px', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', background: '#ffffff', padding: '6px',
    borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  logoImage: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
  logoText: { fontSize: '1.25rem', fontWeight: 800, display: 'inline-block', letterSpacing: '0.5px' },
  logoutBtn: {
    color: '#fb7185',
    border: '1px solid rgba(251, 113, 133, 0.2)',
    padding: '8px 16px',
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '700',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  mainContainer: { 
    display: 'flex', 
    minHeight: 'calc(100vh - 65px)' 
  },
  /* ✅ LIGHTENED SIDEBAR */
  sidebar: {
    width: '280px',
    /* Reduced opacity from 0.95 to 0.65 to let the image show more */
    backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.65), rgba(15, 23, 42, 0.75)), url(${sidebarBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: 'white',
    padding: '1.5rem 0',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
    /* Added a subtle blur to make text pop against the lightened image */
    backdropFilter: 'blur(4px)',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' },
  sidebarLink: { 
    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', 
    textDecoration: 'none', borderRadius: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent'
  },
  sidebarLinkHover: { 
    background: 'rgba(255, 255, 255, 0.15)', 
    transform: 'translateX(4px)' 
  },
  sidebarLinkActive: { 
    background: 'rgba(59, 130, 246, 0.3)', 
    border: '1px solid rgba(59, 130, 246, 0.5)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
  },
  icon: { fontSize: '1.2rem', display: 'inline-block' },
  linkLabel: { fontSize: '0.95rem', letterSpacing: '0.3px' },
  mainContent: { 
    flex: 1, 
    padding: '2rem', 
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', 
    overflowY: 'auto',
    color: '#f1f5f9'
  },
  activeIndicator: { marginLeft: 'auto', color: '#60a5fa', fontWeight: 'bold', fontSize: '1.2rem' }
};

export default Layout;