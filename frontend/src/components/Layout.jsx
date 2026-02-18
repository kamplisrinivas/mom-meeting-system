import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';  // 👈 ADD Link import

const Layout = ({ onLogout }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div style={styles.appContainer}>
      {/* TOP HEADER */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>🚀</div>  {/* 👈 Logo placeholder */}
          <span style={styles.logoText}>MOM Dashboard</span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span>👋</span> Logout
        </button>
      </header>

      <div style={styles.mainContainer}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            <SidebarLink to="/dashboard" label=" Dashboard" icon="📊" />
            <SidebarLink to="/meetings/create" label=" Create Meeting" icon="➕" />
            <SidebarLink to="/meetings" label=" All Meetings" icon="📋" />
            <SidebarLink to="/employee-tasks" label=" My Tasks" icon="🎯" />  {/* 👈 FIXED PATH */}
            <SidebarLink to="/reports" label=" Reports" icon="📈" disabled />
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ✅ FIXED SidebarLink - Uses proper Link component
const SidebarLink = ({ to, label, icon, disabled = false }) => {
  return (
    <Link 
      to={disabled ? '#' : to}
      style={{
        ...styles.sidebarLink,
        ...(disabled && styles.sidebarLinkDisabled),
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default Layout;

// ==================== COMPLETE STYLES ====================
const styles = {
  // App Layout
  appContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
  },

  // Header
  header: {
    background: 'white',
    padding: '1.5rem 2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #e2e8f0',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  logoText: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1a1a1a',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.75rem',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },

  // Main Layout
  mainContainer: {
    display: 'flex',
    minHeight: 'calc(100vh - 80px)',
  },
  sidebar: {
    width: '280px',
    background: 'white',
    boxShadow: '4px 0 20px rgba(0,0,0,0.06)',
    borderRight: '1px solid #e2e8f0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '2rem 0',
  },
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem 1.75rem',
    color: '#475569',
    textDecoration: 'none',
    borderRadius: '0 20px 20px 0',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderLeft: '4px solid transparent',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  sidebarLinkDisabled: {
    opacity: 0.5,
    background: 'transparent !important',
  },
  'sidebarLink:hover': {
    background: 'linear-gradient(135deg, #667eea15, #764ba215)',
    color: '#667eea',
    borderLeftColor: '#667eea',
    transform: 'translateX(4px)',
  },

  // Main Content
  mainContent: {
    flex: 1,
    padding: '2.5rem',
    overflow: 'auto',
  },



  // Responsive
  '@media (max-width: 1024px)': {
    sidebar: {
      transform: 'translateX(-100%)',
    },
  },
};

// Add global CSS for smooth animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
if (!document.querySelector('style[data-layout]')) {
  styleSheet.setAttribute('data-layout', 'true');
  document.head.appendChild(styleSheet);
}

export { styles }; // Export for other components if needed
