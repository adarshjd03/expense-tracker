const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'), { readonly: true });

console.log('\n========================================');
console.log('   SQLite Database Inspector');
console.log('========================================\n');

// 1. List all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all();

if (tables.length === 0) {
  console.log('⚠️  No tables found in the database.');
  process.exit(0);
}

console.log(`📋 Tables found: ${tables.map(t => t.name).join(', ')}\n`);

// 2. For each table, show schema + row count + data
for (const { name } of tables) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📦 TABLE: ${name.toUpperCase()}`);
  console.log(`${'─'.repeat(50)}`);

  // Schema
  const schema = db.prepare(`PRAGMA table_info(${name})`).all();
  console.log('\n  Columns:');
  for (const col of schema) {
    const pk = col.pk ? ' 🔑 PK' : '';
    const notnull = col.notnull ? ' NOT NULL' : '';
    const def = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
    console.log(`    • ${col.name.padEnd(20)} ${col.type}${pk}${notnull}${def}`);
  }

  // Row count
  const count = db.prepare(`SELECT COUNT(*) as cnt FROM "${name}"`).get();
  console.log(`\n  Row count: ${count.cnt}`);

  // Data rows (limit 20)
  if (count.cnt > 0) {
    const rows = db.prepare(`SELECT * FROM "${name}" LIMIT 20`).all();
    console.log(`\n  Data (showing up to 20 rows):`);
    console.table(rows);
    if (count.cnt > 20) {
      console.log(`  ... and ${count.cnt - 20} more rows.`);
    }
  } else {
    console.log('  (empty — no rows yet)');
  }
}

console.log('\n========================================');
console.log('   Inspection complete ✅');
console.log('========================================\n');

db.close();
