import { MessageChannel } from 'node:worker_threads';

export const shutdownSignals = ['SIGINT', 'SIGTERM'] as const;

export type ShutdownSignal = (typeof shutdownSignals)[number];

export interface WorkerLogger {
  info(message: string): void;
}

export interface WorkerRuntime {
  stop(signal?: ShutdownSignal): Promise<void>;
  stopped: Promise<void>;
}

export function startWorker(logger: WorkerLogger = console): WorkerRuntime {
  const keepAlive = new MessageChannel();
  keepAlive.port1.on('message', () => undefined);

  let resolveStopped!: () => void;
  const stopped = new Promise<void>((resolve) => {
    resolveStopped = resolve;
  });

  let stopping = false;

  const handlers = {
    SIGINT: () => {
      void stop('SIGINT');
    },
    SIGTERM: () => {
      void stop('SIGTERM');
    },
  } satisfies Record<ShutdownSignal, () => void>;

  function stop(signal: ShutdownSignal = 'SIGTERM'): Promise<void> {
    if (stopping) {
      return stopped;
    }

    stopping = true;

    for (const signalName of shutdownSignals) {
      process.off(signalName, handlers[signalName]);
    }

    keepAlive.port1.close();
    keepAlive.port2.close();

    logger.info(`Worker stopped after ${signal}.`);
    resolveStopped();

    return stopped;
  }

  for (const signal of shutdownSignals) {
    process.once(signal, handlers[signal]);
  }

  logger.info('Worker started.');

  return {
    stop,
    stopped,
  };
}
