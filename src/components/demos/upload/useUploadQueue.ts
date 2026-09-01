import { useCallback, useEffect, useRef, useState } from "react";

export type UploadStatus =
  | "waiting"
  | "uploading"
  | "success"
  | "error"
  | "cancelled";

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  abortController?: AbortController;
  url?: string;
}

function simulateUpload(
  task: UploadTask,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    let progress = 0;
    let timer: ReturnType<typeof setTimeout>;

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener("abort", onAbort, { once: true });

    const tick = () => {
      progress = Math.min(progress + Math.floor(Math.random() * 11) + 5, 100);
      onProgress(progress);

      if (progress === 100) {
        signal.removeEventListener("abort", onAbort);
        resolve();
        return;
      }

      timer = setTimeout(tick, Math.floor(Math.random() * 400) + 200);
    };

    timer = setTimeout(tick, 100);
  });
}

export function useUploadQueue(concurrency = 3) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const tasksRef = useRef(tasks);
  const activeIdsRef = useRef(new Set<string>());

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const runTask = useCallback(async (task: UploadTask) => {
    const controller = new AbortController();
    activeIdsRef.current.add(task.id);
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status: "uploading", abortController: controller }
          : item,
      ),
    );

    try {
      await simulateUpload(task, controller.signal, (progress) => {
        setTasks((current) =>
          current.map((item) =>
            item.id === task.id ? { ...item, progress } : item,
          ),
        );
      });
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, status: "success", progress: 100 }
            : item,
        ),
      );
    } catch (error) {
      const cancelled =
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError");
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, status: cancelled ? "cancelled" : "error" }
            : item,
        ),
      );
    } finally {
      activeIdsRef.current.delete(task.id);
    }
  }, []);

  useEffect(() => {
    const available = concurrency - activeIdsRef.current.size;
    if (available <= 0) return;

    tasks
      .filter(
        (task) =>
          task.status === "waiting" && !activeIdsRef.current.has(task.id),
      )
      .slice(0, available)
      .forEach((task) => void runTask(task));
  }, [concurrency, runTask, tasks]);

  useEffect(
    () => () => {
      tasksRef.current.forEach((task) => task.abortController?.abort());
    },
    [],
  );

  const addFiles = useCallback((files: File[]) => {
    const newTasks: UploadTask[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "waiting",
    }));
    setTasks((current) => [...current, ...newTasks]);
  }, []);

  const cancelFile = useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id || !["waiting", "uploading"].includes(task.status)) {
          return task;
        }
        task.abortController?.abort();
        return { ...task, status: "cancelled" };
      }),
    );
  }, []);

  const cancelAll = useCallback(() => {
    setTasks((current) =>
      current.map((task) => {
        if (!["waiting", "uploading"].includes(task.status)) return task;
        task.abortController?.abort();
        return { ...task, status: "cancelled" };
      }),
    );
  }, []);

  const clearRecords = useCallback(() => {
    setTasks((current) =>
      current.filter((task) => ["waiting", "uploading"].includes(task.status)),
    );
  }, []);

  return {
    tasks,
    addFiles,
    cancelFile,
    cancelAll,
    clearRecords,
    isMockMode: true,
  };
}
