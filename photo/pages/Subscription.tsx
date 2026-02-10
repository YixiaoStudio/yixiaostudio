
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ai-user-profile') || '{}');
    setProfile(user);
    window.scrollTo(0, 0);
  }, []);

  const handleOpenModal = (planName: string) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const handleActivate = () => {
    if (!activationCode.trim()) {
      alert('请输入兑换码');
      return;
    }

    setIsActivating(true);
    // 模拟验证延迟
    setTimeout(() => {
      // 演示逻辑：只要输入非空且长度大于等于6位即视为成功（或者设置特定码如 PLUS888）
      if (activationCode.toUpperCase() === 'PLUS888' || activationCode.length >= 6) {
        const updatedProfile = { ...profile, isPlus: true } as UserProfile;
        localStorage.setItem('ai-user-profile', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        alert(`恭喜！您的 ${selectedPlan} 特权已成功激活。`);
        setShowModal(false);
        navigate('/');
      } else {
        alert('兑换码无效，请检查后重试。');
      }
      setIsActivating(false);
    }, 1500);
  };

  const features = [
    {
      title: '每日登录赠送',
      desc: '1 次九宫格写真 · 10 张图片生成',
      icon: '🎁'
    },
    {
      title: '生成次数可累计',
      desc: '未消耗次数自动累计，最高可叠加至 3 次',
      icon: '📈'
    },
    {
      title: '4K 高清 & 去水印',
      desc: '导出 4K 超清原画，画面纯净无水印干扰',
      icon: '💎'
    },
    {
      title: '专属模板持续更新',
      desc: '每周上架仅限会员使用的顶级限定模版',
      icon: '🎨'
    },
    {
      title: '高峰期优先生成',
      desc: '尊享高速渲染专线，繁忙时段无需排队',
      icon: '⚡'
    },
    {
      title: '专属身份标识',
      desc: '尊贵皇冠标识，社区互动彰显独特身份',
      icon: '👑'
    },
  ];

  const plans = [
    {
      id: 'early',
      name: '早鸟 PLUS',
      price: '14.9',
      unit: '/ 月',
      tag: '限时优惠',
      desc: '适合初尝创作的新人',
      best: false,
    },
    {
      id: 'month',
      name: 'PLUS 月费',
      price: '19.9',
      unit: '/ 月',
      tag: '主推套餐',
      desc: '畅享所有核心高级功能',
      best: true,
    },
    {
      id: 'year',
      name: 'PLUS 年费',
      price: '168',
      unit: '/ 年',
      tag: '超值方案',
      desc: '约合 ¥14 / 月，最省之选',
      best: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1014] text-white pb-32 font-sans relative">
      {/* 动态背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-amber-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-24">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-12 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-black">返回上一页</span>
        </button>

        {/* 标题区域（修复PLUS的S显示不完整问题） */}
        <header className="text-center mb-20 space-y-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic">
            逸潇次元拍
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 
                    inline-block px-0.5 tracking-normal relative">
              PLUS
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            解锁巅峰算力，让每一张照片都成为无可替代的艺术杰作。
          </p>
        </header>

        {/* 价格卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleOpenModal(plan.name)}
              className={`
                relative p-10 rounded-[4rem] border-2 cursor-pointer transition-all duration-500 group overflow-hidden
                ${plan.best
                  ? 'bg-amber-400 border-amber-300 shadow-[0_40px_100px_rgba(251,191,36,0.2)] scale-105 z-10'
                  : 'bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-white/[0.08] scale-100'}
              `}
            >
              {plan.best && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
              )}

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className={`text-xl font-black mb-1 ${plan.best ? 'text-amber-950' : 'text-white'}`}>{plan.name}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${plan.best ? 'bg-amber-950 text-amber-400' : 'bg-amber-400/20 text-amber-400'}`}>
                    {plan.tag}
                  </span>
                </div>
                {plan.best && (
                  <div className="bg-amber-950 text-amber-400 text-[11px] font-black px-2 py-1 rounded-lg animate-pulse">最受欢迎</div>
                )}
              </div>

              <div className="mb-10">
                <div className="flex items-baseline">
                  <span className={`text-4xl font-black ${plan.best ? 'text-amber-950' : 'text-white'}`}>¥{plan.price}</span>
                  <span className={`text-sm font-bold ml-1 opacity-60 ${plan.best ? 'text-amber-900' : 'text-slate-400'}`}>{plan.unit}</span>
                </div>
                <p className={`text-xs mt-3 font-medium ${plan.best ? 'text-amber-900/60' : 'text-slate-500'}`}>{plan.desc}</p>
              </div>

              <button className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all active:scale-95 shadow-lg ${plan.best ? 'bg-amber-950 text-amber-400 shadow-amber-900/20' : 'bg-white text-black hover:bg-amber-400 hover:text-amber-950'}`}>
                立即开启特权
              </button>
            </div>
          ))}
        </div>

        {/* 核心权益对比区 */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">核心权益对比</h2>
            <p className="text-slate-500 text-sm font-medium">清晰直观的价值体现，助您做出明智选择</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* 免费用户 */}
            <div className="bg-white/5 border border-white/10 rounded-[4rem] p-10 flex flex-col relative overflow-hidden transition-all hover:bg-white/[0.07]">
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-200">免费用户</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">基础账号</p>
              </div>

              <ul className="space-y-7 flex-grow">
                {[
                  { text: '每 2 天解锁 1 次九宫格', status: 'limited' },
                  { text: '每天可生成 5 张图片', status: 'limited' },
                  { text: '高峰期需要排队等待', status: 'limited' },
                  { text: '部分高级模板不可用', status: 'denied' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status === 'denied' ? 'bg-rose-500/10 text-rose-500/50' : 'bg-slate-700/50 text-slate-400'}`}>
                      {item.status === 'denied' ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <span className={`text-[15px] font-medium ${item.status === 'denied' ? 'text-slate-600' : 'text-slate-400'}`}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PLUS 用户 - 醒目高亮版 */}
            <div className="relative group">
              {/* 背景呼吸光特效 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-amber-200 to-amber-600 rounded-[4.1rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>

              <div className="relative bg-gradient-to-br from-[#1A1C23] via-[#2A2D38] to-[#1A1C23] border-2 border-amber-400/60 rounded-[4rem] p-10 flex flex-col h-full overflow-hidden shadow-[0_30px_60px_rgba(251,191,36,0.2)]">

                {/* 动态扫光 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none" />

                <div className="absolute top-0 right-0 p-8">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 text-[12.5px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-amber-900/40 tracking-wider animate-bounce">
                    尊享升级
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">PLUS 尊享会员</h3>
                  <p className="text-[11px] font-bold text-amber-500/60 uppercase tracking-[0.2em]">至尊特权</p>
                </div>

                <div className="space-y-7 flex-grow">
                  {[
                    { text: '每天解锁 1 次九宫格写真', desc: '全库模版通用' },
                    { text: '每天可生成 10 张高清图片', desc: '4K算力专属加持' },
                    { text: '优先生成，不用久等', desc: '专线极速渲染出片' },
                    { text: 'PLUS 专属写真模板', desc: '每周上新独家专享' },
                    { text: 'PLUS 专属身份标识', desc: '彰显尊贵身份' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-4 group/item">
                      <div className="mt-0.5 w-6 h-6 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] transition-transform group-hover/item:scale-125">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[16px] font-black text-white group-hover/item:text-amber-400 transition-colors">{item.text}</span>
                        <p className="text-[10px] text-amber-500/40 font-bold uppercase tracking-widest">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 pt-8 border-t border-white/5">
                  <div className="flex items-center space-x-2 text-amber-500/30 text-[12.5px] font-black uppercase italic">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>专属摄影体验，让美无需等待</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 权益详情宫格 */}
        <section className="bg-white/[0.03] border border-white/5 rounded-[5rem] p-12 md:p-20 shadow-inner">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4 tracking-tight">PLUS 权益详情</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {features.map((f, i) => (
              <div key={i} className="flex space-x-6 group">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                  {f.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-slate-100">{f.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 底部横幅 */}
        <div className="mt-32 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center px-4">
            <span>PLUS 当前为内测体验版本 · 通过兑换码激活 · 暂不支持站内直接支付</span>
          </div>
          <p className="text-slate-600 text-[12px] font-medium max-w-md mx-auto">
            本产品目前为内测体验版本，相关权益可能随产品形态调整。
          </p>
        </div>
      </div>

 {/* 激活弹窗 */}
{showModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />

    <div className="relative w-full max-w-lg bg-[#1A1C23] border border-amber-400/30 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
      {/* 装饰发光 */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[60px] rounded-full" />

      {/* 顶部关闭 X 按钮 */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all z-20"
        aria-label="关闭窗口"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center mb-10">
        {/* 已删除图标所在的div块 */}
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">激活PLUS特权</h3>
        <p className="text-slate-400 text-sm font-medium italic opacity-80">您正在激活: <span className="text-amber-400">{selectedPlan}</span></p>
      </div>

      <div className="space-y-8 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.3)]">1</div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-200">前往淘宝店铺下单</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">获取专属激活码，支持 24 小时自动发货</p>
            </div>
          </div>
          <button
            className="w-full mt-5 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-black text-sm shadow-lg shadow-orange-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
            onClick={() => window.open('https://item.taobao.com/item.htm?id=1020137775226&spm=a213gs.v2success.0.0.5fc74831PJRLjF', '_blank')}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
            <span>前往淘宝下单</span>
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-start space-x-4 mb-5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm shrink-0">2</div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-200">输入兑换码激活</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">在下方输入您获得的 8 位兑换激活码</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="请输入激活码 (例如: PLUS888)"
              className="w-full px-6 py-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-black text-center text-amber-400 tracking-[0.2em]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleActivate}
          disabled={isActivating}
          className={`
              w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3
              ${isActivating ? 'bg-slate-700 text-slate-500' : 'bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-amber-900/20'}
            `}
        >
          {isActivating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-amber-950" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在验证激活码...</span>
            </>
          ) : (
            <span>立即验证并激活特权</span>
          )}
        </button>

        {/* 底部显式关闭按钮 */}
        <button
          onClick={() => setShowModal(false)}
          className="w-full py-2 text-[13px] font-black text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
        >
          下次再说
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-6 font-medium">
        激活即代表您同意《逸潇次元拍服务协议》及《隐私政策》
      </p>
    </div>
  </div>
)}

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.2); }
          100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); }
        }
      `}</style>
    </div>
  );
};

export default Subscription;
