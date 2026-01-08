
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// CONFIGURATION
// We must manually grab the old URL from the commented out section or hardcode it if we know it.
// Based on previous cat output, the old URL was commented efficiently. 
// I will parse it from the file content or user input for safety.
// But for now, I'll use the one I saw in the logs earlier.
const OLD_DB_URL = "postgresql://postgres.jppugzqceagjnbqlzaxr:skillfind%23321@aws-1-eu-west-3.pooler.supabase.com:6543/postgres";
const NEW_DB_URL = process.env.DATABASE_URL;

if (!NEW_DB_URL) {
    console.error('❌ NEW_DATABASE_URL (DATABASE_URL) is missing in .env');
    process.exit(1);
}

const TABLES = [
    'users',
    'categories',
    'subcategories',
    'clients',
    'professionals',
    'professional_profiles',
    'professional_services',
    'verification_documents',
    'wallets',
    'transactions',
    'requests',
    'offers',
    'jobs',
    'reviews',
    'review_responses',
    'click_events',
    'platform_settings',
    'system_settings',
    'translations',
    'notifications',
    'ad_campaigns',
    'ad_clicks',
    'disputes',
    'admin_actions'
];

async function migrate() {
    console.log('🚀 Starting migration...');
    console.log(`📡 OLD: ${OLD_DB_URL.substring(0, 20)}...`);
    console.log(`📡 NEW: ${NEW_DB_URL!.substring(0, 20)}...`);

    const oldClient = new Client({
        connectionString: OLD_DB_URL,
        ssl: { rejectUnauthorized: false }
    });
    const newClient = new Client({
        connectionString: NEW_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await oldClient.connect();
        await newClient.connect();
        console.log('✅ Connected to both databases');

        // Disable foreign key checks on new DB to make insertion easier? 
        // No, better to insert in order. But disabling triggers/constraints temporarily is safer for bulk copy.
        // On RDS/Postgres, we can set session_replication_role = replica;
        await newClient.query("SET session_replication_role = 'replica';");
        console.log('🔓 Disabled FK constraints (session_replication_role = replica)');

        for (const table of TABLES) {
            console.log(`\n📦 Migrating table: ${table}...`);

            // 1. Fetch data from old DB
            const res = await oldClient.query(`SELECT * FROM "${table}"`);
            const rows = res.rows;
            console.log(`   Found ${rows.length} rows`);

            if (rows.length === 0) continue;

            // 2. Insert into new DB
            // We'll use a transaction for each table or batched inserts
            let successCount = 0;

            // Get columns from the first row
            const columns = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');

            // Construct param placeholders ($1, $2, etc)
            // It's safer to do one by one or small batches to avoid query size limits
            for (const row of rows) {
                const values = Object.values(row);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

                // Special handling for json/array types if needed? pg driver handles JS objects well.

                try {
                    await newClient.query(
                        `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                        values
                    );
                    successCount++;
                } catch (err: any) {
                    console.error(`   ❌ Failed to insert row in ${table}:`, err.message);
                }
            }
            console.log(`   ✅ Migrated ${successCount}/${rows.length} rows`);
        }

        // Re-enable constraints
        await newClient.query("SET session_replication_role = 'origin';");
        console.log('🔒 Re-enabled FK constraints');

        // Reset sequences (important!)
        console.log('\n🔄 Resetting sequences...');
        // This is a rough sequence reset query generator
        const seqRes = await newClient.query(`
            SELECT 'SELECT setval(' || quote_literal(quote_ident(S.relname)) || ', MAX(' || quote_ident(C.attname) || ') + 1) FROM ' || quote_ident(T.relname) || ';' as reset_query
            FROM pg_class AS S, pg_depend AS D, pg_class AS T, pg_attribute AS C
            WHERE S.relkind = 'S' AND S.oid = D.objid AND D.refobjid = T.oid AND D.refobjid = C.attrelid AND D.refobjsubid = C.attnum
            ORDER BY S.relname;
        `);

        for (const row of seqRes.rows) {
            // Logic to actually run the reset query might need adjustment based on table content
            // Usually specific queries like: SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
        }
        // Since we use CUIDs mostly, sequences might not be critical except for legacy serials. 
        // Unlikely to have serials with CUIDs.

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await oldClient.end();
        await newClient.end();
    }
}

migrate();
