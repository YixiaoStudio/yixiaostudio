import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// 定义积分相关的类型接口（保留原有，补充注释）
export interface PointsProfile {
  points: number;
  credits: number;
  crystalRoses?: number; // 明确支持小数类型
  lastRoseClaimDate?: string;
  lastCreditsClaimDate?: string;
  isPlusMember?: boolean;
}

// 🔥 扩展Props接口：新增claimLoading状态（从Header传递），完善类型定义
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
  // 新增：接收扣减玫瑰的方法（关键修复，补充必选标记）
  deductRose: (num?: number) => Promise<boolean>;
  // 新增：接收领取loading状态（防重复点击）
  claimLoading: { credits: boolean; rose: boolean };
  // 新增：手动刷新数据的方法（核心新增）
  refreshPoints: () => Promise<void>;
}

// 🔥 核心新增：格式化玫瑰数量 - 整数显示为整数，小数保留1位
const formatRoseNumber = (num: number): string | number => {
  if (isNaN(num)) return 0;
  // 先保留1位小数，避免精度问题
  const fixedNum = parseFloat(num.toFixed(1));
  // 判断是否为整数，是则返回整数，否则返回保留1位的小数
  return fixedNum % 1 === 0 ? Math.floor(fixedNum) : fixedNum;
};

// 🔥 彻底删除定时器，完全依赖props同步
const PointsManager: React.FC<PointsManagerProps> = ({ 
  onProfileUpdate,
  profile, // 后端实时数据
  profileLoading, // 加载状态
  claimCredits, // 后端领取积分方法
  claimRose, // 后端领取玫瑰方法
  deductCredits, // 后端扣减积分方法
  deductRose, // 后端扣减玫瑰方法（新增，移除可选标记）
  claimLoading, // 领取loading状态
  refreshPoints // 手动刷新方法（新增，移除可选标记）
}) => {
  // 🔥 核心重构：localProfile完全依赖props.profile，不再有本地初始化逻辑
  const [localProfile, setLocalProfile] = useState<PointsProfile>({
    points: 0,
    credits: 0,
    crystalRoses: 0,
    isPlusMember: false
  });

  // 🔥 关键修复：props.profile变化时，立即同步到localProfile（无延迟）
  useEffect(() => {
    if (!profile) return;
    // 同步时格式化玫瑰数，确保小数显示正确
    const syncedProfile = {
      ...profile,
      crystalRoses: typeof profile.crystalRoses === 'number' 
        ? parseFloat(profile.crystalRoses.toFixed(1)) 
        : 0
    };
    setLocalProfile(syncedProfile);
  }, [profile]); // 只要App的profile变，立刻同步

  // 保留原有方法：获取今日日期（样式/逻辑不动）
  const getTodayDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // 🔥 核心修复：优化领取状态判断逻辑（严格匹配日期格式）
  const canClaimRose = (): boolean => {
    if (!profile || profileLoading) return false; // 加载中不显示加号
    // 确保日期格式统一（处理后端返回的时间戳/不同格式）
    const claimedDate = profile.lastRoseClaimDate 
      ? new Date(profile.lastRoseClaimDate).toISOString().split('T')[0] 
      : '';
    return claimedDate !== getTodayDate();
  };

  // 🔥 核心修复：优化积分领取状态判断逻辑，兼容更多日期字段格式
  const canClaimCredits = (): boolean => {
    if (!profile || profileLoading) return false; // 加载中不显示加号
    // 兼容两种字段名，确保日期格式统一
    const claimedDate = profile.lastCreditsClaimDate || profile.lastPointsClaimDate
      ? new Date(profile.lastCreditsClaimDate || profile.lastPointsClaimDate!).toISOString().split('T')[0]
      : '';
    return claimedDate !== getTodayDate();
  };

  // 保留原有方法：更新profile（样式/逻辑不动，补充格式化）
  const updateProfile = (updatedData: Partial<PointsProfile>) => {
    const newProfile = { ...localProfile, ...updatedData };
    // 格式化玫瑰数，避免小数显示异常
    newProfile.crystalRoses = typeof newProfile.crystalRoses === 'number' 
      ? parseFloat(newProfile.crystalRoses.toFixed(1)) 
      : 0;
    setLocalProfile(newProfile);
    // 通知外部（保留原有逻辑）
    if (onProfileUpdate) {
      onProfileUpdate(newProfile);
    }
  };

  // 🔥 核心修复：领取每日水晶玫瑰 - 领取后立即刷新后端数据，增加loading防重复点击
  const claimDailyRose = async () => {
    if (claimLoading.rose) return; // 加载中禁止点击
    
    const today = getTodayDate();
    // 二次校验（避免UI判断和实际状态不一致）
    const claimedDate = profile.lastRoseClaimDate 
      ? new Date(profile.lastRoseClaimDate).toISOString().split('T')[0] 
      : '';
    if (claimedDate === today) {
      alert('今日水晶玫瑰已领取，明天再来吧！');
      return;
    }
    
    try {
      // 调用后端领取玫瑰接口
      await claimRose();
      // 🔥 关键：领取后立即手动刷新后端数据，保证UI实时同步
      await refreshPoints();
      
      // 格式化显示的数值，提升用户体验
      const currentRose = parseFloat((profile.crystalRoses || 0).toFixed(1));
      const afterClaimRose = parseFloat((currentRose + 0.5).toFixed(1));
      const displayAfterRose = formatRoseNumber(afterClaimRose);
      
      let tipMsg = '';
      if (afterClaimRose >= 3.0) {
        tipMsg = `今日玫瑰已领取，当前玫瑰(${displayAfterRose})已达上限，无需补充🌹`;
      } else {
        tipMsg = `获得0.5个水晶玫瑰🌹，当前玫瑰数：${displayAfterRose}`;
      }
      alert(tipMsg);
    } catch (error) {
      console.error('领取玫瑰失败:', error);
      alert('领取失败，请稍后重试！');
    }
  };

  // 🔥 核心修复：领取每日积分点 - 领取后立即刷新后端数据，增加loading防重复点击
  const claimDailyCredits = async () => {
    if (claimLoading.credits) return; // 加载中禁止点击
    
    const today = getTodayDate();
    const claimedDate = profile.lastCreditsClaimDate || profile.lastPointsClaimDate
      ? new Date(profile.lastCreditsClaimDate || profile.lastPointsClaimDate!).toISOString().split('T')[0]
      : '';
    if (claimedDate === today) {
      alert('今日积分点已领取，明天再来吧！');
      return;
    }

    try {
      // 调用后端领取积分接口
      await claimCredits();
      // 🔥 关键：领取后立即手动刷新后端数据，保证UI实时同步
      await refreshPoints();
      
      const tipMsg = profile.credits < 10 
        ? `积分点已补至10个✨` 
        : `今日积分已领取，当前积分(${profile.credits})已达上限，无需补充✨`;
      alert(tipMsg);
    } catch (error) {
      console.error('领取积分失败:', error);
      alert('领取失败，请稍后重试！');
    }
  };

  // 🔥 核心修复：扣减逻辑 - 玫瑰扣减调用专门的deductRose方法，完善错误处理
  const deductForGeneration = useCallback(async (type: 'single' | 'grid'): Promise<{ success: boolean; message: string }> => {
    // 直接使用props的profile（后端最新值），不再用localProfile，保证数据准确性
    const currentCredits = profile.credits || 0;
    const currentRoses = parseFloat((profile.crystalRoses || 0).toFixed(1));
    const isPlus = profile.isPlusMember || false;

    // 1. 单张生成：扣1个积分点
    if (type === 'single') {
      if (currentCredits < 1) {
        return { success: false, message: '积分点不足！生成单张需要1个积分点。' };
      }
      const success = await deductCredits(1);
      if (!success) {
        return { success: false, message: '积分扣减失败，请重试！' };
      }
      // 扣减后立即刷新，保证数据实时同步
      await refreshPoints();
      return { success: true, message: '已扣1个积分点，生成成功！' };
    }

    // 2. 九宫格生成：优先扣玫瑰（修复扣减逻辑，完善提示）
    if (type === 'grid') {
      // 优先扣玫瑰（1朵=1次九宫格）
      if (currentRoses >= 1) {
        // 调用专门的deductRose方法扣减1朵玫瑰
        const success = await deductRose(1);
        if (!success) {
          return { success: false, message: '玫瑰扣减失败，请重试！' };
        }
        // 扣减后立即刷新
        await refreshPoints();
        const remainingRoses = formatRoseNumber(currentRoses - 1);
        return { 
          success: true, 
          message: `已使用1朵水晶玫瑰，九宫格生成成功！剩余玫瑰：${remainingRoses}` 
        };
      } else {
        // 玫瑰为0时检查PLUS会员
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
        const success = await deductCredits(9);
        if (!success) {
          return { success: false, message: '积分扣减失败，请重试！' };
        }
        // 扣减后立即刷新
        await refreshPoints();
        return { success: true, message: '已扣9个积分点，九宫格生成成功！' };
      }
    }

    return { success: false, message: '生成类型错误！仅支持single/grid类型' };
  }, [profile, deductCredits, deductRose, refreshPoints]);

  // 🔥 新增：手动刷新数据的按钮（方便测试/强制同步），增加loading防重复点击
  const handleManualRefresh = async () => {
    if (profileLoading) return; // 加载中禁止刷新
    try {
      await refreshPoints();
      alert('数据已刷新为最新！');
    } catch (error) {
      console.error('手动刷新失败:', error);
      alert('刷新失败，请重试！');
    }
  };

  // JSX结构：保留原有样式，新增手动刷新按钮，玫瑰数直接用格式化后的props值
  return (
    <div className="flex items-center space-x-1.5">
      {/* 积分点按钮 - 含每日领取功能 */}
      <div className="relative">
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent rounded-full shadow-sm transition-all hover:scale-105 hover:bg-gray-50 group"
        >
          <div
            title="积分点（1个=1次单张生成）"
            className="flex items-center gap-1 text-indigo-600 select-none focus:outline-none outline-none"
          >
            <span className="text-sm leading-none">✨</span>
            <span className="text-xs font-black tabular-nums">
              {profile.credits || 0}
            </span>
          </div>
        </Link>
        
        {/* 每日领取积分点按钮 */}
        {canClaimCredits() && (
          <button
            onClick={claimDailyCredits}
            disabled={claimLoading.credits}
            className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-md hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            title="领取今日10积分点"
          >
            {claimLoading.credits ? '...' : '+'}
          </button>
        )}
      </div>

      {/* 水晶玫瑰按钮 - 含每日领取+手动刷新功能 */}
      <div className="relative">
        <div
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent rounded-full shadow-sm transition-all hover:scale-105 hover:bg-gray-50 group cursor-pointer"
          // 🔥 新增：点击玫瑰区域手动刷新
          onClick={handleManualRefresh}
          title="点击刷新最新玫瑰数"
        >
          <div
            title="水晶玫瑰：1 朵 = 1 次九宫格"
            className="flex items-center gap-1 text-pink-500 select-none focus:outline-none ring-0"
          >
            <span className="text-sm leading-none">🌹</span>
            {/* 🔥 核心修改：直接显示props.profile的玫瑰数（后端最新值），格式化显示 */}
            <span className="text-xs font-black tabular-nums">
              {formatRoseNumber(profile.crystalRoses || 0)}
            </span>
          </div>
        </div>
        
        {/* 每日领取玫瑰按钮 */}
        {canClaimRose() && (
          <button
            onClick={claimDailyRose}
            disabled={claimLoading.rose}
            className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-md hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            title="领取今日0.5水晶玫瑰"
          >
            {claimLoading.rose ? '...' : '+'}
          </button>
        )}
      </div>

      {/* 金级贡献值按钮 - 点击跳转任务中心（保留原有样式） */}
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
          <span className="text-amber-700 text-[11px] font-black tabular-nums">{profile.points || 0}</span>
        </div>
      </Link>
    </div>
  );
};

// 🔥 新增：默认导出，确保组件能被正常引入
export default PointsManager;