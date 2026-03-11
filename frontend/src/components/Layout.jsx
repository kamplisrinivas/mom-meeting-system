import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import logoImg from "../assets/img/company-logo.png"; 
import sidebarBg from "../assets/img/create.jpg"; 

const Layout = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div style={styles.appContainer}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logoWrapper}>
            <img 
              src={logoImg} 
              alt="Logo" 
              style={styles.logoImage} 
              onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
            />
          </div>
          <span style={styles.logoText}>MOM Dashboard</span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span>👋</span> Logout
        </button>
      </header>

      <div style={styles.mainContainer}>
        {/* SIDEBAR WITH IMAGE BACKGROUND */}
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            <SidebarLink to="/dashboard" label="Dashboard" icon="📊" />
            <SidebarLink to="/meetings/create" label="Create Meeting" icon="➕" />
            <SidebarLink to="/meetings" label="All Meetings" icon="📋" />
            <SidebarLink to="/employee-tasks" label="My Tasks" icon="🎯" />
            <SidebarLink to="/reports" label="Reports" icon="📈" />
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// SidebarLink Component handling Hover and Transparent Active states
const SidebarLink = ({ to, label, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === to;

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
      <span style={styles.icon}>{icon}</span>
      <span style={styles.linkLabel}>{label}</span>
      {isActive && <span style={styles.activeIndicator}>•</span>}
    </Link>
  );
};

// ==================== STYLES ====================
const styles = {
  appContainer: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
  header: {
    background: 'white',
    padding: '0.8rem 2.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #e2e8f0',
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoWrapper: { height: '40px', display: 'flex', alignItems: 'center' },
  logoImage: { height: '100%', maxWidth: '150px', objectFit: 'contain' },
  logoText: { 
    fontSize: '1.3rem', 
    fontWeight: 800, 
    color: '#1e293b',
    letterSpacing: '-0.5px'
  },
  logoutBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    transition: 'transform 0.2s ease',
  },
  mainContainer: { 
    display: 'flex', 
    minHeight: 'calc(100vh - 65px)' 
  },
  
  // SIDEBAR WITH GLASS OVERLAY
  sidebar: {
    width: '280px',
    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${sidebarBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Keeps image steady on scroll
    color: 'white',
    padding: '1.5rem 0',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  },
  nav: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px', 
    padding: '0 12px' 
  },

  // LINK DEFAULT STATE
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    color: 'rgba(255, 255, 255, 0.6)', // Faded when not selected
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent',
  },

  // HOVER EFFECT
  sidebarLinkHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    transform: 'translateX(5px)',
  },

  // ✅ TRANSPARENT ACTIVE STATE (No Blue)
  sidebarLinkActive: {
    background: 'rgba(255, 255, 255, 0.12)', // Subtle highlight
    color: '#ffffff',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.3)', // Frosted glass border
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },

  icon: { fontSize: '1.2rem' },
  activeIndicator: { marginLeft: 'auto', fontSize: '1.5rem', lineHeight: 0 },
  mainContent: { flex: 1, padding: '2.5rem', background: '#f8fafc', overflow: 'auto' },
};

export default Layout;