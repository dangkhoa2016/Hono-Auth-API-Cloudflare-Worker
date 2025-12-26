#!/usr/bin/env node

import path from 'path';
import url from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const masterPath = path.resolve(__dirname, 'master.js');
const args = process.argv.slice(2);

const result = spawnSync('node', [masterPath, 'sort', ...args], { stdio: 'inherit' });
process.exit(result.status === null ? 1 : result.status);
