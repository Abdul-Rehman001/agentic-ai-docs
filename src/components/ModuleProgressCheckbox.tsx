"use client";
import { useProgress } from './ProgressContext';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ModuleProgressCheckbox({ slug }: { slug: string }) {
  const { isCompleted, toggleModule } = useProgress();
  const completed = isCompleted(slug);

  return (
    <div className="mt-16 pt-8 border-t border-border flex items-center justify-between bg-white/5 rounded-xl p-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-1">Module Completed?</h3>
        <p className="text-sm text-gray-400">Mark this module as finished to update your progress.</p>
      </div>
      <button
        onClick={() => toggleModule(slug)}
        className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
          completed 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
            : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
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
