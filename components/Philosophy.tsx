
import React from 'react';

const Philosophy: React.FC = () => {
  return (
    <section id="philosophy" className="py-32 bg-zinc-900 text-white overflow-hidden relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-block px-3 py-1 rounded-full border border-white/20 text-white/40 text-[10px] font-bold tracking-widest uppercase mb-12">
          OUR PHILOSOPHY
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-12 leading-tight">
          我们在尝试把软件做好，<br />
          也希望它能被用得久一点。
        </h2>
        <div className="space-y-8 text-zinc-400 text-lg font-light leading-loose max-w-2xl mx-auto">
          <p>
            在当下这个热点层出不穷的时代，我们反而更迷恋“时间”的力量。
          </p>
          <p>
            逸潇工作室不追求规模的扩张，也不追求短期内爆发式的增长。我们关注的是用户在使用软件一年、三年、甚至五年后，是否依然能感受到它带来的价值。
          </p>
          <p>
            我们是一个独立工作室，这赋予了我们不妥协的权利。每一行代码、每一个交互细节，都由我们负责人深度打磨。
          </p>
          <p className="text-white font-medium italic">
            —— “克制，是为了给未来留出更长的时间。”
          </p>
        </div>
      </div>
      
      {/* Dynamic background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>
    </section>
  );
};

export default Philosophy;
