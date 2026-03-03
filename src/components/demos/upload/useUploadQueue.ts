import { useState, useCallback, useEffect, useRef } from 'react';

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// 存储配置，用于真实的 R2/S3 集成
export const STORAGE_CONFIG = {
    accessKeyId: '',     // e.g. 'YOUR_ACCESS_KEY'
    secretAccessKey: '', // e.g. 'YOUR_SECRET_KEY'
    endpoint: '',        // e.g. 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com'
    bucket: '',
    publicDomain: ''
};

// 1. 初始化客户端
const s3Client = new S3Client({
    region: "auto", // R2 必须设为 auto
    endpoint: STORAGE_CONFIG.endpoint,
    credentials: {
        accessKeyId: STORAGE_CONFIG.accessKeyId,
        secretAccessKey: STORAGE_CONFIG.secretAccessKey,
    },
});

export type UploadStatus = 'waiting' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadTask {
    id: string;
    file: File;
    progress: number;
    status: UploadStatus;
    abortController?: AbortController;
    url?: string;
}

export function useUploadQueue(concurrency: number = 3) {
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const activeCountRef = useRef(0);

    // 组件卸载时的清理逻辑
    const tasksRef = useRef(tasks);
    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    useEffect(() => {
        return () => {
            // 在组件卸载时取消所有正在进行的上传，以防止内存泄漏
            tasksRef.current.forEach(task => {
                if (task.status === 'uploading' && task.abortController) {
                    task.abortController.abort();
                }
            });
        };
    }, []);

    const processQueue = useCallback(() => {
        setTasks(prevTasks => {
            const activeTasksCount = prevTasks.filter(t => t.status === 'uploading').length;
            activeCountRef.current = activeTasksCount;

            let availableSlots = concurrency - activeTasksCount;
            if (availableSlots <= 0) return prevTasks;

            const newTasks = [...prevTasks];
            let hasChanges = false;

            for (let i = 0; i < newTasks.length && availableSlots > 0; i++) {
                if (newTasks[i].status === 'waiting') {
                    const controller = new AbortController();
                    newTasks[i] = { ...newTasks[i], status: 'uploading', abortController: controller };
                    availableSlots--;
                    hasChanges = true;

                    // 触发实际的上传，与状态更新解耦
                    uploadFile(newTasks[i], controller.signal);
                }
            }

            return hasChanges ? newTasks : prevTasks;
        });
    }, [concurrency]);

    const uploadFile = async (task: UploadTask, signal: AbortSignal) => {
        try {
            if (STORAGE_CONFIG.accessKeyId && STORAGE_CONFIG.secretAccessKey) {
                // --- 真实 R2/S3 上传逻辑 ---
                const parallelUploads3 = new Upload({
                    client: s3Client,
                    params: {
                        Bucket: STORAGE_CONFIG.bucket,
                        Key: task.file.name, // 实际开发建议加个 uuid 前缀防重名
                        Body: task.file,
                        ContentType: task.file.type,
                    },
                    // // 关键点：绑定中断信号
                    // abortSignal: signal,
                    // // 关键点：实时同步进度条
                    // queueSize: 4,
                    // partSize: 5 * 1024 * 1024, // 5MB 分片
                });

                // 重点：手动监听 signal 的中止事件
                const abortHandler = () => {
                    console.log("正在物理中止 S3 上传...");
                    parallelUploads3.abort(); // 直接调用实例的 abort 方法
                };

                signal.addEventListener('abort', abortHandler);

                // 监听进度
                parallelUploads3.on("httpUploadProgress", (progress) => {
                    const percentage = Math.round((progress.loaded! / progress.total!) * 100);
                    setTasks(prev => prev.map(t =>
                        t.id === task.id ? { ...t, progress: percentage, status: 'uploading' } : t
                    ));
                });

                try {
                    await parallelUploads3.done();
                    // R2 S3 客户端默认返回内部 S3 节点地址，因此我们需要手动拼接公开访问的 URL
                    const publicUrl = `${STORAGE_CONFIG.publicDomain}/${task.file.name}`;
                    if (!signal.aborted) {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'success', progress: 100, url: publicUrl } : t));
                    }
                } catch (err) {
                    // 捕获中止异常
                } finally {
                    // 记得移除监听器，防止内存泄漏
                    signal.removeEventListener('abort', abortHandler);
                }
            } else {
                // Mock upload logic
                await mockUpload(task, signal);
                if (!signal.aborted) {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'success', progress: 100, url: `https://mock.url/${task.file.name}` } : t));
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || signal.aborted) {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'cancelled' } : t));
            } else {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error' } : t));
            }
        } finally {
            // 触发队列去处理下一个文件
            processQueue();
        }
    };

    const mockUpload = (task: UploadTask, signal: AbortSignal) => {
        return new Promise<void>((resolve, reject) => {
            let progress = 0;
            let timer: any;

            const onAbort = () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
            };

            if (signal.aborted) {
                return reject(new DOMException('Aborted', 'AbortError'));
            }
            signal.addEventListener('abort', onAbort);

            const simulateProgress = () => {
                if (progress >= 100) {
                    signal.removeEventListener('abort', onAbort);
                    resolve();
                    return;
                }

                // 随机增加 5 到 15 的进度
                const increment = Math.floor(Math.random() * 10) + 5;
                progress = Math.min(progress + increment, 100);

                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress } : t));

                // 随机延迟 200ms 到 600ms
                const delay = Math.floor(Math.random() * 400) + 200;
                timer = setTimeout(simulateProgress, delay);
            };

            timer = setTimeout(simulateProgress, 100);
        });
    };

    const addFiles = useCallback((files: File[]) => {
        const newTasks: UploadTask[] = files.map(file => ({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'waiting',
        }));

        setTasks(prev => [...prev, ...newTasks]);
    }, []);

    useEffect(() => {
        // 每当任务状态更新时，检查是否可以处理更多队列
        const hasWaiting = tasks.some(t => t.status === 'waiting');
        const activeTasksCount = tasks.filter(t => t.status === 'uploading').length;

        if (hasWaiting && activeTasksCount < concurrency) {
            processQueue();
        }
    }, [tasks, concurrency, processQueue]);

    const cancelFile = useCallback((id: string) => {
        setTasks(prev => {
            const task = prev.find(t => t.id === id);
            if (task?.status === 'uploading' && task.abortController) {
                task.abortController.abort();
            }
            if (task?.status === 'uploading' || task?.status === 'waiting') {
                return prev.map(t => t.id === id ? { ...t, status: 'cancelled' } : t);
            }
            return prev;
        });
    }, []);

    const cancelAll = useCallback(() => {
        setTasks(prev => {
            prev.forEach(task => {
                if (task.status === 'uploading' && task.abortController) {
                    task.abortController.abort();
                }
            });
            return prev.map(t => (t.status === 'uploading' || t.status === 'waiting') ? { ...t, status: 'cancelled' } : t);
        });
    }, []);

    const clearRecords = useCallback(() => {
        setTasks(prev => prev.filter(t => t.status === 'uploading' || t.status === 'waiting'));
    }, []);

    return {
        tasks,
        addFiles,
        cancelFile,
        cancelAll,
        clearRecords,
        isMockMode: !STORAGE_CONFIG.secretAccessKey,
    };
}
