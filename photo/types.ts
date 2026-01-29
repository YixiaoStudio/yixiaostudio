
export type Category = '女神' | '男神' | '女孩' | '男孩' | '商家' | '全部' | '旅拍';

export type TaskType = 'daily' | 'weekly' | 'achievement';

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
  isNew?: boolean;
  isLimited?: boolean;
  pointCost?: number;
  targetPath?: string;
  // 旅行地图相关
  locationName?: string;
  coordinates?: { lat: number; lng: number };
  // 热度统计
  usageCount?: number;
}

export interface UserProfile {
  userName: string;
  avatar: string;
  bio: string;
  isPublic: boolean;
  joinDate: string;
  points: number;
  credits: number; 
  isPlus: boolean; // 新增：是否是PLUS会员
  unlockedTemplates: string[];
  visitedLocations: string[]; 
  lastLoginDate?: string;
}

export interface DailyTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  points: number;
  limit: number;
  current: number;
  icon: string;
  color: string;
}

export interface GalleryItem {
  id: string;
  templateId: string;
  templateTitle: string;
  images: string[];
  timestamp: string;
  isPlus: boolean;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  title: string;
  templateId: string; 
  templateTitle: string;
  likes: number;
  isLiked?: boolean;
  comments: Comment[]; 
  timestamp: string;
  isChallengeEntry?: boolean;
}

// Added Challenge interface to fix import error in Community.tsx
export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  bannerImage: string;
}
