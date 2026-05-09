#!/usr/bin/env node
// If node_modules/autoblogger is a symlink (left over from a previous
// dev:tunnel run that linked ../autoblogger), replace it with the proper
// bun-installed version per bun.lock. No-op when already installed.

import { lstatSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const path = 'node_modules/autoblogger'

let isSymlink = false
try {
  isSymlink = lstatSync(path).isSymbolicLink()
} catch {
  // Doesn't exist — treat as needing install.
  isSymlink = true
}

if (isSymlink) {
  console.log('[autoblogger] symlink detected — restoring GitHub-installed version...')
  rmSync(path, { recursive: true, force: true })
  const r = spawnSync('bun', ['install'], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
