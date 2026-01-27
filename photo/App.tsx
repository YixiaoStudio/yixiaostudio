import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TemplateDetail from './pages/TemplateDetail';
import Header from './components/Header';

// 1. 后端接口地址（火山引擎触发器）
const API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com/';

const App: React.FC = () => {
  // ===== 新增登录相关状态（不影响原有布局）=====
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

  // 初始化读取登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('ai_photo_generator_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // 表单输入处理
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
    setAuthMessage('');
  };

  // 验证码输入处理
  const handleVerifyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerifyCode(value);
    setVerifyMessage('');
  };

  // 注册接口
  const handleRegister = async () => {
    const { username, email, password } = authForm;
    if (!username || !email || !password) {
      setAuthMessage('请填写完整的注册信息！');
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
          setTimeout(() => {
            setShowAuthModal(false);
            setShowVerifyModal(true);
          }, 3000);
        } else {
          setTimeout(() => setIsRegisterMode(false), 2000);
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
  };

  // 登录接口
  const handleLogin = async () => {
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
        setCurrentUser(data.data);
        localStorage.setItem('ai_photo_generator_user', JSON.stringify(data.data));
        setAuthMessage('登录成功！');
        setAuthMessageType('success');
        setTimeout(() => setShowAuthModal(false), 1000);
      } else if (data.code === 403 && data.msg.includes('邮箱尚未验证')) {
        setAuthMessage(data.msg);
        setAuthMessageType('error');
        setCurrentVerifyEmail(data.data?.email || account);
        setTimeout(() => setShowVerifyModal(true), 3000);
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
  };

  // 邮箱验证接口
  const handleVerifyEmail = async () => {
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
        setTimeout(() => {
          setShowVerifyModal(false);
          setShowAuthModal(true);
          setIsRegisterMode(false);
          setAuthMessage('验证成功，请登录！');
          setAuthMessageType('success');
        }, 2000);
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
  };

  // 退出登录
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ai_photo_generator_user');
  };

  // ===== 登录/注册模态框（悬浮在页面上方，不影响原有布局）=====
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{isRegisterMode ? '用户注册' : '用户登录'}</h3>
          <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
        </div>

        {isRegisterMode ? (
          <div className="space-y-4 mb-4">
            <input type="text" name="username" value={authForm.username} onChange={handleAuthInputChange} placeholder="用户名" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="email" name="email" value={authForm.email} onChange={handleAuthInputChange} placeholder="邮箱" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" name="password" value={authForm.password} onChange={handleAuthInputChange} placeholder="密码" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <input type="text" name="account" value={authForm.account} onChange={handleAuthInputChange} placeholder="用户名/邮箱" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" name="loginPassword" value={authForm.loginPassword} onChange={handleAuthInputChange} placeholder="密码" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        {authMessage && (
          <div className={`text-sm text-center mb-4 ${authMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {authMessage}
          </div>
        )}

        <button onClick={isRegisterMode ? handleRegister : handleLogin} disabled={authLoading} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70">
          {authLoading ? '处理中...' : (isRegisterMode ? '注册' : '登录')}
        </button>

        <div className="text-center mt-4 text-sm">
          {isRegisterMode ? (
            <>已有账号？<button onClick={() => { setIsRegisterMode(false); setAuthMessage(''); }} className="text-blue-600 ml-1">登录</button></>
          ) : (
            <>没有账号？<button onClick={() => { setIsRegisterMode(true); setAuthMessage(''); }} className="text-blue-600 ml-1">注册</button></>
          )}
        </div>
      </div>
    </div>
  );

  // 邮箱验证模态框
  const VerifyModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">邮箱验证</h3>
          <button onClick={() => setShowVerifyModal(false)} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
        </div>
        <div className="text-center text-sm mb-4">
          请输入发送到 <span className="text-blue-600 font-bold">{currentVerifyEmail}</span> 的6位验证码
        </div>
        <input type="text" value={verifyCode} onChange={handleVerifyCodeChange} placeholder="6位数字验证码" maxLength={6} inputMode="numeric" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4" />
        {verifyMessage && (
          <div className={`text-sm text-center mb-4 ${verifyMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {verifyMessage}
          </div>
        )}
        <button onClick={handleVerifyEmail} disabled={verifyLoading} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70">
          {verifyLoading ? '验证中...' : '验证邮箱'}
        </button>
      </div>
    </div>
  );

  // ===== 保留你原有100%的布局结构 =====
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {/* 传递登录相关方法到Header（只加按钮，不改原有Header样式） */}
        <Header 
          currentUser={currentUser}
          onLoginClick={() => setShowAuthModal(true)}
          onLogoutClick={handleLogout}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/template/:id" element={<TemplateDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
          <p>© 2026 逸潇次元拍 - 记录你的每一个闪光时刻</p>
        </footer>

        {/* 模态框只在需要时显示，不影响原有布局 */}
        {showAuthModal && <AuthModal />}
        {showVerifyModal && <VerifyModal />}
      </div>
    </HashRouter>
  );
};

export default App;