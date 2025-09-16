import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GalaxyPlatformDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const applications = {
    core: [
      {
        name: "Proxima",
        description: "Core Banking System - Main financial processing engine",
        owner: "Jaroslaw Sobel",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "5010",
        repo: "galaxy-proxima",
        version: "0.3.0",
        lastBuild: "2025-09-07 10:45:14",
        buildStatus: "healthy",
        buildDuration: "2m 34s"
      },
      {
        name: "Horizon",
        description: "Front-/backoffice tool - Administrative interface",
        owner: "Jaroslaw Sobel",
        tech: "React",
        techIcon: "⚛️",
        category: "Frontend",
        port: "5137",
        repo: "horizon",
        version: "1.2.5",
        lastBuild: "2025-09-06 14:22:31",
        buildStatus: "healthy",
        buildDuration: "1m 12s"
      },
      {
        name: "Orion",
        description: "Customer Management System - CRM and customer data",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "5020",
        repo: "orion",
        version: "2.1.3",
        lastBuild: "2025-09-05 09:15:42",
        buildStatus: "warning",
        buildDuration: "3m 45s"
      },
      {
        name: "Titan",
        description: "Products Factory - Financial product configuration",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "5030",
        repo: "titan",
        version: "1.8.2",
        lastBuild: "2025-09-07 08:30:15",
        buildStatus: "healthy",
        buildDuration: "2m 18s"
      },
      {
        name: "Draco",
        description: "RBAC Backend System - Role-based access control",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "-",
        repo: "draco",
        version: "0.9.1",
        lastBuild: "2025-09-04 16:45:23",
        buildStatus: "healthy",
        buildDuration: "1m 58s"
      },
      {
        name: "Luna",
        description: "GenAI assistant backend - AI-powered customer support",
        owner: "Wojciech Ptasiński",
        tech: "Python",
        techIcon: "🐍",
        category: "Backend",
        port: "5040",
        repo: "luna",
        version: "3.2.1",
        lastBuild: "2025-09-07 11:22:08",
        buildStatus: "healthy",
        buildDuration: "4m 12s"
      },
      {
        name: "Stellar",
        description: "File Management Service - Document and media handling",
        owner: "Wojciech Ptasiński",
        tech: "Python",
        techIcon: "🐍",
        category: "Backend",
        port: "5050",
        repo: "stellar",
        version: "2.4.0",
        lastBuild: "2025-09-06 13:18:37",
        buildStatus: "healthy",
        buildDuration: "3m 25s"
      },
      {
        name: "Quasar",
        description: "Verification Service - Multi-factor authentication",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "-",
        repo: "quasar",
        version: "1.5.3",
        lastBuild: "2025-09-03 10:42:19",
        buildStatus: "error",
        buildDuration: "Failed"
      },
      {
        name: "Pulsar",
        description: "Webhook Module - Event notifications and integrations",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "-",
        repo: "pulsar",
        version: "0.7.2",
        lastBuild: "2025-09-07 07:15:44",
        buildStatus: "healthy",
        buildDuration: "1m 33s"
      },
      {
        name: "Polaris",
        description: "Configuration Management - Centralized settings",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "-",
        repo: "polaris",
        version: "2.0.1",
        lastBuild: "2025-09-06 15:30:22",
        buildStatus: "healthy",
        buildDuration: "2m 05s"
      },
      {
        name: "Nebula",
        description: "Customer Analytics - Interaction logging and insights",
        owner: "Miroslaw Forystek",
        tech: "Rust",
        techIcon: "🦞",
        category: "Backend",
        port: "-",
        repo: "nebula",
        version: "1.3.4",
        lastBuild: "2025-09-05 12:48:17",
        buildStatus: "warning",
        buildDuration: "2m 52s"
      }
    ],
    tools: [
      {
        name: "Voyager",
        description: "Testing scripts - Automated testing framework",
        owner: "Jaroslaw Sobel",
        tech: "Python",
        techIcon: "🐍",
        category: "Tools",
        port: "n/a",
        repo: "-",
        version: "1.0.2",
        lastBuild: "2025-09-04 09:30:15",
        buildStatus: "healthy",
        buildDuration: "45s"
      },
      {
        name: "Ceres",
        description: "Product Factory & Customers Mockup Server",
        owner: "Jaroslaw Sobel",
        tech: "Python",
        techIcon: "🐍",
        category: "Tools",
        port: "-",
        repo: "-",
        version: "0.8.1",
        lastBuild: "2025-09-05 11:20:33",
        buildStatus: "healthy",
        buildDuration: "1m 05s"
      },
      {
        name: "Viking",
        description: "Deployment testing app - Infrastructure validation",
        owner: "Jaroslaw Sobel",
        tech: "Rust",
        techIcon: "🦞",
        category: "Tools",
        port: "8088",
        repo: "viking",
        version: "0.5.1",
        lastBuild: "2025-09-07 06:45:33",
        buildStatus: "healthy",
        buildDuration: "1m 22s"
      },
      {
        name: "Schemas",
        description: "Schema Validation Project - Data structure definitions",
        owner: "Team",
        tech: "JSON",
        techIcon: "📋",
        category: "Tools",
        port: "-",
        repo: "schemas",
        version: "2.1.0",
        lastBuild: "2025-09-06 11:20:45",
        buildStatus: "healthy",
        buildDuration: "12s"
      },
      {
        name: "Automation",
        description: "Database seed data and automation scripts",
        owner: "Team",
        tech: "Shell",
        techIcon: "🔧",
        category: "Tools",
        port: "-",
        repo: "automation",
        version: "1.4.3",
        lastBuild: "2025-09-05 14:15:28",
        buildStatus: "healthy",
        buildDuration: "28s"
      }
    ],
    cloud: [
      {
        name: "Terrain",
        description: "Cloud terraform scripts - Infrastructure as code",
        owner: "Jaroslaw Sobel",
        tech: "Terraform",
        techIcon: "🏗️",
        category: "Tools",
        port: "n/a",
        repo: "spark",
        version: "2.3.1",
        lastBuild: "2025-09-06 16:45:12",
        buildStatus: "healthy",
        buildDuration: "3m 15s"
      }
    ]
  };

  const allApps = [...applications.core, ...applications.tools, ...applications.cloud];
  const stats = {
    total: allApps.length,
    active: allApps.filter(app => app.buildStatus === 'healthy').length,
    rust: allApps.filter(app => app.tech === 'Rust').length,
    python: allApps.filter(app => app.tech === 'Python').length,
    tools: applications.tools.length
  };

  const filterApps = (apps: any[]) => {
    return apps.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tech.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.owner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = currentFilter === 'all' ||
        (currentFilter === 'backend' && app.category === 'Backend') ||
        (currentFilter === 'frontend' && app.category === 'Frontend') ||
        (currentFilter === 'tools' && app.category === 'Tools') ||
        (currentFilter === 'rust' && app.tech === 'Rust') ||
        (currentFilter === 'python' && app.tech === 'Python');

      return matchesSearch && matchesFilter;
    });
  };

  const createAppCard = (app: any) => {
    const initials = app.owner.split(' ').map((n: string) => n[0]).join('');
    
    let statusText = '';
    let statusIcon = '';
    switch(app.buildStatus) {
      case 'healthy': 
        statusText = 'Healthy'; 
        statusIcon = '✅';
        break;
      case 'warning': 
        statusText = 'Warning'; 
        statusIcon = '⚠️';
        break;
      case 'error': 
        statusText = 'Error'; 
        statusIcon = '❌';
        break;
      default: 
        statusText = 'Unknown'; 
        statusIcon = '❓';
        break;
    }

    return (
      <div className="app-card" key={app.name}>
        <div className={`status-indicator status-${app.buildStatus}`}></div>
        
        <div className="app-header">
          <div className="app-name">{app.name}</div>
          <div className="app-description">{app.description}</div>
        </div>

        <div className="tech-stack">
          <span className="tech-badge">
            <span>{app.techIcon}</span>
            <span>{app.tech}</span>
          </span>
          {app.port !== '-' && app.port !== 'n/a' && (
            <span className="port-info">:{app.port}</span>
          )}
        </div>

        <div className="app-info-grid">
          <div className="info-item">
            <span className="info-label">VERSION</span>
            <span className="version-badge">v{app.version}</span>
          </div>
          <div className="info-item">
            <span className="info-label">STATUS</span>
            <span className="status-value">
              <span>{statusIcon} {statusText}</span>
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">LAST BUILD</span>
            <span className="build-time">{app.lastBuild}</span>
          </div>
          <div className="info-item">
            <span className="info-label">DURATION</span>
            <span className="info-value">{app.buildDuration}</span>
          </div>
        </div>

        <div className="owner-info">
          <div className="owner-avatar">{initials}</div>
          <span className="owner-name">{app.owner}</span>
        </div>

        <div className="app-actions">
          <button className="action-btn btn-success">
            📥 Download
          </button>
          <button 
            className="action-btn btn-primary"
            onClick={() => navigate(`/service-bom/${app.name.toLowerCase()}`)}
          >
            📋 BOM
          </button>
          <button className="action-btn">
            🔗 Repo
          </button>
        </div>
      </div>
    );
  };

  return (
    <Box>
      <style>{`
        .galaxy-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          color: #1a202c;
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .header {
          background: white;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .platform-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .platform-subtitle {
          color: #6b7280;
          font-size: 1.125rem;
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .stat-number {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .controls {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
        }

        .search-box:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-group {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: #f9fafb;
        }

        .filter-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 20px;
        }

        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .app-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          position: relative;
          transition: all 0.2s;
        }

        .app-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .status-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-healthy { background: #10b981; }
        .status-warning { background: #f59e0b; }
        .status-error { background: #ef4444; }

        .app-header {
          margin-bottom: 16px;
        }

        .app-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .app-description {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .tech-stack {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tech-badge {
          background: #f3f4f6;
          color: #374151;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .port-info {
          background: #f0fdf4;
          color: #166534;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: monospace;
        }

        .app-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 0.625rem;
          color: #9ca3af;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .info-value {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .version-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        .status-value {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .build-time {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .owner-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
          margin-bottom: 16px;
        }

        .owner-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .owner-name {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .app-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-success {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .apps-grid {
            grid-template-columns: 1fr;
          }
          
          .controls {
            flex-direction: column;
          }
          
          .search-box {
            min-width: 100%;
          }
        }
      `}</style>

      <div className="galaxy-dashboard">
        <div className="dashboard-container">
          <div className="header">
            <h1 className="platform-title">
              🌌 Galaxy Platform
            </h1>
            <p className="platform-subtitle">Core Banking & Financial Services Infrastructure</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Apps</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.rust}</div>
                <div className="stat-label">Rust</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.python}</div>
                <div className="stat-label">Python</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.tools}</div>
                <div className="stat-label">Tools</div>
              </div>
            </div>

            <div className="controls">
              <input 
                type="text" 
                className="search-box" 
                placeholder="🔍 Search applications..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="filter-group">
                <button 
                  className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'backend' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('backend')}
                >
                  Backend
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'frontend' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('frontend')}
                >
                  Frontend
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'tools' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('tools')}
                >
                  Tools
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'rust' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('rust')}
                >
                  Rust
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'python' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('python')}
                >
                  Python
                </button>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">⚡ Core Applications</h2>
            <div className="apps-grid">
              {filterApps(applications.core).map(app => createAppCard(app))}
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">🛠️ Supporting Tools</h2>
            <div className="apps-grid">
              {filterApps(applications.tools).map(app => createAppCard(app))}
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">☁️ Cloud Infrastructure</h2>
            <div className="apps-grid">
              {filterApps(applications.cloud).map(app => createAppCard(app))}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default GalaxyPlatformDashboard;