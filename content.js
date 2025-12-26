// 存储已处理的推文，避免重复添加按钮
const processedTweets = new Set();

// 获取推文文本
function getTweetText(articleElement) {
  // 查找推文内容的主要文本容器
  const tweetElement = articleElement.querySelector('[data-testid="tweetText"]');
  if (tweetElement) {
    return tweetElement.innerText.trim();
  }
  
  // 备选方案：查找所有文本节点
  const allText = articleElement.innerText;
  // 移除用户信息和时间戳等非内容部分
  const lines = allText.split('\n');
  const contentLines = [];
  
  for (let line of lines) {
    // 跳过用户名行、时间戳行、按钮行
    if (line.includes('@') || line.includes('AM') || line.includes('PM') || 
        line === 'Translate post' || line === 'Read' || line.includes('replies') ||
        line.includes('Repost') || line.includes('Like') || line.includes('Bookmark') ||
        line.includes('Share') || line.includes('View') || line.includes('查看') ||
        line.includes('转发') || line.includes('点赞') || line.includes('书签')) {
      continue;
    }
    if (line.trim()) {
      contentLines.push(line);
    }
  }
  
  return contentLines.join('\n').trim();
}

// 获取作者信息
function getAuthorInfo(articleElement) {
  // 尝试多种方式获取作者信息
  const userNameElement = articleElement.querySelector('[data-testid="User-Name"]');
  
  let author = 'Unknown';
  let handle = '@unknown';
  
  if (userNameElement) {
    const nameLinks = userNameElement.querySelectorAll('a');
    if (nameLinks.length >= 1) {
      author = nameLinks[0].innerText.trim();
    }
    if (nameLinks.length >= 2) {
      const href = nameLinks[1].getAttribute('href');
      if (href) {
        handle = href.replace('/', '');
      }
    }
  }
  
  return { author, handle };
}

// 创建AI回复按钮
function createAIReplyButton() {
  const button = document.createElement('button');
  button.className = 'ai-reply-btn';
  button.innerHTML = '✨ AI回复';
  button.style.cssText = `
    padding: 6px 12px;
    margin-left: 8px;
    background-color: #1d9bf0;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: background-color 0.2s;
  `;
  
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#1a8cd8';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#1d9bf0';
  });
  
  return button;
}

// 在推文中注入AI回复按钮
function injectAIButton(articleElement) {
  // 生成唯一ID用于识别已处理的推文
  const tweetId = articleElement.getAttribute('data-testid') || 
                  articleElement.innerHTML.substring(0, 100);
  
  // 检查是否已经添加了按钮
  if (articleElement.querySelector('.ai-reply-btn')) {
    return;
  }
  
  if (processedTweets.has(tweetId)) {
    return;
  }
  
  processedTweets.add(tweetId);
  
  // 查找操作按钮组容器
  const actionGroup = articleElement.querySelector('[role="group"]');
  if (!actionGroup) {
    return;
  }
  
  // 创建并添加AI回复按钮
  const aiButton = createAIReplyButton();
  
  aiButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 获取推文信息
    const tweetText = getTweetText(articleElement);
    const { author, handle } = getAuthorInfo(articleElement);
    
    console.log('推文文本:', tweetText);
    console.log('作者:', author, handle);
    
    if (!tweetText) {
      alert('无法获取推文内容，请刷新页面重试');
      return;
    }
    
    // 显示加载状态
    const originalText = aiButton.innerHTML;
    aiButton.innerHTML = '⏳ 生成中...';
    aiButton.disabled = true;
    
    try {
      // 从storage获取用户设置
      const settings = await chrome.storage.sync.get(['apiKey', 'baseUrl', 'model', 'customPrompt']);
      
      console.log('API设置:', {
        hasApiKey: !!settings.apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model
      });
      
      if (!settings.apiKey) {
        alert('请先在插件设置中配置API密钥\n\n点击浏览器工具栏的插件图标 → "⚙️ 打开设置"');
        chrome.runtime.openOptionsPage();
        aiButton.innerHTML = originalText;
        aiButton.disabled = false;
        return;
      }
      
      // 发送消息到background script生成回复
      const response = await chrome.runtime.sendMessage({
        action: 'generateReply',
        tweetText: tweetText,
        author: author,
        handle: handle,
        customPrompt: settings.customPrompt || ''
      });
      
      console.log('API响应:', response);
      
      if (response.error) {
        alert('生成回复失败:\n\n' + response.error + '\n\n请检查API配置是否正确');
        console.error('API错误:', response.error);
      } else if (response.reply) {
        // 填充回复输入框
        fillReplyBox(response.reply);
        alert('回复已生成！\n\n请在下方回复框中查看并编辑');
      } else {
        alert('生成回复失败: 未收到有效响应');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('发生错误:\n\n' + error.message + '\n\n请检查插件配置和网络连接');
    } finally {
      aiButton.innerHTML = originalText;
      aiButton.disabled = false;
    }
  });
  
  // 将按钮添加到操作组的末尾
  actionGroup.appendChild(aiButton);
}

// 填充回复输入框
function fillReplyBox(replyText) {
  // 等待一下让回复框加载
  setTimeout(() => {
    // 查找回复输入框 - 尝试多种选择器
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') || 
                     document.querySelector('[contenteditable="true"][role="textbox"]') ||
                     document.querySelector('.public-DraftEditor-content');
    
    if (replyBox) {
      // 如果是contenteditable元素
      if (replyBox.contentEditable === 'true') {
        // 清空现有内容
        replyBox.innerHTML = '';
        
        // 设置新内容
        const textNode = document.createTextNode(replyText);
        replyBox.appendChild(textNode);
        
        // 聚焦
        replyBox.focus();
        
        // 触发input事件以更新X的内部状态
        const inputEvent = new Event('input', { bubbles: true });
        replyBox.dispatchEvent(inputEvent);
        
        const changeEvent = new Event('change', { bubbles: true });
        replyBox.dispatchEvent(changeEvent);
        
        // 滚动到输入框
        replyBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // 如果是普通input
        replyBox.value = replyText;
        replyBox.focus();
        const inputEvent = new Event('input', { bubbles: true });
        replyBox.dispatchEvent(inputEvent);
      }
    } else {
      // 如果找不到输入框，复制到剪贴板
      navigator.clipboard.writeText(replyText).then(() => {
        console.log('回复已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
      });
    }
  }, 500);
}

// 处理页面上的所有推文
function processAllTweets() {
  const articles = document.querySelectorAll('article[role="article"]');
  console.log('找到', articles.length, '条推文');
  articles.forEach(article => {
    injectAIButton(article);
  });
}

// 初始化：等待页面加载后处理推文
setTimeout(() => {
  processAllTweets();
}, 1000);

// 监听DOM变化，处理动态加载的推文
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      shouldProcess = true;
    }
  });
  
  if (shouldProcess) {
    // 使用防抖，避免频繁处理
    clearTimeout(window.tweetProcessTimeout);
    window.tweetProcessTimeout = setTimeout(() => {
      processAllTweets();
    }, 500);
  }
});

// 开始监听
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 监听URL变化（单页应用路由）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed:', url);
    setTimeout(() => {
      processAllTweets();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });

console.log('✨ X AI回复生成器已加载');
