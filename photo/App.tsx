import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import TemplateDetail from './pages/TemplateDetail';
import MyGallery from './pages/MyGallery';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import TravelMap from './pages/TravelMap';
import Subscription from './pages/Subscription';
import Header from './components/Header';
// 导入积分类型
import { PointsProfile } from './components/PointsManager';

// ========== 新增：创建积分刷新Context（供跨组件触发刷新） ==========
export const PointsRefreshContext = createContext<{
  refreshPoints: () => Promise<void>;
}>({ refreshPoints: async () => { } });

// 1. 保留能正常登录的后端接口地址
const API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com';
// 2. 积分接口地址（替换为火山引擎实际地址）
const POINTS_API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com/api/points';

// ========== 新增：生成图片类型枚举（便于区分单张/九宫格） ==========
export type GenerateType = 'single' | 'grid9';

// ========== 新增：邮箱格式验证工具函数 ==========
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
};

// ========== 提取独立的登录/注册模态框组件 ==========
const AuthModal = React.memo(({
  isRegisterMode,
  authForm,
  authMessage,
  authMessageType,
  authLoading,
  onInputChange,
  onRegister,
  onLogin,
  onSwitchMode,
  onClose,
  onForgotPassword // 新增：忘记密码回调
}) => {
  // ========== 新增：密码显示/隐藏状态 ==========
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{isRegisterMode ? '用户注册' : '用户登录'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
        </div>

        {isRegisterMode ? (
          <div className="space-y-4 mb-4">
            <input
              type="text"
              name="username"
              value={authForm.username}
              onChange={onInputChange}
              placeholder="用户名"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            <div className="relative">
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={onInputChange}
                placeholder="邮箱"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${authForm.email && !isValidEmail(authForm.email)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
                }`}
                autoComplete="off"
              />
              {/* 新增：邮箱格式错误提示 */}
              {authForm.email && !isValidEmail(authForm.email) && (
                <p className="absolute -bottom-5 left-0 text-xs text-red-500">请输入有效的邮箱地址</p>
              )}
            </div>
            {/* ========== 修改：注册密码输入框 - 统一使用同一个眼睛图标 ========== */}
            <div className="relative">
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                name="password"
                value={authForm.password}
                onChange={onInputChange}
                placeholder="密码"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showRegisterPassword ? '隐藏密码' : '显示密码'}
              >
                {/* 统一使用睁眼图标 */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <input
              type="text"
              name="account"
              value={authForm.account}
              onChange={onInputChange}
              placeholder="用户名/邮箱"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            {/* ========== 修改：登录密码输入框 - 统一使用同一个眼睛图标 ========== */}
            <div className="relative">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                name="loginPassword"
                value={authForm.loginPassword}
                onChange={onInputChange}
                placeholder="密码"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showLoginPassword ? '隐藏密码' : '显示密码'}
              >
                {/* 统一使用睁眼图标 */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {authMessage && (
          <div className={`text-sm text-center mb-4 ${authMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {authMessage}
          </div>
        )}

        <button
          onClick={isRegisterMode ? onRegister : onLogin}
          disabled={authLoading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
        >
          {authLoading ? '处理中...' : (isRegisterMode ? '注册' : '登录')}
        </button>

        <div className="text-center mt-4 text-sm">
          {isRegisterMode ? (
            <>已有账号？<button onClick={onSwitchMode} className="text-blue-600 ml-1">登录</button></>
          ) : (
            <>
              没有账号？<button onClick={onSwitchMode} className="text-blue-600 ml-1">注册</button>
              <br />
              {/* 核心修改：添加 text-xs 类缩小字号，可根据需要调整 mt-1 减小间距 */}
              <button onClick={onForgotPassword} className="text-blue-600 mt-2 text-xs">忘记密码？</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// ========== 提取独立的邮箱验证模态框组件 ==========
const VerifyModal = React.memo(({
  verifyCode,
  verifyMessage,
  verifyMessageType,
  verifyLoading,
  currentVerifyEmail,
  onCodeChange,
  onVerify,
  onClose
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">邮箱验证</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
      </div>
      <div className="text-center text-sm mb-4">
        请输入发送到 <span className="text-blue-600 font-bold">{currentVerifyEmail}</span> 的6位验证码
      </div>
      <input
        type="text"
        value={verifyCode}
        onChange={onCodeChange}
        placeholder="6位数字验证码"
        maxLength={6}
        inputMode="numeric"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
        autoComplete="off"
      />
      {verifyMessage && (
        <div className={`text-sm text-center mb-4 ${verifyMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {verifyMessage}
        </div>
      )}
      <button
        onClick={onVerify}
        disabled={verifyLoading}
        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
      >
        {verifyLoading ? '验证中...' : '验证邮箱'}
      </button>
    </div>
  </div>
));

// ========== 新增：密码找回模态框组件 ==========
const ForgotPasswordModal = React.memo(({
  forgotForm,
  forgotStep,
  forgotMessage,
  forgotMessageType,
  forgotLoading,
  onInputChange,
  onSendCode,
  onVerifyCode,
  onResetPassword,
  onClose,
  onBackToLogin
}) => {
  // ========== 新增：密码显示/隐藏状态 ==========
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {forgotStep === 1 ? '找回密码' : forgotStep === 2 ? '验证验证码' : '重置密码'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
        </div>

        {forgotStep === 1 && (
          <div className="space-y-4 mb-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                value={forgotForm.email}
                onChange={onInputChange}
                placeholder="请输入注册时的邮箱"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${forgotForm.email && !isValidEmail(forgotForm.email)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
                }`}
                autoComplete="off"
              />
              {forgotForm.email && !isValidEmail(forgotForm.email) && (
                <p className="absolute -bottom-5 left-0 text-xs text-red-500">请输入有效的邮箱地址</p>
              )}
            </div>
          </div>
        )}

        {forgotStep === 2 && (
          <div className="space-y-4 mb-4">
            <div className="text-center text-sm mb-2">
              请输入发送到 <span className="text-blue-600 font-bold">{forgotForm.email}</span> 的6位重置验证码
            </div>
            <input
              type="text"
              name="resetCode"
              value={forgotForm.resetCode}
              onChange={onInputChange}
              placeholder="6位数字验证码"
              maxLength={6}
              inputMode="numeric"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
          </div>
        )}

        {forgotStep === 3 && (
          <div className="space-y-4 mb-4">
            {/* ========== 修改：新密码输入框 - 统一使用同一个眼睛图标 ========== */}
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={forgotForm.newPassword}
                onChange={onInputChange}
                placeholder="请输入新密码（至少6位）"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showNewPassword ? '隐藏密码' : '显示密码'}
              >
                {/* 统一使用睁眼图标 */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            {/* ========== 修改：确认密码输入框 - 统一使用同一个眼睛图标 ========== */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={forgotForm.confirmPassword}
                onChange={onInputChange}
                placeholder="请确认新密码"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${forgotForm.confirmPassword && forgotForm.newPassword !== forgotForm.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
              >
                {/* 统一使用睁眼图标，移除所有状态判断 */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              {forgotForm.confirmPassword && forgotForm.newPassword !== forgotForm.confirmPassword && (
                <p className="absolute -bottom-5 left-0 text-xs text-red-500">两次输入的密码不一致</p>
              )}
            </div>
          </div>
        )}

        {forgotMessage && (
          <div className={`text-sm text-center mb-4 ${forgotMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {forgotMessage}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {forgotStep === 1 && (
            <button
              onClick={onSendCode}
              disabled={forgotLoading || !forgotForm.email || !isValidEmail(forgotForm.email)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
            >
              {forgotLoading ? '发送中...' : '发送重置验证码'}
            </button>
          )}

          {forgotStep === 2 && (
            <button
              onClick={onVerifyCode}
              disabled={forgotLoading || !forgotForm.resetCode || forgotForm.resetCode.length !== 6}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
            >
              {forgotLoading ? '验证中...' : '验证验证码'}
            </button>
          )}

          {forgotStep === 3 && (
            <button
              onClick={onResetPassword}
              disabled={
                forgotLoading ||
                !forgotForm.newPassword ||
                forgotForm.newPassword.length < 6 ||
                forgotForm.newPassword !== forgotForm.confirmPassword
              }
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
            >
              {forgotLoading ? '重置中...' : '重置密码'}
            </button>
          )}

          <button
            onClick={onBackToLogin}
            className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            返回登录
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== 工具函数：调用积分接口（修复CORS + 避免缓存） ==========
const requestPointsApi = async (userId: number, url: string, options: RequestInit = {}) => {
  try {
    // 核心修复1：将userId转为字符串，避免数字类型传递问题
    const userIdStr = String(userId);
    // 核心修复2：加随机时间戳参数避免缓存（替代cache-control请求头）
    const timestamp = new Date().getTime();
    // 拼接URL：userId + 时间戳（避免缓存）
    const fullUrl = `${POINTS_API_BASE_URL}${url}?userId=${userIdStr}&t=${timestamp}`;
    console.log(`调用积分接口：${fullUrl}`); // 新增日志，便于排查

    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // 核心修复3：移除导致CORS错误的请求头（cache-control/pragma/expires）
        ...options.headers
      },
      cache: 'no-cache', // 简化缓存配置，避免触发CORS
      credentials: 'include' // 确保跨域请求携带凭证
    });

    const data = await res.json();
    console.log(`积分接口返回：`, data); // 新增日志，便于排查
    return data;
  } catch (error) {
    console.error('积分接口请求失败:', error);
    return { success: false, msg: '网络错误，请重试' };
  }
};

// ========== 封装Header组件的跳转逻辑（新增） ==========
const HeaderWithNavigation = (props: any) => {
  const navigate = useNavigate();
  
  // PLUS按钮跳转处理函数
  const handlePlusButtonClick = () => {
    navigate('/subscribe');
  };

  return (
    <Header
      {...props}
      onPlusButtonClick={handlePlusButtonClick} // 传递跳转函数给Header
    />
  );
};

// ========== 主App组件 ==========
const App: React.FC = () => {
  // ===== 登录相关状态（移除Token相关） =====
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    account: '',
    loginPassword: ''
  });
  const [authMessage, setAuthMessage] = useState('');
  const [authMessageType, setAuthMessageType] = useState<'success' | 'error'>('error');
  const [authLoading, setAuthLoading] = useState(false);

  // 邮箱验证相关状态
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyMessageType, setVerifyMessageType] = useState<'success' | 'error'>('error');
  const [currentVerifyEmail, setCurrentVerifyEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ========== 新增状态：保存待自动登录的用户信息 ==========
  const [autoLoginData, setAutoLoginData] = useState<{
    account: string;
    password: string;
  } | null>(null);

  // ========== 新增：密码找回相关状态 ==========
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1:输入邮箱 2:验证验证码 3:重置密码
  const [forgotForm, setForgotForm] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotMessageType, setForgotMessageType] = useState<'success' | 'error'>('error');
  const [forgotLoading, setForgotLoading] = useState(false);

  // ========== 新增：领取按钮loading状态 ==========
  const [claimLoading, setClaimLoading] = useState({
    credits: false,
    rose: false
  });

  // ========== 积分状态管理（对接后端） ==========
  const [profile, setProfile] = useState<PointsProfile>({
    points: 0,
    credits: 0,
    crystalRoses: 0,
    lastRoseClaimDate: '',
    lastCreditsClaimDate: '',
    isPlusMember: false
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // ===== 从后端获取积分数据（仅主动调用，无自动轮询） =====
  const fetchProfile = useCallback(async (force = false) => {
    if (!currentUser?.id) {
      console.log('currentUser.id为空：', currentUser);
      return;
    }

    console.log('当前登录用户ID：', currentUser.id);
    if (!force) setProfileLoading(true);

    try {
      const res = await requestPointsApi(currentUser.id, '/profile');
      if (res.success) {
        const newProfile = {
          ...res.data,
          crystalRoses: Number(res.data.crystalRoses || 0),
          credits: Number(res.data.credits || 0),
          points: Number(res.data.points || 0)
        };
        setProfile(newProfile);
        console.log('积分数据更新为：', newProfile);
      } else {
        alert(res.msg || '获取积分失败');
      }
    } catch (error) {
      console.error('拉取积分失败：', error);
      alert('获取积分失败，请重试');
    } finally {
      if (!force) setProfileLoading(false);
    }
  }, [currentUser]);

  // ========== 手动刷新积分（只在需要时调用） ==========
  const refreshPoints = useCallback(async () => {
    console.log('触发积分刷新...');
    await fetchProfile(true);
  }, [fetchProfile]);

  // ===== 领取积分：操作完立即刷新 =====
  const claimCredits = useCallback(async () => {
    if (!currentUser?.id) {
      alert('请先登录');
      return;
    }
    // 设置loading状态
    setClaimLoading(prev => ({ ...prev, credits: true }));
    try {
      const res = await requestPointsApi(currentUser.id, '/claim-credits', {
        method: 'POST'
      });
      if (res.success) {
        alert(res.msg);
        await refreshPoints(); // 刷新积分
      } else {
        alert(res.msg);
      }
    } catch (error) {
      console.error('领取积分失败：', error);
      alert('领取积分失败，请重试');
    } finally {
      // 重置loading状态
      setClaimLoading(prev => ({ ...prev, credits: false }));
    }
  }, [currentUser, refreshPoints]);

  // ===== 领取玫瑰：操作完立即刷新 =====
  const claimRose = useCallback(async () => {
    if (!currentUser?.id) {
      alert('请先登录');
      return;
    }
    // 设置loading状态
    setClaimLoading(prev => ({ ...prev, rose: true }));
    try {
      const res = await requestPointsApi(currentUser.id, '/claim-rose', {
        method: 'POST'
      });
      if (res.success) {
        alert(res.msg);
        await refreshPoints(); // 只在这里刷新
      } else {
        alert(res.msg);
      }
    } catch (error) {
      console.error('领取玫瑰失败：', error);
      alert('领取失败，请稍后重试！');
    } finally {
      // 重置loading状态
      setClaimLoading(prev => ({ ...prev, rose: false }));
    }
  }, [currentUser, refreshPoints]);

  // ========== 扣减玫瑰：操作完立即刷新 ==========
  const deductRose = useCallback(async (num = 1) => {
    if (!currentUser?.id) {
      alert('请先登录');
      return false;
    }
    try {
      const res = await requestPointsApi(currentUser.id, '/deduct-rose', {
        method: 'POST',
        body: JSON.stringify({ num })
      });
      if (res.success) {
        await refreshPoints();
        return true;
      } else {
        alert(res.msg);
        return false;
      }
    } catch (error) {
      console.error('扣减玫瑰失败：', error);
      alert('扣减玫瑰失败，请重试');
      return false;
    }
  }, [currentUser, refreshPoints]);

  // ========== 扣减积分：操作完立即刷新 ==========
  const deductCredits = useCallback(async (num = 1) => {
    if (!currentUser?.id) {
      alert('请先登录');
      return false;
    }
    try {
      const res = await requestPointsApi(currentUser.id, '/deduct-credits', {
        method: 'POST',
        body: JSON.stringify({ num })
      });
      if (res.success) {
        await refreshPoints(); // 只在这里刷新
        return true;
      } else {
        alert(res.msg);
        return false;
      }
    } catch (error) {
      console.error('扣减积分失败：', error);
      alert('积分扣减失败，请重试！');
      return false;
    }
  }, [currentUser, refreshPoints]);

  // ========== 生成图片：扣减后自动刷新 ==========
  const handleGenerateImage = useCallback(async (type: GenerateType): Promise<boolean> => {
    if (!currentUser?.id) {
      setShowAuthModal(true);
      return false;
    }

    if (type === 'single') {
      if (profile.credits < 1) {
        alert('当前credits不足，无法生成单张图片！');
        return false;
      }
      return await deductCredits(1);
    }

    if (type === 'grid9') {
      if (profile.crystalRoses > 0) {
        const roseDeducted = await deductRose();
        if (roseDeducted) {
          alert('使用1个水晶玫瑰免费生成九宫格！');
        }
        return roseDeducted;
      }

      if (!profile.isPlusMember) {
        alert('当前无水晶玫瑰且未开通PLUS会员，无法生成九宫格！\n可领取每日玫瑰或开通PLUS会员后重试。');
        return false;
      }

      if (profile.credits < 9) {
        alert('当前credits不足9个，无法生成九宫格！');
        return false;
      }
      const creditsDeducted = await deductCredits(9);
      if (creditsDeducted) {
        alert('已扣减9个credits生成九宫格（PLUS会员特权）！');
      }
      return creditsDeducted;
    }

    return false;
  }, [currentUser, profile, deductCredits, deductRose]);

  // ===== 初始化：读取登录状态 =====
  useEffect(() => {
    const savedUser = localStorage.getItem('ai_photo_generator_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const userData = {
          ...parsedUser,
          id: parsedUser.id || parsedUser.user_id
        };
        setCurrentUser(userData);
        console.log('从本地存储加载用户：', userData);
      } catch (error) {
        console.error('解析本地用户信息失败：', error);
        localStorage.removeItem('ai_photo_generator_user');
      }
    } else {
      setProfile({
        points: 0,
        credits: 0,
        crystalRoses: 0,
        lastRoseClaimDate: '',
        lastCreditsClaimDate: '',
        isPlusMember: false
      });
    }
  }, []);

  // ===== 仅登录时拉取一次积分：无任何定时刷新 =====
  useEffect(() => {
    if (currentUser?.id) {
      fetchProfile(); // 只在登录成功时拉取一次
    } else {
      setProfile({
        points: 0,
        credits: 0,
        crystalRoses: 0,
        lastRoseClaimDate: '',
        lastCreditsClaimDate: '',
        isPlusMember: false
      });
    }
  }, [currentUser, fetchProfile]);

  // ========== 跨页面刷新：只在别的页面改了数据才刷 ==========
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai_points_need_refresh' && e.newValue && e.storageArea === localStorage) {
        console.log('跨页面积分变更，触发刷新');
        refreshPoints().finally(() => {
          window.removeEventListener('storage', handleStorageChange);
          localStorage.removeItem('ai_points_need_refresh');
          window.addEventListener('storage', handleStorageChange);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshPoints]);

  // ===== 稳定的事件处理函数 =====
  const handleAuthInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
    setAuthMessage('');
  }, []);

  const handleVerifyCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerifyCode(value);
    setVerifyMessage('');
  }, []);

  const handleSwitchAuthMode = useCallback(() => {
    setIsRegisterMode(prev => !prev);
    setAuthMessage('');
    setAuthForm(prev => ({
      ...prev,
      username: '',
      email: '',
      password: '',
      account: '',
      loginPassword: ''
    }));
  }, []);

  const handleForgotInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotForm(prev => ({ ...prev, [name]: name === 'resetCode' ? value.replace(/[^0-9]/g, '').slice(0, 6) : value }));
    setForgotMessage('');
  }, []);

  // ========== 自动登录：登录完刷新积分 ==========
  const autoLogin = useCallback(async () => {
    if (!autoLoginData) return;

    const { account, password } = autoLoginData;
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ account, password })
      });
      const data = await response.json();

      if (data.code === 200) {
        const userData = {
          ...data.data,
          id: data.data.id || data.data.user_id
        };
        setCurrentUser(userData);
        localStorage.setItem('ai_photo_generator_user', JSON.stringify(userData));
        await refreshPoints();
        setShowAuthModal(false);
        setShowVerifyModal(false);
      } else {
        alert(`自动登录失败：${data.msg || '请手动登录'}`);
        setShowVerifyModal(false);
        setShowAuthModal(true);
        setIsRegisterMode(false);
      }
    } catch (error) {
      console.error('自动登录失败：', error);
      alert('自动登录失败，请手动登录');
      setShowVerifyModal(false);
      setShowAuthModal(true);
      setIsRegisterMode(false);
    }
  }, [autoLoginData, refreshPoints]);

  // ===== 注册 =====
  const handleRegister = useCallback(async () => {
    const { username, email, password } = authForm;

    if (!username) {
      setAuthMessage('请输入用户名！');
      setAuthMessageType('error');
      return;
    }
    if (!email) {
      setAuthMessage('请输入邮箱！');
      setAuthMessageType('error');
      return;
    }
    if (!isValidEmail(email)) {
      setAuthMessage('请输入有效的邮箱地址！');
      setAuthMessageType('error');
      return;
    }
    if (!password || password.length < 6) {
      setAuthMessage('密码长度不能少于6位！');
      setAuthMessageType('error');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      if (data.code === 200) {
        setAuthMessage(data.msg);
        setAuthMessageType('success');
        setAuthForm(prev => ({ ...prev, username: '', email: '', password: '' }));
        if (data.msg.includes('请查收邮箱')) {
          setCurrentVerifyEmail(email);
          setAutoLoginData({ account: email, password });
          setShowAuthModal(false);
          setShowVerifyModal(true);
        } else {
          setIsRegisterMode(false);
        }
      } else {
        setAuthMessage(data.msg || '注册失败');
        setAuthMessageType('error');
      }
    } catch (error) {
      setAuthMessage('网络错误，请检查后端服务');
      setAuthMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  }, [authForm]);

  // ===== 登录：登录完刷新积分 =====
  const handleLogin = useCallback(async () => {
    const { account, loginPassword } = authForm;
    if (!account || !loginPassword) {
      setAuthMessage('请填写账号和密码！');
      setAuthMessageType('error');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ account, password: loginPassword })
      });
      const data = await response.json();

      if (data.code === 200) {
        const userData = {
          ...data.data,
          id: data.data.id || data.data.user_id
        };
        setCurrentUser(userData);
        localStorage.setItem('ai_photo_generator_user', JSON.stringify(userData));
        await refreshPoints();
        setAuthMessage('登录成功！');
        setAuthMessageType('success');
        setShowAuthModal(false);
      } else if (data.code === 403 && data.msg.includes('邮箱尚未验证')) {
        setAuthMessage(data.msg);
        setAuthMessageType('error');
        setCurrentVerifyEmail(data.data?.email || account);
        setAutoLoginData({ account, password: loginPassword });
        setShowVerifyModal(true);
        setShowAuthModal(false);
      } else {
        setAuthMessage(data.msg || '登录失败');
        setAuthMessageType('error');
      }
    } catch (error) {
      setAuthMessage('网络错误，请检查后端服务');
      setAuthMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  }, [authForm, refreshPoints]);

  // ===== 邮箱验证：验证完刷新积分 =====
  const handleVerifyEmail = useCallback(async () => {
    if (!verifyCode || verifyCode.length !== 6 || !/^\d{6}$/.test(verifyCode)) {
      setVerifyMessage('请输入6位数字验证码！');
      setVerifyMessageType('error');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verifyCode })
      });
      const data = await response.json();

      if (data.code === 200) {
        setVerifyMessage(data.msg);
        setVerifyMessageType('success');
        setVerifyCode('');
        await autoLogin();
      } else {
        setVerifyMessage(data.msg || '验证失败');
        setVerifyMessageType('error');
      }
    } catch (error) {
      setVerifyMessage('网络错误，请检查后端服务');
      setVerifyMessageType('error');
    } finally {
      setVerifyLoading(false);
    }
  }, [verifyCode, autoLogin]);

  // ===== 退出登录 =====
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('ai_photo_generator_user');
    setAutoLoginData(null);

    setProfile({
      points: 0,
      credits: 0,
      crystalRoses: 0,
      lastRoseClaimDate: '',
      lastCreditsClaimDate: '',
      isPlusMember: false
    });
  }, []);

  // ========== 找回密码 ==========
  const handleSendResetCode = useCallback(async () => {
    const { email } = forgotForm;
    if (!email || !isValidEmail(email)) {
      setForgotMessage('请输入有效的邮箱地址！');
      setForgotMessageType('error');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (data.code === 200) {
        setForgotMessage(data.msg);
        setForgotMessageType('success');
        setForgotStep(2);
      } else {
        setForgotMessage(data.msg || '发送验证码失败');
        setForgotMessageType('error');
      }
    } catch (error) {
      setForgotMessage('网络错误，请检查后端服务');
      setForgotMessageType('error');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotForm]);

  const handleVerifyResetCode = useCallback(async () => {
    const { email, resetCode } = forgotForm;
    if (!resetCode || resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
      setForgotMessage('请输入6位数字验证码！');
      setForgotMessageType('error');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: resetCode })
      });
      const data = await response.json();

      if (data.code === 200) {
        setForgotMessage('验证码验证成功，请设置新密码');
        setForgotMessageType('success');
        setForgotStep(3);
      } else {
        setForgotMessage(data.msg || '验证码验证失败');
        setForgotMessageType('error');
      }
    } catch (error) {
      setForgotMessage('网络错误，请检查后端服务');
      setForgotMessageType('error');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotForm]);

  const handleResetPassword = useCallback(async () => {
    const { email, resetCode, newPassword, confirmPassword } = forgotForm;

    if (!newPassword || newPassword.length < 6) {
      setForgotMessage('新密码长度不能少于6位！');
      setForgotMessageType('error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotMessage('两次输入的密码不一致！');
      setForgotMessageType('error');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          code: resetCode,
          new_password: newPassword
        })
      });
      const data = await response.json();

      if (data.code === 200) {
        setForgotMessage(data.msg);
        setForgotMessageType('success');
        setTimeout(() => {
          setShowForgotModal(false);
          setShowAuthModal(true);
          setIsRegisterMode(false);
          setForgotForm({
            email: '',
            resetCode: '',
            newPassword: '',
            confirmPassword: ''
          });
          setForgotStep(1);
        }, 2000);
      } else {
        setForgotMessage(data.msg || '重置密码失败');
        setForgotMessageType('error');
      }
    } catch (error) {
      setForgotMessage('网络错误，请检查后端服务');
      setForgotMessageType('error');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotForm]);

  const handleOpenForgotPassword = useCallback(() => {
    setShowAuthModal(false);
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotForm({
      email: '',
      resetCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotMessage('');
  }, []);

  const handleBackToLogin = useCallback(() => {
    setShowForgotModal(false);
    setShowAuthModal(true);
    setIsRegisterMode(false);
  }, []);

  // ===== 渲染 =====
  return (
    <PointsRefreshContext.Provider value={{ refreshPoints }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <HeaderWithNavigation
            currentUser={currentUser}
            profile={profile}
            profileLoading={profileLoading}
            claimCredits={claimCredits}
            claimRose={claimRose}
            deductCredits={deductCredits}
            deductRose={deductRose}
            claimLoading={claimLoading}
            handleGenerateImage={handleGenerateImage}
            onLoginClick={() => setShowAuthModal(true)}
            onLogoutClick={handleLogout}
            refreshPoints={refreshPoints}
          />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/template/:id" element={<TemplateDetail handleGenerateImage={handleGenerateImage} profile={profile} />} />
              <Route path="/gallery" element={<MyGallery />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/map" element={<TravelMap />} />
              <Route path="/subscribe" element={<Subscription />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
            <p>© 2026 逸潇次元拍 - 记录你的每一个闪光时刻</p>
          </footer>

          {showAuthModal && (
            <AuthModal
              isRegisterMode={isRegisterMode}
              authForm={authForm}
              authMessage={authMessage}
              authMessageType={authMessageType}
              authLoading={authLoading}
              onInputChange={handleAuthInputChange}
              onRegister={handleRegister}
              onLogin={handleLogin}
              onSwitchMode={handleSwitchAuthMode}
              onClose={() => setShowAuthModal(false)}
              onForgotPassword={handleOpenForgotPassword}
            />
          )}
          {showVerifyModal && (
            <VerifyModal
              verifyCode={verifyCode}
              verifyMessage={verifyMessage}
              verifyMessageType={verifyMessageType}
              verifyLoading={verifyLoading}
              currentVerifyEmail={currentVerifyEmail}
              onCodeChange={handleVerifyCodeChange}
              onVerify={handleVerifyEmail}
              onClose={() => setShowVerifyModal(false)}
            />
          )}
          {showForgotModal && (
            <ForgotPasswordModal
              forgotForm={forgotForm}
              forgotStep={forgotStep}
              forgotMessage={forgotMessage}
              forgotMessageType={forgotMessageType}
              forgotLoading={forgotLoading}
              onInputChange={handleForgotInputChange}
              onSendCode={handleSendResetCode}
              onVerifyCode={handleVerifyResetCode}
              onResetPassword={handleResetPassword}
              onClose={() => setShowForgotModal(false)}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </div>
      </HashRouter>
    </PointsRefreshContext.Provider>
  );
};

export default App;