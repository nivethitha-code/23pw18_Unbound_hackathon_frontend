import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MODELS = [
    { id: 'kimi-k2p5', name: 'Kimi K2P5', cost: 'Low' },
    { id: 'kimi-k2-instruct-0905', name: 'Kimi Instruct', cost: 'High' }
];

export function WorkflowEditor() {
    const navigate = useNavigate();
    const [name, setName] = useState('New Workflow');
    const [steps, setSteps] = useState([
        { id: 1, model: 'kimi-k2p5', prompt: '', criteria: { type: 'contains', value: '' } }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const addStep = () => {
        setSteps([
            ...steps,
            { id: Date.now(), model: 'kimi-k2p5', prompt: '', criteria: { type: 'contains', value: '' } }
        ]);
    };

    const removeStep = (id) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const updateStep = (id, field, value) => {
        setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const updateCriteria = (id, field, value) => {
        setSteps(steps.map(s => s.id === id ? { ...s, criteria: { ...s.criteria, [field]: value } } : s));
    };

    const handleSaveAndRun = async () => {
        setIsSaving(true);
        try {
            // 1. Create Workflow
            const formattedSteps = steps.map((s, index) => ({
                order: index,
                prompt_template: s.prompt,
                model: s.model,
                retry_limit: 3,
                completion_criteria: {
                    type: s.criteria.type,
                    value: s.criteria.value,
                    instruction: s.criteria.type === 'llm_judge' ? s.criteria.value : undefined
                }
            }));

            const response = await fetch('http://localhost:8000/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, steps: formattedSteps })
            });

            if (!response.ok) throw new Error('Failed to save');
            const workflow = await response.json();

            // 2. Run Workflow
            const runRes = await fetch(`http://localhost:8000/run/${workflow.id}`, {
                method: 'POST'
            });
            const run = await runRes.json();

            // 3. Navigate to Run View
            navigate(`/run/${run.run_id}`);
        } catch (e) {
            console.error(e);
            alert('Error saving workflow');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 w-full"
                    placeholder="Workflow Name"
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAndRun}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                    {isSaving ? 'Starting...' : <> <Play size={20} /> Save & Run </>}
                </motion.button>
            </div>

            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-8 top-full h-6 w-0.5 bg-gray-200 dark:bg-gray-800 z-0" />
                            )}

                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative z-10 transition-colors hover:border-blue-500/30">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                                            {index + 1}
                                        </div>
                                        <h3 className="font-semibold text-lg">Step {index + 1}</h3>
                                    </div>
                                    <button onClick={() => removeStep(step.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Model</label>
                                            <select
                                                value={step.model}
                                                onChange={(e) => updateStep(step.id, 'model', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                            >
                                                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Prompt Template</label>
                                            <textarea
                                                value={step.prompt}
                                                onChange={(e) => updateStep(step.id, 'prompt', e.target.value)}
                                                placeholder="Use {{context}} to insert previous output"
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Tip: Type <code>{'{{context}}'}</code> to use input from previous step.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-l border-gray-100 dark:border-gray-800 pl-6">
                                        <label className="block text-sm font-medium text-gray-500">Completion Criteria</label>
                                        <div className="space-y-3">
                                            <select
                                                value={step.criteria.type}
                                                onChange={(e) => updateCriteria(step.id, 'type', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="contains">Contains Text</option>
                                                <option value="json_valid">Valid JSON</option>
                                                <option value="llm_judge">LLM Judge (AI Check)</option>
                                            </select>

                                            {step.criteria.type !== 'json_valid' && (
                                                <input
                                                    value={step.criteria.value}
                                                    onChange={(e) => updateCriteria(step.id, 'value', e.target.value)}
                                                    placeholder={step.criteria.type === 'contains' ? 'Text to match...' : 'Describe what counts as success...'}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addStep}
                    className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all font-medium"
                >
                    <Plus size={20} /> Add Step
                </motion.button>
            </div>
        </div>
    );
}
