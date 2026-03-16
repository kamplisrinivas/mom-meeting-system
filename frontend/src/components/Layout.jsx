import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import logoImg from "../assets/img/company-logo.png"; 
import sidebarBg from "../assets/img/sidebar.jpg"; 
import bgImage from "../assets/img/bgd.jpg"; 

const Layout = ({ onLogout }) => {
  const navigate = useNavigate();
  
  // State for Header Hovering
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        {/* LOGO SECTION WITH HOVER */}
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
            color: isLogoHovered ? '#2563eb' : '#1e3a8a',
            transform: isLogoHovered ? 'translateX(5px)' : 'translateX(0)',
            transition: 'all 0.3s ease'
          }}>
            MOM Dashboard
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* LOGOUT BUTTON WITH HOVER */}
          <button 
            style={{
              ...styles.logoutBtn,
              background: isLogoutHovered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: isLogoutHovered ? '#be123c' : 'rgba(239, 68, 68, 0.2)',
              transform: isLogoutHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isLogoutHovered ? '0 4px 12px rgba(190, 18, 60, 0.2)' : 'none',
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
            <SidebarLink to="/meetings/create" label="Create Meeting" icon="➕" />
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
        color: highlight ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
        transform: isHovered ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </span>
      
      <span style={{
        ...styles.linkLabel,
        color: highlight ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
        fontWeight: highlight ? '600' : '400',
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
    background: 'rgba(240, 249, 255, 0.6)', 
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    padding: '0.6rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
  },
  logoSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    cursor: 'pointer' 
  },
  logoWrapper: { 
    height: '42px', width: '42px', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', background: '#ffffff', padding: '6px',
    borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  logoImage: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
  logoText: { 
    fontSize: '1.25rem', 
    fontWeight: 800, 
    display: 'inline-block' 
  },
  logoutBtn: {
    color: '#be123c', 
    border: '1px solid',
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
  sidebar: {
    width: '280px',
    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${sidebarBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    color: 'white',
    padding: '1.5rem 0',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' },
  sidebarLink: { 
    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', 
    textDecoration: 'none', borderRadius: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent'
  },
  sidebarLinkHover: { 
    background: 'rgba(255, 255, 255, 0.05)',
    transform: 'translateX(6px)', 
  },
  sidebarLinkActive: { 
    background: 'rgba(59, 130, 246, 0.15)', 
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  },
  icon: { fontSize: '1.2rem', display: 'inline-block' },
  linkLabel: { fontSize: '0.95rem', letterSpacing: '0.3px' },
  mainContent: { 
    flex: 1, 
    padding: '2rem', 
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', 
    overflowY: 'auto',
    color: '#ffffff'
  },
  activeIndicator: { 
    marginLeft: 'auto', 
    color: '#3b82f6', 
    fontWeight: 'bold', 
    fontSize: '1.2rem' 
  }
};

export default Layout;