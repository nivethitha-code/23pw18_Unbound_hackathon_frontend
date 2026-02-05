import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

export function RunViewer() {
    const { runId } = useParams();
    const [run, setRun] = useState(null);
    const [workflow, setWorkflow] = useState(null);

    useEffect(() => {
        fetchRun();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('workflow_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'workflow_runs',
                    filter: `id=eq.${runId}`,
                },
                (payload) => {
                    setRun(payload.new);
                    if (payload.new.status === 'completed') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [runId]);

    const fetchRun = async () => {
        const res = await fetch(`http://localhost:8000/run/${runId}`);
        if (res.ok) {
            const data = await res.json();
            setRun(data);
            // Fetch workflow details too for step names or validation
            // In a real app we'd likely join this or fetch separately
        }
    };

    if (!run) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Execution Status</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium capitalize",
                            run.status === 'completed' ? "bg-green-100 text-green-700" :
                                run.status === 'failed' ? "bg-red-100 text-red-700" :
                                    "bg-blue-100 text-blue-700"
                        )}>
                            {run.status}
                        </span>
                        <span className="text-gray-500 text-sm">ID: {run.id.slice(0, 8)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800 z-0" />

                {/* Steps Display - Logic to merge definition with results is implicit for now, 
              assuming steps_results contains enough info or we map by index 
          */}
                {run.steps_results?.map((result, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative z-10 pl-14"
                    >
                        <div className={cn(
                            "absolute left-2 top-2 w-8 h-8 rounded-full border-4 border-gray-50 dark:border-gray-950 flex items-center justify-center transition-colors",
                            result.status === 'completed' ? "bg-green-500 text-white" :
                                result.status === 'running' ? "bg-blue-500 text-white animate-pulse" :
                                    result.status === 'failed' ? "bg-red-500 text-white" :
                                        "bg-gray-200 dark:bg-gray-800 text-gray-500"
                        )}>
                            {result.status === 'completed' && <CheckCircle2 size={16} />}
                            {result.status === 'running' && <Loader2 size={16} className="animate-spin" />}
                            {result.status === 'failed' && <XCircle size={16} />}
                            {result.status === 'pending' && <Circle size={16} />}
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-semibold">Step {index + 1}</h3>
                                {result.retries_used > 0 && (
                                    <span className="text-xs text-orange-500 font-medium">{result.retries_used} Retries</span>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-black/20 font-mono text-sm space-y-3">
                                {result.input_context && (
                                    <div className="text-gray-500 truncate">
                                        <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block mb-1">Input Context</span>
                                        {result.input_context.slice(0, 100)}...
                                    </div>
                                )}

                                {result.output ? (
                                    <div>
                                        <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block mb-1">Output</span>
                                        <div className="whitespace-pre-wrap">{result.output}</div>
                                    </div>
                                ) : result.error ? (
                                    <div className="text-red-500">
                                        <span className="hidden">Error: </span>
                                        {result.error}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic">Waiting to execute...</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
