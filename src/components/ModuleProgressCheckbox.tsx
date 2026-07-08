"use client";
import { useProgress } from './ProgressContext';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ModuleProgressCheckbox({ slug }: { slug: string }) {
  const { isCompleted, toggleModule } = useProgress();
  const completed = isCompleted(slug);

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 dark:bg-white/5 rounded-xl p-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Module Completed?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Mark this module as finished to update your progress.</p>
      </div>
      <button
        onClick={() => toggleModule(slug)}
        className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
          completed 
            ? 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 shadow-sm dark:shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
            : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm dark:shadow-none'
        }`}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Completed</span>
          </>
        ) : (
          <>
            <Circle className="w-5 h-5" />
            <span>Mark as Done</span>
          </>
        )}
      </button>
    </div>
  );
}
