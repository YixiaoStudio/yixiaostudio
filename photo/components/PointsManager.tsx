// src/components/PointsManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// 定义积分相关的类型接口（保留原有）
export interface PointsProfile {
  points: number;
  credits: number;
  crystalRoses?: number;
  lastRoseClaimDate?: string;
  lastCreditsClaimDate?: string;
  isPlusMember?: boolean;
}

// 🔥 扩展Props接口：新增deductRose方法（核心修改）
interface PointsManagerProps {
  // 原有Props保留
  onProfileUpdate?: (updatedProfile: Partial<PointsProfile>) => void;
  // 新增：接收后端数据（核心逻辑修改）
  profile: PointsProfile;
  profileLoading: boolean;
  // 新增：接收后端操作方法
  claimCredits: () => Promise<void>;
  claimRose: () => Promise<void>;
  deductCredits: (num?: number) => Promise<boolean>;
  // 🔥 新增：扣减玫瑰的方法（九宫格专用）
  deductRose: () => Promise<boolean>;
}

// 🔥 接收新增的deductRose props
const PointsManager: React.FC<PointsManagerProps> = ({ 
  onProfileUpdate,
  profile, // 后端数据
  profileLoading, // 加载状态
  claimCredits, // 后端领取积分方法
  claimRose, // 后端领取玫瑰方法
  deductCredits, // 后端扣减积分方法
  deductRose // 🔥 新增：接收扣减玫瑰方法
}) => {
  // 🔥 核心修改：数据源从localStorage改为后端profile，变量名保留localProfile（避免改样式逻辑）
  const [localProfile, setLocalProfile] = useState<PointsProfile>(() => {
    // 优先使用后端数据，无后端数据时用本地默认值（兼容未登录）
    return profile || { points: 0, credits: 0, crystalRoses: 0, isPlusMember: false };
  });

  // 🔥 核心修改：监听后端profile变化，实时同步（替代原localStorage监听）
  useEffect(() => {
    if (profile && !profileLoading) {
      setLocalProfile(profile);
    }
    // 保留原有定时检查逻辑（兜底同步）
    const interval = setInterval(() => {
      if (profile && !profileLoading) {
        setLocalProfile(profile);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [profile, profileLoading]);

  // 保留原有方法：获取今日日期（样式/逻辑不动）
  const getTodayDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // 保留原有方法：判断是否可领取今日玫瑰（逻辑不动，仅数据源变）
  const canClaimRose = (): boolean => {
    return localProfile.lastRoseClaimDate !== getTodayDate();
  };

  // 保留原有方法：判断是否可领取今日积分点（逻辑不动，仅数据源变）
  const canClaimCredits = (): boolean => {
    return (localProfile.lastCreditsClaimDate || localProfile.lastPointsClaimDate) !== getTodayDate();
  };

  // 🔥 核心修改：更新profile改为调用后端方法（保留原有onProfileUpdate）
  const updateProfile = (updatedData: Partial<PointsProfile>) => {
    const newProfile = { ...localProfile, ...updatedData };
    setLocalProfile(newProfile);
    // 通知外部（保留原有逻辑）
    if (onProfileUpdate) {
      onProfileUpdate(newProfile);
    }
  };

  // 🔥 核心修改：领取每日水晶玫瑰改为调用后端方法（样式/提示语完全不动）
  const claimDailyRose = async () => {
    const today = getTodayDate();
    if (localProfile.lastRoseClaimDate === today) {
      alert('今日水晶玫瑰已领取，明天再来吧！');
      return;
    }
    
    // 调用后端领取玫瑰接口
    await claimRose();
    // 无需本地计算，后端会返回最新数据，useEffect会自动同步
    
    // 保留原有提示语（样式/文案不动）
    const tipMsg = localProfile.crystalRoses === 0 
      ? '领取成功！获得1个水晶玫瑰🌹' 
      : `今日玫瑰已领取，当前玫瑰(${localProfile.crystalRoses})已达上限，无需补充🌹`;
    alert(tipMsg);
  };

  // 🔥 核心修改：领取每日积分点改为调用后端方法（样式/提示语完全不动）
  const claimDailyCredits = async () => {
    const today = getTodayDate();
    if ((localProfile.lastCreditsClaimDate || localProfile.lastPointsClaimDate) === today) {
      alert('今日积分点已领取，明天再来吧！');
      return;
    }
    
    // 调用后端领取积分接口
    await claimCredits();
    // 无需本地计算，后端会返回最新数据，useEffect会自动同步
    
    // 保留原有提示语（样式/文案不动）
    const tipMsg = localProfile.credits < 10 
      ? `领取成功！积分点已补至10个✨` 
      : `今日积分已领取，当前积分(${localProfile.credits})已达上限，无需补充✨`;
    alert(tipMsg);
  };

  // 🔥 核心修改：修正扣减逻辑，新增deductRose调用（九宫格扣玫瑰）
  const deductForGeneration = useCallback(async (type: 'single' | 'grid'): Promise<{ success: boolean; message: string }> => {
    const currentCredits = localProfile.credits || 0;
    const currentRoses = localProfile.crystalRoses || 0;
    const isPlus = localProfile.isPlusMember || false;

    // 1. 单张生成：扣1个积分点（逻辑/提示语不动，调用后端deductCredits）
    if (type === 'single') {
      if (currentCredits < 1) {
        return { success: false, message: '积分点不足！生成单张需要1个积分点。' };
      }
      // 调用后端扣减1个积分
      const success = await deductCredits(1);
      if (!success) {
        return { success: false, message: '积分扣减失败，请重试！' };
      }
    }

    // 2. 九宫格生成：优先扣玫瑰（核心修正，替换原deductCredits(0)）
    if (type === 'grid') {
      // 优先扣玫瑰（1朵=1次九宫格）
      if (currentRoses >= 1) {
        // 🔥 核心修改：调用deductRose方法扣减玫瑰，而非deductCredits(0)
        const success = await deductRose();
        if (!success) {
          return { success: false, message: '玫瑰扣减失败，请重试！' };
        }
      } else {
        // 玫瑰为0时检查PLUS会员（逻辑不动）
        if (!isPlus) {
          return { 
            success: false, 
            message: '水晶玫瑰不足且非PLUS会员！无法生成九宫格（1朵玫瑰可免费生成1次九宫格，或开通PLUS会员使用9积分点生成）。' 
          };
        }
        // PLUS会员：扣9个积分点
        if (currentCredits < 9) {
          return { success: false, message: '积分点不足！PLUS会员生成九宫格需要9个积分点。' };
        }
        // 调用后端扣减9个积分
        const success = await deductCredits(9);
        if (!success) {
          return { success: false, message: '积分扣减失败，请重试！' };
        }
      }
    }

    // 返回成功提示（文案/样式不动）
    const successMsg = type === 'single' 
      ? '已扣1个积分点，生成成功！' 
      : (currentRoses >= 1 ? '已使用1朵水晶玫瑰，九宫格生成成功！' : '已扣9个积分点，九宫格生成成功！');
    return { success: true, message: successMsg };
  }, [localProfile, deductCredits, deductRose]); // 🔥 新增deductRose依赖

  // 🔥 以下JSX结构、className、样式、交互完全保留，无任何修改！
  return (
    <div className="flex items-center space-x-1.5">
      {/* 积分点按钮 - 含每日领取功能 */}
      <div className="relative">
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent rounded-full shadow-sm transition-all hover:scale-105 hover:bg-gray-50 group"
        >
          <div
            title="积分点"
            className="flex items-center gap-1 text-indigo-600 select-none focus:outline-none outline-none"
          >
            <span className="text-sm leading-none">✨</span>
            <span className="text-xs font-black tabular-nums">
              {localProfile.credits || 0}
            </span>
          </div>
        </Link>
        
        {/* 每日领取积分点按钮（仅当天未领取时显示） */}
        {canClaimCredits() && (
          <button
            onClick={claimDailyCredits}
            className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-md hover:bg-green-600 transition-colors"
            title="领取今日10积分点"
          >
            +
          </button>
        )}
      </div>

      {/* 水晶玫瑰按钮 - 含每日领取功能 */}
      <div className="relative">
        <div
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent rounded-full shadow-sm transition-all hover:scale-105 hover:bg-gray-50 group cursor-default"
        >
          <div
            title="水晶玫瑰：1 朵 = 1 次九宫格"
            className="flex items-center gap-1 text-pink-500 select-none focus:outline-none ring-0"
          >
            <span className="text-sm leading-none">🌹</span>
            <span className="text-xs font-black tabular-nums">
              {localProfile.crystalRoses || 0}
            </span>
          </div>
        </div>
        
        {/* 每日领取玫瑰按钮（仅当天未领取时显示） */}
        {canClaimRose() && (
          <button
            onClick={claimDailyRose}
            className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-md hover:bg-pink-600 transition-colors"
            title="领取今日1水晶玫瑰"
          >
            +
          </button>
        )}
      </div>

      {/* 金级贡献值按钮 - 点击跳转任务中心 */}
      <Link
        to="/tasks"
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 shadow-sm transition-all hover:scale-105 hover:bg-amber-100 group"
      >
        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-inner group-hover:animate-bounce">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[7px] font-black text-amber-500 uppercase">Points</span>
          <span className="text-amber-700 text-[11px] font-black tabular-nums">{localProfile.points || 0}</span>
        </div>
      </Link>
    </div>
  );
};

export default PointsManager;