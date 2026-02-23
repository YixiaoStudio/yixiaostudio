
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  step: number;
  mode: 'single' | 'grid';
  setMode: (mode: 'single' | 'grid') => void;
}

const Header: React.FC<HeaderProps> = ({ step, mode, setMode }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">制作我的模版</h1>
        <p className="text-gray-500 mt-2">
          {step === 1 ? '第一步：构思并测试你的 AI 风格' : '第二步：完善信息并发布到社区'}
        </p>
      </div>
      
      {step === 1 && (
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button 
            onClick={() => setMode('single')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'single' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            单张模版
          </button>
          <button 
            onClick={() => setMode('grid')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            宫格模版
          </button>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 mr-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>1</div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          取消返回
        </button>
      </div>
    </div>
  );
};

export default Header;
