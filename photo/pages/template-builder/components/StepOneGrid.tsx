
import React from 'react';
import { Template } from '../../../types';

interface StepOneGridProps {
  userTemplates: Template[];
  selectedTemplateIds: string[];
  toggleTemplateSelection: (id: string) => void;
  onNext: () => void;
  setMode: (mode: 'single' | 'grid') => void;
}

const StepOneGrid: React.FC<StepOneGridProps> = ({
  userTemplates,
  selectedTemplateIds,
  toggleTemplateSelection,
  onNext,
  setMode
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">选择你的单张模版 ({selectedTemplateIds.length}/9)</h2>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-bold text-gray-400">请选择 4 张或 9 张</span>
          <button 
            onClick={onNext}
            disabled={selectedTemplateIds.length !== 4 && selectedTemplateIds.length !== 9}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${selectedTemplateIds.length === 4 || selectedTemplateIds.length === 9 ? 'bg-indigo-600 text-white shadow-lg hover:scale-105' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            下一步：完善信息
          </button>
        </div>
      </div>

      {userTemplates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userTemplates.map(t => (
            <div 
              key={t.id}
              onClick={() => toggleTemplateSelection(t.id)}
              className={`relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${selectedTemplateIds.includes(t.id) ? 'border-indigo-600 scale-95' : 'border-transparent hover:border-gray-200'}`}
            >
              <img src={t.coverImage} className="w-full h-full object-cover" alt={t.title} />
              <div className={`absolute inset-0 bg-indigo-600/20 flex items-center justify-center transition-opacity ${selectedTemplateIds.includes(t.id) ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg">
                  <span className="font-black text-sm">{selectedTemplateIds.indexOf(t.id) + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">你还没有制作过单张模版</p>
          <button 
            onClick={() => setMode('single')}
            className="mt-4 text-indigo-600 font-black hover:underline"
          >
            去制作第一张模版
          </button>
        </div>
      )}
    </div>
  );
};

export default StepOneGrid;
