
export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  url: string;
  isUserContributed?: boolean;
  contributor?: string;
  tutorialSteps?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum TabType {
  HOME = 'HOME',
  FAVORITES = 'FAVORITES',
  FEATURED_ARTIFACTS = 'FEATURED_ARTIFACTS',
  FORUM = 'FORUM',
  USER_POOL = 'USER_POOL',
  NEWS = 'NEWS'
}

export interface FavoriteUsage {
  toolId: string;
  lastUsedDate: string;
  totalTimeMinutes: number;
  remainingPoints: number;
}

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  tag: '求助' | '分享' | '讨论';
  repliesCount: number;
  likes: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  tag: string;
  url: string;
  imageUrl: string;
}
