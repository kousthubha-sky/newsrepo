import { useCallback, useRef } from 'react';

interface TaskConfig {
  task: () => void;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

class BackgroundTaskScheduler {
  private tasks: Map<string, TaskConfig> = new Map();
  private isProcessing = false;

  schedule(id: string, config: TaskConfig) {
    this.tasks.set(id, config);
    this.processTasks();
  }

  private processTasks() {
    if (this.isProcessing || this.tasks.size === 0) return;
    this.isProcessing = true;

    const processNextTask = () => {
      if (this.tasks.size === 0) {
        this.isProcessing = false;
        return;
      }

      const [id, config] = Array.from(this.tasks.entries())[0];
      this.tasks.delete(id);

      const timeoutDuration = config.timeout || 1000;
      const deadline = performance.now() + timeoutDuration;

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(
          (idleDeadline) => {
            try {
              if (idleDeadline.timeRemaining() > 0 || idleDeadline.didTimeout) {
                config.task();
              } else {
                // Re-schedule if we don't have enough time
                this.tasks.set(id, config);
              }
            } catch (error) {
              console.error('Error in background task:', error);
            }
            processNextTask();
          },
          { timeout: timeoutDuration }
        );
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => {
          try {
            config.task();
          } catch (error) {
            console.error('Error in background task:', error);
          }
          processNextTask();
        }, 0);
      }
    };

    processNextTask();
  }
}

const globalScheduler = new BackgroundTaskScheduler();

export const useBackgroundTask = () => {
  const taskCountRef = useRef(0);

  const scheduleTask = useCallback((config: Omit<TaskConfig, 'id'>) => {
    const taskId = `task_${taskCountRef.current++}`;
    globalScheduler.schedule(taskId, config as TaskConfig);
  }, []);

  return { scheduleTask };
};
