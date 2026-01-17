// 全局变量
let uploadedImageUrl = '';       
let currentGridIndex = 0;        
let isGridGenerating = false;    
let isPaused = false;            
let generationTimer = null;      
// 存储生成的图片URL
let generatedImageUrls = [];
// 存储每个图片的生成状态：pending/success/failed
let generationStatus = [];
// 存储每个请求的唯一ID
let requestIds = [];
// 历史记录相关
let currentHistoryIndex = -1; // 当前选中的历史记录索引
const HISTORY_STORAGE_KEY = 'photoGeneratorHistory'; // 历史记录存储Key
// 生成状态存储Key
const GENERATION_STATE_KEY = 'photoGeneratorState';
// 当前生成批次ID，用于区分不同批次的生成
let currentBatchId = Date.now();

// ===================== API配置（核心修改区） =====================
// 后端接口地址（修改API地址只需要改这里）
const VOLC_API_BASE = 'https://sd5j17d5mg7k3v1e7vu60.apigateway-cn-beijing.volceapi.com'; 
const UPLOAD_API = VOLC_API_BASE + '/api/upload-to-tos';
const GENERATE_API = VOLC_API_BASE + '/api/generate-image';
// 积分&令牌相关接口
const VERIFY_TOKEN_API = VOLC_API_BASE + '/api/verify-token';
const GET_POINTS_API = VOLC_API_BASE + '/api/get-points';
const DEDUCT_POINTS_API = VOLC_API_BASE + '/api/deduct-points';

// 积分&令牌相关配置（仅保留必要配置，移除次数规则）
const TOKEN_CONFIG = {
    exchangeLimitSeconds: 2 // 兑换限流：2秒（可选保留）
};
let lastExchangeTime = 0; // 最后一次兑换时间（限流）
const GENERATE_COST = 1; // 生成一次九宫格消耗的积分
// 用户ID（需要从前端存储/生成，确保唯一标识用户）
let userId = localStorage.getItem('photoGeneratorUserId') || generateUserId();
// 保存用户ID到本地
localStorage.setItem('photoGeneratorUserId', userId);

// 生成唯一用户ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 默认标签配置
const DEFAULT_TAGS = [
    '杰作，最高画质，超高清细节，参考图中的小孩成长为 25 岁的青年民航飞行员，面部褪去稚气，轮廓硬朗分明，下颌线清晰，鼻梁挺拔，眼神沉稳锐利且自带专业气场（飞行员职业特质），身穿藏青色飞行员制服，肩章缀有清晰的飞行员等级标识，内搭挺括白色衬衫，系深蓝色条纹领带，胸前佩戴民航飞行员执照与姓名牌，左手自然扶着飞行头盔（头盔带有航空公司标志），站立在民航客机舷梯旁，背景可见客机机身、机场跑道与远处的航站楼，清晨的阳光柔和洒下，勾勒出制服的利落线条，皮肤质感真实自然，保留细微毛孔与面部肌理，电影级柔光光影，8K 分辨率，面部特征基于参考图但呈现成年状态，细节拉满（制服面料的挺括质感、肩章金属光泽、头盔的塑料纹理均清晰可见），整体氛围干练、专业且充满使命感。',
    '杰作，高质量，高清细节，参考图里的小孩成长为25岁帅气军官，面部褪去稚气，轮廓分明，下颌线清晰，眼神坚定，身穿合身的迷彩制服，带军帽，身姿挺拔站立在开阔的户外场地，背景有蓝天和绿树，阳光柔和自然，皮肤质感真实，画面清晰明亮，8K分辨率，面部特征基于参考图且呈现成年状态',
    '杰作，最高画质，超高清细节，参考图中的小孩成长为25岁的青年临床医生，面部褪去稚气，轮廓硬朗分明，下颌线清晰，鼻梁挺拔，眼神沉稳坚毅且带着医者温柔，戴眼镜，身穿挺括白大褂，内搭医护专用内搭，胸前别着工作牌（标注姓名与科室，简约设计），听诊器斜跨胸前/手持听诊器，手指带有轻微薄茧（贴合临床操作特质），站立在整洁的诊疗室中（背景可见诊疗床、病历本、听诊器托盘等元素，虚化处理），自然光与室内冷白光交织，电影级光影，8K分辨率，皮肤质感真实自然，无过度磨皮，面部特征基于参考图呈现成年状态，白大褂面料纹理、工作牌细节、听诊器金属光泽均清晰可见，整体色调清新专业，氛围感拉满。',
    '杰作，最高画质，超高清细节，参考图中的小孩成长为 25 岁的青年教师，戴眼镜，面部褪去稚气，轮廓硬朗分明，下颌线清晰，鼻梁挺拔，眼神温和且富有亲和力（教师职业特质），身穿简约合身的纯色衬衫（可选浅蓝色 / 白色，面料平整有质感），外搭深色针织开衫，袖口挽至小臂，胸前别着木质姓名牌，手持翻开的教案与粉笔，站立在明亮的教室讲台旁，背景可见整齐的课桌椅、写满板书的黑板、窗台上的绿植，阳光透过窗户柔和洒入，在地面投射出斑驳光影，皮肤质感真实自然，保留细微毛孔与面部肌理，电影级柔光光影，8K 分辨率，面部特征基于参考图但呈现成年状态，细节拉满（教案纸张纹理、粉笔灰痕迹、针织开衫的绒感均清晰可见），整体氛围温暖、知性且充满书卷气。',
    '杰作，最高画质，超高清细节，参考图中的小孩成长为 25 岁的青年消防员，面部褪去稚气，轮廓硬朗分明，下颌线清晰，鼻梁挺拔，身穿灭火防护服（深色防火面料，搭配橙红色反光带），头戴消防头盔，面罩半掀至额前，脖颈处露出防护围巾，手套沾染少许烟尘，站立在刚完成救援的现场（背景虚化呈现受损建筑、警戒线、队友身影），现场光线杂乱，应急灯与自然光交织，电影级光影对比，8K 分辨率，皮肤质感真实，面部带有轻微烟尘痕迹，面部特征基于参考图呈现成年状态，防护服的防火涂层质感、破拆工具的金属光泽、头盔的划痕均超高清呈现，整体氛围紧张且充满力量感。',
    '8K超写实，参考图小孩成长为25岁职业赛车手，面部轮廓硬朗但是年轻，表情自信，眼神专注，身穿白色带印花潮流赛车服，佩戴头盔与护目镜，双手扶方向盘倚靠赛车，赛道背景，轮胎摩擦烟雾，电影级侧逆光，皮肤质感真实，面部特征基于参考图',
    '杰作，最高画质，超高清细节，参考图中的小孩成长为 25 岁的青年摇滚巨星，面部褪去稚气，轮廓硬朗分明，下颌线清晰锋利，鼻梁挺拔，眼神桀骜不驯且自带舞台感染力（摇滚巨星特质），身穿黑色皮质夹克，内搭印花 T 恤，腰间系着金属链条，手腕佩戴复古铆钉手链，发型是利落的层次感短发，手持电吉他（琴身有个性涂鸦与划痕），站立在演唱会舞台中央，背景可见炫彩霓虹灯光、挥舞的荧光棒、巨大的乐队 LOGO 屏幕，舞台追光灯聚焦全身，皮肤质感真实自然，带有轻微的舞台妆光泽，8K 分辨率，面部特征基于参考图呈现成年状态，细节拉满（皮衣的褶皱肌理、铆钉的金属反光、电吉他的木纹与涂鸦均清晰可见），整体氛围热血、张扬且充满舞台张力。',
    '杰作，最高画质，超高清细节，参考图中的小孩成长为 25 岁的青年股票交易员，面部褪去稚气，轮廓硬朗分明，下颌线清晰，鼻梁挺拔，眼神专注急切，带着盯盘时的紧绷感，身穿高级感衬衫（袖口挽至小臂），搭配黑色西裤，高级西装+领带，手腕戴着运动款计时腕表，手持对讲机，目光紧盯前方的电子交易大屏，站立在证券交易大厅内，背景可见闪烁的红色绿色股价数字、忙碌的交易员身影、此起彼伏的电话铃声，大厅内冷白色灯光与屏幕光交织，光影对比强烈，皮肤带有轻微的疲惫感（眼底淡青），8K 分辨率，面部特征基于参考图呈现成年状态，衬衫的褶皱肌理、对讲机的按键细节、交易大屏的像素光泽均清晰可见，整体氛围紧张、高效，还原交易大厅的实战氛围。',
    '杰作，最高画质，超高清细节，参考图中的小孩成长为 25 岁的青年游戏制作人，面部褪去稚气，轮廓硬朗分明，下颌线清晰，鼻梁挺拔，眼神自信从容，带着产品宣讲的感染力，身穿简约深色休闲西装，内搭白色 T 恤，未系领带，领口利落，手持激光翻页笔，指向身后的巨型投影幕布（幕布上是新游宣传 PV 画面），站立在游戏发布会舞台中央，背景可见台下的媒体闪光灯、观众的欢呼剪影、舞台两侧的游戏角色立牌，追光灯聚焦全身，皮肤质感通透，面带得体微笑，8K 分辨率，面部特征基于参考图呈现成年状态，休闲西装的面料肌理、激光笔的金属光泽、PV 画面的色彩细节均清晰可见，整体氛围自信、专业，凸显游戏制作人的舞台魅力。'
];
// ===================== API配置结束 =====================

// 初始化：恢复生成状态 + 加载积分 + 加载历史记录
window.onload = function() {
    // 清空生成状态存储
    localStorage.removeItem(GENERATION_STATE_KEY);
    
    // 恢复上次的生成状态
    restoreGenerationState();
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('retryFailedBtn').style.display = 'none';
    // 从后端加载用户积分（核心修改）
    loadPointsFromBackend();
    // 强制加载历史记录并渲染
    loadHistoryFromLocal();
    renderHistoryList();
    // 调试用：打印当前存储的历史记录
    console.log('当前历史记录：', loadHistoryFromLocal());
    // 默认展开历史记录列表
    document.getElementById('historyList').style.display = 'block';
    document.getElementById('showHistoryBtn').textContent = '收起历史';
    
    // 监听页面关闭/刷新事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 绑定文件上传事件（避免HTML内联事件）
    document.getElementById('fileInput').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const previewImg = document.getElementById('previewImg');
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = 'block';

        const base64Str = await fileToBase64(file);
        await uploadImageToTOS(base64Str);
    });
};

// ========== 页面关闭提醒 ==========
function handleBeforeUnload(e) {
    if (isGridGenerating && !isPaused) {
        // 显示提醒
        document.getElementById('beforeunloadTip').style.display = 'block';
        // 取消默认行为（部分浏览器会显示自定义提示）
        e.preventDefault();
        e.returnValue = '图片生成中，关闭页面会导致生成中断，且已消耗的次数无法恢复！';
        return e.returnValue;
    }
}

// ========== 保存生成状态到本地 ==========
function saveGenerationState() {
    const state = {
        batchId: currentBatchId,
        uploadedImageUrl: uploadedImageUrl,
        currentGridIndex: currentGridIndex,
        isGridGenerating: isGridGenerating,
        isPaused: isPaused,
        generatedImageUrls: generatedImageUrls,
        generationStatus: generationStatus,
        requestIds: requestIds
    };
    localStorage.setItem(GENERATION_STATE_KEY, JSON.stringify(state));
    addDebugLog('已保存生成状态到本地存储');
}

// ========== 从本地恢复生成状态 ==========
function restoreGenerationState() {
    try {
        const stateStr = localStorage.getItem(GENERATION_STATE_KEY);
        if (!stateStr) {
            // 初始化状态
            initGridContainer();
            return;
        }
        
        const state = JSON.parse(stateStr);
        currentBatchId = state.batchId || Date.now();
        uploadedImageUrl = state.uploadedImageUrl || '';
        currentGridIndex = state.currentGridIndex || 0;
        isGridGenerating = state.isGridGenerating || false;
        isPaused = state.isPaused || false;
        generatedImageUrls = state.generatedImageUrls || [];
        generationStatus = state.generationStatus || [];
        requestIds = state.requestIds || [];
        
        // 重新渲染九宫格
        renderGridFromState();
        
        // 更新按钮状态
        if (isGridGenerating) {
            document.getElementById('genGridBtn').disabled = true;
            document.getElementById('pauseBtn').style.display = 'block';
            document.getElementById('pauseBtn').textContent = isPaused ? '继续生成' : '暂停生成';
            document.getElementById('pauseBtn').disabled = false;
            
            // 显示重试按钮（如果有失败的图片）
            if (generationStatus.some(status => status === 'failed')) {
                document.getElementById('retryFailedBtn').style.display = 'block';
            }
            
            // 更新提示
            document.getElementById('loading').style.display = 'block';
            document.getElementById('loading').textContent = isPaused 
                ? `已暂停生成（当前进度：${currentGridIndex}/9）`
                : `恢复生成第 ${currentGridIndex+1}/9 张...`;
            document.getElementById('progressTip').textContent = isPaused
                ? `已暂停，已生成${currentGridIndex}张，剩余${9 - currentGridIndex}张（长按图片即可保存）`
                : `恢复生成(${currentGridIndex+1}/9)（长按图片即可保存）`;
        }
        
        addDebugLog('已从本地恢复生成状态');
    } catch (err) {
        addDebugLog(`恢复生成状态失败：${err.message}，将初始化新状态`);
        initGridContainer();
    }
}

// ========== 根据状态重新渲染九宫格 ==========
function renderGridFromState() {
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.id = `gridItem-${i}`;
        
        if (i < generatedImageUrls.length && generatedImageUrls[i]) {
            // 已生成的图片
            const img = document.createElement('img');
            img.className = 'grid-img';
            img.src = generatedImageUrls[i];
            img.alt = `第${i+1}张`;
            img.onerror = function() {
                this.classList.add('error');
                this.src = '';
                this.textContent = '图片加载失败';
                generationStatus[i] = 'failed';
                saveGenerationState();
                addDebugLog(`第${i+1}张图片加载失败`);
            };
            
            // 点击查看大图
            img.onclick = function(e) {
                e.stopPropagation();
                openImagePreview(generatedImageUrls[i]);
            };
            gridItem.onclick = function() {
                openImagePreview(generatedImageUrls[i]);
            };
            
            gridItem.appendChild(img);
        } else if (generationStatus[i] === 'failed') {
            // 生成失败的图片（显示重试按钮）
            const errorDiv = document.createElement('div');
            errorDiv.className = 'grid-img error';
            errorDiv.textContent = '生成失败';
            
            // 重试按钮
            const retryBtn = document.createElement('button');
            retryBtn.className = 'retry-btn';
            retryBtn.textContent = '重试';
            retryBtn.onclick = function(e) {
                e.stopPropagation();
                retrySingleImage(i);
            };
            
            gridItem.appendChild(errorDiv);
            gridItem.appendChild(retryBtn);
        } else if (i < currentGridIndex && generationStatus[i] === 'pending') {
            // 处理中但未返回结果的图片 - 显示加载动画
            const loadingContainer = document.createElement('div');
            loadingContainer.className = 'grid-loading-container';
            
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            loadingContainer.appendChild(spinner);
            gridItem.appendChild(loadingContainer);
            gridItem.onclick = null;
        } else {
            // 等待生成的图片
            const placeholder = document.createElement('div');
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#999';
            placeholder.style.fontSize = '12px';
            placeholder.textContent = `等待生成(${i+1}/9)`;
            gridItem.appendChild(placeholder);
        }
        
        gridContainer.appendChild(gridItem);
    }
}

// ========== 积分相关核心函数（核心修改：全部调用后端接口） ==========
// 从后端加载用户积分
async function loadPointsFromBackend() {
    try {
        const res = await fetch(GET_POINTS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        });
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('currentPoints').textContent = data.totalPoints;
            addDebugLog(`从后端加载积分：${data.totalPoints}`);
        } else {
            document.getElementById('currentPoints').textContent = 0;
            addDebugLog('加载积分失败，使用默认值0');
        }
    } catch (err) {
        document.getElementById('currentPoints').textContent = 0;
        addDebugLog(`加载积分异常：${err.message}，使用默认值0`);
    }
}

// 更新积分显示
function updatePointsDisplay(newPoints) {
    document.getElementById('currentPoints').textContent = newPoints;
    addDebugLog(`积分更新为：${newPoints}`);
}

// 从后端扣减积分（生成前校验）
async function deductPoints() {
    try {
        const res = await fetch(DEDUCT_POINTS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        });
        const data = await res.json();
        
        if (data.success) {
            updatePointsDisplay(data.totalPoints);
            addDebugLog(`扣减${GENERATE_COST}积分成功，剩余${data.totalPoints}积分`);
            return true;
        } else {
            alert(data.message || '积分扣减失败');
            addDebugLog(`扣减积分失败：${data.message}`);
            return false;
        }
    } catch (err) {
        alert(`积分扣减异常：${err.message}`);
        addDebugLog(`扣减积分异常：${err.message}`);
        return false;
    }
}

// ========== 令牌兑换核心函数（核心修改：调用后端接口，仅展示后端提示） ==========
async function exchangeInviteCode() {
    const token = document.getElementById('inviteCodeInput').value.trim().toUpperCase();
    const exchangeBtn = document.getElementById('exchangeBtn');
    
    if (!token) {
        alert('请输入令牌！');
        return;
    }

    // 前端限流
    const now = Date.now();
    if (now - lastExchangeTime < TOKEN_CONFIG.exchangeLimitSeconds * 1000) {
        alert(`请${TOKEN_CONFIG.exchangeLimitSeconds}秒后再试！`);
        return;
    }
    lastExchangeTime = now;

    // 禁用按钮
    exchangeBtn.disabled = true;
    exchangeBtn.textContent = '兑换中...';

    try {
        addDebugLog(`管理员日志：开始验证令牌 ${token}`);
        
        // 调用后端验证令牌接口（核心修改）
        const res = await fetch(VERIFY_TOKEN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: token,
                userId: userId
            })
        });
        const data = await res.json();
        
        if (data.success) {
            // 兑换成功：展示后端返回的提示
            alert(data.message);
            updatePointsDisplay(data.totalPoints);
            addDebugLog(`管理员日志：令牌 ${token} 兑换成功，用户积分：${data.totalPoints}`);
            document.getElementById('inviteCodeInput').value = ''; // 清空输入框
        } else {
            // 兑换失败：直接展示后端返回的提示（如"令牌已用尽，无法兑换"）
            alert(data.message || '令牌兑换失败');
            addDebugLog(`管理员日志：令牌 ${token} 兑换失败：${data.message}`);
        }
    } catch (err) {
        alert(`兑换异常：${err.message}`);
        addDebugLog(`令牌兑换异常：${err.message}`);
    } finally {
        // 恢复按钮
        exchangeBtn.disabled = false;
        exchangeBtn.textContent = '兑换积分';
    }
}

// ========== 获取当前标签 ==========
function getCurrentTags() {
    return [...DEFAULT_TAGS]; // 返回 DEFAULT_TAGS 的副本
}

// ========== 九宫格初始化 ==========
function initGridContainer() {
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = '';
    // 重置生成的图片URL数组
    generatedImageUrls = [];
    // 重置生成状态
    generationStatus = [];
    // 重置请求ID
    requestIds = [];
    // 生成新的批次ID
    currentBatchId = Date.now();
    
    // 初始化状态数组
    for (let i = 0; i < 9; i++) {
        generatedImageUrls[i] = null;
        generationStatus[i] = 'waiting';
        requestIds[i] = null;
        
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.id = `gridItem-${i}`;
        
        const placeholder = document.createElement('div');
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = '#999';
        placeholder.style.fontSize = '12px';
        placeholder.textContent = `等待生成(${i+1}/9)`;
        
        gridItem.appendChild(placeholder);
        gridContainer.appendChild(gridItem);
    }
    
    // 保存初始状态
    saveGenerationState();
}

// ========== 调试日志 ==========
function addDebugLog(msg) {
    const debugLog = document.getElementById('debugLog');
    if (debugLog) {
        debugLog.style.display = 'block';
        debugLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ${msg}`;
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

// ========== 文件转Base64 ==========
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

// ========== 上传图片到TOS ==========
async function uploadImageToTOS(base64Str) {
    const loading = document.getElementById('loading');
    const genGridBtn = document.getElementById('genGridBtn');
    
    loading.style.display = 'block';
    loading.textContent = '正在上传图片到服务器...';
    addDebugLog('开始上传图片');

    try {
        const res = await fetch(UPLOAD_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Str: base64Str })
        });
        const data = await res.json();
        addDebugLog(`上传返回：${JSON.stringify(data)}`);

        if (data.code === 0) {
            uploadedImageUrl = data.data.imageUrl;
            loading.textContent = '✅ 图片上传成功！请确认积分充足后点击生成';
            genGridBtn.disabled = false; 
            addDebugLog(`上传成功，URL：${uploadedImageUrl}`);
            
            // 保存上传状态
            saveGenerationState();
        } else {
            alert('上传失败：' + data.message);
            genGridBtn.disabled = true;
            addDebugLog(`上传失败：${data.message}`);
        }
    } catch (err) {
        alert('上传异常：' + err.message);
        genGridBtn.disabled = true;
        addDebugLog(`上传异常：${err.message}`);
    }
}

// ========== 启动九宫格生成 ==========
async function startGridGeneration() {
    if (!uploadedImageUrl) {
        alert('请先上传图片！');
        return;
    }
    // 积分校验（调用后端扣减积分）
    if (!await deductPoints()) {
        return;
    }
    if (isGridGenerating && !isPaused) {
        alert('正在生成九宫格，请稍等！');
        return;
    }

    isGridGenerating = true;
    isPaused = false;
    if (currentGridIndex === 0 || currentGridIndex >= 9) {
        currentGridIndex = 0;
        const debugLog = document.getElementById('debugLog');
        if (debugLog) debugLog.innerHTML = '调试日志：';
        initGridContainer();
    }
    
    document.getElementById('genGridBtn').disabled = true;
    document.getElementById('pauseBtn').style.display = 'block';
    document.getElementById('pauseBtn').textContent = '暂停生成';
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('retryFailedBtn').style.display = 'none';
    
    document.getElementById('loading').style.display = 'block';
    // 显示页面关闭提醒
    document.getElementById('beforeunloadTip').style.display = 'block';
    addDebugLog(isPaused ? '恢复九宫格生成流程' : '启动九宫格生成流程，共9张');
    
    // 保存状态
    saveGenerationState();
    
    triggerSingleGeneration();
}

// ========== 暂停/继续生成 ==========
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    const loading = document.getElementById('loading');
    const progressTip = document.getElementById('progressTip');

    if (isPaused) {
        if (generationTimer) {
            clearTimeout(generationTimer);
            generationTimer = null;
        }
        pauseBtn.textContent = '继续生成';
        loading.textContent = `已暂停生成（当前进度：${currentGridIndex}/9）`;
        progressTip.textContent = `已暂停，已生成${currentGridIndex}张，剩余${9 - currentGridIndex}张（长按图片即可保存）`;
        // 隐藏页面关闭提醒
        document.getElementById('beforeunloadTip').style.display = 'none';
        addDebugLog(`暂停生成，当前进度：${currentGridIndex}/9`);
    } else {
        pauseBtn.textContent = '暂停生成';
        loading.textContent = `恢复生成第 ${currentGridIndex+1}/9 张...`;
        progressTip.textContent = `恢复生成(${currentGridIndex+1}/9)（长按图片即可保存）`;
        // 显示页面关闭提醒
        document.getElementById('beforeunloadTip').style.display = 'block';
        addDebugLog(`恢复生成，继续生成第${currentGridIndex+1}张`);
        triggerSingleGeneration();
    }
    
    // 保存状态
    saveGenerationState();
}

// ========== 触发单张图片生成 ==========
function triggerSingleGeneration() {
    if (currentGridIndex >= 9 || isPaused) {
        if (currentGridIndex >= 9) {
            document.getElementById('loading').textContent = '✅ 九宫格生成完成！';
            document.getElementById('progressTip').textContent = '所有图片生成完成，长按图片可保存，点击图片查看大图';
            document.getElementById('pauseBtn').style.display = 'none';
            // 隐藏页面关闭提醒
            document.getElementById('beforeunloadTip').style.display = 'none';
            
            // 检查是否有失败的图片
            const failedCount = generationStatus.filter(status => status === 'failed').length;
            if (failedCount > 0) {
                document.getElementById('retryFailedBtn').style.display = 'block';
                document.getElementById('loading').textContent += ` (${failedCount}张生成失败，可点击重试)`;
            }
            
            isGridGenerating = false;
            isPaused = false;
            addDebugLog('九宫格生成完成');
            
            // 最终保存一次完整记录
            saveCurrentGenerationToHistory(true);
        } else {
            addDebugLog('当前处于暂停状态，停止生成下一张');
        }
        
        // 保存状态
        saveGenerationState();
        return;
    }

    const tags = getCurrentTags();
    const currentTag = tags[currentGridIndex];
    document.getElementById('loading').textContent = `正在生成第 ${currentGridIndex+1}/9 张：${currentTag.substring(0, 20)}...`;
    document.getElementById('progressTip').textContent = `生成中(${currentGridIndex+1}/9)（长按图片即可保存）`;
    addDebugLog(`准备生成第${currentGridIndex+1}张，Tag：${currentTag}`);

    // 更新状态为处理中
    generationStatus[currentGridIndex] = 'pending';
    // 生成唯一请求ID
    requestIds[currentGridIndex] = `${currentBatchId}_${currentGridIndex}_${Date.now()}`;
    // 保存状态
    saveGenerationState();
    
    // 重新渲染当前格子为处理中（显示加载动画）
    renderGridImage(currentGridIndex, null, '生成中...');
    
    document.getElementById('genSingleBtn').click();
}

// ========== 重试失败图片 ==========
function retryFailedImages() {
    if (isGridGenerating && !isPaused) {
        alert('正在生成九宫格，请稍等！');
        return;
    }
    
    // 找到所有失败的图片索引
    const failedIndices = [];
    for (let i = 0; i < generationStatus.length; i++) {
        if (generationStatus[i] === 'failed') {
            failedIndices.push(i);
        }
    }
    
    if (failedIndices.length === 0) {
        alert('没有失败的图片需要重试！');
        return;
    }
    
    // 确认重试
    if (!confirm(`发现${failedIndices.length}张图片生成失败，是否重试这些图片？`)) {
        return;
    }
    
    isGridGenerating = true;
    isPaused = false;
    // 从第一个失败的图片开始
    currentGridIndex = failedIndices[0];
    
    document.getElementById('genGridBtn').disabled = true;
    document.getElementById('pauseBtn').style.display = 'block';
    document.getElementById('pauseBtn').textContent = '暂停生成';
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('retryFailedBtn').style.display = 'none';
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loading').textContent = `开始重试失败图片（共${failedIndices.length}张）`;
    document.getElementById('progressTip').textContent = `重试中(1/${failedIndices.length})（长按图片即可保存）`;
    // 显示页面关闭提醒
    document.getElementById('beforeunloadTip').style.display = 'block';
    
    addDebugLog(`开始重试失败图片，失败索引：${failedIndices.join(',')}`);
    
    // 保存状态
    saveGenerationState();
    
    triggerSingleGeneration();
}

// ========== 重试单张图片 ==========
function retrySingleImage(index) {
    if (isGridGenerating && !isPaused) {
        alert('正在生成九宫格，请稍等！');
        return;
    }
    
    // 确认重试
    if (!confirm(`是否重试第${index+1}张图片？`)) {
        return;
    }
    
    isGridGenerating = true;
    isPaused = false;
    currentGridIndex = index;
    
    document.getElementById('genGridBtn').disabled = true;
    document.getElementById('pauseBtn').style.display = 'block';
    document.getElementById('pauseBtn').textContent = '暂停生成';
    document.getElementById('pauseBtn').disabled = false;
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loading').textContent = `重试第 ${index+1}/9 张图片...`;
    document.getElementById('progressTip').textContent = `重试中(${index+1}/9)（长按图片即可保存）`;
    // 显示页面关闭提醒
    document.getElementById('beforeunloadTip').style.display = 'block';
    
    addDebugLog(`开始重试第${index+1}张图片`);
    
    // 更新状态为处理中
    generationStatus[index] = 'pending';
    // 生成新的请求ID
    requestIds[index] = `${currentBatchId}_${index}_${Date.now()}`;
    // 保存状态
    saveGenerationState();
    
    triggerSingleGeneration();
}

// ========== 生成单张图片 ==========
async function generateSingleImage() {
    if (!uploadedImageUrl || isPaused) return;

    const tags = getCurrentTags();
    const currentTag = tags[currentGridIndex];
    const genSingleBtn = document.getElementById('genSingleBtn');
    const currentRequestId = requestIds[currentGridIndex];
    
    genSingleBtn.disabled = true;
    addDebugLog(`开始调用生成接口[${currentRequestId}]，Tag：${currentTag}`);

    try {
        const imageUrl = await callGenerateApi(currentTag, uploadedImageUrl, currentRequestId);
        
        // 验证请求ID是否匹配（防止异步返回的旧请求覆盖新请求）
        if (requestIds[currentGridIndex] !== currentRequestId) {
            addDebugLog(`请求ID不匹配[${currentRequestId}]，忽略返回结果`);
            genSingleBtn.disabled = false;
            return;
        }
        
        renderGridImage(currentGridIndex, imageUrl);
        // 保存生成的图片URL
        generatedImageUrls[currentGridIndex] = imageUrl;
        // 更新状态为成功
        generationStatus[currentGridIndex] = 'success';
        addDebugLog(`第${currentGridIndex+1}张生成成功[${currentRequestId}]，URL：${imageUrl}`);

        // 单张生成成功后立刻保存历史记录
        saveCurrentGenerationToHistory(false);

        currentGridIndex++;
        // 保存状态
        saveGenerationState();
        
        generationTimer = setTimeout(() => {
            genSingleBtn.disabled = false;
            triggerSingleGeneration();
        }, 1000);

    } catch (err) {
        // 验证请求ID是否匹配
        if (requestIds[currentGridIndex] !== currentRequestId) {
            addDebugLog(`请求ID不匹配[${currentRequestId}]，忽略错误`);
            genSingleBtn.disabled = false;
            return;
        }
        
        renderGridImage(currentGridIndex, null, err.message);
        // 失败时记录null
        generatedImageUrls[currentGridIndex] = null;
        // 更新状态为失败
        generationStatus[currentGridIndex] = 'failed';
        addDebugLog(`第${currentGridIndex+1}张生成失败[${currentRequestId}]：${err.message}`);
        
        // 生成失败也保存历史记录
        saveCurrentGenerationToHistory(false);

        currentGridIndex++;
        // 保存状态
        saveGenerationState();
        
        generationTimer = setTimeout(() => {
            genSingleBtn.disabled = false;
            triggerSingleGeneration();
        }, 1000);
    }
}

// ========== 调用生成API ==========
async function callGenerateApi(tag, imageUrl, requestId) {
    return new Promise((resolve, reject) => {
        fetch(GENERATE_API, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: tag,
                imageUrl: imageUrl,
                requestId: requestId // 新增：将请求ID作为参数传入
            })
        })
        .then(async response => {
            addDebugLog(`接口响应状态[${requestId}]：${response.status}`);
            
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP${response.status}：${errText}`);
            }

            try {
                const data = await response.json();
                addDebugLog(`非流式返回[${requestId}]：${JSON.stringify(data)}`);
                
                if (data.code === 0 && data.data && data.data.length > 0) {
                    resolve(data.data[0].url);
                } else if (data.url) {
                    resolve(data.url);
                } else {
                    reject(new Error('未找到图片URL'));
                }
            } catch (e) {
                addDebugLog(`非流式解析失败[${requestId}]，尝试流式解析：${e.message}`);
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let imageUrl = '';

                function readStream() {
                    if (isPaused || requestIds[currentGridIndex] !== requestId) {
                        reader.cancel();
                        reject(new Error(isPaused ? '生成已暂停' : '请求已过期'));
                        return;
                    }

                    reader.read().then(({ done, value }) => {
                        if (done) {
                            if (imageUrl) {
                                resolve(imageUrl);
                            } else {
                                reject(new Error('流式解析未找到图片URL'));
                            }
                            return;
                        }

                        const chunk = decoder.decode(value, { stream: true });
                        addDebugLog(`流式数据[${requestId}]：${chunk}`);
                        
                        const lines = chunk.split('\n').filter(line => line.trim());
                        lines.forEach(line => {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.slice(6).trim();
                                if (dataStr === '[DONE]') return;
                                
                                try {
                                    const data = JSON.parse(dataStr);
                                    if (data.url || (data.type === 'image_generation.partial_succeeded' && data.url)) {
                                        imageUrl = data.url || imageUrl;
                                    }
                                } catch (err) {
                                    addDebugLog(`解析单行失败[${requestId}]：${err.message}`);
                                }
                            }
                        });

                        readStream();
                    }).catch(err => reject(new Error('流式读取失败：' + err.message)));
                }

                readStream();
            }
        })
        .catch(err => reject(new Error('生成失败：' + err.message)));
    });
}

// ========== 渲染九宫格图片 ==========
function renderGridImage(index, imageUrl, errorMsg = '') {
    const gridItem = document.getElementById(`gridItem-${index}`);
    if (!gridItem) return;
    
    // 清空当前格子内容
    gridItem.innerHTML = '';
    
    if (imageUrl) {
        // 有图片地址：显示图片
        const img = document.createElement('img');
        img.className = 'grid-img';
        img.src = imageUrl;
        img.alt = `第${index+1}张`;
        
        // 图片加载失败的处理
        img.onerror = function() {
            this.classList.add('error');
            this.src = '';
            this.textContent = '图片加载失败';
            generationStatus[index] = 'failed';
            saveGenerationState();
            addDebugLog(`第${index+1}张图片加载失败`);
        };
        
        // 点击查看大图
        img.onclick = function(e) {
            e.stopPropagation();
            openImagePreview(imageUrl);
        };
        gridItem.onclick = function() {
            openImagePreview(imageUrl);
        };
        
        gridItem.appendChild(img);
    } else {
        if (errorMsg === '生成中...') {
            // 生成中：显示转动的加载动画
            const loadingContainer = document.createElement('div');
            loadingContainer.className = 'grid-loading-container';
            
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            loadingContainer.appendChild(spinner);
            gridItem.appendChild(loadingContainer);
            
            // 生成中时取消点击事件
            gridItem.onclick = null;
        } else {
            // 生成失败：显示错误提示
            const errorDiv = document.createElement('div');
            errorDiv.className = 'grid-img error';
            errorDiv.textContent = errorMsg || '生成失败';
            gridItem.appendChild(errorDiv);
            
            // 失败时添加重试按钮
            if (errorMsg && errorMsg !== '生成中...') {
                const retryBtn = document.createElement('button');
                retryBtn.className = 'retry-btn';
                retryBtn.textContent = '重试';
                retryBtn.onclick = function(e) {
                    e.stopPropagation();
                    retrySingleImage(index);
                };
                gridItem.appendChild(retryBtn);
                
                // 显示重试按钮
                document.getElementById('retryFailedBtn').style.display = 'block';
            }
            
            gridItem.onclick = null;
        }
    }
}

// ========== 大图预览功能 ==========
function openImagePreview(imageUrl) {
    const modal = document.getElementById('imgPreviewModal');
    const largeImg = document.getElementById('previewLargeImg');
    
    if (!modal || !largeImg) return;
    
    largeImg.src = imageUrl;
    modal.style.display = 'flex';
    
    // 点击模态框背景关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeImagePreview();
        }
    };
    
    // 按ESC键关闭
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeImagePreview();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    addDebugLog(`打开大图预览：${imageUrl}`);
}

function closeImagePreview() {
    const modal = document.getElementById('imgPreviewModal');
    const largeImg = document.getElementById('previewLargeImg');
    
    if (!modal || !largeImg) return;
    
    modal.style.display = 'none';
    largeImg.src = '';
    addDebugLog('关闭大图预览');
}

// ========== 历史记录核心功能 ==========
/**
 * 加载本地存储的历史记录
 * @returns {Array} 历史记录数组
 */
function loadHistoryFromLocal() {
    try {
        const historyStr = localStorage.getItem(HISTORY_STORAGE_KEY) || '[]';
        const history = JSON.parse(historyStr);
        // 过滤掉无效的记录
        return history.filter(item => item && item.timestamp && Array.isArray(item.images));
    } catch (err) {
        addDebugLog(`加载历史记录失败：${err.message}，将清空历史记录`);
        localStorage.setItem(HISTORY_STORAGE_KEY, '[]');
        return [];
    }
}

/**
 * 保存历史记录到本地存储
 * @param {Array} history 历史记录数组
 */
function saveHistoryToLocal(history) {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        // 更新清空按钮状态
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) clearBtn.disabled = history.length === 0;
    } catch (err) {
        addDebugLog(`保存历史记录失败：${err.message}`);
        alert('保存历史记录失败，请稍后重试');
    }
}

/**
 * 实时保存当前生成记录到历史
 * @param {boolean} isFinal 是否是最终保存（九宫格完成后）
 */
function saveCurrentGenerationToHistory(isFinal = false) {
    // 1. 准备当前批次的记录数据
    const currentRecord = {
        batchId: currentBatchId,
        timestamp: Date.now(),
        timeStr: new Date().toLocaleString('zh-CN'),
        images: [...generatedImageUrls],
        status: [...generationStatus],
        requestIds: [...requestIds],
        isCompleted: isFinal
    };

    // 2. 加载现有历史记录
    let history = loadHistoryFromLocal();

    // 3. 检查是否存在当前批次的记录
    const batchIndex = history.findIndex(item => item.batchId === currentBatchId);

    if (batchIndex !== -1) {
        // 4. 如果存在，更新该批次的记录
        history[batchIndex] = currentRecord;
    } else {
        // 5. 如果不存在，添加新记录到开头
        history.unshift(currentRecord);
    }

    // 6. 限制历史记录数量（最多30条）
    if (history.length > 30) {
        history.splice(30);
    }

    // 7. 保存到本地并实时渲染
    saveHistoryToLocal(history);
    // 延迟渲染，确保DOM元素已就绪
    setTimeout(() => {
        renderHistoryList();
    }, 50);

    // 8. 调试日志
    const validCount = currentRecord.images.filter(url => url).length;
    addDebugLog(`实时保存历史记录：批次${currentBatchId}，已生成${validCount}/9张，${isFinal ? '完成' : '进行中'}`);
}

/**
 * 渲染历史记录列表
 */
function renderHistoryList() {
    // 检查DOM元素是否存在
    const historyList = document.getElementById('historyList');
    if (!historyList) {
        console.error('历史记录容器不存在！');
        return;
    }
    
    // 先获取空状态元素（避免重复创建）
    let historyEmpty = document.getElementById('historyEmpty');
    if (!historyEmpty) {
        historyEmpty = document.createElement('div');
        historyEmpty.id = 'historyEmpty';
        historyEmpty.className = 'history-empty';
        historyEmpty.textContent = '暂无生成记录';
    }
    
    const history = loadHistoryFromLocal();

    // 安全清空列表
    while (historyList.firstChild) {
        historyList.removeChild(historyList.firstChild);
    }

    if (history.length === 0) {
        // 显示空状态
        historyList.appendChild(historyEmpty);
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) clearBtn.disabled = true;
        return;
    }

    // 渲染每条历史记录
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${currentHistoryIndex === index ? 'active' : ''}`;
        historyItem.dataset.index = index;

        // 计算有效图片数量
        const validCount = item.images.filter(url => url).length;
        // 计算失败图片数量
        const failedCount = item.status ? item.status.filter(status => status === 'failed').length : 0;
        // 显示状态（进行中/已完成）
        const statusText = item.isCompleted ? '已完成' : '生成中';

        // 时间显示
        const timeSpan = document.createElement('span');
        timeSpan.className = 'history-time';
        timeSpan.textContent = `${item.timeStr} (${statusText}：${validCount}/9，失败：${failedCount}张)`;

        // 操作按钮
        const actionSpan = document.createElement('span');
        actionSpan.className = 'history-action';
        actionSpan.textContent = '点击查看';

        // 组装并添加点击事件
        historyItem.appendChild(timeSpan);
        historyItem.appendChild(actionSpan);
        historyItem.onclick = () => showHistoryItem(index);

        historyList.appendChild(historyItem);
    });

    // 启用清空按钮
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) clearBtn.disabled = false;
}

/**
 * 切换历史记录列表的显示/隐藏
 */
function toggleHistoryList() {
    const historyList = document.getElementById('historyList');
    const showHistoryBtn = document.getElementById('showHistoryBtn');
    
    if (!historyList || !showHistoryBtn) return;
    
    if (historyList.style.display === 'none') {
        historyList.style.display = 'block';
        showHistoryBtn.textContent = '收起历史';
    } else {
        historyList.style.display = 'none';
        showHistoryBtn.textContent = '查看历史';
    }
}

/**
 * 显示指定索引的历史记录图片
 * @param {number} index 历史记录索引
 */
function showHistoryItem(index) {
    const history = loadHistoryFromLocal();
    if (index < 0 || index >= history.length) {
        addDebugLog('无效的历史记录索引');
        return;
    }

    const item = history[index];
    currentHistoryIndex = index;

    // 重置九宫格容器
    const gridContainer = document.getElementById('gridContainer');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    generatedImageUrls = [...item.images]; // 更新当前图片数组
    generationStatus = item.status || []; // 更新状态数组
    requestIds = item.requestIds || []; // 更新请求ID数组
    currentBatchId = item.batchId; // 更新批次ID

    // 更新提示信息
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
        loading.textContent = `查看历史记录：${item.timeStr} ${item.isCompleted ? '(已完成)' : '(生成中)'}`;
    }
    
    // 计算失败数量
    const failedCount = generationStatus.filter(status => status === 'failed').length;
    const retryBtn = document.getElementById('retryFailedBtn');
    if (retryBtn) {
        if (failedCount > 0) {
            retryBtn.style.display = 'block';
            if (loading) loading.textContent += ` (${failedCount}张生成失败，可点击重试)`;
        } else {
            retryBtn.style.display = 'none';
        }
    }
    
    const progressTip = document.getElementById('progressTip');
    if (progressTip) {
        progressTip.textContent = `共${item.images.filter(url => url).length}张有效图片，点击图片查看大图（长按图片即可保存）`;
    }

    // 渲染每张图片
    item.images.forEach((imageUrl, imgIndex) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.id = `gridItem-${imgIndex}`;

        if (imageUrl) {
            // 有历史图片：显示图片
            const img = document.createElement('img');
            img.className = 'grid-img';
            img.src = imageUrl;
            img.alt = `历史图片${imgIndex+1}`;
            img.onerror = function() {
                this.classList.add('error');
                this.src = '';
                this.textContent = '图片加载失败';
                generationStatus[imgIndex] = 'failed';
                saveGenerationState();
            };

            // 历史图片也支持点击查看大图
            img.onclick = function(e) {
                e.stopPropagation();
                openImagePreview(imageUrl);
            };
            gridItem.onclick = function() {
                openImagePreview(imageUrl);
            };

            gridItem.appendChild(img);
        } else {
            if (generationStatus[imgIndex] === 'pending') {
                // 历史记录中处于生成中的图片：显示加载动画
                const loadingContainer = document.createElement('div');
                loadingContainer.className = 'grid-loading-container';
                
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                
                loadingContainer.appendChild(spinner);
                gridItem.appendChild(loadingContainer);
                gridItem.onclick = null;
            } else {
                // 未生成/失败的图片：显示提示
                const errorDiv = document.createElement('div');
                errorDiv.className = 'grid-img error';
                errorDiv.textContent = generationStatus[imgIndex] === 'failed' ? '生成失败' : '未生成';
                gridItem.appendChild(errorDiv);
                
                // 如果是生成失败，添加重试按钮
                if (generationStatus[imgIndex] === 'failed') {
                    const retryBtn = document.createElement('button');
                    retryBtn.className = 'retry-btn';
                    retryBtn.textContent = '重试';
                    retryBtn.onclick = function(e) {
                        e.stopPropagation();
                        retrySingleImage(imgIndex);
                    };
                    gridItem.appendChild(retryBtn);
                }
                
                gridItem.onclick = null;
            }
        }

        gridContainer.appendChild(gridItem);
    });

    // 更新历史列表选中状态
    document.querySelectorAll('.history-item').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });

    addDebugLog(`显示第${index+1}条历史记录（${item.timeStr}）`);
    
    // 保存状态
    saveGenerationState();
}

/**
 * 清空所有历史记录
 */
function clearAllHistory() {
    if (!confirm('确定要清空所有生成历史记录吗？此操作不可恢复！')) {
        return;
    }

    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, '[]');
        // 同时清空生成状态
        localStorage.removeItem(GENERATION_STATE_KEY);
        currentHistoryIndex = -1;
        renderHistoryList();
        
        // 重置九宫格为初始状态
        initGridContainer();
        
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        
        const progressTip = document.getElementById('progressTip');
        if (progressTip) progressTip.textContent = '长按图片即可保存';
        
        const retryBtn = document.getElementById('retryFailedBtn');
        if (retryBtn) retryBtn.style.display = 'none';
        
        // 隐藏页面关闭提醒
        const beforeunloadTip = document.getElementById('beforeunloadTip');
        if (beforeunloadTip) beforeunloadTip.style.display = 'none';
        
        addDebugLog('已清空所有历史记录和生成状态');
        alert('所有历史记录已清空！');
    } catch (err) {
        addDebugLog(`清空历史记录失败：${err.message}`);
        alert('清空历史记录失败，请稍后重试');
    }
}