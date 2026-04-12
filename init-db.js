/**
 * Database Initialization Script
 * Creates SQLite database and loads schema + seed data
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'leader_academy.db');

console.log('🚀 Initializing Leader Academy Database...\n');

// Create or open database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Database connected:', DB_PATH);
});

// Read schema file
const schemaPath = path.join(__dirname, 'database-sqlite.sql');
const seedPath = path.join(__dirname, 'seed-sqlite.sql');

// Execute schema
db.exec(fs.readFileSync(schemaPath, 'utf8'), (err) => {
  if (err) {
    console.error('❌ Error creating schema:', err);
    process.exit(1);
  }
  console.log('✅ Schema created successfully');

  // Execute seed data
  db.exec(fs.readFileSync(seedPath, 'utf8'), (err) => {
    if (err) {
      console.error('❌ Error loading seed data:', err);
      process.exit(1);
    }
    console.log('✅ Seed data loaded successfully');

    // Get statistics
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err);
      } else {
        console.log(`\n📊 Database Statistics:`);
        console.log(`   Tables created: ${tables.length}`);
        
        tables.forEach(table => {
          db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
            if (!err) {
              console.log(`   - ${table.name}: ${row.count} records`);
            }
          });
        });
      }

      // Close database
      setTimeout(() => {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            process.exit(1);
          }
          console.log('\n✅ Database initialization complete!');
          process.exit(0);
        });
      }, 1000);
    });
  });
});
