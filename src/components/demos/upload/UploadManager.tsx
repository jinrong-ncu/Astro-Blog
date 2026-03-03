import React, { useCallback, useRef } from 'react';
import { useUploadQueue } from './useUploadQueue';
import { UploadCloud, CheckCircle2, XCircle, AlertCircle, Loader2, X, Trash2, StopCircle } from 'lucide-react';

function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function UploadManager() {

    const { tasks, addFiles, cancelFile, cancelAll, clearRecords, isMockMode } = useUploadQueue(3);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files));
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    }, [addFiles]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-sans">
            {/* 顶部状态栏 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">上传管理</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">最大支持同时并发上传 3 个文件</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isMockMode ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20">
                            模拟模式
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
                            生产模式
                        </span>
                    )}
                </div>
            </div>

            {/* 拖拽上传区域 */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative group border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl p-8 text-center transition-all bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer overflow-hidden mb-4"
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <UploadCloud className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors mb-3" />
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">点击此处或拖拽文件到此区域上传</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">单文件大小不超过 150MB</p>
            </div>

            {/* 操作按钮与任务列表 */}
            {tasks.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm border-b border-transparent font-medium text-zinc-900 dark:text-zinc-100">上传队列 ({tasks.length})</h3>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelAll}
                                className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-1.5 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                            >
                                <StopCircle className="w-3.5 h-3.5" /> 取消全部
                            </button>
                            <button
                                onClick={clearRecords}
                                className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> 清除记录
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {tasks.map(task => (
                            <div key={task.id} className="group relative flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">

                                {/* 背景进度填充条 */}
                                {task.status === 'uploading' && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 bg-blue-50 dark:bg-blue-500/5 transition-all duration-300 ease-out z-0"
                                        style={{ width: `${task.progress}%` }}
                                    />
                                )}

                                <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
                                    <div className="shrink-0">
                                        {task.status === 'waiting' && <Loader2 className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />}
                                        {task.status === 'uploading' && <Loader2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 animate-spin" />}
                                        {task.status === 'success' && <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />}
                                        {task.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                        {task.status === 'cancelled' && <XCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />}
                                    </div>

                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{task.file.name}</p>
                                                {task.url && (task.status === 'success') && (
                                                    <a
                                                        href={task.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Link
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">{formatSize(task.file.size)}</span>

                                                {/* 状态文字 */}
                                                <span className={`text-xs capitalize ${task.status === 'success' ? 'text-zinc-900 dark:text-zinc-100 font-medium' :
                                                    task.status === 'error' ? 'text-red-600 dark:text-red-400 font-medium' :
                                                        task.status === 'cancelled' ? 'text-zinc-500 dark:text-zinc-500' :
                                                            task.status === 'waiting' ? 'text-zinc-500 dark:text-zinc-400' :
                                                                'text-zinc-900 dark:text-zinc-100'
                                                    }`}>
                                                    {task.status === 'uploading' ? '上传中' :
                                                        task.status === 'success' ? '已完成' :
                                                            task.status === 'cancelled' ? '已取消' :
                                                                task.status === 'error' ? '失败' :
                                                                    '排队中'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 进度条（仅在上传中或等待时显示） */}
                                        {(task.status === 'uploading' || task.status === 'waiting') && (
                                            <div className="w-24 shrink-0 flex items-center gap-3">
                                                <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300 ease-out"
                                                        style={{ width: `${task.status === 'waiting' ? 0 : task.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 w-7 text-right">
                                                    {task.status === 'waiting' ? '0%' : `${task.progress}%`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 取消操作 */}
                                <div className="relative z-10 ml-4 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    {(task.status === 'waiting' || task.status === 'uploading') ? (
                                        <button
                                            onClick={() => cancelFile(task.id)}
                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500/50"
                                            title="取消上传"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="w-7"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
