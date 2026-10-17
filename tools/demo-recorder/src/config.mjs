import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireDemo } from './contracts.mjs';
import { demoGeolocation } from './gps.mjs';

export const toolRoot = fileURLToPath(new URL('../', import.meta.url));
export const repoRoot = path.resolve(toolRoot, '../..');
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.join(toolRoot, '.cache', 'browsers');

export function validateConfig(config) {
  const target = new URL(config.baseUrl);
  requireDemo(!target.username && !target.password && !target.search && !target.hash, 'INVALID_TARGET', 'Target URLs cannot contain credentials, queries or fragments.');
  requireDemo(['http:', 'https:'].includes(target.protocol), 'INVALID_TARGET', 'An HTTP(S) demo target is required.');
  requireDemo(target.pathname === '/', 'INVALID_TARGET', 'Set baseUrl to the site origin, without a page path.');
  requireDemo(config.environment === 'demo' && config.allowedOrigins?.includes(target.origin), 'TARGET_NOT_ALLOWED', 'The target must be explicitly allowlisted and marked as a demo.');
  requireDemo(Number.isFinite(config.maxSeconds) && config.maxSeconds > 0 && config.maxSeconds <= 60, 'INVALID_CONFIG', 'maxSeconds must be greater than zero and at most 60.');
  requireDemo(Number.isInteger(config.paceMs) && config.paceMs >= 300 && config.paceMs <= 3000, 'INVALID_CONFIG', 'paceMs must be between 300 and 3000.');
  requireDemo(Number.isInteger(config.timeoutMs) && config.timeoutMs >= 1000 && config.timeoutMs <= 60000, 'INVALID_CONFIG', 'timeoutMs must be between 1000 and 60000.');
  const { width, height } = config.viewport ?? {};
  requireDemo(Number.isInteger(width) && Number.isInteger(height) && width >= 960 && height >= 540 && width <= 3840 && height <= 2160 && width % 2 === 0 && height % 2 === 0, 'INVALID_CONFIG', 'The viewport needs even dimensions from 960x540 to 3840x2160.');
  requireDemo(['manager', 'hr'].includes(config.approvalRole), 'INVALID_CONFIG', 'approvalRole must be manager or hr.');
  return { ...config, baseUrl: target.origin };
}

function text(value, name) {
  requireDemo(typeof value === 'string' && value.trim().length > 0, 'MISSING_SCENARIO_DATA', `Configure ${name} before recording this workflow.`);
}

function date(value, name) {
  text(value, name);
  requireDemo(/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, 'INVALID_SCENARIO_DATA', `${name} must be a real YYYY-MM-DD date.`);
}

function money(value, name) {
  requireDemo(typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value)) && Number(value) > 0, 'INVALID_SCENARIO_DATA', `${name} must be a positive amount with at most two decimal places.`);
}

function range(data, name) {
  date(data?.fromDate, `${name}.fromDate`);
  date(data?.toDate, `${name}.toDate`);
  requireDemo(data.fromDate <= data.toDate, 'INVALID_SCENARIO_DATA', `${name} dates cannot run backwards.`);
}

export function validateScenarioData(id, config) {
  if (id === 'punch') demoGeolocation(config.attendance);
  if (id === 'leave-apply') {
    const data = config.leave;
    text(data?.typeLabel, 'leave.typeLabel');
    range(data, 'leave');
    text(data.reason, 'leave.reason');
  }
  if (id === 'expense-submit') {
    const data = config.expense;
    for (const key of ['categoryLabel', 'title', 'currency', 'receipt']) text(data?.[key], `expense.${key}`);
    money(data.amount, 'expense.amount');
    date(data.date, 'expense.date');
    requireDemo(/^[A-Z]{3}$/.test(data.currency), 'INVALID_SCENARIO_DATA', 'Expense currency must be a three-letter ISO code.');
  }
  if (id === 'travel-submit') {
    const data = config.travel;
    for (const key of ['fromLocation', 'toLocation', 'purpose', 'supportingFile']) text(data?.[key], `travel.${key}`);
    range(data, 'travel');
    money(data.estimatedCost, 'travel.estimatedCost');
  }
}

export function loadConfig(file = 'demo.local.json') {
  const configPath = path.resolve(toolRoot, file);
  requireDemo(existsSync(configPath), 'CONFIG_REQUIRED', 'Create demo.local.json from demo.example.json before a live run.');
  const envPath = path.join(toolRoot, '.env.local');
  if (existsSync(envPath)) process.loadEnvFile(envPath);
  return validateConfig(JSON.parse(readFileSync(configPath, 'utf8')));
}

export function credentials(role) {
  const prefix = `DEMO_${role.toUpperCase()}`;
  const username = process.env[`${prefix}_USERNAME`];
  const password = process.env[`${prefix}_PASSWORD`];
  const stateFile = process.env[`${prefix}_STATE`];
  requireDemo(stateFile || (username && password), 'CREDENTIALS_REQUIRED', `Configure the ${role} credentials or saved session in .env.local.`);
  return { username, password, stateFile: stateFile ? path.resolve(toolRoot, stateFile) : undefined };
}

export function attachment(file) {
  const absolute = path.resolve(toolRoot, file);
  requireDemo(existsSync(absolute), 'ATTACHMENT_REQUIRED', 'A configured demo attachment file does not exist.');
  return absolute;
}
