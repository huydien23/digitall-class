#!/usr/bin/env python
"""
Django management script to fix database schema issues.
"""
import django
import sys
import os

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from django.db import connection, transaction

def check_column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    with connection.cursor() as cursor:
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        columns = [row[0] for row in cursor.fetchall()]
        return column_name in columns

def add_column_if_missing(table_name, column_name, column_definition):
    """Add a column to a table if it doesn't exist"""
    if not check_column_exists(table_name, column_name):
        print(f"Adding {column_name} to {table_name}")
        with connection.cursor() as cursor:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}")
    else:
        print(f"Column {column_name} already exists in {table_name}")

def main():
    """Fix the database schema"""
    try:
        with transaction.atomic():
            # Check and add missing columns to subjects table
            print("Checking subjects table...")
            add_column_if_missing('subjects', 'created_by_id', 'bigint NOT NULL')
            
            # Check and add missing columns to terms table  
            print("Checking terms table...")
            add_column_if_missing('terms', 'year_id', 'bigint NOT NULL')
            
            # Check and add missing columns to classes table
            print("Checking classes table...")
            add_column_if_missing('classes', 'subject_id', 'bigint NULL')
            add_column_if_missing('classes', 'term_id', 'bigint NULL')
            
            # Add foreign key constraints if needed
            print("Adding foreign key constraints...")
            with connection.cursor() as cursor:
                # Add foreign key for subjects.created_by_id -> accounts_user.id
                try:
                    cursor.execute("""
                        ALTER TABLE subjects 
                        ADD CONSTRAINT subjects_created_by_id_fk 
                        FOREIGN KEY (created_by_id) REFERENCES accounts_user(id)
                    """)
                    print("Added foreign key constraint for subjects.created_by_id")
                except Exception as e:
                    print(f"Foreign key constraint for subjects.created_by_id may already exist: {e}")
                
                # Add foreign key for terms.year_id -> academic_years.id
                try:
                    cursor.execute("""
                        ALTER TABLE terms 
                        ADD CONSTRAINT terms_year_id_fk 
                        FOREIGN KEY (year_id) REFERENCES academic_years(id)
                    """)
                    print("Added foreign key constraint for terms.year_id")
                except Exception as e:
                    print(f"Foreign key constraint for terms.year_id may already exist: {e}")
                
                # Add foreign key for classes.subject_id -> subjects.id
                try:
                    cursor.execute("""
                        ALTER TABLE classes 
                        ADD CONSTRAINT classes_subject_id_fk 
                        FOREIGN KEY (subject_id) REFERENCES subjects(id)
                    """)
                    print("Added foreign key constraint for classes.subject_id")
                except Exception as e:
                    print(f"Foreign key constraint for classes.subject_id may already exist: {e}")
                
                # Add foreign key for classes.term_id -> terms.id
                try:
                    cursor.execute("""
                        ALTER TABLE classes 
                        ADD CONSTRAINT classes_term_id_fk 
                        FOREIGN KEY (term_id) REFERENCES terms(id)
                    """)
                    print("Added foreign key constraint for classes.term_id")
                except Exception as e:
                    print(f"Foreign key constraint for classes.term_id may already exist: {e}")
            
            print("Database schema fix completed successfully!")
            
    except Exception as e:
        print(f"Error fixing database schema: {e}")
        raise

if __name__ == "__main__":
    main()