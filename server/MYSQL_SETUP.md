# MySQL Setup Guide for MEN'S Fashion

## Step 1: Install MySQL

Download and install MySQL from: https://dev.mysql.com/downloads/mysql/

Or use XAMPP/WAMP which includes MySQL.

## Step 2: Create Database

Open MySQL Command Line or phpMyAdmin and run:

```sql
-- Option A: Run the schema file
source database/schema.sql;

-- Option B: Run manually
CREATE DATABASE mens_fashion;
USE mens_fashion;
-- Then run schema.sql content
```

## Step 3: Seed Data (Optional)

```sql
-- Run the seed file
source database/seed.sql;
```

## Step 4: Update Configuration

Edit `db_mysql.js` and update these values:

```javascript
const DB_CONFIG = {
  host: "localhost",       // Your MySQL host
  user: "root",            // Your MySQL username
  password: "",            // Your MySQL password
  database: "mens_fashion", // Your MySQL database name
};
```

## Step 5: Start Server

```bash
# Use MySQL version
npm run start:mysql

# Or for development
npm run dev:mysql
```

## Default Admin Account

- Email: admin@gmail.com
- Password: admin123

## Database Tables

| Table | Description |
|-------|-------------|
| users | Admin and customer accounts |
| products | Product catalog |
| categories | Product categories |
| orders | Customer orders |
| settings | Store configuration |

## Troubleshooting

### Error: "Access denied for user"
- Check your MySQL username/password in `db_mysql.js`
- Make sure MySQL is running

### Error: "Unknown database 'mens_fashion'"
- Run `schema.sql` first to create the database

### Error: "Table doesn't exist"
- Run `seed.sql` to create tables and seed data
- Or restart the server (it auto-creates tables)

### Connection refused
- Make sure MySQL is running on port 3306
- Check if firewall is blocking the connection
