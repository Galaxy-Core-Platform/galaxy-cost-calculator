"""
PostgreSQL Database Inspector
Queries real PostgreSQL databases to get statistics and metadata
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseInspector:
    def __init__(self):
        # Default PostgreSQL connection parameters
        self.default_config = {
            'host': os.environ.get('POSTGRES_HOST', 'localhost'),
            'port': os.environ.get('POSTGRES_PORT', '5432'),
            'user': os.environ.get('POSTGRES_USER', 'postgres'),
            'password': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        }
    
    def get_connection(self, database: str = 'postgres'):
        """Create a database connection"""
        config = self.default_config.copy()
        config['database'] = database
        try:
            return psycopg2.connect(**config, cursor_factory=RealDictCursor)
        except Exception as e:
            logger.error(f"Failed to connect to database {database}: {e}")
            return None
    
    def get_all_databases(self) -> List[Dict[str, Any]]:
        """Get list of all databases"""
        conn = self.get_connection('postgres')
        if not conn:
            return []
        
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        datname as name,
                        pg_database_size(datname) as size_bytes,
                        pg_size_pretty(pg_database_size(datname)) as size_pretty,
                        datcollate as collation,
                        datctype as ctype,
                        datacl as permissions
                    FROM pg_database 
                    WHERE datistemplate = false
                    ORDER BY datname;
                """)
                databases = cur.fetchall()
                return [dict(db) for db in databases]
        except Exception as e:
            logger.error(f"Error fetching databases: {e}")
            return []
        finally:
            conn.close()
    
    def get_database_stats(self, database: str) -> Dict[str, Any]:
        """Get detailed statistics for a specific database"""
        conn = self.get_connection(database)
        if not conn:
            return {}
        
        stats = {
            'name': database,
            'tables': [],
            'total_tables': 0,
            'total_size': 0,
            'total_rows': 0,
            'connections': 0,
            'version': '',
            'indexes': 0,
            'largest_tables': []
        }
        
        try:
            with conn.cursor() as cur:
                # Run ANALYZE to ensure statistics are up-to-date
                try:
                    cur.execute("ANALYZE")
                    conn.commit()
                except:
                    # If ANALYZE fails, continue anyway
                    pass
                
                # Get PostgreSQL version
                cur.execute("SELECT version();")
                result = cur.fetchone()
                if result:
                    stats['version'] = result['version'].split(' ')[1] if 'version' in result else 'Unknown'
                
                # Get connection count
                cur.execute("""
                    SELECT count(*) as connections 
                    FROM pg_stat_activity 
                    WHERE datname = %s;
                """, (database,))
                result = cur.fetchone()
                if result:
                    stats['connections'] = result['connections']
                
                # Get table statistics
                cur.execute("""
                    SELECT 
                        schemaname,
                        relname as tablename,
                        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS size,
                        pg_total_relation_size(schemaname||'.'||relname) AS size_bytes,
                        n_live_tup AS row_count,
                        n_dead_tup AS dead_rows,
                        last_vacuum,
                        last_autovacuum
                    FROM pg_stat_user_tables 
                    ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
                """)
                tables = cur.fetchall()
                
                total_size = 0
                total_rows = 0
                for table in tables:
                    table_dict = dict(table)
                    stats['tables'].append(table_dict)
                    total_size += table_dict.get('size_bytes', 0)
                    total_rows += table_dict.get('row_count', 0)
                
                stats['total_tables'] = len(tables)
                stats['total_size'] = total_size
                stats['total_size_pretty'] = self._format_bytes(total_size)
                stats['total_rows'] = total_rows
                
                # Get largest tables (top 5)
                stats['largest_tables'] = [dict(t) for t in tables[:5]]
                
                # Count indexes
                cur.execute("""
                    SELECT COUNT(*) as index_count 
                    FROM pg_indexes 
                    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
                """)
                result = cur.fetchone()
                if result:
                    stats['indexes'] = result['index_count']
                
                # Get database-specific settings
                cur.execute("""
                    SELECT 
                        pg_database_size(current_database()) as db_size,
                        pg_size_pretty(pg_database_size(current_database())) as db_size_pretty,
                        current_setting('max_connections') as max_connections,
                        current_setting('shared_buffers') as shared_buffers,
                        current_setting('effective_cache_size') as effective_cache_size,
                        current_setting('work_mem') as work_mem
                """)
                result = cur.fetchone()
                if result:
                    stats.update(dict(result))
                
        except Exception as e:
            logger.error(f"Error fetching stats for database {database}: {e}")
        finally:
            conn.close()
        
        return stats
    
    def get_galaxy_databases_stats(self) -> List[Dict[str, Any]]:
        """Get statistics for all Galaxy service databases"""
        galaxy_services = [
            'proxima', 'titan', 'orion', 'nebula', 'quasar', 'polaris',
            'aphelion', 'krypton', 'aster', 'draco', 'pulsar', 'stellar'
        ]
        
        all_stats = []
        
        # First try to get all databases
        databases = self.get_all_databases()
        db_names = [db['name'] for db in databases]
        
        for service in galaxy_services:
            # Check if database exists
            if service in db_names:
                stats = self.get_database_stats(service)
                stats['service'] = service
                stats['status'] = 'healthy' if stats.get('connections', 0) >= 0 else 'down'
            else:
                # Database doesn't exist, create placeholder
                stats = {
                    'service': service,
                    'name': service,
                    'status': 'not_found',
                    'total_tables': 0,
                    'total_size': 0,
                    'total_size_pretty': '0 B',
                    'total_rows': 0,
                    'connections': 0,
                    'version': 'N/A',
                    'indexes': 0,
                    'tables': [],
                    'largest_tables': []
                }
            
            all_stats.append(stats)
        
        return all_stats
    
    def _format_bytes(self, bytes_value: int) -> str:
        """Format bytes to human-readable string"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} PB"
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """Get summary statistics across all databases"""
        all_dbs = self.get_all_databases()
        galaxy_stats = self.get_galaxy_databases_stats()
        
        # Calculate totals
        total_size = sum(db.get('size_bytes', 0) for db in all_dbs)
        total_connections = 0
        total_tables = 0
        total_rows = 0
        
        for stats in galaxy_stats:
            if stats['status'] != 'not_found':
                total_connections += stats.get('connections', 0)
                total_tables += stats.get('total_tables', 0)
                total_rows += stats.get('total_rows', 0)
        
        # Get max connections
        conn = self.get_connection('postgres')
        max_connections = 100  # default
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("SHOW max_connections;")
                    result = cur.fetchone()
                    if result:
                        max_connections = int(result['max_connections'])
            except:
                pass
            finally:
                conn.close()
        
        return {
            'total_databases': len(all_dbs),
            'galaxy_databases': len([s for s in galaxy_stats if s['status'] != 'not_found']),
            'total_size': total_size,
            'total_size_pretty': self._format_bytes(total_size),
            'total_connections': total_connections,
            'max_connections': max_connections,
            'total_tables': total_tables,
            'total_rows': total_rows,
            'postgres_version': galaxy_stats[0].get('version', 'Unknown') if galaxy_stats else 'Unknown'
        }