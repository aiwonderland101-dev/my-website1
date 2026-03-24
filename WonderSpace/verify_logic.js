#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = __dirname;

const requiredDirs = [
  'theia-app',
  'theia-app/src',
  'theia-app/plugins',
  'workspace'
];

const requiredFiles = [
  'Dockerfile',
  'docker-compose.yml',
  'theia-app/package.json'
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function warn(condition, message) {
  if (!condition) {
    console.warn(`verify_logic.js warning: ${message}`);
  }
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

for (const dir of requiredDirs) {
  assert(fs.existsSync(path.join(root, dir)), `Missing directory: ${dir}`);
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `Missing file: ${file}`);
}

const dockerfile = read('Dockerfile');
assert(dockerfile.includes('FROM node:18-bullseye AS build'), 'Missing build stage base image');
warn(dockerfile.includes('ARG THEIA_BASE_IMAGE='), 'Missing THEIA_BASE_IMAGE build arg');
warn(dockerfile.includes('FROM ${THEIA_BASE_IMAGE}'), 'Runtime image is not configurable');
assert(dockerfile.includes('npm install -g pnpm'), 'pnpm bootstrap step missing');
assert(dockerfile.includes('RUN pnpm build'), 'pnpm build step missing');
assert(dockerfile.includes('EXPOSE 3000'), 'Port expose missing');

const compose = read('docker-compose.yml');
warn(compose.includes('THEIA_BASE_IMAGE:'), 'compose build arg missing');
warn(compose.includes('theiaide/theia:latest'), 'compose default runtime fallback missing');
assert(compose.includes('AI_API_URL:'), 'AI_API_URL env missing');
assert(compose.includes('AI_API_KEY:'), 'AI_API_KEY env missing');

const pkg = JSON.parse(read('theia-app/package.json'));
assert(pkg?.scripts?.build === 'theia build', 'Unexpected build script in package.json');
assert(pkg?.dependencies?.['@theia/navigator'], 'Missing @theia/navigator dependency');
assert(pkg?.dependencies?.['@theia/terminal'], 'Missing @theia/terminal dependency');
assert(pkg?.dependencies?.['@theia/git'], 'Missing @theia/git dependency');
assert(pkg?.dependencies?.['@theia/search-in-workspace'], 'Missing @theia/search-in-workspace dependency');
assert(pkg?.dependencies?.['@theia/markers'], 'Missing @theia/markers dependency for Problems view');
assert(pkg?.dependencies?.['@theia/output'], 'Missing @theia/output dependency');
assert(pkg?.dependencies?.['@theia/task'], 'Missing @theia/task dependency');
assert(pkg?.dependencies?.['@theia/filesystem'], 'Missing @theia/filesystem dependency');
assert(pkg?.dependencies?.['@theia/workspace'], 'Missing @theia/workspace dependency');
assert(pkg?.dependencies?.['@theia/monaco'], 'Missing @theia/monaco dependency');
assert(pkg?.dependencies?.['@theia/application-package'], 'Missing @theia/application-package dependency');
assert(pkg?.devDependencies?.['@theia/cli'], 'Missing @theia/cli dev dependency');

console.log('verify_logic.js: all static checks passed');
