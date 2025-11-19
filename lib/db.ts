import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'db', 'database.sqlite');
const db = new Database(dbPath);

// Maak de users-tabel als hij nog niet bestaat (met isAdmin)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,

    -- Account / factuurgegevens
    voornaam TEXT,
    achternaam TEXT,
    bedrijfsnaam TEXT,
    telefoon TEXT,
    straat TEXT,
    postcode TEXT,
    plaats TEXT,
    land TEXT,

    -- Admin-vlag
    isAdmin INTEGER NOT NULL DEFAULT 0,

    createdAt TEXT NOT NULL
  );
`);

// Probeer bestaande tabel uit te breiden met isAdmin (als kolom nog niet bestaat)
try {
  db.exec(`ALTER TABLE users ADD COLUMN isAdmin INTEGER NOT NULL DEFAULT 0;`);
} catch (e) {
  // negeren: kolom bestaat al
}

/**
 * Zorg dat er minstens één admin-account is.
 * - Als er nog geen admin is, en ADMIN_EMAIL + ADMIN_PASSWORD staan in .env.local,
 *   dan maken we automatisch een admin-user aan.
 */
function ensureAdmin() {
  const existingAdmin = db
    .prepare('SELECT id FROM users WHERE isAdmin = 1 LIMIT 1')
    .get();

  if (existingAdmin) return;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      '[auth] Geen admin gevonden en ADMIN_EMAIL/ADMIN_PASSWORD niet gezet. ' +
        'Zet deze in .env.local om automatisch een admin-account aan te maken.'
    );
    return;
  }

  const id = randomUUID();
  const hash = bcrypt.hashSync(adminPassword, 12);

  const stmt = db.prepare(`
    INSERT INTO users (
      id,
      email,
      passwordHash,
      voornaam,
      achternaam,
      bedrijfsnaam,
      telefoon,
      straat,
      postcode,
      plaats,
      land,
      isAdmin,
      createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    adminEmail,
    hash,
    'Admin',
    'Gebruiker',
    null,
    null,
    null,
    null,
    null,
    null,
    1, // ⬅️ admin!
    new Date().toISOString()
  );

  console.log('[auth] Admin-account aangemaakt voor:', adminEmail);
}

ensureAdmin();

export default db;
