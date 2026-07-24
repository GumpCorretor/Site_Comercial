import { parseWorkerEnvironment } from './config/environment.js';
import { startWorker, type WorkerRuntime } from './worker.js';

export type WorkerStarter = () => WorkerRuntime;

export function startWorkerProcess(
  environment: NodeJS.ProcessEnv = process.env,
  workerStarter: WorkerStarter = startWorker,
): WorkerRuntime {
  parseWorkerEnvironment(environment);

  return workerStarter();
}
