#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const dbPath = path.join(root, 'harness.db');
const schemaDir = path.join(root, 'scripts', 'schema');

const inputTypes = new Map([
  ['new spec', 'new_spec'],
  ['new_spec', 'new_spec'],
  ['spec slice', 'spec_slice'],
  ['spec_slice', 'spec_slice'],
  ['change request', 'change_request'],
  ['change_request', 'change_request'],
  ['new initiative', 'new_initiative'],
  ['new_initiative', 'new_initiative'],
  ['maintenance', 'maintenance'],
  ['maintenance request', 'maintenance'],
  ['harness improvement', 'harness_improvement'],
  ['harness_improvement', 'harness_improvement'],
]);

const lanes = new Map([
  ['tiny', 'tiny'],
  ['normal', 'normal'],
  ['high-risk', 'high_risk'],
  ['high risk', 'high_risk'],
  ['high_risk', 'high_risk'],
]);

function normalize(value, mapping, field) {
  const key = String(value ?? '').trim().toLowerCase().replaceAll('_', ' ');
  const direct = String(value ?? '').trim().toLowerCase();
  if (mapping.has(key)) return mapping.get(key);
  if (mapping.has(direct)) return mapping.get(direct);
  fail(`Invalid ${field}: ${value}`);
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const name = arg.slice(2);
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) {
        options[name] = true;
      } else {
        options[name] = argv[i + 1];
        i += 1;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, options };
}

function csvJson(value) {
  if (value === undefined || value === null) return null;
  if (value === 'none') return JSON.stringify([]);
  return JSON.stringify(String(value).split(',').map((part) => part.trim()).filter(Boolean));
}

function db() {
  const database = new DatabaseSync(dbPath);
  database.exec('PRAGMA busy_timeout = 5000');
  database.exec('PRAGMA foreign_keys = ON');
  return database;
}

function initialized(database) {
  const row = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'")
    .get();
  return Boolean(row);
}

function ensureDb() {
  const database = db();
  try {
    if (initialized(database)) return database;
    const schemas = fs.readdirSync(schemaDir).filter((name) => name.endsWith('.sql')).sort();
    for (const schema of schemas) {
      try {
        database.exec(fs.readFileSync(path.join(schemaDir, schema), 'utf8'));
      } catch (error) {
        if (!String(error.message).includes('UNIQUE constraint failed: schema_version.version')) {
          throw error;
        }
      }
    }
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

function option(options, name, required = false) {
  const value = options[name];
  if (required && (value === undefined || value === true || value === '')) {
    fail(`Missing required option --${name}`);
  }
  return value === true ? undefined : value;
}

function runStmt(database, sql, values = []) {
  return database.prepare(sql).run(...values.map((value) => value === undefined ? null : value));
}

function all(database, sql, values = []) {
  return database.prepare(sql).all(...values.map((value) => value === undefined ? null : value));
}

function printTable(rows, columns) {
  if (!rows.length) {
    console.log('No rows');
    return;
  }
  const widths = Object.fromEntries(columns.map((column) => [
    column,
    Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length)),
  ]));
  console.log(columns.map((column) => column.padEnd(widths[column])).join(' | '));
  console.log(columns.map((column) => '-'.repeat(widths[column])).join('-+-'));
  for (const row of rows) {
    console.log(columns.map((column) => String(row[column] ?? '').padEnd(widths[column])).join(' | '));
  }
}

function cmdInit() {
  const database = ensureDb();
  database.close();
  console.log(`Initialized Harness database at ${dbPath}`);
}

function cmdMigrate() {
  const database = ensureDb();
  database.close();
  console.log('Harness database is up to date');
}

function cmdIntake(options) {
  const database = ensureDb();
  const type = normalize(option(options, 'type', true), inputTypes, 'type');
  const lane = normalize(option(options, 'lane', true), lanes, 'lane');
  const result = runStmt(database, `
    INSERT INTO intake
      (input_type, summary, risk_lane, risk_flags, affected_docs, story_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    type,
    option(options, 'summary', true),
    lane,
    csvJson(option(options, 'flags')),
    csvJson(option(options, 'docs')),
    option(options, 'story'),
    option(options, 'notes'),
  ]);
  database.close();
  console.log(`Recorded intake ${result.lastInsertRowid}: ${type} / ${lane}`);
}

function cmdStoryAdd(options) {
  const database = ensureDb();
  const id = option(options, 'id', true);
  const title = option(options, 'title', true);
  const lane = normalize(option(options, 'lane', true), lanes, 'lane');
  runStmt(database, `
    INSERT INTO story (id, title, risk_lane, contract_doc, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      risk_lane=excluded.risk_lane,
      contract_doc=excluded.contract_doc,
      notes=COALESCE(excluded.notes, story.notes)
  `, [id, title, lane, option(options, 'contract-doc'), option(options, 'status') ?? 'planned', option(options, 'notes')]);
  database.close();
  console.log(`Saved story ${id}: ${title}`);
}

function cmdStoryUpdate(options) {
  const id = option(options, 'id', true);
  const pairs = [
    ['status', option(options, 'status')],
    ['unit_proof', option(options, 'unit')],
    ['integration_proof', option(options, 'integration')],
    ['e2e_proof', option(options, 'e2e')],
    ['platform_proof', option(options, 'platform')],
    ['evidence', option(options, 'evidence')],
    ['notes', option(options, 'notes')],
  ].filter(([, value]) => value !== undefined);
  if (!pairs.length) {
    console.log('No story fields supplied');
    return;
  }
  const database = ensureDb();
  const result = runStmt(
    database,
    `UPDATE story SET ${pairs.map(([column]) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...pairs.map(([, value]) => value), id],
  );
  database.close();
  if (result.changes === 0) fail(`Story not found: ${id}`);
  console.log(`Updated story ${id}`);
}

function cmdBacklogAdd(options) {
  const database = ensureDb();
  const result = runStmt(database, `
    INSERT INTO backlog
      (title, discovered_while, current_pain, suggested_improvement, risk,
       predicted_impact, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    option(options, 'title', true),
    option(options, 'discovered-while'),
    option(options, 'pain', true),
    option(options, 'suggested'),
    option(options, 'risk') ? normalize(option(options, 'risk'), lanes, 'risk') : null,
    option(options, 'predicted'),
    option(options, 'notes'),
  ]);
  database.close();
  console.log(`Added backlog item ${result.lastInsertRowid}: ${option(options, 'title')}`);
}

function cmdBacklogClose(options) {
  const id = option(options, 'id', true);
  const status = option(options, 'status') ?? 'implemented';
  const database = ensureDb();
  const result = runStmt(database, `
    UPDATE backlog
    SET status = ?, actual_outcome = ?, implemented_at = datetime('now')
    WHERE id = ?
  `, [status, option(options, 'outcome'), id]);
  database.close();
  if (result.changes === 0) fail(`Backlog item not found: ${id}`);
  console.log(`Closed backlog item ${id} as ${status}`);
}

function cmdTrace(options) {
  const database = ensureDb();
  const result = runStmt(database, `
    INSERT INTO trace
      (task_summary, intake_id, story_id, agent, actions_taken, files_read,
       files_changed, decisions_made, errors, outcome, duration_seconds,
       token_estimate, harness_friction, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    option(options, 'summary', true),
    option(options, 'intake'),
    option(options, 'story'),
    option(options, 'agent'),
    csvJson(option(options, 'actions')),
    csvJson(option(options, 'read')),
    csvJson(option(options, 'changed')),
    csvJson(option(options, 'decisions')),
    csvJson(option(options, 'errors')),
    option(options, 'outcome', true),
    option(options, 'duration'),
    option(options, 'tokens'),
    option(options, 'friction'),
    option(options, 'notes'),
  ]);
  database.close();
  console.log(`Recorded trace ${result.lastInsertRowid}: ${option(options, 'outcome')}`);
}

function queryMatrix() {
  const database = ensureDb();
  const rows = all(database, `
    SELECT id, title, risk_lane, status, unit_proof, integration_proof,
           e2e_proof, platform_proof
    FROM story
    ORDER BY id
  `);
  database.close();
  printTable(rows, ['id', 'title', 'risk_lane', 'status', 'unit_proof', 'integration_proof', 'e2e_proof', 'platform_proof']);
}

function queryBacklog(options) {
  const database = ensureDb();
  let where = '';
  if (options.open) where = "WHERE status IN ('proposed','accepted')";
  if (options.closed) where = "WHERE status IN ('implemented','rejected')";
  const rows = all(database, `SELECT id, title, risk, status, current_pain FROM backlog ${where} ORDER BY id`);
  database.close();
  printTable(rows, ['id', 'title', 'risk', 'status', 'current_pain']);
}

function querySimple(table, columns) {
  const database = ensureDb();
  const rows = all(database, `SELECT ${columns.join(', ')} FROM ${table} ORDER BY 1`);
  database.close();
  printTable(rows, columns);
}

function queryStats() {
  const database = ensureDb();
  for (const table of ['intake', 'story', 'decision', 'backlog', 'trace']) {
    const row = database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
    console.log(`${table}: ${row.count}`);
  }
  database.close();
}

function queryFriction() {
  const database = ensureDb();
  const rows = all(database, `
    SELECT id, created_at, task_summary, harness_friction
    FROM trace
    WHERE harness_friction IS NOT NULL AND harness_friction != ''
    ORDER BY id
  `);
  database.close();
  printTable(rows, ['id', 'created_at', 'task_summary', 'harness_friction']);
}

function querySql(positional) {
  const sql = positional.slice(2).join(' ');
  if (!sql) fail('Missing SQL argument');
  const database = ensureDb();
  const rows = all(database, sql);
  database.close();
  if (!rows.length) {
    console.log('No rows');
    return;
  }
  printTable(rows, Object.keys(rows[0]));
}

function scoreTrace(options) {
  const database = ensureDb();
  const row = option(options, 'id')
    ? database.prepare('SELECT * FROM trace WHERE id = ?').get(option(options, 'id'))
    : database.prepare('SELECT * FROM trace ORDER BY id DESC LIMIT 1').get();
  database.close();
  if (!row) fail('No trace found');
  let score = 1;
  if (row.agent && row.actions_taken && row.files_read && row.files_changed) score = 2;
  if (score === 2 && row.decisions_made && row.errors && row.harness_friction && (row.duration_seconds || row.token_estimate || row.notes)) {
    score = 3;
  }
  console.log(`Trace ${row.id} score: ${score}`);
}

function help() {
  console.log(`Usage: harness-cli <command> [options]

Commands:
  init
  migrate
  intake --type <type> --summary <text> --lane <lane>
  story add --id <id> --title <text> --lane <lane>
  story update --id <id> [--status <status>] [--unit 1] [--integration 1]
  backlog add --title <text> --pain <text> [--risk <lane>]
  backlog close --id <id> [--status implemented|rejected]
  trace --summary <text> --outcome completed|blocked|partial|failed
  score-trace [--id <id>]
  query matrix|backlog|stats|friction|intakes|traces|decisions|sql <sql>
  import brownfield`);
}

function main() {
  const { positional, options } = parseArgs(process.argv.slice(2));
  const [command, subcommand] = positional;
  if (!command || command === 'help' || command === '--help') return help();
  if (command === 'init') return cmdInit();
  if (command === 'migrate') return cmdMigrate();
  if (command === 'intake') return cmdIntake(options);
  if (command === 'story' && subcommand === 'add') return cmdStoryAdd(options);
  if (command === 'story' && subcommand === 'update') return cmdStoryUpdate(options);
  if (command === 'backlog' && subcommand === 'add') return cmdBacklogAdd(options);
  if (command === 'backlog' && subcommand === 'close') return cmdBacklogClose(options);
  if (command === 'trace') return cmdTrace(options);
  if (command === 'score-trace') return scoreTrace(options);
  if (command === 'query' && subcommand === 'matrix') return queryMatrix();
  if (command === 'query' && subcommand === 'backlog') return queryBacklog(options);
  if (command === 'query' && subcommand === 'stats') return queryStats();
  if (command === 'query' && subcommand === 'friction') return queryFriction();
  if (command === 'query' && subcommand === 'intakes') return querySimple('intake', ['id', 'created_at', 'input_type', 'risk_lane', 'summary']);
  if (command === 'query' && subcommand === 'traces') return querySimple('trace', ['id', 'created_at', 'task_summary', 'outcome']);
  if (command === 'query' && subcommand === 'decisions') return querySimple('decision', ['id', 'title', 'status', 'doc_path']);
  if (command === 'query' && subcommand === 'sql') return querySql(positional);
  if (command === 'import' && subcommand === 'brownfield') {
    console.log('Brownfield import is not implemented by the Windows fallback CLI');
    process.exitCode = 2;
    return;
  }
  fail(`Unknown command: ${positional.join(' ')}`);
}

try {
  main();
} catch (error) {
  fail(error.stack ?? error.message);
}
