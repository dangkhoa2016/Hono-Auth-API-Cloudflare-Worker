import { Miniflare } from 'miniflare';
import path from 'path';

const temp_script = `
  export default {
    async fetch(request, env, ctx) {
      return new Response("Hello from Miniflare!");
    }
  }
`;

const current_folder = process.cwd();
console.log('Current folder:', current_folder);

(async () => {
  const mf = new Miniflare({
    script: temp_script,
    modules: true,
    cachePersist: true,
    defaultPersistRoot: path.resolve(current_folder, './tools/d1'),
    d1Persist: path.resolve(current_folder, './tools/d1/local_test'),
    d1Databases: {
      DB: 'TestCode',
    },
  });

  const sql = `
CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, name TEXT);
  INSERT INTO Users (name) VALUES ('Alice'), ('Bob')
`;
  // List all users in the database
  const database = await mf.getD1Database('DB');
  console.log('database', database);// ProxyStub { name: 'D1Database', poisoned: false }
  const statement = await database.prepare(sql);
  const result = await statement.run();
  console.log(result);

  process.exit(0);
})().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
