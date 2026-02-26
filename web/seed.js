const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_n2zE7iOQjBwV@ep-black-water-a8p4g48g-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
});

async function seed() {
    try {
        await client.connect();
        console.log('Connected to Neon PG DB');

        // Create Design #1 if it doesn't exist
        const res = await client.query(`
      INSERT INTO designs (id, homeowner_name, address, status, created_at, updated_at) 
      VALUES (1, 'Live Demo User', '123 Verified St', 0, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `);

        console.log('Seeding complete:', res.rows.length ? res.rows[0] : 'Already seeded');
    } catch (err) {
        console.error('Connection error', err.stack);
    } finally {
        await client.end();
    }
}

seed();
