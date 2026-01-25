
import { AITool } from './types';

export const CATEGORIES = [
  '全部', '常用', '通用对话', '创意设计', '效率办公', '视频创作', '代码编程', '音频处理'
];

// 助手系统指令
export const SYSTEM_PROMPT = `你是一个专业的 AI 助手，名叫“逸潇助手”。
你的职责是帮助用户了解和使用“逸潇工具箱”中的各种 AI 工具。
你的语气应该是友好、专业且具有启发性的。
你可以回答关于去水印、PDF 转换、图片处理等工具的问题，也可以推荐适合用户需求的 AI 模型。
如果你无法确定某个具体的本地工具功能，请引导用户查看“精选神器”板块。
如果用户的问题超出了工具箱的范围，请引导他们去“用户论坛”发帖讨论。`;

// 自研精选神器
export const FEATURED_ARTIFACTS_TOOLS: AITool[] = [
  { id: 'watermark-remover', name: '一键去水印', description: '基于本地算法，移除视频与图片中的多余水印。', category: '创意设计', icon: 'erase', url: '#' },
  { id: 'pixelator', name: '一键像素化', description: '将普通照片瞬间转换为复古 8-bit 像素画风格。', category: '创意设计', icon: 'grid', url: '#' },
  { id: 'pdf-convert', name: 'PDF 格式转换', description: '本地 PDF 处理工具，支持与 Word、Excel、PPT 互转。', category: '效率办公', icon: 'pdf', url: '#' },
  { id: 'bg-remove', name: '图片扣背景', description: '本地精准扣图，一键去除背景，生成透明素材。', category: '创意设计', icon: 'scissors', url: '#' },
  { id: 'quick-collage', name: '快速拼图', description: '智能布局算法，将多张素材快速融合成精美排版海报。', category: '创意设计', icon: 'collage', url: '#' },
  { id: 'icon-generator', name: '图标生成器', description: '一键克隆图标美术风格，批量生成，自动命名。', category: '创意设计', icon: 'icon', url: '#' },
];

// 图标 Slug 对应手绘风格图标
export const POPULAR_TOOLS: AITool[] = [
  // 常用/热门
  { id: 'typeless', name: 'Typeless', description: 'AI 原生智能输入增强工具，重塑你的打字体验。', category: '效率办公', icon: 'keyboard', url: 'https://typeless.ai' },
  { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI 旗下的全能型 AI 助手。', category: '通用对话', icon: 'bot', url: 'https://chatgpt.com' },
  { id: 'claude', name: 'Claude', description: 'Anthropic 开发的高智能、安全 AI 助手。', category: '通用对话', icon: 'theater-mask', url: 'https://claude.ai' },
  { id: 'gemini', name: 'Gemini', description: 'Google 开发的多模态大模型助手。', category: '通用对话', icon: 'sparkling-diamond', url: 'https://gemini.google.com' },
  { id: 'deepseek', name: 'DeepSeek', description: '国产高性能、开源的大语言模型。', category: '通用对话', icon: 'whale', url: 'https://www.deepseek.com' },
  { id: 'midjourney', name: 'Midjourney', description: '顶尖的 AI 艺术图像生成工具。', category: '创意设计', icon: 'paint-palette', url: 'https://midjourney.com' },
  
  // 通用对话 (国产)
  { id: 'kimi', name: 'Kimi 智能助手', description: 'Moonshot AI 出品，支持超长文本分析。', category: '通用对话', icon: 'crescent-moon', url: 'https://kimi.moonshot.cn' },
  { id: 'wenxin', name: '文心一言', description: '百度推出的新一代知识增强大语言模型。', category: '通用对话', icon: 'temple-archive', url: 'https://yiyan.baidu.com' },
  { id: 'tongyi', name: '通义千问', description: '阿里巴巴出品的智能问答及创作助手。', category: '通用对话', icon: 'cloud', url: 'https://tongyi.aliyun.com' },
  { id: 'zhipu', name: '智谱清言', description: '基于 ChatGLM 的智能交互助手。', category: '通用对话', icon: 'brain', url: 'https://chatglm.cn' },
  
  // 创意设计
  { id: 'stable-diffusion', name: 'Stable Diffusion', description: '开源且功能最强大的图像生成 AI。', category: '创意设计', icon: 'milky-way', url: 'https://stability.ai' },
  { id: 'dall-e', name: 'DALL-E 3', description: '集成在 ChatGPT 中的精准图像生成系统。', category: '创意设计', icon: 'picture', url: 'https://openai.com/dall-e-3' },
  { id: 'firefly', name: 'Adobe Firefly', description: 'Adobe 出品的商业级创意生成 AI。', category: '创意设计', icon: 'fire', url: 'https://www.adobe.com/firefly' },
  { id: 'canva', name: 'Canva Magic', description: '在线设计平台集成的 AI 辅助套件。', category: '创意设计', icon: 'paint-brush', url: 'https://www.canva.com' },
  { id: 'leonardo', name: 'Leonardo.ai', description: '以高画质著称的创作平台。', category: '创意设计', icon: 'lion', url: 'https://leonardo.ai' },
  
  // 视频创作
  { id: 'sora', name: 'Sora', description: 'OpenAI 出品的颠覆性文生视频模型。', category: '视频创作', icon: 'video-camera', url: 'https://openai.com/sora' },
  { id: 'runway', name: 'Runway Gen-3', description: '顶级的 AI 视频生成与编辑平台。', category: '视频创作', icon: 'film-reel', url: 'https://runwayml.com' },
  { id: 'pika', name: 'Pika Labs', description: '极具创意的动态视频生成工具。', category: '视频创作', icon: 'rabbit', url: 'https://pika.art' },

  // 代码编程
  { id: 'github-copilot', name: 'GitHub Copilot', description: '全球最流行的 AI 代码辅助编程工具。', category: '代码编程', icon: 'laptop', url: 'https://github.com/features/copilot' },
  { id: 'cursor', name: 'Cursor', description: '基于 AI 的次世代代码编辑器。', category: '代码编程', icon: 'mouse', url: 'https://cursor.com' },
  { id: 'v0', name: 'v0.dev', description: 'Vercel 出品的 UI 界面生成 AI。', category: '代码编程', icon: 'flash-light', url: 'https://v0.dev' },

  // 音频处理
  { id: 'elevenlabs', name: 'ElevenLabs', description: '业界领先的 AI 语音克隆与合成。', category: '音频处理', icon: 'speaker', url: 'https://elevenlabs.io' },
  { id: 'suno', name: 'Suno AI', description: '风靡全球的 AI 音乐创作平台。', category: '音频处理', icon: 'musical-notes', url: 'https://suno.com' }
];