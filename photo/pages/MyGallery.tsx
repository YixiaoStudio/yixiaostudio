import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalleryItem, CommunityPost, UserProfile } from '../types';
import { ALL_TASKS_CONFIG } from '../constants';

// ========== 修正：后端接口配置（统一为正确的接口地址） ==========
const API_BASE_URL = 'https://sd5j17d5mg7k3v1e7vu60.apigateway-cn-beijing.volceapi.com';
const USER_IMAGES_API = `${API_BASE_URL}/api/get-user-images`;
const SAVE_GENERATED_IMAGE_API = `${API_BASE_URL}/api/save-generated-image`;
const DELETE_GENERATED_IMAGE_API = `${API_BASE_URL}/api/delete-generated-image`;
const CHECK_IMAGE_EXIST_API = `${API_BASE_URL}/api/check-image-exist`; // 新增：检查图片是否存在

// ========== 核心优化：生成高精度时间戳（到毫秒） ==========
/**
 * 生成精确到毫秒的ISO格式时间戳
 * @returns string 如 "2026-02-23T15:30:45.123Z"
 */
const generatePreciseTimestamp = (): string => {
  return new Date().toISOString();
};

// ========== 优化：按毫秒级时间降序排序的工具函数（核心修改：高精度排序） ==========
/**
 * 按时间降序排序图库图片（新生成的排在前面）
 * @param items GalleryItem[] 待排序的图片列表
 * @returns GalleryItem[] 排序后的图片列表
 */
const sortGalleryItemsByTimeDesc = (items: GalleryItem[]): GalleryItem[] => {
  const sortedItems = [...items].sort((a, b) => {
    // 确保timestamp是有效的高精度日期格式，解析到毫秒
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    // 降序排列：时间大的（新的）排在前面，毫秒级精度对比
    return timeB - timeA;
  });
  
  // 打印排序日志，显示精确到秒的时间，方便验证
  console.log('[排序结果] 图片按时间降序排列（新→旧）：', sortedItems.map(item => ({
    id: item.id,
    templateTitle: item.templateTitle,
    time: new Date(item.timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    timestamp: item.timestamp,
    timeMs: new Date(item.timestamp).getTime()
  })));
  
  return sortedItems;
};

// ========== 新增：过滤无效图片的工具函数（增强版） ==========
/**
 * 过滤无效/生成失败/已删除的图片
 * @param item GalleryItem
 * @returns boolean 是否为有效图片
 */
export const isValidGalleryItem = (item: GalleryItem): boolean => {
  if (!item || !item.images || item.images.length === 0) return false;
  
  // 只保留TOS永久URL
  const tosDomain = 'yixiaostudio.tos-cn-beijing.volces.com';
  // 过滤无效URL
  const invalidUrlPatterns = [/^$/, /localhost/, /127.0.0.1/, /tmp/, /ark\.volces\.com/];
  
  const hasValidImage = item.images.some(url => {
    return url.includes(tosDomain) && !invalidUrlPatterns.some(pattern => pattern.test(url));
  });
  
  return hasValidImage;
};

// ========== 新增：检查图片URL是否有效（避免加载已删除的图片） ==========
export const checkImageUrlValid = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl || !imageUrl.includes('yixiaostudio.tos-cn-beijing.volces.com')) {
    return false;
  }
  
  try {
    // 方式1：通过后端接口检查（推荐）
    const res = await fetch(`${CHECK_IMAGE_EXIST_API}?imageUrl=${encodeURIComponent(imageUrl)}`, {
      method: 'HEAD',
      cache: 'no-cache',
      timeout: 3000
    });
    return res.ok;
    
    // 方式2：直接检查图片（备用）
    // const img = new Image();
    // img.src = imageUrl;
    // await new Promise((resolve) => {
    //   img.onload = () => resolve(true);
    //   img.onerror = () => resolve(false);
    //   setTimeout(() => resolve(false), 3000);
    // });
    // return img.complete && img.naturalWidth > 0;
  } catch (err) {
    console.debug(`[checkImageUrlValid] 图片${imageUrl}无效`, err);
    return false;
  }
};

// ========== 重构：获取当前登录用户ID ==========
export const getCurrentUserId = (): number | null => {
  try {
    const userKeys = ['ai-current-user', 'ai_photo_generator_user', 'ai-user-profile'];
    let userStr = null;
    
    for (const key of userKeys) {
      userStr = localStorage.getItem(key);
      if (userStr) {
        console.log(`[getCurrentUserId] 从${key}读取到用户信息：`, userStr);
        break;
      }
    }

    if (!userStr) {
      console.warn('[getCurrentUserId] 未找到任何用户登录信息');
      return null;
    }

    const user = JSON.parse(userStr);
    const userId = user.id || user.userId || user.user_id;
    
    if (!userId || isNaN(Number(userId))) {
      console.warn('[getCurrentUserId] 用户信息中无有效ID：', user);
      return null;
    }

    const numId = Number(userId);
    console.log(`[getCurrentUserId] 成功获取用户ID：${numId}`);
    return numId;
  } catch (err) {
    console.error('[getCurrentUserId] 获取用户ID失败：', err);
    return null;
  }
};

// ========== 重构：从后端获取用户图片（优化时间戳格式） ==========
export const fetchGeneratedImages = async (userId: number): Promise<GalleryItem[]> => {
  try {
    if (!userId) {
      console.warn('[fetchGeneratedImages] userId为空，返回空数组');
      return [];
    }
    
    console.log(`[fetchGeneratedImages] 调用接口：${USER_IMAGES_API}?userId=${userId}&type=generate`);
    const res = await fetch(`${USER_IMAGES_API}?userId=${userId}&type=generate&limit=50`, {
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[fetchGeneratedImages] 接口返回错误（${res.status}）：`, errorText);
      return [];
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const nonJsonText = await res.text();
      console.error('[fetchGeneratedImages] 接口返回非JSON数据：', nonJsonText);
      return [];
    }

    const data = await res.json();
    console.log(`[fetchGeneratedImages] 从后端获取生成图片：`, data);
    
    // 适配格式 + 过滤无效图片 + 标准化时间戳
    if (data.code === 0 && Array.isArray(data.data)) {
      const validItems: GalleryItem[] = [];
      // 🔥 修复：改用for循环，避免Promise.all导致的Hook调用异常
      for (const item of data.data) {
        // 过滤图片数组
        const validImages = (item.url ? [item.url] : (item.images || [])).filter(url => {
          const tosDomain = 'yixiaostudio.tos-cn-beijing.volces.com';
          return url.includes(tosDomain) && !/^$|localhost|127.0.0.1|tmp|ark\.volces\.com/.test(url);
        });
        
        // 只保留有有效图片的项
        if (validImages.length > 0) {
          // 标准化时间戳：确保是高精度ISO格式
          let itemTimestamp = item.timestamp;
          if (!itemTimestamp) {
            // 如果后端没有返回时间戳，使用图片ID中的时间或生成新的
            itemTimestamp = item.id && /\d{13}/.test(item.id) 
              ? new Date(Number(/\d{13}/.exec(item.id)[0])).toISOString()
              : generatePreciseTimestamp();
          } else if (typeof itemTimestamp === 'number') {
            // 如果是数字时间戳（毫秒），转换为ISO格式
            itemTimestamp = new Date(itemTimestamp).toISOString();
          } else if (!itemTimestamp.includes('T') || !itemTimestamp.includes('.')) {
            // 如果是不标准的时间字符串，尝试修复为高精度格式
            try {
              itemTimestamp = new Date(itemTimestamp).toISOString();
            } catch (e) {
              itemTimestamp = generatePreciseTimestamp();
            }
          }
          
          validItems.push({
            id: item.id || `${item.templateId || 'temp'}-${Date.now()}`, // ID包含毫秒级时间，确保唯一
            templateId: item.templateId || '',
            templateTitle: item.templateTitle || '未知模板',
            images: validImages,
            // 核心优化：确保timestamp为高精度ISO格式（到毫秒）
            timestamp: itemTimestamp,
            isPlus: item.isPlus || false,
            originalImage: { 
              tosUrl: item.originalImageUrl || '', 
              source: 'upload' 
            }
          });
        }
      }
      
      // 🔥 新增：打印后端返回的图片ID和URL，用于排查
      console.log(`[fetchGeneratedImages] 后端有效图片列表：`, validItems.map(i => ({ 
        id: i.id, 
        url: i.images[0],
        timestamp: i.timestamp,
        timeMs: new Date(i.timestamp).getTime()
      })));
      return validItems.filter(item => isValidGalleryItem(item));
    } else {
      console.error('[fetchGeneratedImages] 后端返回数据格式错误：', data);
      return [];
    }
  } catch (err) {
    console.error('[fetchGeneratedImages] 调用后端接口失败：', err);
    return [];
  }
};

// ========== 重构：保存生成图片到后端（优化时间戳存储） ==========
export const saveGeneratedImageToServer = async (userId: number, galleryItem: GalleryItem) => {
  // 增加防抖标记，避免重复保存
  const syncKey = `synced_${galleryItem.id}_${userId}`;
  if (localStorage.getItem(syncKey)) {
    console.debug(`[saveGeneratedImageToServer] 图片${galleryItem.id}已同步过，跳过`);
    return true;
  }
  
  try {
    if (!userId) {
      console.error('[saveGeneratedImageToServer] userId为空，保存失败');
      return false;
    }
    if (!galleryItem || !galleryItem.images || galleryItem.images.length === 0) {
      console.error('[saveGeneratedImageToServer] 图片数据无效：', galleryItem);
      return false;
    }

    // 只保存TOS永久URL
    const validImageUrls = galleryItem.images.filter(url => {
      const tosDomain = 'yixiaostudio.tos-cn-beijing.volces.com';
      return url.includes(tosDomain) && !/^$|localhost|127.0.0.1|tmp|ark\.volces\.com/.test(url);
    });

    if (validImageUrls.length === 0) {
      console.warn('[saveGeneratedImageToServer] 无有效TOS URL，跳过保存');
      return false;
    }

    // 确保时间戳是高精度格式
    const preciseTimestamp = galleryItem.timestamp || generatePreciseTimestamp();
    
    const requestData = {
      userId,
      templateId: galleryItem.templateId,
      templateTitle: galleryItem.templateTitle,
      imageUrls: validImageUrls,
      isPlus: galleryItem.isPlus,
      originalImageUrl: galleryItem.originalImage?.tosUrl || '',
      timestamp: new Date(preciseTimestamp).getTime(), // 后端存储毫秒级时间戳
      isoTimestamp: preciseTimestamp, // 新增：同时存储ISO格式时间戳
      id: galleryItem.id || `${Date.now()}-${userId}` // ID包含毫秒级时间，确保唯一
    };

    console.log('[saveGeneratedImageToServer] 发送请求数据（含高精度时间戳）：', requestData);
    const res = await fetch(SAVE_GENERATED_IMAGE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestData)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[saveGeneratedImageToServer] 接口返回错误（${res.status}）：`, errorText);
      return false;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const nonJsonText = await res.text();
      console.error('[saveGeneratedImageToServer] 接口返回非JSON数据：', nonJsonText);
      return false;
    }

    const data = await res.json();
    console.log(`[saveGeneratedImageToServer] 保存图片到后端结果：`, data);
    
    const isSuccess = data.code === 0 || data.success === true;
    if (isSuccess) {
      // 标记为已同步，有效期1小时
      localStorage.setItem(syncKey, '1');
      setTimeout(() => localStorage.removeItem(syncKey), 3600000);
    } else {
      console.error('[saveGeneratedImageToServer] 后端返回保存失败：', data.message || data.msg);
    }
    return isSuccess;
  } catch (err) {
    console.error('[saveGeneratedImageToServer] 保存图片到后端失败：', err);
    return false;
  }
};

// ========== 核心修复：从后端删除生成图片（强制转换imageId为字符串） ==========
export const deleteGeneratedImageFromServer = async (userId: number, imageId: string | number) => {
  try {
    // 核心修复1：强制转换imageId为字符串，避免数字类型导致后端报错
    const imageIdStr = String(imageId).trim();
    
    if (!userId || !imageIdStr) {
      console.error('[deleteGeneratedImageFromServer] 参数无效：userId=', userId, 'imageId=', imageIdStr);
      return false;
    }
    
    console.log(`[deleteGeneratedImageFromServer] 准备删除：userId=${userId}, imageId=${imageIdStr}`);
    const res = await fetch(DELETE_GENERATED_IMAGE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        imageId: imageIdStr // 确保传递字符串类型
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[deleteGeneratedImageFromServer] 接口返回错误（${res.status}）：`, errorText);
      return false;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const nonJsonText = await res.text();
      console.error('[deleteGeneratedImageFromServer] 接口返回非JSON数据：', nonJsonText);
      return false;
    }

    const data = await res.json();
    console.log(`[deleteGeneratedImageFromServer] 删除后端图片结果：`, data);
    
    // 删除同步标记
    localStorage.removeItem(`synced_${imageIdStr}_${userId}`);
    
    return data.code === 0 || data.success === true;
  } catch (err) {
    console.error('[deleteGeneratedImageFromServer] 删除后端图片失败：', err);
    return false;
  }
};

// ========== 新增：基于图片URL的去重工具函数（解决同图不同ID问题） ==========
const deduplicateByImageUrl = (items: GalleryItem[]): GalleryItem[] => {
  const urlMap = new Map<string, GalleryItem>();
  items.forEach(item => {
    // 取第一张图片的URL作为去重标识（生成的是单张图）
    const imageUrl = item.images[0];
    if (imageUrl && !urlMap.has(imageUrl)) {
      urlMap.set(imageUrl, item);
    }
  });
  return Array.from(urlMap.values());
};

const MyGallery: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageErrorCount, setImageErrorCount] = useState(0); // 限制图片错误日志输出
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // 新增：跟踪当前登录用户ID
  
  // ========== 新增：大图预览相关状态 ==========
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 是否显示大图预览
  const [currentPreviewImage, setCurrentPreviewImage] = useState(''); // 当前预览的图片URL
  
  // 🔥 新增：防止无限加载的控制变量
  const reloadCountRef = useRef(0); // 记录重新加载次数
  const lastReloadUserIdRef = useRef<number | null>(null); // 记录上次加载的用户ID
  const reloadDebounceTimerRef = useRef<NodeJS.Timeout | null>(null); // 防抖定时器
  
  // 🔥 修复：使用ref保存状态，避免闭包捕获过期值导致的Hook异常
  const itemsRef = useRef<GalleryItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ========== 重构：加载图库数据（核心修复重复加载+URL去重+高精度排序） ==========
  const loadGalleryData = useCallback(async () => {
    // 🔥 核心修复1：执行锁，避免重复调用
    if ((loadGalleryData as any).currentExecuting) return;
    (loadGalleryData as any).currentExecuting = true;
    
    // 标记组件是否已卸载，避免卸载后更新状态
    let isMounted = true;
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      let serverItems: GalleryItem[] = [];
      
      // 1. 登录状态下从后端获取最新数据
      if (userId) {
        serverItems = await fetchGeneratedImages(userId);
      }
      
      // 2. 读取本地数据并过滤无效图片
      const savedStr = localStorage.getItem('ai-photo-gallery');
      const localItems: GalleryItem[] = savedStr ? JSON.parse(savedStr) : [];
      const validLocalItems = localItems.filter(item => isValidGalleryItem(item));
      
      // 🔥 新增：打印本地图片列表（ID+URL+时间戳），用于排查
      console.log(`[loadGalleryData] 本地有效图片列表：`, validLocalItems.map(i => ({ 
        id: i.id, 
        url: i.images[0],
        timestamp: i.timestamp,
        timeMs: new Date(i.timestamp).getTime()
      })));
      
      // 3. 合并数据 + 双重去重（先ID去重，再URL去重） + 高精度排序
      const mergedItems = [...serverItems, ...validLocalItems];
      // 第一步：按ID去重
      const idDeduplicated = Array.from(new Map(mergedItems.map(item => [String(item.id), item])).values());
      // 第二步：按图片URL去重（核心解决同图不同ID问题）
      const urlDeduplicated = deduplicateByImageUrl(idDeduplicated).filter(item => isValidGalleryItem(item));
      // 第三步：核心优化：按毫秒级时间降序排序（新生成的在前）
      const finalItems = sortGalleryItemsByTimeDesc(urlDeduplicated);
      
      // 🔥 新增：打印去重前后的数量，确认去重效果
      console.log(`[loadGalleryData] 合并后数量：${mergedItems.length}，ID去重后：${idDeduplicated.length}，URL去重后：${urlDeduplicated.length}，排序后：${finalItems.length}`);
      
      // 4. 同步本地未同步的图片（只同步URL未在后端的图片）
      const syncLocalItems = async () => {
        if (!userId) return;
        // 获取后端图片的URL列表
        const serverImageUrls = serverItems.map(item => item.images[0]);
        for (const localItem of validLocalItems) {
          const localImageUrl = localItem.images[0];
          // 只同步：本地图片URL不在后端 + 未标记过同步
          if (!serverImageUrls.includes(localImageUrl) && !localStorage.getItem(`synced_${localItem.id}_${userId}`)) {
            // 确保本地图片有高精度时间戳
            const itemWithPreciseTime = {
              ...localItem,
              timestamp: localItem.timestamp || generatePreciseTimestamp()
            };
            const syncSuccess = await saveGeneratedImageToServer(userId, itemWithPreciseTime);
            if (syncSuccess) {
              console.log(`[MyGallery] 本地图片${localItem.id}（URL：${localImageUrl}）已同步到后端，时间戳：${itemWithPreciseTime.timestamp}`);
            } else {
              console.warn(`[MyGallery] 本地图片${localItem.id}（URL：${localImageUrl}）同步到后端失败`);
            }
          }
        }
      };
      
      // 先同步本地数据（不阻塞UI）
      await syncLocalItems();
      
      // 仅在组件挂载时更新状态
      if (isMounted) {
        setItems(finalItems);
        // 存储时保留高精度时间戳，确保刷新后排序不变
        localStorage.setItem('ai-photo-gallery', JSON.stringify(finalItems)); 
        console.log(`[MyGallery] 加载完成，有效TOS图片数：${finalItems.length}，已按毫秒级时间排序`);
      }
    } catch (err) {
      console.error('[MyGallery] 读取图库数据失败：', err);
      if (isMounted) {
        const savedStr = localStorage.getItem('ai-photo-gallery');
        const fallbackItems = savedStr ? JSON.parse(savedStr).filter(isValidGalleryItem) : [];
        // 兜底也做URL去重 + 高精度排序
        const deduplicatedFallback = deduplicateByImageUrl(fallbackItems);
        const sortedFallback = sortGalleryItemsByTimeDesc(deduplicatedFallback); 
        setItems(sortedFallback);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
      // 释放执行锁
      (loadGalleryData as any).currentExecuting = false;
    }
    
    // 组件卸载时标记
    return () => {
      isMounted = false;
    };
  }, []); // 保持空依赖，避免重复创建

  // 🔥 新增：给loadGalleryData添加执行锁属性
  (loadGalleryData as any).currentExecuting = false;

  // ========== 初始化加载（修复重复触发） ==========
  useEffect(() => {
    let initTimer: NodeJS.Timeout;
    
    const initLoad = async () => {
      await loadGalleryData();
    };
    
    // 🔥 修复：防抖500ms，避免初始化时重复触发
    initTimer = setTimeout(() => {
      initLoad();
    }, 500);

    // 组件卸载清理
    return () => {
      clearTimeout(initTimer);
      itemsRef.current = [];
      (loadGalleryData as any).currentExecuting = false; // 释放锁
      
      // 清理防抖定时器
      if (reloadDebounceTimerRef.current) {
        clearTimeout(reloadDebounceTimerRef.current);
      }
    };
  }, [loadGalleryData]);

  // ========== 修复：监听用户登录状态变化（核心解决无限循环问题） ==========
  useEffect(() => {
    // 更新用户ID并处理登录/退出登录逻辑
    const updateUserState = () => {
      const userId = getCurrentUserId();
      setCurrentUserId(userId);
      
      // 情况1：用户退出登录（userId变为null）- 清空所有本地数据
      if (userId === null) {
        console.log('[MyGallery] 检测到用户退出登录，开始清空本地图库数据');
        // 清空页面状态
        setItems([]);
        itemsRef.current = [];
        setSelectedItem(null);
        setIsImageModalOpen(false);
        // 清空本地存储
        localStorage.removeItem('ai-photo-gallery');
        // 清除所有同步标记
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('synced_')) {
            localStorage.removeItem(key);
          }
        });
        // 重置加载计数
        reloadCountRef.current = 0;
        lastReloadUserIdRef.current = null;
        console.log('[MyGallery] 本地图库数据已清空');
      } 
      // 情况2：用户重新登录 - 只有满足以下条件才重新加载
      else if (userId !== null) {
        // 重置条件：用户ID变化 或 加载次数未超过限制（最多2次）
        const shouldReload = 
          userId !== lastReloadUserIdRef.current || 
          (reloadCountRef.current < 2 && items.length === 0 && !loading);
        
        if (shouldReload) {
          // 防抖处理：避免短时间内多次触发
          if (reloadDebounceTimerRef.current) {
            clearTimeout(reloadDebounceTimerRef.current);
          }
          
          reloadDebounceTimerRef.current = setTimeout(() => {
            // 检查执行锁，避免重复加载
            if (!(loadGalleryData as any).currentExecuting) {
              console.log(`[MyGallery] 检测到用户${userId}登录/状态变化，重新加载云端图库数据（第${reloadCountRef.current + 1}次）`);
              loadGalleryData();
              reloadCountRef.current += 1;
              lastReloadUserIdRef.current = userId;
            }
          }, 1000); // 1秒防抖
        }
      }
    };

    // 初始执行一次
    updateUserState();

    // 监听localStorage变化（用户退出/登录时触发）
    const handleStorageChange = (e: StorageEvent) => {
      const userKeys = ['ai-current-user', 'ai_photo_generator_user', 'ai-user-profile'];
      if (userKeys.includes(e.key || '')) {
        updateUserState();
      }
    };

    // 监听页面可见性变化（切换标签/返回页面时检查）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserState();
      }
    };

    // 监听窗口焦点变化
    const handleFocus = () => {
      updateUserState();
    };

    // 绑定事件监听
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // 组件卸载时清理监听
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      // 清理防抖定时器
      if (reloadDebounceTimerRef.current) {
        clearTimeout(reloadDebounceTimerRef.current);
      }
    };
  }, [items.length, loading, loadGalleryData]);

  // ========== 核心修复：删除作品（使用ref避免闭包问题 + 加锁 + 高精度排序） ==========
  const deleteItem = useCallback(async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要从图库中永久删除这件作品吗？此操作不可恢复。')) return;
    
    const userId = getCurrentUserId();
    let deleteSuccess = true;
    
    // 1. 先删后端
    if (userId) {
      deleteSuccess = await deleteGeneratedImageFromServer(userId, id);
    }
    
    if (deleteSuccess) {
      // 2. 删本地数据（使用ref获取最新状态，避免闭包）
      const idStr = String(id);
      const updated = itemsRef.current.filter(item => String(item.id) !== idStr).filter(isValidGalleryItem);
      // 删除后也做URL去重 + 核心优化：删除后重新按毫秒级时间排序
      const deduplicatedUpdated = deduplicateByImageUrl(updated);
      const sortedUpdated = sortGalleryItemsByTimeDesc(deduplicatedUpdated); 
      setItems(sortedUpdated);
      // 存储时保留高精度时间戳
      localStorage.setItem('ai-photo-gallery', JSON.stringify(sortedUpdated)); 
      
      // 3. 关闭详情弹窗和大图预览
      if (selectedItem && String(selectedItem.id) === idStr) {
        setSelectedItem(null);
        setIsImageModalOpen(false); // 关闭大图预览
      }
      
      // 4. 重新加载后端最新数据（加锁避免重复）
      if (!(loadGalleryData as any).currentExecuting) {
        await loadGalleryData();
      }
      console.log(`[MyGallery] 图片${idStr}删除成功，当前有效TOS图片数：${sortedUpdated.length}`);
    } else {
      alert('删除失败：后端数据未清理，请重试！');
      console.warn(`[MyGallery] 图片${id}后端删除失败`);
    }
  }, [loadGalleryData, selectedItem]); 

  // ========== 新增：手动刷新图库 ==========
  const handleRefresh = useCallback(async () => {
    // 清除同步标记，强制重新同步
    const userId = getCurrentUserId();
    if (userId) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('synced_') && key.endsWith(`_${userId}`)) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // 重置加载计数，允许重新加载
    reloadCountRef.current = 0;
    
    // 加锁避免重复刷新
    if (!(loadGalleryData as any).currentExecuting) {
      await loadGalleryData();
    }
    alert('图库已刷新为最新状态！所有图片已按生成时间（精确到秒）重新排序');
  }, [loadGalleryData]);

  // ========== 单张图片下载 ==========
  const handleSingleDownload = useCallback((imageUrl: string, templateTitle: string, index: number) => {
    if (!imageUrl || !imageUrl.includes('yixiaostudio.tos-cn-beijing.volces.com')) {
      alert('图片URL无效，无法下载');
      return;
    }
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      // 文件名包含精确时间，便于区分
      const preciseTime = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
      const fileName = `${templateTitle}_${index + 1}_${preciseTime}.jpg`;
      a.download = fileName;
      a.target = '_blank';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert(`✅ 下载已触发！
若未自动下载，请右键图片选择「图片另存为」`);
    } catch (err) {
      console.error('单张图片下载失败：', err);
      alert('下载失败，请右键图片手动保存');
    }
  }, []);

  // ========== 优化：图片加载失败容错（修复依赖数组） ==========
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget;
    const altText = imgElement.alt;
    
    // 限制错误日志输出频率（最多输出5条）
    if (imageErrorCount < 5) {
      console.warn(`图片加载失败：${altText}，已替换为占位图`);
      // 🔥 修复：使用函数式更新，避免闭包捕获过期值
      setImageErrorCount(prev => prev + 1);
    }
    
    // 替换为稳定的占位图
    const fallbackUrl = 'https://picsum.photos/400/600?grayscale&blur=2';
    imgElement.src = fallbackUrl;
    imgElement.alt = `${altText}（图片已失效）`;
    
    // 标记图片为失效，下次加载时过滤
    const imgUrl = imgElement.getAttribute('data-original-src') || imgElement.src;
    localStorage.setItem(`invalid_img_${btoa(imgUrl)}`, '1');
  }, [imageErrorCount]); 

  // ========== 分享功能 ==========
  const earnPoints = useCallback((taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const taskKey = `ai-tasks-${today}`;
    const taskData = JSON.parse(localStorage.getItem(taskKey) || '{}');
    
    const config = ALL_TASKS_CONFIG.find(c => c.id === taskId);
    if (config && (taskData[taskId] || 0) < config.limit) {
      taskData[taskId] = (taskData[taskId] || 0) + 1;
      localStorage.setItem(taskKey, JSON.stringify(taskData));
      
      const user: UserProfile = JSON.parse(localStorage.getItem('ai-user-profile') || '{}');
      user.points = (user.points || 0) + config.points;
      localStorage.setItem('ai-user-profile', JSON.stringify(user));
      console.log(`完成任务: ${config.title}, 获得 ${config.points} 点数`);
    }
  }, []);

  // ========== 分享到社区 ==========
  const shareToCommunity = useCallback((imageUrl: string) => {
    if (!selectedItem || !imageUrl.includes('yixiaostudio.tos-cn-beijing.volces.com')) {
      alert('无效的图片URL，无法分享');
      return;
    }
    setIsSharing(true);
    
    // 🔥 修复：使用setTimeout避免同步更新状态导致的Hook异常
    setTimeout(() => {
      const posts: CommunityPost[] = JSON.parse(localStorage.getItem('ai-community-posts') || '[]');
      const newPost: CommunityPost = {
        id: Date.now().toString(), // ID包含毫秒级时间，确保唯一
        userName: '我',
        userAvatar: 'https://i.pravatar.cc/150?u=me',
        imageUrl: imageUrl,
        title: `来看看我用【${selectedItem.templateTitle}】模版生成的写真！`,
        templateId: selectedItem.templateId,
        templateTitle: selectedItem.templateTitle,
        likes: 0,
        comments: [],
        timestamp: generatePreciseTimestamp() // 使用高精度时间戳
      };
      
      localStorage.setItem('ai-community-posts', JSON.stringify([newPost, ...posts]));
      setIsSharing(false);
      earnPoints('share');
      alert('分享成功！获得贡献值奖励，已发布至社区。');
      navigate('/community');
    }, 1000);
  }, [selectedItem, earnPoints, navigate]);

  // ========== 核心修复：清空所有（使用ref获取最新状态） ==========
  const clearAll = useCallback(async () => {
    if (!window.confirm('确定要清空所有作品吗？此操作不可恢复。')) return;
    
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      
      // 1. 批量删除后端所有图片（逐个删除，避免清空接口不存在的问题）
      if (userId && itemsRef.current.length > 0) {
        const deletePromises = itemsRef.current.map(item => 
          deleteGeneratedImageFromServer(userId, item.id)
        );
        await Promise.all(deletePromises);
        console.log('[MyGallery] 后端所有图片已批量删除');
      }
      
      // 2. 彻底清空本地存储
      setItems([]);
      localStorage.removeItem('ai-photo-gallery');
      
      // 3. 清除所有同步标记
      if (userId) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('synced_') && key.endsWith(`_${userId}`)) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // 4. 清除失效图片标记
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('invalid_img_')) {
          localStorage.removeItem(key);
        }
      });
      
      // 5. 关闭所有弹窗
      setSelectedItem(null);
      setIsImageModalOpen(false);
      
      // 重置加载计数
      reloadCountRef.current = 0;
      
      // 6. 重新加载数据（确认清空，加锁避免重复）
      if (!(loadGalleryData as any).currentExecuting) {
        await loadGalleryData();
      }
      alert('画廊已彻底清空！');
    } catch (err) {
      console.error('[MyGallery] 清空画廊失败：', err);
      alert('清空失败，部分数据可能未删除，请手动刷新后重试');
      // 即使出错也清空本地数据
      setItems([]);
      localStorage.removeItem('ai-photo-gallery');
      if (!(loadGalleryData as any).currentExecuting) {
        await loadGalleryData();
      }
    }
  }, [loadGalleryData]);

  // ========== 新增：打开大图预览 ==========
  const openImageModal = useCallback((imageUrl: string) => {
    setCurrentPreviewImage(imageUrl);
    setIsImageModalOpen(true);
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';
  }, []);

  // ========== 新增：关闭大图预览 ==========
  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
    setCurrentPreviewImage('');
    // 恢复页面滚动
    document.body.style.overflow = 'auto';
  }, []);

  // ========== 新增：监听ESC键关闭大图预览 ==========
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto'; // 组件卸载时恢复滚动
    };
  }, [isImageModalOpen, closeImageModal]);

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">加载我的图库中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      <section className="bg-white border-b border-gray-100 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>Personal Collection</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
              我的<span className="text-indigo-600">数字美术馆</span>
            </h1>
            <p className="mt-4 text-gray-400 font-medium max-w-lg">
              这里收藏了您每一次与 AI 协作产生的艺术结晶。
            </p>
          </div>
          {/* 刷新 + 清空按钮组 */}
          <div className="flex gap-4 items-center">
            {/* 手动刷新按钮 */}
            <button 
              onClick={handleRefresh}
              className="text-xs font-black text-indigo-400 hover:text-indigo-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>刷新图库</span>
            </button>
            {/* 清空按钮 */}
            {items.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs font-black text-rose-400 hover:text-rose-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>清空画廊</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {items.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">画廊目前是空的</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">您还没有创作过任何写真，快去浏览模版开启您的艺术之旅吧！</p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              去浏览模版
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map(item => (
              <div 
                key={`gallery-item-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-50"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img 
                    src={item.images[0]} 
                    alt={item.templateTitle}
                    data-original-src={item.images[0]} // 保存原始URL
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">
                    {item.isPlus ? 'Premium Set' : 'Standard'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <button 
                      onClick={(e) => deleteItem(item.id, e)}
                      className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <h4 className="text-white font-black text-lg truncate">{item.templateTitle}</h4>
                    {/* 优化：显示精确到秒的生成时间 */}
                    <p className="text-white/60 text-[10px] font-medium">
                      {new Date(item.timestamp).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })} · {item.images.length}张照片
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 图片详情弹窗 */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-full">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
               <div>
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedItem.templateTitle}</h2>
                 {/* 优化：显示精确到秒的生成时间 */}
                 <p className="text-xs text-gray-400 font-medium">
                   生成于 {new Date(selectedItem.timestamp).toLocaleString('zh-CN', {
                     year: 'numeric',
                     month: '2-digit',
                     day: '2-digit',
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: false
                   })}
                 </p>
               </div>
               <button 
                onClick={() => setSelectedItem(null)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
               >
                 <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 bg-gray-50">
               <div className={`grid gap-4 ${selectedItem.isPlus ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 max-w-md mx-auto'}`}>
                  {selectedItem.images.map((img, idx) => (
                    <div key={`gallery-image-${selectedItem.id}-${idx}`} className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-white group/img relative">
                      <img 
                        src={img} 
                        data-original-src={img}
                        onError={handleImageError} 
                        className="w-full h-full object-cover" 
                        alt={`${selectedItem.templateTitle}-${idx+1}`} 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3 p-4 text-center">
                         {/* 分享到社区按钮 */}
                         <button 
                           onClick={() => shareToCommunity(img)}
                           disabled={isSharing}
                           className="w-full py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] shadow-lg"
                         >
                           {isSharing ? '分享中...' : '分享到社区'}
                         </button>
                         {/* 高清下载按钮 */}
                         <button 
                           onClick={() => handleSingleDownload(img, selectedItem.templateTitle, idx)}
                           className="w-full py-2 bg-white text-gray-900 rounded-xl font-black text-[10px] hover:bg-gray-100 transition-colors"
                         >
                           高清下载
                         </button>
                         {/* ========== 新增：查看大图按钮 ========== */}
                         <button 
                           onClick={() => openImageModal(img)}
                           className="w-full py-2 bg-amber-500 text-white rounded-xl font-black text-[10px] hover:bg-amber-600 transition-colors"
                         >
                           查看大图
                         </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 新增：大图预览模态框 ========== */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          onClick={closeImageModal} // 点击空白处关闭
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()} // 阻止图片区域点击关闭
          >
            {/* 关闭按钮 */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
              aria-label="关闭大图预览"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* 大图展示 */}
            <img 
              src={currentPreviewImage} 
              alt="大图预览" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              loading="lazy"
              onError={handleImageError}
            />
            
            {/* 图片信息提示 */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/80 text-xs font-medium bg-black/40 backdrop-blur-md inline-block px-4 py-2 rounded-full">
                可右键保存图片 | 按ESC键关闭预览
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// 默认导出组件（用于渲染UI）
export default MyGallery;