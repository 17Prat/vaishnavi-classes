import sys
import os
import asyncio
import asyncpg

DEFAULT_PROJECT_REF = "ubvbndbqfedejywynuwc"

async def run_migration(connection_input: str):
    if not connection_input:
        print("ERROR: Please provide your Supabase database password or connection string.")
        print(f"Usage: python backend/migrate_to_supabase.py <YOUR_SUPABASE_DB_PASSWORD_OR_URI>")
        return

    # Check if user provided just the password or full URI
    if connection_input.startswith("postgres://") or connection_input.startswith("postgresql://"):
        uri = connection_input
    else:
        # Standard Supabase Direct URI
        pwd = connection_input.strip()
        uri = f"postgresql://postgres:{pwd}@db.{DEFAULT_PROJECT_REF}.supabase.co:5432/postgres"

    print(f"Connecting to Supabase PostgreSQL (Project: {DEFAULT_PROJECT_REF})...")
    
    sql_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "supabase_complete_setup.sql")
    if not os.path.exists(sql_file):
        print(f"ERROR: {sql_file} not found!")
        return

    with open(sql_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    try:
        conn = await asyncpg.connect(uri, timeout=30)
        print("Connected to Supabase PostgreSQL successfully!")
        print("Executing migration statements and restoring data...")
        await conn.execute(sql_content)
        print("SUCCESS: All tables created and data migrated to Supabase successfully!")
        
        # Verify row counts
        print("\nVerifying migrated table counts in Supabase:")
        tables = [
            "institutes", "users", "student_profiles", "fee_plans",
            "student_fee_assignments", "installments", "payments", "receipts",
            "upi_accounts", "institute_settings", "reminders"
        ]
        for t in tables:
            try:
                cnt = await conn.fetchval(f'SELECT COUNT(*) FROM "{t}"')
                print(f"  ✓ {t}: {cnt} rows")
            except Exception as e:
                print(f"  ! {t}: {e}")

        await conn.close()
        print("\nMigration completed! You can now set DATABASE_URL in Render / .env to use Supabase.")
    except Exception as e:
        print(f"\nConnection Error: {e}")
        print("\nTips:")
        print("1. If using password, ensure special characters are URL-encoded or supply the full connection string from:")
        print(f"   https://supabase.com/dashboard/project/{DEFAULT_PROJECT_REF}/settings/database")
        print("2. You can also paste the contents of 'supabase_complete_setup.sql' directly into Supabase SQL Editor:")
        print(f"   https://supabase.com/dashboard/project/{DEFAULT_PROJECT_REF}/sql/new")

if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else ""
    asyncio.run(run_migration(arg))
