
import React, { useState, useEffect } from 'react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum ModalStep {
  INFO,
  FORM,
  SUCCESS
}

/**
 * Formspree 配置
 * 已配置为用户的专属 ID: mlgddknl
 * 提交的信息将自动转发至 3577239276@qq.com
 */
const FORMSPREE_ID = "mlgddknl"; 
const CONTACT_EMAIL = "3577239276@qq.com";

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<ModalStep>(ModalStep.INFO);
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置弹窗状态
  useEffect(() => {
    if (isOpen) {
      setStep(ModalStep.INFO);
      setContact('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError('请输入邮箱或手机号码');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "联系方式": contact,
          "预约产品": "逸潇AI助手",
          "提交时间": new Date().toLocaleString('zh-CN'),
          "_subject": `[新预约通知] 有人预约了逸潇AI助手`
        })
      });

      if (response.ok) {
        setStep(ModalStep.SUCCESS);
      } else {
        const data = await response.json();
        setError(data.error || '提交请求未成功，请检查 Formspree 设置或稍后再试。');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('网络请求失败，请确保网络连接正常并重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* 弹窗主体 */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="p-10">
          {step === ModalStep.INFO && (
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">逸潇AI助手</h3>
              <p className="text-zinc-500 leading-relaxed mb-8">
                逸潇AI助手V1版本预计上线时间：<br />
                <span className="text-zinc-900 font-semibold">2026年1月31日</span>
              </p>
              <button 
                onClick={() => setStep(ModalStep.FORM)}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              >
                立即预约上线通知
              </button>
            </div>
          )}

          {step === ModalStep.FORM && (
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">预约上线通知</h3>
              <p className="text-sm text-zinc-500 mb-8">请留下您的联系方式，产品上线后我们将第一时间邮件通知您。</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    name="contact"
                    placeholder="您的邮箱或手机号"
                    value={contact}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full px-6 py-4 bg-zinc-50 border ${error ? 'border-red-300' : 'border-zinc-100'} rounded-2xl outline-none focus:border-zinc-300 transition-all text-zinc-900 disabled:opacity-50`}
                    autoFocus
                  />
                  {error && (
                    <div className="mt-3 p-3 rounded-xl text-[11px] leading-relaxed text-red-500 bg-red-50 border border-red-100 font-medium">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在同步预约状态...
                    </>
                  ) : "确认并提交预约"}
                </button>
              </form>
            </div>
          )}

          {step === ModalStep.SUCCESS && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">预约成功</h3>
              <p className="text-zinc-500 leading-relaxed mb-8">
                我们已记录您的联系信息。当 <strong>逸潇AI助手</strong> 正式发布时，系统将自动向您发送通知邮件。
              </p>
              <button 
                onClick={onClose}
                className="w-full bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-medium hover:bg-zinc-200 transition-all"
              >
                好的，保持期待
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
