
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 bg-white border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold tracking-tight text-zinc-900">逸潇工作室</span>
              <span className="text-sm text-zinc-400 font-light">| Yixiao Studio</span>
            </div>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              独立软件研发工作室。坚持长期主义，用技术构建有温度、有厚度的数字工具。
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-6">快速链接</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#hero" className="hover:text-zinc-900 transition-colors">工作室首页</a></li>
              <li><a href="#matrix" className="hover:text-zinc-900 transition-colors">产品路线图</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">隐私政策</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">服务条款</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-6">联系我们</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li>微信公众号：逸潇工作室</li>
              <li>反馈邮箱：3577239276@qq.com</li>
              <li>地址：中国·成都</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
          <div>
            © 2024 YIXIAO STUDIO. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
