import React from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const DemoNoticeBanner: React.FC = () => {
  const { resetToDemoData } = useStore();

  return (
    <aside aria-label="Demo mode notice" className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong className="font-semibold">Demonstration Mode:</strong> Sample retail data for preview & evaluation. All changes are stored in local session.
          </span>
        </div>
        <button
          onClick={resetToDemoData}
          className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 underline underline-offset-2 transition-colors ml-auto"
          title="Reset store data to initial demonstration state"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Demo Data
        </button>
      </div>
    </aside>
  );
};
