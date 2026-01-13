"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const pg_1 = require("pg");
const DEFAULT_DATABASE_URL = 'postgresql://dietapp:dietapp@localhost:5433/dietapp';
async function runMigrations() {
    const connectionString = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
    const client = new pg_1.Client({ connectionString });
    await client.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        run_at timestamptz NOT NULL DEFAULT now()
      );
    `);
        const migrationsDir = node_path_1.default.resolve(__dirname, '../../migrations');
        const migrationFiles = node_fs_1.default
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();
        const { rows } = await client.query('SELECT name FROM schema_migrations');
        const applied = new Set(rows.map((row) => row.name));
        for (const file of migrationFiles) {
            if (applied.has(file)) {
                continue;
            }
            const sql = node_fs_1.default.readFileSync(node_path_1.default.join(migrationsDir, file), 'utf8');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`Applied migration: ${file}`);
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
    }
    finally {
        await client.end();
    }
}
runMigrations().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map