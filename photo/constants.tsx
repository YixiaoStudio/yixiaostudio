import { Template, DailyTask } from './types';

// 任务配置
export const ALL_TASKS_CONFIG: Omit<DailyTask, 'current'>[] = [
  // 每日任务
  { id: 'login', type: 'daily', title: '每日签到', description: '开启元气满满的创作一天', points: 50, limit: 1, icon: '📅', color: 'from-blue-500 to-indigo-600' },
  { id: 'generate', type: 'daily', title: '创作写真', description: '使用任意模版生成作品', points: 20, limit: 5, icon: '🎨', color: 'from-purple-500 to-pink-600' },
  { id: 'share', type: 'daily', title: '分享作品', description: '将作品发布至社区', points: 30, limit: 2, icon: '🚀', color: 'from-blue-400 to-cyan-500' },
  { id: 'like', type: 'daily', title: '社区互动', description: '给喜欢的作品点个赞', points: 5, limit: 10, icon: '❤️', color: 'from-rose-400 to-red-500' },
  { id: 'comment', type: 'daily', title: '友善评论', description: '在评论区交流心得', points: 10, limit: 3, icon: '💬', color: 'from-amber-400 to-orange-500' },
  { id: 'travel', type: 'daily', title: '环球打卡', description: '在旅行地图生成一张异国写真', points: 100, limit: 1, icon: '🌍', color: 'from-emerald-400 to-teal-600' },

  // 每周任务 (New)
  { id: 'weekly_explore', type: 'weekly', title: '本周探险家', description: '本周内点亮 3 个不同的旅行目的地', points: 500, limit: 3, icon: '🎒', color: 'from-indigo-600 to-purple-700' },
  { id: 'weekly_creator', type: 'weekly', title: '高产创作者', description: '本周内累计创作 15 件写真作品', points: 300, limit: 15, icon: '🌟', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'weekly_social', type: 'weekly', title: '社交达人', description: '本周作品累计获得 50 个社区点赞', points: 400, limit: 50, icon: '🔥', color: 'from-orange-500 to-rose-500' },
];

// 旅拍模版预设 (扩充至 24 个地点)
const travelTemplates: Template[] = [
  {
    id: 'travel-paris',
    category: '旅拍',
    title: '塞纳河畔的晨光',
    locationName: '法国 · 巴黎',
    subtitle: '法式优雅与浪漫之都',
    description: '以埃菲尔铁塔为背景，捕捉清晨的第一缕阳光，展现极致的法式慵懒。',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
    tags: ['巴黎', '法式', '浪漫'],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    usageCount: 8902
  },
  {
    id: 'travel-beijing',
    category: '旅拍',
    title: '故宫红墙下的雪',
    locationName: '中国 · 北京',
    subtitle: '一眼万年的东方古韵',
    description: '身着汉服漫步在故宫红墙下，感受紫禁城的庄严与雪景的静谧。',
    coverImage: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?auto=format&fit=crop&q=80&w=800',
    tags: ['北京', '故宫', '古风'],
    coordinates: { lat: 39.9042, lng: 116.4074 },
    usageCount: 15400
  },
  {
    id: 'travel-newyork',
    category: '旅拍',
    title: '第五大道的繁华',
    locationName: '美国 · 纽约',
    subtitle: '永不熄灭的都市霓虹',
    description: '在繁华的时代广场，捕捉全球潮流的脉动。',
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
    tags: ['纽约', '时尚', '都市'],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    usageCount: 12000
  },
  {
    id: 'travel-london',
    category: '旅拍',
    title: '泰晤士河的钟声',
    locationName: '英国 · 伦敦',
    subtitle: '英伦贵族的优雅沉淀',
    description: '在大本钟与红色双层巴士的映衬下，开启一段复古的英伦旅程。',
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
    tags: ['伦敦', '英伦', '复古'],
    coordinates: { lat: 51.5074, lng: -0.1278 },
    usageCount: 9800
  },
  {
    id: 'travel-rome',
    category: '旅拍',
    title: '永恒之城的午后',
    locationName: '意大利 · 罗马',
    subtitle: '废墟之上的艺术巅峰',
    description: '在斗兽场与特莱维喷泉旁，追寻罗马假日的浪漫回忆。',
    coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
    tags: ['罗马', '文艺', '电影感'],
    coordinates: { lat: 41.9028, lng: 12.4964 },
    usageCount: 7600
  },
  {
    id: 'travel-santorini',
    category: '旅拍',
    title: '爱琴海的蓝调',
    locationName: '希腊 · 圣托里尼',
    subtitle: '上帝掉落在海里的调色盘',
    description: '纯白的建筑与湛蓝的海水交织，定格最唯美的海岛度假风。',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800',
    tags: ['希腊', '海岛', '清新'],
    coordinates: { lat: 36.3932, lng: 25.4615 },
    usageCount: 11000
  },
  {
    id: 'travel-bali',
    category: '旅拍',
    title: '丛林秋千与海浪',
    locationName: '印度尼西亚 · 巴厘岛',
    subtitle: '赤道南纬 8 度的私藏',
    description: '在乌布的秋千上飞越丛林，感受巴厘岛的野性与纯净。',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    tags: ['巴厘岛', '度假', '自然'],
    coordinates: { lat: -8.4095, lng: 115.1889 },
    usageCount: 13400
  },
  {
    id: 'travel-dubai',
    category: '旅拍',
    title: '黄金沙漠之巅',
    locationName: '阿联酋 · 迪拜',
    subtitle: '沙漠与科技的交响',
    description: '在哈利法塔顶俯瞰云端，或是骑着骆驼横跨漫天金黄的沙海。',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
    tags: ['迪拜', '奢华', '科幻'],
    coordinates: { lat: 25.2048, lng: 55.2708 },
    usageCount: 8800
  },
  {
    id: 'travel-tokyo',
    category: '旅拍',
    title: '涩谷霓虹物语',
    locationName: '日本 · 东京',
    subtitle: '赛博都市的潮流巅峰',
    description: '置身于东京繁华街头，感受霓虹灯影下的时尚脉搏。',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
    tags: ['东京', '潮流', '都市'],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    usageCount: 12450
  },
  {
    id: 'travel-seoul',
    category: '旅拍',
    title: '韩屋村的初雪',
    locationName: '韩国 · 首尔',
    subtitle: '韩流与传统的碰撞',
    description: '穿上精美的韩服，在景福宫的长廊间留下动人瞬间。',
    coverImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&q=80&w=800',
    tags: ['首尔', '韩系', '氛围'],
    coordinates: { lat: 37.5665, lng: 126.9780 },
    usageCount: 9500
  },
  {
    id: 'travel-bangkok',
    category: '旅拍',
    title: '大皇宫的金辉',
    locationName: '泰国 · 曼谷',
    subtitle: '暹罗王朝的璀璨遗产',
    description: '在精美绝伦的泰式神庙中，定格极具异域色彩的奢华写真。',
    coverImage: 'https://images.unsplash.com/photo-1504966981333-1cf345c47314?auto=format&fit=crop&q=80&w=800',
    tags: ['曼谷', '泰式', '异域'],
    coordinates: { lat: 13.7563, lng: 100.5018 },
    usageCount: 10200
  },
  {
    id: 'travel-moscow',
    category: '旅拍',
    title: '红场的克林姆林',
    locationName: '俄罗斯 · 莫斯科',
    subtitle: '冰雪王国的童话梦',
    description: '以洋葱头教堂为背景，展现大气磅礴的东欧贵族气质。',
    coverImage: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80&w=800',
    tags: ['莫斯科', '硬核', '宏伟'],
    coordinates: { lat: 55.7558, lng: 37.6173 },
    usageCount: 6700
  },
  {
    id: 'travel-cairo',
    category: '旅拍',
    title: '金字塔的黄昏',
    locationName: '埃及 · 开罗',
    subtitle: '跨越千年的时空对话',
    description: '在漫天黄沙中，与世界奇迹合影，寻找神秘的法老印记。',
    coverImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800',
    tags: ['埃及', '沙漠', '神秘'],
    coordinates: { lat: 30.0444, lng: 31.2357 },
    usageCount: 5400
  },
  {
    id: 'travel-sydney',
    category: '旅拍',
    title: '悉尼湾的帆影',
    locationName: '澳大利亚 · 悉尼',
    subtitle: '南半球的阳光海岸',
    description: '在歌剧院与海港大桥前，享受最纯正的澳洲蓝天与白帆。',
    coverImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800',
    tags: ['悉尼', '海港', '现代'],
    coordinates: { lat: -33.8688, lng: 151.2093 },
    usageCount: 8200
  },
  {
    id: 'travel-switzerland',
    category: '旅拍',
    title: '阿尔卑斯的呼吸',
    locationName: '瑞士 · 少女峰',
    subtitle: '离天空最近的雪境',
    description: '在圣洁的雪山之巅，记录如同精灵般的纯粹美感。',
    coverImage: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=800',
    tags: ['瑞士', '雪景', '治愈'],
    coordinates: { lat: 46.5475, lng: 7.9854 },
    usageCount: 14500
  },
  {
    id: '0001',
    category: '女神',
    title: '滑雪实验室',
    subtitle: '雪道飞驰的冬日欢歌',
    description: ' 身着滑雪服，驰骋在银装素裹的雪场，尽享冬日运动的酣畅快意。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0001.jpg',
    tags: ['滑雪', '雪场', '冬日'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 27100
  },
  {
    id: '0004',
    category: '旅拍',
    title: '长安寻迹',
    subtitle: '古都的千年风华',
    description: '身着汉服，漫步在西安的古街巷弄，感受历史与现代的交融。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0004.jpg',
    tags: ['西安', '古都', '汉服'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 18800
  },
  {
    id: '0005',
    category: '旅拍',
    title: '沪上风华',
    subtitle: '十里洋场，沪上的摩登风华',
    description: '身着复古旗袍，徜徉在老上海的石库门弄堂，邂逅百年的摩登与优雅。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0005.jpg',
    tags: ['老上海', '名媛', '旗袍'],
    coordinates: { lat: 31.2304, lng: 121.4737 },
    usageCount: 26900
  },
  {
    id: '0006',
    category: '女神',
    title: '我是世界500强的女老板',
    subtitle: '职场高阶，锋芒尽显',
    description: '身着干练穿搭，置身都市商务场景，彰显独立自信的女性力量。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0006.jpg',
    tags: ['女老板', '职场', '干练'],
    coordinates: { lat: 31.2304, lng: 121.4737 },
    usageCount: 18600
  },
  {
    id: '0007',
    category: '旅拍',
    title: '成都漫叙',
    subtitle: '蜀地闲情，入画生香',
    description: '身着蜀绣旗袍，漫步成都的宽窄巷陌，邂逅天府之国的烟火与闲适。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0007.jpg',
    tags: ['成都', '休闲', '熊猫'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 17500
  },
  {
    id: '0008',
    category: '旅拍',
    title: '敦煌飞天仙韵',
    subtitle: '飞天踏云，古韵盈怀',
    description: '身着飞天襦裙，飘带翩跹于大漠戈壁之间，邂逅丝路遗韵与飞天的灵动之美。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0008.jpg',
    tags: ['敦煌', '飞天', '大漠'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 26810
  },
  {
    id: '0009',
    category: '女神',
    title: '霍格沃茨・魔法绮梦',
    subtitle: '化身巫师，畅游霍格沃茨',
    description: '身着魔法袍，徜徉在霍格沃茨的城堡街巷，邂逅魔法世界的奇幻与浪漫。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0009.jpg',
    tags: ['霍格沃茨', '魔法', '奇幻'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 18300
  },
  {
    id: '0010',
    category: '旅拍',
    title: '新加坡寻迹',
    subtitle: '狮城的南洋风情',
    description: '漫步新加坡的街巷滨海，感受南洋风情与现代都市的交融。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0010.jpg',
    tags: ['新加坡', '狮城', '南洋'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 18200
  },
  {
    id: '0011',
    category: '旅拍',
    title: '波多黎各寻迹',
    subtitle: '海岛的热带风情',
    description: '身着度假风穿搭，漫步波多黎各的彩色街巷与海滩，感受加勒比的热烈与浪漫。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0011.jpg',
    tags: ['波多黎各', '海岛', '热带'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 18100
  },
  {
    id: '0012',
    category: '旅拍',
    title: '墨西哥复活节',
    subtitle: '拉美色彩狂欢季',
    description: '参与墨西哥复活节的民俗庆典，感受拉美文化的热烈与鲜活。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0012.jpg',
    tags: ['墨西哥', '复活节', '狂欢'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 18000
  },
  {
    id: '0013',
    category: '旅拍',
    title: '马尔代夫寻迹',
    subtitle: '海岛的澄澈之美',
    description: '徜徉马尔代夫的海岛椰林，感受碧海白沙的澄澈与浪漫。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0013.jpg',
    tags: ['马尔代夫', '海岛', '度假'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 27200
  },
  {
    id: '0014',
    category: '女神',
    title: '乐园绮梦',
    subtitle: '童话里的浪漫时光',
    description: '身着甜美穿搭，漫步梦幻乐园之中，邂逅童真与欢乐的美好瞬间。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0014.jpg',
    tags: ['乐园', '童话', '浪漫'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 17800
  },
  {
    id: '0015',
    category: '女孩',
    title: '粉色蛋糕派对',
    subtitle: '甜妹的梦幻时刻',
    description: '身着粉色蓬蓬裙，置身蛋糕与气球的梦幻场景，捕捉甜妹的俏皮与灵动。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0015.jpg',
    tags: ['蛋糕', '派对', '梦幻'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 17800
  },
  {
    id: '0016',
    category: '男孩',
    title: '小蜘蛛奇遇记',
    subtitle: '童趣的冒险之旅',
    description: '化身小小蜘蛛侠，穿梭在充满奇幻色彩的场景中，开启一场充满勇气与惊喜的冒险。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0016.jpg',
    tags: ['蜘蛛侠', '童趣', '冒险'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 17810
  },
  {
    id: '0017',
    category: '商家',
    title: '儿童糖画',
    subtitle: '舌尖上的非遗',
    description: '手持晶莹的糖画，在老巷的糖画摊前驻足，感受传统手艺的甜香与童趣。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0017.jpg',
    tags: ['糖画', '非遗', '童趣'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 17600
  },
  {
    id: '0018',
    category: '女神',
    title: '解锁新座驾',
    subtitle: '奔赴自由新旅程',
    description: '驰骋万里，平安顺遂。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0018.jpg',
    tags: ['车', '自由', '旅程'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 26800
  },
  {
    id: '0019',
    category: '女神',
    title: '小奶汪的精致SPA',
    subtitle: '生活小美好・萌宠日记',
    description: '用心呵护爱宠，温柔洗护，定格温馨治愈的日常瞬间。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0019.jpg',
    tags: ['宠物', 'SPA', '治愈'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 27000
  },
    {
    id: '0020',
    category: '女神',
    title: '鎏光度假之夜',
    subtitle: '奢享度假慢时光',
    description: '置身奢华酒店，定格精致优雅的轻奢瞬间，尽享品质生活。',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0020.jpg',
    tags: ['酒店', '轻奢', '优雅'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 27300
  },
  {
    id: '0023',
    category: '旅拍',
    title: '梦回长安不夜城',
    locationName: '中国 · 西安',
    subtitle: '大唐盛世的万家灯火',
    description: '身着襦裙，置身不夜城的流光溢彩中，重现盛唐风华。',
    coverImage: 'https://images.unsplash.com/photo-1582268611958-ebad17159ed7?auto=format&fit=crop&q=80&w=800',
    tags: ['西安', '盛唐', '汉服'],
    coordinates: { lat: 34.3416, lng: 108.9398 },
    usageCount: 10
  },
  {
    id: 'travel-chengdu',
    category: '旅拍',
    title: '宽窄巷子的安逸',
    locationName: '中国 · 成都',
    subtitle: '烟火气中的时尚之都',
    description: '在古香古色的川西民居中，捕捉独属于成都的慢节奏优雅。',
    coverImage: 'https://images.unsplash.com/photo-1541417129705-0e31be03df6c?auto=format&fit=crop&q=80&w=800',
    tags: ['成都', '巷弄', '川蜀'],
    coordinates: { lat: 30.5728, lng: 104.0668 },
    usageCount: 14200
  },
  {
    id: 'travel-hangzhou',
    category: '旅拍',
    title: '西湖断桥残雪',
    locationName: '中国 · 杭州',
    subtitle: '江南烟雨的极致柔情',
    description: '在苏堤与雷峰塔的掩映下，定格如水墨画般的江南写真。',
    coverImage: 'https://images.unsplash.com/photo-1581414436531-155452f36d1f?auto=format&fit=crop&q=80&w=800',
    tags: ['杭州', '西湖', '唯美'],
    coordinates: { lat: 30.2741, lng: 120.1551 },
    usageCount: 11500
  },
  {
    id: 'travel-dali',
    category: '旅拍',
    title: '洱海边的白裙',
    locationName: '中国 · 大理',
    subtitle: '风花雪月的自在生活',
    description: '站在洱海的S湾，任海风吹乱发丝，定格最纯粹的森系大片。',
    coverImage: 'https://images.unsplash.com/photo-1591147139223-9993309e3215?auto=format&fit=crop&q=80&w=800',
    tags: ['大理', '洱海', '文艺'],
    coordinates: { lat: 25.6065, lng: 100.2676 },
    usageCount: 16700
  },
  {
    id: 'travel-lhasa',
    category: '旅拍',
    title: '布达拉宫之虔诚',
    locationName: '中国 · 拉萨',
    subtitle: '世界屋脊的信仰之光',
    description: '在圣洁的布达拉宫广场前，留下一生一次的西藏记忆。',
    coverImage: 'https://images.unsplash.com/photo-1541542684-d2d91df5185d?auto=format&fit=crop&q=80&w=800',
    tags: ['拉萨', '民族', '震撼'],
    coordinates: { lat: 29.6469, lng: 91.1172 },
    usageCount: 13900
  },
  {
    id: '0002',
    category: '男孩',
    title: '儿童未来职业照',
    subtitle: '童心筑梦的职业畅想',
    description: '身着职业装，置身专属职业场景，定格童年的美好职业期许',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0002.jpg',
    tags: ['儿童职业照', '童梦启航', '成长纪念'],
    usageCount: 17800
  },
  {
    id: '0003',
    category: '女孩',
    title: '儿童未来职业照',
    subtitle: '童心筑梦的职业畅想',
    description: '身着职业装，置身专属职业场景，定格童年的美好职业期许',
    coverImage: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-Photo/z0003.jpg',
    tags: ['儿童职业照', '童梦启航', '成长纪念'],
    usageCount: 17800
  },
  {
    id: 'travel-hongkong',
    category: '旅拍',
    title: '维港霓虹电影感',
    locationName: '中国 · 香港',
    subtitle: '东方之珠的怀旧胶片',
    description: '天星小轮与摩天大楼交错，定格极具王家卫风格的胶片质感。',
    coverImage: 'https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&q=80&w=800',
    tags: ['香港', '胶片', '复古'],
    coordinates: { lat: 22.3193, lng: 114.1694 },
    usageCount: 10
  },
  {
    id: 'travel-iceland',
    category: '旅拍',
    title: '极地苍穹之下',
    locationName: '冰岛 · 雷克雅未克',
    subtitle: '地球上最像外星的地方',
    description: '在冰岛的旷野中，与绚丽极光共舞，记录跨越时空的壮丽美感。',
    coverImage: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800',
    tags: ['冰岛', '极光', '壮丽'],
    coordinates: { lat: 64.1265, lng: -21.8174 },
    usageCount: 5670
  },
  {
    id: 'travel-shanghai',
    category: '旅拍',
    title: '东方明珠幻梦',
    locationName: '中国 · 上海',
    subtitle: '摩登东方的交响乐',
    description: '在外滩的长廊上，看浦江两岸的建筑交叠，感受魔都的无限魅力。',
    coverImage: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&q=80&w=800',
    tags: ['上海', '外滩', '摩登'],
    coordinates: { lat: 31.2304, lng: 121.4737 },
    usageCount: 15800
  },
  {
    id: 'travel-riodejaneiro',
    category: '旅拍',
    title: '救世基督像前',
    locationName: '巴西 · 里约热内卢',
    subtitle: '狂欢之都的无限热望',
    description: '在科科瓦多山顶，张开双臂迎接南美洲最热情的阳光。',
    coverImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
    tags: ['里约', '耶稣像', '热情'],
    coordinates: { lat: -22.9519, lng: -43.2105 },
    usageCount: 4200
  }
];

const generateTemplates = (): Template[] => {
  const categories: Exclude<import('./types').Category, '全部'>[] = ['女神', '男神', '女孩', '男孩', '商家'];
  const allTemplates: Template[] = [...travelTemplates];

  for (let i = 0; i < 40; i++) {
    const category = categories[i % categories.length];
    const id = `${category}-${i}`;
    const isLimited = i % 8 === 0;
    allTemplates.push({
      id,
      category,
      title: isLimited ? `【限定】${category}典藏 #${i}` : `${category}模版 #${i + 1}`,
      subtitle: isLimited ? '稀有艺术风格' : 'AI 智能生成',
      description: `为您设计的专属${category}风格。`,
      coverImage: `https://picsum.photos/seed/${id}/400/533`,
      tags: isLimited ? ['限定', '高级'] : ['写真'],
      isHot: i % 5 === 0,
      isLimited,
      pointCost: isLimited ? 500 : 0,
      usageCount: Math.floor(Math.random() * 5000) + 100 // 初始随机热度
    });
  }
  return allTemplates;
};

export const TEMPLATES = generateTemplates();

export const CATEGORIES: { label: string; value: string }[] = [
  { label: '全部', value: '全部' },
  { label: '热门推荐', value: '热门' },
  { label: '旅行地图', value: '旅拍' },
  { label: '女神', value: '女神' },
  { label: '男神', value: '男神' },
  { label: '女孩', value: '女孩' },
  { label: '男孩', value: '男孩' },
  { label: '商家', value: '商家' },
];