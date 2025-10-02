"""
Custom MySQL database backend that bypasses MariaDB version check.
This is a temporary workaround for development with MariaDB 10.4.
TODO: Upgrade to MariaDB 10.5+ in production.
"""
from django.db.backends.mysql.base import DatabaseWrapper as MySQLDatabaseWrapper


class DatabaseWrapper(MySQLDatabaseWrapper):
    """
    Custom MySQL database wrapper that skips version check.
    """
    
    def check_database_version_supported(self):
        """
        Override to skip MariaDB version check.
        Development only - MariaDB 10.4 is being used instead of required 10.5+
        """
        # Skip the version check entirely
        pass
