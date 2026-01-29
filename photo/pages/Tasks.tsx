
import React, { useState, useEffect } from 'react';
import { ALL_TASKS_CONFIG } from '../constants';
import { UserProfile, DailyTask } from '../types';

const Tasks: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    const loadTaskData = () => {
      const user = JSON.parse(localStorage.getItem('ai-user-profile') || '{}');
      setProfile(user);

      const today = new Date().toISOString().split('T')[0];
      const weekId = getWeekNumber(new Date()); // 获取当前周ID
      
      const taskData = JSON.parse(localStorage.getItem(`ai-tasks-${today}`) || '{}');
      const weeklyTaskData = JSON.parse(localStorage.getItem(`ai-tasks-weekly-${weekId}`) || '{}');

      const currentTasks = ALL_TASKS_CONFIG.map(config => ({
        ...config,
        current: config.type === 'daily' ? (taskData[config.id] || 0) : (weeklyTaskData[config.id] || 0)
      }));
      setTasks(currentTasks);
    };

    loadTaskData();
    const interval = setInterval(loadTaskData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${weekNo}`;
  };

  const filteredTasks = tasks.filter(t => t.type === activeTab);

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span>Rewards & Tasks</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              任务<span className="text-amber-500">中心</span>
            </h1>
            <p className="mt-4 text-gray-400 font-medium max-w-lg">
              完成日常或周期任务，积累贡献值，免费解锁顶级限定写真模版。
            </p>
          </div>
          <div className="bg-amber-500 text-white p-6 rounded-[2rem] shadow-xl shadow-amber-100 flex items-center space-x-6">
             <div>
                <p className="text-[10px] font-black uppercase opacity-60">当前贡献值</p>
                <p className="text-4xl font-black">{profile?.points || 0}</p>
             </div>
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">💎</div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 mt-12">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
           <div className="inline-flex p-1.5 bg-gray-100 rounded-[1.5rem] border border-gray-200 shadow-inner">
              <button 
                onClick={() => setActiveTab('daily')}
                className={`px-8 py-3 rounded-[1.2rem] font-black text-xs transition-all ${activeTab === 'daily' ? 'bg-white text-amber-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                每日任务
              </button>
              <button 
                onClick={() => setActiveTab('weekly')}
                className={`px-8 py-3 rounded-[1.2rem] font-black text-xs transition-all ${activeTab === 'weekly' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                每周精选
              </button>
           </div>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div key={task.id} className={`bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all ${activeTab === 'daily' ? 'hover:border-amber-200' : 'hover:border-indigo-200'}`}>
               <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 ${activeTab === 'weekly' ? 'shadow-inner' : ''}`}>
                    {task.icon}
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-gray-900">{task.title}</h3>
                     <p className="text-xs text-gray-400 font-medium mb-1 mt-0.5">{task.description}</p>
                     <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black ${activeTab === 'daily' ? 'text-amber-600' : 'text-indigo-600'}`}>+{task.points} 贡献值</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-400 text-[10px] font-bold">上限 {task.limit} 次/{activeTab === 'daily' ? '日' : '周'}</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-col items-end space-y-2 min-w-[120px]">
                  <div className="flex items-center space-x-3">
                     <span className={`text-sm font-black ${task.current >= task.limit ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {task.current} / {task.limit}
                     </span>
                     {task.current >= task.limit && (
                       <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       </div>
                     )}
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                     <div 
                        className={`h-full transition-all duration-1000 ${task.current >= task.limit ? 'bg-emerald-500' : (activeTab === 'daily' ? 'bg-amber-400' : 'bg-indigo-600')}`}
                        style={{ width: `${Math.min(100, (task.current / task.limit) * 100)}%` }}
                     />
                  </div>
               </div>
            </div>
          )) : (
            <div className="py-20 text-center">
               <p className="text-gray-300 font-black italic">暂无任务数据</p>
            </div>
          )}
        </div>

        <div className={`rounded-[3rem] p-10 mt-12 text-white relative overflow-hidden transition-colors ${activeTab === 'daily' ? 'bg-indigo-600' : 'bg-slate-900'}`}>
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 tracking-tight">积分兑换规则</h3>
              <ul className="space-y-4 opacity-80 text-sm font-medium">
                 <li className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${activeTab === 'daily' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                    <span>限定模版一经解锁，永久拥有，不限生成次数。</span>
                 </li>
                 <li className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${activeTab === 'daily' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                    <span>每日 0 点重置每日任务；每周一 0 点重置每周任务。</span>
                 </li>
                 <li className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${activeTab === 'daily' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                    <span>贡献值无法兑换现金，仅用于站内模版及高级功能兑换。</span>
                 </li>
              </ul>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </main>
    </div>
  );
};

export default Tasks;
