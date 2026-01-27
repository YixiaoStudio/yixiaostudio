
export type Category = '女神' | '男神' | '女孩' | '男孩' | '全部';

export interface Template {
  id: string;
  category: Exclude<Category, '全部'>;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  exampleImages: string[];
  tags: string[];
  isHot?: boolean;
  isNew?: boolean; // 新增：标注是否为新上架模版
  targetPath?: string;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  status: string;
  result?: string[];
}
