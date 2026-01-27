
import { Template } from './types';

const optimizeUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    return url.split('?')[0] + '?auto=format&fit=crop&q=75&w=400&fm=webp';
  }
  if (url.includes('volccdn.com') || url.includes('byteimg.com')) {
    if (url.includes('~')) return url;
    return `${url}~image/resize,w_400/format,webp/quality,q_75`;
  }
  return url;
};

// 预设的精选模版（前20个）
const initialTemplates: Template[] = [
  { id: 'woman-ski', category: '女神', title: '极地雪域女神', subtitle: '高级感滑雪写真', description: '在银装素裹的滑雪场，捕捉你最飒爽英姿的瞬间。', coverImage: optimizeUrl('https://images.unsplash.com/photo-1551698618-1dfe5d97d256'), exampleImages: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/seed/ski${i}/200/250`), tags: ['时尚', '运动', '冬日'], isHot: true },
  { id: 'woman-birthday', category: '女神', title: '璀璨生日之夜', subtitle: '电影感庆生大片', description: '香槟、气球与烛光，记录你最闪耀的岁末时刻。', coverImage: optimizeUrl('https://images.unsplash.com/photo-1530103043960-ef38714abb15'), exampleImages: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/seed/bday${i}/200/250`), tags: ['生日', '唯美', '派对'], isNew: true },
  { id: 'man-fitness', category: '男神', title: '肌肉钢铁意志', subtitle: '硬核健身光影大片', description: '极致的光影雕刻你的每一块肌肉线条。', coverImage: optimizeUrl('https://images.unsplash.com/photo-1534438327276-14e5300c3a48'), exampleImages: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/seed/gym${i}/200/250`), tags: ['力量', '肌肉'], isHot: true },
  { id: 'girl-career', category: '女孩', title: '小小医生梦想', subtitle: '未来职业幻想系列', description: '为孩子开启未来的无限可能。', coverImage: optimizeUrl('https://images.unsplash.com/photo-1559839734-2b71f1e3c7e5'), exampleImages: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/seed/girl1${i}/200/250`), tags: ['梦想', '职业'] },
  { id: 'boy-career', category: '男孩', title: '少年宇航员', subtitle: '未来职业幻想系列', description: '从深海潜航员到顶尖科学家。', coverImage: optimizeUrl('https://images.unsplash.com/photo-1511895426328-dc8714191300'), exampleImages: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/seed/boy1${i}/200/250`), tags: ['科学', '探索'] },
];

// 自动生成剩余 80+ 个模版以填充至 100 个，确保分页功能展现
const generateTemplates = (): Template[] => {
  const allTemplates = [...initialTemplates];
  const categories: ('女神' | '男神' | '女孩' | '男孩')[] = ['女神', '男神', '女孩', '男孩'];
  
  for (let i = allTemplates.length; i < 100; i++) {
    const category = categories[i % categories.length];
    const id = `${category}-${i}`;
    allTemplates.push({
      id,
      category,
      title: `${category}风格模版 #${i + 1}`,
      subtitle: `高画质 AI 生成系列`,
      description: `这是为您精心设计的第 ${i + 1} 款${category}专属模版，支持九宫格高清导出。`,
      coverImage: optimizeUrl(`https://picsum.photos/seed/${id}/400/533`),
      exampleImages: Array.from({ length: 9 }, (_, j) => `https://picsum.photos/seed/${id}-${j}/200/250`),
      tags: ['AI生成', '写真', category],
      isHot: i % 7 === 0,
      isNew: i % 11 === 0
    });
  }
  return allTemplates;
};

export const TEMPLATES = generateTemplates();

export const CATEGORIES: { label: string; value: string }[] = [
  { label: '全部', value: '全部' },
  { label: '女神', value: '女神' },
  { label: '男神', value: '男神' },
  { label: '女孩', value: '女孩' },
  { label: '男孩', value: '男孩' },
];
