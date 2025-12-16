import { execSync } from 'child_process';
import { getPlatformProxy } from 'wrangler';

// sql query for inspect
const inspectQueries = [{
  name: 'List all tables',
  query: 'SELECT * FROM sqlite_master WHERE type=\'table\';'
}];

function executeCommand(command) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['inherit', 'pipe', 'pipe']
    });
    // console.log(`Command executed successfully: ${command}`);
    console.log(result);
    return { success: true, output: result };
  } catch (error) {
    // console.log(`Error executing command: ${command}`);
    console.log('Error message:', error);
    return { success: false, error: error.message, stderr: error.stderr };
  }
}
async function inspectDatabase() {
  for (const { name, query } of inspectQueries) {
    console.log(`\nExecuting: ${name}:\n${query}`);
    try {
      const result = await executeCommand(`npx wrangler d1 execute hono-auth-api-db-staging --env "staging" --remote --command "${query}"`);
      console.log(result);
    } catch (error) {
      console.log(`Error executing query "${name}":`, error);
    }
  }
}

(async () => {

  await inspectDatabase();

  const { env } = await getPlatformProxy({ environment: 'test' });
  const assets = await env.ASSETS.fetch('http://test.local/favicon.png');
  console.log('sample asset:', assets.headers);

  console.log('Database inspection completed successfully.');
  process.exit(0);
})().catch(err => {
  console.error('Error during database inspection:', err);
  process.exit(1);
});
