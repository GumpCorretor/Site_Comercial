import { startWorkerProcess } from './start-worker-process.js';

try {
  startWorkerProcess();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
