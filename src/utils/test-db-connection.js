#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the PostgreSQL connection and displays connection information.
 * Run: node src/utils/test-db-connection.js
 */

require('dotenv').config();
const { sequelize, testConnection } = require('../config');

async function main() {
  console.log('🔄 Testing database connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || 5432}`);
  console.log(`  Database: ${process.env.DB_NAME || 'nutrition_management'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}\n`);

  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('\n✅ Database connection test passed!');
    
    // Get database version
    const [results] = await sequelize.query('SELECT version()');
    console.log('\nPostgreSQL Version:');
    console.log(`  ${results[0].version}\n`);
    
    // List all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Existing tables:');
    if (tables.length === 0) {
      console.log('  (no tables yet - migrations needed)');
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    await sequelize.close();
    process.exit(0);
  } else {
    console.log('\n❌ Database connection test failed!');
    console.log('\nTroubleshooting:');
    console.log('  1. Check if PostgreSQL is running: docker ps');
    console.log('  2. Verify .env file has correct credentials');
    console.log('  3. Test connection: docker exec -it nutrition-postgres psql -U postgres');
    console.log('  4. Check database exists: \\l in psql\n');
    
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
