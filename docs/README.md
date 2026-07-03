## 🗄️ Database Migrations

We provide two different migration paths depending on your starting point. Please choose the one that matches your current environment.

### 🟢 Standard Setup (New Environment)

If you are starting from scratch, simply use the default folder:

Path: ./migrations

Action: No action required. Run your migration command normally.

### 🟠 Legacy Migration (Existing System)

If you are migrating an existing database, you must use the specialized scripts designed for modernization.

Clear the content of the root ./migrations folder.

Copy the contents of ./migrations_for_legacy into the root ./migrations folder.

### ⚠️ Critical Safety Check

Before running any migration command, always manually validate the content of the SQL scripts.

Review: Open the files in the ./migrations folder.

Verify: Ensure the scripts align with your current database schema and intended state.

Backup: We strongly recommend performing a database backup before applying legacy migrations.

[!CAUTION]
Migrations, especially those for legacy systems, can involve destructive operations (DROP, ALTER, etc.). Verification is mandatory.
