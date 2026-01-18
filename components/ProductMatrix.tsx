
import React from 'react';
import { ProductStatus } from '../types';

interface ProductMatrixProps {
  onDownloadClick: () => void;
}

const products = [
  {
    name: '逸潇AI助手',
    description: '你的个人AI资产管理中心，一站集中管理，告别分散AI工具和重复操作。',
    status: ProductStatus.AVAILABLE,
    tags: ['工具', '效率', 'AI管理'],
    color: 'bg-zinc-900',
    icon: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/icon-yixiao_ai.png',
    btnText: '预约上线'
  },
  {
    name: '逸潇次元拍',
    description: 'AI创意修图应用，让每个人都能轻松生成好看又有风格的照片。',
    status: ProductStatus.PLANNING,
    tags: ['AI影像', '创作', '易用'],
    color: 'bg-blue-500',
    icon: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/icon-yixiaociyuanpai.png',
    btnText: '敬请期待'
  },
  {
    name: '逸潇宝贝',
    description: '面向儿童的启蒙软件。涵盖编程、外语、美术等方向，以陪伴式学习支持孩子长期发展。',
    status: ProductStatus.LONG_TERM,
    tags: ['儿童启蒙', '长期', '安全'],
    color: 'bg-emerald-500',
    icon: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/icon-yixiaokids.png',
    btnText: '敬请期待'
  }
];

const ProductMatrix: React.FC<ProductMatrixProps> = ({ onDownloadClick }) => {
  return (
    <section id="matrix" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">产品矩阵</h2>
          <p className="text-zinc-500 font-light">我们的路线图。每一个项目都承载着我们对特定领域的长期观察。</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <div 
              key={i} 
              className="group flex flex-col p-8 bg-white border border-zinc-100 rounded-3xl hover:shadow-xl hover:shadow-zinc-100 hover:border-zinc-200 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-zinc-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
                   <img 
                    src={p.icon} 
                    alt={p.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 备用方案：如果图标路径不存在，显示带颜色的圆角矩形
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.classList.add(p.color, 'opacity-20');
                      }
                    }}
                   />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                  p.status === ProductStatus.AVAILABLE 
                  ? 'border-zinc-200 text-zinc-900 bg-zinc-50' 
                  : 'border-zinc-100 text-zinc-400'
                }`}>
                  {p.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-zinc-900 mb-3">{p.name}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-8 flex-grow">
                {p.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {p.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-zinc-50 text-zinc-400 px-2 py-1 rounded-md">#{tag}</span>
                ))}
              </div>
              
              {p.status === ProductStatus.AVAILABLE ? (
                <button 
                  onClick={onDownloadClick}
                  className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all"
                >
                  {p.btnText}
                </button>
              ) : (
                <button disabled className="w-full py-3 bg-zinc-50 text-zinc-300 rounded-xl text-sm font-medium cursor-not-allowed">
                  {p.btnText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductMatrix;
