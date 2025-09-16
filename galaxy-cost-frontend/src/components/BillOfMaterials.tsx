import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Dependency {
  name: string;
  version: string;
  source: string;
  dependencies: string[];
}

const BillOfMaterials: React.FC = () => {
  const { service } = useParams<{ service?: string }>();
  const [currentView, setCurrentView] = useState<'list' | 'tree'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [expandedTreeItems, setExpandedTreeItems] = useState<Set<number>>(new Set());

  // Generate sample dependencies
  const generateSampleDependencies = (count: number): Dependency[] => {
    const commonNames = ['actix', 'tokio', 'serde', 'clap', 'reqwest', 'anyhow', 'thiserror', 'uuid', 'chrono', 'regex', 'log', 'env_logger', 'futures', 'async-trait', 'tower', 'hyper', 'warp', 'axum', 'sqlx', 'diesel', 'redis', 'mongodb', 'postgresql', 'mysql', 'sqlite', 'rocksdb', 'leveldb', 'memcache', 'rabbitmq', 'kafka', 'nats', 'etcd', 'consul', 'vault', 'prometheus', 'grafana', 'jaeger', 'opentelemetry', 'tracing', 'metrics', 'benchmarks', 'criterion', 'proptest', 'quickcheck', 'mockall', 'wiremock', 'testcontainers', 'tempfile', 'once_cell', 'lazy_static', 'parking_lot', 'crossbeam', 'rayon', 'dashmap', 'arc-swap', 'flume', 'kanal', 'smol', 'async-std', 'surf', 'isahc', 'ureq', 'minreq', 'attohttpc', 'rustls', 'native-tls', 'openssl', 'ring', 'webpki', 'rustls-webpki', 'x509-parser', 'pem', 'der', 'asn1', 'base64', 'hex', 'sha2', 'sha3', 'md5', 'blake2', 'blake3', 'argon2', 'bcrypt', 'scrypt', 'pbkdf2', 'hmac', 'rand', 'rand_core', 'getrandom', 'fastrand', 'nanorand', 'oorandom', 'smallrng', 'chacha20poly1305', 'aes-gcm', 'aes', 'chacha20', 'salsa20', 'poly1305', 'ed25519', 'rsa', 'p256', 'p384', 'secp256k1', 'curve25519', 'x25519', 'ecdsa', 'dsa', 'ssh-key', 'ssh-cipher', 'ssh-encoding', 'libssh2-sys', 'git2', 'gix'];
    const suffixes = ['-sys', '-core', '-codec', '-utils', '-derive', '-macros', '-proc-macro', '-test', '-dev', '-cli', '-server', '-client', '-api', '-web', '-http', '-tcp', '-udp', '-ws', '-grpc', '-json', '-xml', '-yaml', '-toml', '-csv', '-parser', '-lexer', '-formatter', '-validator', '-builder', '-factory', '-pool', '-cache', '-store', '-db', '-orm', '-migration', '-schema', '-query', '-transaction', '-connection', '-driver', '-connector', '-adapter', '-plugin', '-extension', '-middleware', '-handler', '-router', '-controller', '-service', '-worker', '-job', '-task', '-queue', '-stream', '-channel', '-buffer', '-ring', '-circular', '-linked', '-tree', '-graph', '-heap', '-stack', '-map', '-set', '-vec', '-slice', '-array', '-string', '-str', '-char', '-num', '-int', '-float', '-bool', '-option', '-result', '-error', '-panic', '-catch', '-try', '-match', '-pattern', '-regex', '-glob', '-path', '-file', '-dir', '-fs', '-io', '-net', '-socket', '-addr', '-port', '-host', '-domain', '-url', '-uri', '-mime', '-header', '-body', '-request', '-response', '-status', '-method', '-protocol', '-version', '-auth', '-oauth', '-jwt', '-token', '-session', '-cookie', '-csrf', '-cors', '-security', '-crypto', '-hash', '-digest', '-sign', '-verify', '-encrypt', '-decrypt', '-compress', '-decompress', '-zip', '-gzip', '-bzip2', '-lz4', '-zstd', '-snappy', '-brotli', '-deflate', '-inflate', '-archive', '-tar', '-rar', '-7z', '-image', '-png', '-jpg', '-gif', '-svg', '-pdf', '-html', '-css', '-js', '-ts', '-wasm', '-asm', '-llvm', '-jit', '-compile', '-interpret', '-vm', '-runtime', '-gc', '-memory', '-alloc', '-malloc', '-free', '-leak', '-profile', '-bench', '-perf', '-optimize', '-debug', '-trace', '-log', '-audit', '-monitor', '-alert', '-notify', '-email', '-sms', '-push', '-webhook', '-event', '-message', '-signal', '-broadcast', '-multicast', '-unicast', '-p2p', '-mesh', '-cluster', '-node', '-peer', '-discovery', '-registry', '-catalog', '-index', '-search', '-query', '-filter', '-sort', '-group', '-aggregate', '-reduce', '-map', '-fold', '-scan', '-iterate', '-loop', '-while', '-for', '-if', '-else', '-switch', '-case', '-default', '-break', '-continue', '-return', '-yield', '-await', '-async', '-sync', '-lock', '-mutex', '-rwlock', '-semaphore', '-barrier', '-latch', '-gate', '-flag', '-atomic', '-volatile', '-fence', '-ordering', '-acquire', '-release', '-relaxed', '-consume', '-acq_rel', '-seq_cst'];
    
    const dependencies: Dependency[] = [];
    const usedNames = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      let name: string;
      do {
        const baseName = commonNames[Math.floor(Math.random() * commonNames.length)];
        const suffix = Math.random() > 0.7 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
        name = baseName + suffix;
      } while (usedNames.has(name));
      
      usedNames.add(name);
      
      const major = Math.floor(Math.random() * 10);
      const minor = Math.floor(Math.random() * 20);
      const patch = Math.floor(Math.random() * 50);
      const version = `${major}.${minor}.${patch}`;
      
      const depCount = Math.floor(Math.random() * 15) + 1;
      const subDependencies: string[] = [];
      for (let j = 0; j < depCount; j++) {
        const subName = commonNames[Math.floor(Math.random() * commonNames.length)];
        if (!subDependencies.includes(subName)) {
          subDependencies.push(subName);
        }
      }
      
      dependencies.push({
        name: name,
        version: version,
        source: "registry+https://github.com/rust-lang/crates.io-index",
        dependencies: subDependencies
      });
    }
    
    return dependencies.sort((a, b) => a.name.localeCompare(b.name));
  };

  const [allDependencies] = useState<Dependency[]>(() => generateSampleDependencies(126));
  const [filteredDependencies, setFilteredDependencies] = useState<Dependency[]>(allDependencies);

  useEffect(() => {
    let filtered = allDependencies.filter(dep => 
      dep.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'version') {
      filtered.sort((a, b) => a.version.localeCompare(b.version));
    } else if (sortBy === 'deps-count') {
      filtered.sort((a, b) => b.dependencies.length - a.dependencies.length);
    }

    setFilteredDependencies(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortBy, allDependencies]);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const toggleTreeNode = (index: number) => {
    const newExpanded = new Set(expandedTreeItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTreeItems(newExpanded);
  };

  const toggleView = () => {
    setCurrentView(currentView === 'list' ? 'tree' : 'list');
  };

  // Get service name (capitalize first letter if provided, otherwise default to Proxima)
  const serviceName = service ? service.charAt(0).toUpperCase() + service.slice(1) : 'Proxima';

  const downloadBOM = () => {
    const bomData = {
      application: {
        name: serviceName.toLowerCase(),
        repository: `git@github.com:Galaxy-Core-Platform/${serviceName.toLowerCase()}.git`,
        path: `/Users/jaro/new_core/${serviceName.toLowerCase()}`
      },
      version_info: {
        git_hash: "3c221f61cafed70110daaa1be83bee579fefc457",
        git_branch: "develop",
        git_tag: "",
        cargo_version: "0.3.0"
      },
      build_info: {
        timestamp: "20250907_104514",
        rust_version: "rustc 1.86.0 (05f9846f8 2025-03-31)",
        cargo_version: "cargo 1.86.0 (adf9b6ad1 2025-02-28)"
      },
      dependencies: {
        dependencies: filteredDependencies,
        total_count: filteredDependencies.length
      },
      generated_at: "2025-09-07T08:45:19CET"
    };
    
    const dataStr = JSON.stringify(bomData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${serviceName.toLowerCase()}-bom.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderPagination = () => {
    if (itemsPerPage === 'all') return null;
    
    const totalPages = Math.ceil(filteredDependencies.length / itemsPerPage);
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pages.push('...');
      }
    }
    
    return (
      <div className="pagination">
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={idx} className="pagination-info">...</span>
          ) : (
            <button
              key={idx}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(Number(page))}
            >
              {page}
            </button>
          )
        ))}
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  const renderListView = () => {
    const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === 'all' ? filteredDependencies.length : Math.min(startIndex + itemsPerPage, filteredDependencies.length);
    const pageItems = filteredDependencies.slice(startIndex, endIndex);
    
    return (
      <div className="dependencies-list list-view" style={{ display: currentView === 'list' ? 'block' : 'none' }}>
        {pageItems.map((dep, index) => {
          const actualIndex = startIndex + index;
          return (
            <div key={actualIndex} className="dependency-item">
              <div className="dep-info">
                <div className="dep-name">{dep.name}</div>
                <div className="dep-version">{dep.version}</div>
                <div className="dep-sub-count">{dep.dependencies.length} deps</div>
              </div>
              <button className="expand-btn" onClick={() => toggleExpanded(actualIndex)}>
                {expandedItems.has(actualIndex) ? '▲' : '▼'}
              </button>
              <div className={`sub-deps-expanded ${expandedItems.has(actualIndex) ? 'show' : ''}`}>
                <div className="sub-deps">
                  {dep.dependencies.map((subDep, subIdx) => (
                    <span key={subIdx} className="sub-dep">{subDep}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTreeView = () => {
    return (
      <div className={`dependencies-tree tree-view ${currentView === 'tree' ? 'active' : ''}`}>
        {filteredDependencies.map((dep, index) => (
          <div key={index} className="tree-item">
            <div className="tree-node" onClick={() => toggleTreeNode(index)}>
              <span className="tree-toggle">
                {expandedTreeItems.has(index) ? '▼' : '▶'}
              </span>
              <span className="tree-name">{dep.name}</span>
              <span className="tree-version">{dep.version}</span>
            </div>
            <div className={`tree-children ${expandedTreeItems.has(index) ? 'show' : ''}`}>
              {dep.dependencies.map((subDep, subIdx) => (
                <div key={subIdx} className="tree-node" style={{ marginLeft: 0 }}>
                  <span className="tree-toggle"></span>
                  <span className="tree-name">{subDep}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .app-title {
          font-size: 2.5em;
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 10px;
        }

        .app-subtitle {
          color: #718096;
          font-size: 1.1em;
          margin-bottom: 20px;
        }

        .header-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .download-btn, .view-toggle {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .view-toggle {
          background: linear-gradient(135deg, #667eea, #5a67d8);
        }

        .view-toggle.active {
          background: linear-gradient(135deg, #f56565, #e53e3e);
        }

        .download-btn:hover, .view-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .card-title {
          font-size: 1.3em;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon {
          width: 20px;
          height: 20px;
          fill: #667eea;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 500;
          color: #4a5568;
        }

        .info-value {
          color: #718096;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9em;
        }

        .dependencies-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .dependencies-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .deps-title {
          font-size: 1.5em;
          font-weight: 600;
          color: #2d3748;
        }

        .deps-count {
          background: #667eea;
          color: white;
          padding: 6px 15px;
          border-radius: 20px;
          font-weight: 600;
        }

        .controls {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          padding: 12px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 25px;
          font-size: 1em;
          background: white;
        }

        .search-box:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .sort-select, .items-per-page {
          padding: 8px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 0.9em;
        }

        /* List View Styles */
        .list-view .dependency-item {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 10px;
          padding: 15px 20px;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-view .dependency-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .list-view .dep-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .list-view .dep-name {
          font-size: 1.1em;
          font-weight: 600;
          color: #2d3748;
          min-width: 200px;
        }

        .list-view .dep-version {
          background: #e2e8f0;
          color: #4a5568;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.9em;
          font-weight: 500;
        }

        .list-view .dep-sub-count {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .list-view .expand-btn {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 1.2em;
          padding: 5px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .list-view .expand-btn:hover {
          background: #667eea;
          color: white;
        }

        .sub-deps-expanded {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          display: none;
        }

        .sub-deps-expanded.show {
          display: block;
        }

        .sub-deps {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sub-dep {
          background: #667eea;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: 500;
        }

        /* Tree View Styles */
        .tree-view {
          display: none;
        }

        .tree-view.active {
          display: block;
        }

        .tree-item {
          margin: 5px 0;
        }

        .tree-node {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: #f7fafc;
          border-radius: 8px;
          margin: 2px 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tree-node:hover {
          background: #edf2f7;
        }

        .tree-toggle {
          margin-right: 8px;
          font-size: 0.8em;
          color: #718096;
          min-width: 15px;
        }

        .tree-name {
          font-weight: 600;
          color: #2d3748;
          margin-right: 10px;
        }

        .tree-version {
          background: #e2e8f0;
          color: #4a5568;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8em;
        }

        .tree-children {
          margin-left: 25px;
          display: none;
          border-left: 2px solid #e2e8f0;
          padding-left: 15px;
        }

        .tree-children.show {
          display: block;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #4a5568;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .page-btn:hover {
          background: #f7fafc;
        }

        .page-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #718096;
          font-size: 0.9em;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .list-view .dependency-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .list-view .dep-info {
            width: 100%;
            justify-content: space-between;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }
        }
      `}</style>
      
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <div className="container">
          {/* Header Section */}
          <div className="header">
            <h1 className="app-title">{serviceName} Application</h1>
            <p className="app-subtitle">Bill of Materials & Version Information</p>
            <div className="header-actions">
              <button className={`view-toggle ${currentView === 'tree' ? 'active' : ''}`} onClick={toggleView}>
                {currentView === 'list' ? '🌳 Tree View' : '📋 List View'}
              </button>
              <button className="download-btn" onClick={downloadBOM}>
                📥 Download BOM
              </button>
            </div>
          </div>

          {/* Information Grid */}
          <div className="info-grid">
            {/* Version Information */}
            <div className="info-card">
              <h3 className="card-title">
                <svg className="icon" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="#667eea"/>
                </svg>
                Version Information
              </h3>
              <div className="info-item">
                <span className="info-label">Cargo Version</span>
                <span className="info-value">0.3.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Git Branch</span>
                <span className="info-value">develop</span>
              </div>
              <div className="info-item">
                <span className="info-label">Git Hash</span>
                <span className="info-value">3c221f6</span>
              </div>
            </div>

            {/* Build Information */}
            <div className="info-card">
              <h3 className="card-title">
                <svg className="icon" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" fill="#667eea"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" fill="#667eea"/>
                </svg>
                Build Information
              </h3>
              <div className="info-item">
                <span className="info-label">Build Time</span>
                <span className="info-value">2025-09-07 10:45:14</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rust Version</span>
                <span className="info-value">1.86.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cargo Version</span>
                <span className="info-value">1.86.0</span>
              </div>
            </div>

            {/* Repository Information */}
            <div className="info-card">
              <h3 className="card-title">
                <svg className="icon" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" fill="#667eea"/>
                </svg>
                Repository
              </h3>
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{serviceName.toLowerCase()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Generated</span>
                <span className="info-value">2025-09-07 08:45:19</span>
              </div>
            </div>
          </div>

          {/* Dependencies Section */}
          <div className="dependencies-section">
            <div className="dependencies-header">
              <h2 className="deps-title">Dependencies</h2>
              <span className="deps-count">{filteredDependencies.length} packages</span>
            </div>
            
            <div className="controls">
              <input 
                type="text" 
                className="search-box" 
                placeholder="🔍 Search dependencies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="version">Sort by Version</option>
                <option value="deps-count">Sort by Dependencies Count</option>
              </select>
              <select 
                className="items-per-page" 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
                <option value="all">Show all</option>
              </select>
            </div>
            
            {/* List View */}
            {renderListView()}

            {/* Tree View */}
            {renderTreeView()}

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>
      </div>
    </>
  );
};

export default BillOfMaterials;