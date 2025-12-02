import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is niet gezet in .env.local');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ⬇️ Optioneel maar handig: zorg dat er minimaal 1 admin-account is
async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      '[auth] ADMIN_EMAIL en/of ADMIN_PASSWORD niet gezet – er wordt geen automatisch admin-account aangemaakt.'
    );
    return;
  }

  const client = await pool.connect();
  try {
    // Bestaat er al een admin?
    const check = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE is_admin = TRUE LIMIT 1'
    );

    if (check.rowCount && check.rowCount > 0) {
      return; // admin bestaat al
    }

    // Bestaat er al een user met deze email?
    const existing = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [adminEmail]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      // Upgrade deze user naar admin
      await client.query('UPDATE users SET is_admin = TRUE WHERE email = $1', [adminEmail]);
      console.log('[auth] Bestaande gebruiker is admin gemaakt:', adminEmail);
      return;
    }

    // Nieuw admin account aanmaken
    const id = randomUUID();
    const hash = await bcrypt.hash(adminPassword, 12);

    await client.query(
      `
        INSERT INTO users (
          id,
          email,
          password_hash,
          voornaam,
          achternaam,
          bedrijfsnaam,
          telefoon,
          straat,
          postcode,
          plaats,
          land,
          is_admin,
          created_at
        )
        VALUES ($1, $2, $3, 'Admin', 'Gebruiker', NULL, '', '', '', '', '', TRUE, NOW())
      `,
      [id, adminEmail, hash]
    );

    console.log('[auth] Nieuw admin-account aangemaakt:', adminEmail);
  } catch (err) {
    console.error('[auth] Fout bij ensureAdmin:', err);
  } finally {
    client.release();
  }
}

// fire-and-forget bij serverstart
ensureAdmin().catch((e) => console.error('[auth] ensureAdmin top-level error:', e));

export default pool;
