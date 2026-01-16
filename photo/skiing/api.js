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

// 积分&令牌相关配置（支持每日重复使用3次）
const TOKEN_CONFIG = {
    tokens: {
        'YX5': 5,
        'YX10': 10,
        'YX2': 2,
        'YX20': 20
    },
    dailyUseLimit: 3, // 每个令牌每天最多使用3次
    usedTokensKey: 'usedInviteCodesDaily', // 存储每日使用记录的Key
    exchangeLimitSeconds: 2 // 兑换限流：2秒
};
let lastExchangeTime = 0; // 最后一次兑换时间（限流）
const GENERATE_COST = 1; // 生成一次九宫格消耗的积分

// 默认标签配置
const DEFAULT_TAGS = [
    '滑雪场，白色滑雪服，头上带着滑雪镜，手里拿着滑雪板，身材好。长发，大背影，举手比耶，场景抓拍，独特的拍摄角度，非对称，动态模糊，低光环境，光影美学，自然色彩，丰富层次感，细腻画质，真实，意境，虚化柔和过渡，情绪氛围感，胶片质感，电影质感，大师作品，获奖作品。看着镜头，略带随意，',
    '8K超写实，照片级质感，满屏扬雪雾下密上疏包裹人物，雪雾颗粒清晰飞溅冻结；冷白皮韩系美女单板滑雪者，黑长直发粉框护目镜，连体滑雪服持黑粉滑雪板站立；雪山日落暖光，低机位仰拍全身构图，强透视极简背景',
    '(8K超写实，照片级质感)，年轻亚裔女性的半身人像，穿着米白色宽松高领毛衣，腿上盖着红色细黑格纹毛毯，双手捧着一杯冒着热气的热饮（顶部有奶油与可可粉装饰）；面向左边，坐在山间木屋的阳台扶手椅上，阳台栏杆为黑色铁艺雕花样式，栏杆与地面覆盖积雪；背景是晴朗蓝天下的雪山群峰与被雪覆盖的森林，明亮温暖的冬日阳光，治愈放松的度假氛围，50mm镜头拍摄',
    '滑雪场上初级道上。一个8中长发女孩，她个子高，身材好头戴滑雪帽，碎发随风飘逸，她已有3年的初级道滑雪经验，单板；穿着一身粉色的滑雪服，正在熟练的滑雪，真实照片，高清摄影，细节真实，且动感十足。背景滑雪场初级道，雪山树木，几个人也在滑雪，此时，滑雪的女孩踏着滑雪板，双手拿着滑雪杆，从平缓坡向前滑行，身后溅起一大片雪花。',
    '(8K超写实，照片级细节)，年轻亚裔女性的全身人像，戴着米白色针织毛线帽，穿着白黑拼色滑雪夹克与黑色滑雪裤，双手各持一支带黑色固定器的滑雪板（板面有白色箭头与红黑装饰），站在积雪覆盖的高山滑雪场上；背景是连绵的雪山群峰，晴朗的湛蓝色天空，明亮的日光，清晰的雪面脚印，清新通透的冬日氛围，广角镜头拍摄，背后的雪山有很多细节，画面真实感',
    '(8K超写实，照片级细节)，年轻亚裔女性坐在高山缆车车厢内，个子很高，穿着米色高领毛衣、浅灰色紧身裤，搭配同色系流苏围巾与短靴；车厢内是浅棕色布艺座椅与木质小桌，窗外是覆盖积雪的连绵雪山，缆车线路与多辆缆车清晰可见，晴朗的蓝天背景，明亮柔和的自然光，安静治愈的山间缆车氛围，50mm镜头拍摄，窗外的雪山细节丰富，照片真实',
    '(8K超写实，照片级细节)，年轻亚裔女性的近景人像，穿着白黑拼色带毛绒兜帽的冬季羽绒服，温柔微笑，佩戴大尺寸滑雪镜，镜片是彩虹渐变色反光材质（镜片清晰反射出有暖光串灯的雪中小木屋村落），滑雪镜挡住脸部，空中飘着雪花，背景是温馨的冬季滑雪度假村，暖黄色灯光点缀，冬日柔和冷调光线，浅景深效果，温暖治愈的氛围，50mm镜头拍摄',
    '(8K超写实，照片级质感)，年轻亚裔女性的半身人像，穿着酒红色带毛领的羽绒服，内搭米白色高领毛衣，围着格纹长围巾（米色、蓝绿、棕色配色），戴深棕色皮手套，穿黑色紧身裤与棕色雪地靴；站在积雪覆盖的酒店门前道路上，她对着相机镜头摆出pose,背景是木质结构+石墙的高端滑雪度假村大堂（带拱形门、复古壁灯、屋顶积雪），两侧是被雪覆盖的松树与盆栽，冬日明亮柔和的光线，干净清新的雪景氛围，50mm镜头拍摄',
    '(8K超写实，照片级动态质感)，年轻亚裔女性的滑雪抓拍镜头，她个子很高，极速滑雪身前溅起大量雪花挡住双腿，身穿亮蓝色拼黑边的滑雪服，佩戴白色滑雪头盔与护目镜，戴黑色滑雪手套、手持滑雪杖，双脚踩滑雪板在雪坡上滑行，雪沫飞溅的动感效果；背景是晴朗蓝天下的雪山群峰与被雪覆盖的松树，明亮锐利的冬日日光，清晰的雪面纹理，充满活力的户外滑雪氛围，70mm镜头拍摄'
];
// ===================== API配置结束 =====================

// 初始化：恢复生成状态 + 加载积分 + 加载历史记录 + 清理过期令牌记录
window.onload = function() {
    // 恢复上次的生成状态
    restoreGenerationState();
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('retryFailedBtn').style.display = 'none';
    // 加载本地积分
    loadPointsFromLocal();
    // 清理过期的令牌使用记录
    cleanExpiredTokenRecords();
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
            // 处理中但未返回结果的图片
            const loadingDiv = document.createElement('div');
            loadingDiv.style.display = 'flex';
            loadingDiv.style.alignItems = 'center';
            loadingDiv.style.justifyContent = 'center';
            loadingDiv.style.color = '#999';
            loadingDiv.style.fontSize = '12px';
            loadingDiv.textContent = `处理中(${i+1}/9)`;
            gridItem.appendChild(loadingDiv);
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

// ========== 清理过期的令牌使用记录（仅保留当天） ==========
function cleanExpiredTokenRecords() {
    try {
        const usedRecords = JSON.parse(localStorage.getItem(TOKEN_CONFIG.usedTokensKey) || '{}');
        const today = getDateString();
        
        // 遍历所有记录，只保留今天的
        for (const token in usedRecords) {
            const record = usedRecords[token];
            if (record.date !== today) {
                delete usedRecords[token]; // 删除非今日的记录
            }
        }
        
        // 保存清理后的记录
        localStorage.setItem(TOKEN_CONFIG.usedTokensKey, JSON.stringify(usedRecords));
        addDebugLog('已清理过期的令牌使用记录');
    } catch (err) {
        addDebugLog(`清理令牌记录失败：${err.message}`);
    }
}

// ========== 获取格式化的日期字符串（YYYY-MM-DD） ==========
function getDateString(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ========== 积分相关核心函数 ==========
// 加载本地积分
function loadPointsFromLocal() {
    const points = localStorage.getItem('photoGeneratorPoints') || '0';
    document.getElementById('currentPoints').textContent = points;
    addDebugLog(`加载本地积分：${points}`);
}

// 更新积分（本地存储）
function updatePoints(newPoints) {
    localStorage.setItem('photoGeneratorPoints', newPoints.toString());
    document.getElementById('currentPoints').textContent = newPoints;
    addDebugLog(`积分更新为：${newPoints}`);
}

// 扣减积分（生成前校验）
function deductPoints() {
    const currentPoints = Number(document.getElementById('currentPoints').textContent);
    if (currentPoints < GENERATE_COST) {
        alert(`积分不足！生成一次需要${GENERATE_COST}积分，当前只有${currentPoints}积分，请先兑换令牌`);
        return false;
    }
    updatePoints(currentPoints - GENERATE_COST);
    addDebugLog(`扣减${GENERATE_COST}积分，剩余${currentPoints - GENERATE_COST}积分`);
    return true;
}

// ========== 令牌兑换核心函数 ==========
function exchangeInviteCode() {
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
        
        // 步骤1：校验令牌是否存在
        if (!TOKEN_CONFIG.tokens.hasOwnProperty(token)) {
            alert('令牌无效！');
            exchangeBtn.disabled = false;
            exchangeBtn.textContent = '兑换积分';
            return;
        }
        
        // 步骤2：检查今日使用次数（仅后台逻辑，不提示用户）
        const today = getDateString();
        const usedRecords = JSON.parse(localStorage.getItem(TOKEN_CONFIG.usedTokensKey) || '{}');
        
        // 初始化该令牌的今日记录
        if (!usedRecords[token]) {
            usedRecords[token] = {
                date: today,
                useCount: 0
            };
        }
        
        // 非今日则重置计数
        if (usedRecords[token].date !== today) {
            usedRecords[token].date = today;
            usedRecords[token].useCount = 0;
        }
        
        // 检查今日使用次数是否超限（仅你可见日志，用户只看到"令牌无效"）
        if (usedRecords[token].useCount >= TOKEN_CONFIG.dailyUseLimit) {
            alert('令牌无效！');
            addDebugLog(`管理员日志：令牌 ${token} 今日已使用${usedRecords[token].useCount}次，达到每日${TOKEN_CONFIG.dailyUseLimit}次限制`);
            exchangeBtn.disabled = false;
            exchangeBtn.textContent = '兑换积分';
            return;
        }

        // 步骤3：更新使用次数
        usedRecords[token].useCount += 1;
        localStorage.setItem(TOKEN_CONFIG.usedTokensKey, JSON.stringify(usedRecords));

        // 步骤4：发放积分
        const givePoints = TOKEN_CONFIG.tokens[token];
        const currentPoints = Number(document.getElementById('currentPoints').textContent);
        const newPoints = currentPoints + givePoints;
        updatePoints(newPoints);
        
        // 对用户仅显示基础成功提示，隐藏次数
        alert(`兑换成功！获得${givePoints}积分，当前总积分：${newPoints}`);
        // 仅你可见的详细日志
        addDebugLog(`管理员日志：令牌 ${token} 兑换成功，今日已使用${usedRecords[token].useCount}/${TOKEN_CONFIG.dailyUseLimit}次，用户积分：${newPoints}`);
        
        document.getElementById('inviteCodeInput').value = ''; // 清空输入框

    } catch (err) {
        alert(`兑换异常：${err.message}`);
        addDebugLog(`令牌兑换异常：${err.message}`);
        addDebugLog(`错误堆栈：${err.stack}`);
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
function startGridGeneration() {
    if (!uploadedImageUrl) {
        alert('请先上传图片！');
        return;
    }
    // 积分校验
    if (!deductPoints()) {
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
    
    // 重新渲染当前格子为处理中
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
    
    gridItem.innerHTML = '';
    
    const img = document.createElement('img');
    img.className = 'grid-img';
    
    if (imageUrl) {
        img.src = imageUrl;
        img.alt = `第${index+1}张`;
        img.onerror = function() {
            this.classList.add('error');
            this.src = '';
            this.textContent = '图片加载失败';
            generationStatus[index] = 'failed';
            saveGenerationState();
            addDebugLog(`第${index+1}张图片加载失败`);
        };
        
        // 点击图片查看大图
        img.onclick = function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            openImagePreview(imageUrl);
        };
        
        // 点击gridItem也能查看大图
        gridItem.onclick = function() {
            openImagePreview(imageUrl);
        };
        
        gridItem.appendChild(img);
    } else {
        img.classList.add('error');
        img.src = '';
        img.textContent = errorMsg || '生成失败';
        gridItem.appendChild(img);
        
        // 如果是生成失败，添加重试按钮
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
        
        // 失败图片不添加点击事件
        gridItem.onclick = null;
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

        const img = document.createElement('img');
        img.className = 'grid-img';

        if (imageUrl) {
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
            img.classList.add('error');
            img.src = '';
            img.textContent = generationStatus[imgIndex] === 'failed' ? '生成失败' : '未生成';
            gridItem.appendChild(img);
            
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