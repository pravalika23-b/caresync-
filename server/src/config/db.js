const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_CLIENT = process.env.DB_CLIENT || 'sqlite';

let sqliteDb = null;
let mysqlPool = null;

if (DB_CLIENT === 'mysql') {
  const mysql = require('mysql2/promise');
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: false
  });
  console.log('✅ Connected to MySQL Database Pool');
} else {
  // Built-in SQLite in Node 22.5+
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.resolve(__dirname, '../database/hospital.db');
  
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new DatabaseSync(dbPath);
  // Enable foreign keys and WAL mode for high concurrency
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  console.log(`✅ Connected to SQLite Database at ${dbPath}`);
}

/**
 * Execute parameterized query
 * Returns array of rows for SELECT, or { insertId, affectedRows } for writes
 */
async function query(sql, params = []) {
  if (DB_CLIENT === 'mysql') {
    const [result] = await mysqlPool.execute(sql, params);
    if (Array.isArray(result)) {
      return result;
    }
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }

  // SQLite implementation
  const trimmed = sql.trim().toUpperCase();
  const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('WITH');

  const stmt = sqliteDb.prepare(sql);
  if (isSelect) {
    return stmt.all(...params);
  } else {
    const res = stmt.run(...params);
    return {
      insertId: Number(res.lastInsertRowid),
      affectedRows: res.changes
    };
  }
}

/**
 * Execute a transaction block
 */
async function transaction(fn) {
  if (DB_CLIENT === 'mysql') {
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    try {
      const txQuery = async (sql, params = []) => {
        const [result] = await connection.execute(sql, params);
        if (Array.isArray(result)) return result;
        return { insertId: result.insertId, affectedRows: result.affectedRows };
      };
      const result = await fn({ query: txQuery });
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // SQLite transaction
  sqliteDb.exec('BEGIN IMMEDIATE');
  try {
    const txQuery = async (sql, params = []) => {
      const trimmed = sql.trim().toUpperCase();
      const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA');
      const stmt = sqliteDb.prepare(sql);
      if (isSelect) {
        return stmt.all(...params);
      } else {
        const res = stmt.run(...params);
        return { insertId: Number(res.lastInsertRowid), affectedRows: res.changes };
      }
    };
    const result = await fn({ query: txQuery });
    sqliteDb.exec('COMMIT');
    return result;
  } catch (err) {
    sqliteDb.exec('ROLLBACK');
    throw err;
  }
}

/**
 * Execute raw multi-statement SQL (useful for migrations)
 */
async function exec(sql) {
  if (DB_CLIENT === 'mysql') {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.query(sql);
    } finally {
      connection.release();
    }
  } else {
    sqliteDb.exec(sql);
  }
}

module.exports = {
  query,
  transaction,
  exec,
  DB_CLIENT
};
