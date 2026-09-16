import { rmSync } from 'node:fs';
// Only the dedicated test database is ever removed; never use environment URLs here.
for (const suffix of ['', '-wal', '-shm', '-journal']) {
  rmSync(new URL('../test.db' + suffix, import.meta.url), { force: true });
}
