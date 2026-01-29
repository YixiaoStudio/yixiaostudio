import React, { useState, useEffect, useRef } from 'react';

// 补充完整的UserProfile类型定义（包含新增的gender字段）
interface UserProfile {
  userName: string;
  avatar: string;
  bio: string;
  isPublic: boolean;
  joinDate: string;
  points: number;
  credits: number;
  isPlus: boolean;
  unlockedTemplates: any[];
  visitedLocations: any[];
  gender: 'male' | 'female'; // 新增性别字段
}

// 定义男女默认头像URL
const DEFAULT_AVATARS = {
  male: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/male-avatar.png',    // 男性默认头像
  female: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/female-avatar.png'  // 女性默认头像
};

// Fixed Error: Property 'isPlus' is missing in type DEFAULT_PROFILE.
// 新增gender字段，并设置默认性别为male，对应男性默认头像
const DEFAULT_PROFILE: UserProfile = {
  userName: '次元造像师',
  avatar: DEFAULT_AVATARS.male, // 使用男性默认头像
  bio: '在这个数字时代，用 AI 记录每一瞬间的美丽。',
  isPublic: true,
  joinDate: new Date().toISOString(),
  points: 100,
  credits: 50,
  isPlus: false,
  unlockedTemplates: [],
  visitedLocations: [],
  gender: 'male' // 默认性别为男
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 记录初始默认头像（用于判断是否是自定义头像）
  const defaultAvatarsRef = useRef(DEFAULT_AVATARS);

  useEffect(() => {
    const saved = localStorage.getItem('ai-user-profile');
    if (saved) {
      const savedProfile = JSON.parse(saved);
      // 兼容旧数据：如果没有gender字段，设置默认值并更新默认头像
      if (!savedProfile.gender) {
        savedProfile.gender = 'male';
        savedProfile.avatar = DEFAULT_AVATARS.male;
      }
      setProfile(savedProfile);
    }
  }, []);

  // 处理性别切换逻辑
  const handleGenderChange = (newGender: 'male' | 'female') => {
    setProfile(prev => {
      // 判断当前头像是否是默认头像（如果是则切换对应性别头像，否则保留自定义头像）
      const isDefaultAvatar = Object.values(defaultAvatarsRef.current).includes(prev.avatar);
      return {
        ...prev,
        gender: newGender,
        // 只有默认头像时才切换
        avatar: isDefaultAvatar ? defaultAvatarsRef.current[newGender] : prev.avatar
      };
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: url }));
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // 模拟网络延迟
    setTimeout(() => {
      localStorage.setItem('ai-user-profile', JSON.stringify(profile));
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('新密码与确认密码不匹配');
      return;
    }
    alert('密码修改成功！（此为演示）');
    setPasswords({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
            <span>Account Settings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            个人<span className="text-indigo-600">中心</span>
          </h1>
          <p className="mt-4 text-gray-400 font-medium">
            管理您的个人资料、安全设置以及内容偏好。
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 mt-12 grid lg:grid-cols-12 gap-10">
        
        {/* Left Sidebar: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-6" onClick={handleAvatarClick}>
                 <img src={profile.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover transition-transform group-hover:scale-105" alt="profile" />
                 <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                 </div>
                 <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1">{profile.userName}</h3>
              <p className="text-xs text-gray-400 font-medium mb-1">
                {profile.gender === 'male' ? '男' : '女'} | 加入于 {new Date(profile.joinDate).toLocaleDateString()}
              </p>
              
              <div className="w-full pt-6 border-t border-gray-50 flex justify-around">
                 <div className="text-center">
                    <p className="text-sm font-black text-indigo-600">128</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">关注者</p>
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-black text-indigo-600">1.2k</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">获赞</p>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 rounded-[2rem] p-8 text-white">
              <h4 className="font-black text-sm mb-2 uppercase tracking-widest">Premium 会员</h4>
              <p className="text-indigo-100 text-xs mb-6 font-medium">您当前的九宫格生成特权将在 2025-12-01 到期。</p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs">立即续费</button>
           </div>
        </div>

        {/* Right Section: Forms */}
        <div className="lg:col-span-8 space-y-8">
           {/* Basic Info */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center space-x-3">
                 <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                 <span>基础资料</span>
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">用户名</label>
                    <input 
                       type="text" 
                       value={profile.userName} 
                       onChange={e => setProfile(prev => ({...prev, userName: e.target.value}))}
                       className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-400 focus:outline-none transition-all font-bold text-gray-700" 
                    />
                 </div>
                 
                 {/* 新增性别选择区域 */}
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">性别</label>
                    <div className="flex space-x-6">
                       <div className="flex items-center">
                          <input
                             type="radio"
                             id="male"
                             name="gender"
                             value="male"
                             checked={profile.gender === 'male'}
                             onChange={() => handleGenderChange('male')}
                             className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="male" className="ml-2 text-sm font-bold text-gray-700">男</label>
                       </div>
                       <div className="flex items-center">
                          <input
                             type="radio"
                             id="female"
                             name="gender"
                             value="female"
                             checked={profile.gender === 'female'}
                             onChange={() => handleGenderChange('female')}
                             className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="female" className="ml-2 text-sm font-bold text-gray-700">女</label>
                       </div>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">个人简介</label>
                    <textarea 
                       rows={4}
                       value={profile.bio}
                       onChange={e => setProfile(prev => ({...prev, bio: e.target.value}))}
                       placeholder="写点什么介绍一下你自己吧..."
                       className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-400 focus:outline-none transition-all font-medium text-gray-700 resize-none"
                    ></textarea>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl">
                    <div>
                       <p className="text-sm font-black text-indigo-900">公开我的画廊</p>
                       <p className="text-[10px] text-indigo-400 font-bold">开启后，其他用户可以在社区看到您的全部作品。</p>
                    </div>
                    <button 
                       onClick={() => setProfile(prev => ({...prev, isPublic: !prev.isPublic}))}
                       className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${profile.isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${profile.isPublic ? 'translate-x-6' : ''}`} />
                    </button>
                 </div>
              </div>

              <div className="mt-10 flex justify-end">
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center space-x-2"
                 >
                    {isSaving ? (
                       <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>保存中...</span>
                       </>
                    ) : (
                       <span>保存更改</span>
                    )}
                 </button>
              </div>
           </div>

           {/* Password Change */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center space-x-3">
                 <div className="w-2 h-6 bg-rose-500 rounded-full" />
                 <span>安全设置</span>
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">当前密码</label>
                       <input 
                          type="password" 
                          autoComplete="current-password"
                          value={passwords.old}
                          onChange={e => setPasswords(p => ({...p, old: e.target.value}))}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-400 focus:outline-none transition-all" 
                       />
                    </div>
                    <div className="hidden md:block"></div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">新密码</label>
                       <input 
                          type="password" 
                          autoComplete="new-password"
                          value={passwords.new}
                          onChange={e => setPasswords(p => ({...p, new: e.target.value}))}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-400 focus:outline-none transition-all" 
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">确认新密码</label>
                       <input 
                          type="password" 
                          autoComplete="new-password"
                          value={passwords.confirm}
                          onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-400 focus:outline-none transition-all" 
                       />
                    </div>
                 </div>
                 <div className="mt-4">
                    <button type="submit" className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                       无法重置密码？联系人工客服
                    </button>
                 </div>
                 <div className="flex justify-end pt-4">
                    <button className="px-10 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:border-rose-100 hover:text-rose-500 transition-all">
                       更新密码
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-toast-in">
           <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <span className="text-sm font-black">个人资料已成功更新！</span>
           </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          0% { transform: translate(-50%, 100%); opacity: 0; }
          10% { transform: translate(-50%, 0); opacity: 1; }
          90% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, 100%); opacity: 0; }
        }
        .animate-toast-in { animation: toast-in 3s ease-in-out forwards; }
      `}</style>
    </div>
  );
};

export default Profile;