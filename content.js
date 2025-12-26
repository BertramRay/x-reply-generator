// 存储已处理的推文，避免重复添加按钮
const processedTweets = new Set();

// 获取推文文本
function getTweetText(articleElement) {
  // 查找推文内容的主要文本容器
  const textElements = articleElement.querySelectorAll('[data-testid="tweet"]');
  if (textElements.length > 0) {
    return textElements[0].innerText;
  }
  
  // 备选方案：查找所有文本节点
  const allText = articleElement.innerText;
  // 移除用户信息和时间戳等非内容部分
  const lines = allText.split('\n');
  const contentLines = [];
  let foundContent = false;
  
  for (let line of lines) {
    // 跳过用户名行、时间戳行、按钮行
    if (line.includes('@') || line.includes('AM') || line.includes('PM') || 
        line === 'Translate post' || line === 'Read' || line.includes('replies')) {
      continue;
    }
    if (line.trim()) {
      contentLines.push(line);
      foundContent = true;
    }
  }
  
  return contentLines.join('\n').trim();
}

// 获取作者信息
function getAuthorInfo(articleElement) {
  const nameLink = articleElement.querySelector('a[role="link"]');
  const handleLink = articleElement.querySelector('a[href*="/"]');
  
  let author = 'Unknown';
  let handle = '@unknown';
  
  if (nameLink && nameLink.innerText) {
    author = nameLink.innerText;
  }
  
  if (handleLink) {
    const href = handleLink.getAttribute('href');
    if (href) {
      handle = href.split('/')[1];
    }
  }
  
  return { author, handle: '@' + handle };
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
  const tweetId = articleElement.getAttribute('data-testid') || Math.random().toString();
  
  if (processedTweets.has(tweetId)) {
    return;
  }
  
  processedTweets.add(tweetId);
  
  // 查找操作按钮容器
  const actionButtons = articleElement.querySelectorAll('button[role="button"]');
  if (actionButtons.length === 0) {
    return;
  }
  
  // 找到最后一个按钮（通常是分享按钮）
  const lastButton = actionButtons[actionButtons.length - 1];
  const buttonContainer = lastButton.parentElement;
  
  // 创建并添加AI回复按钮
  const aiButton = createAIReplyButton();
  
  aiButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 获取推文信息
    const tweetText = getTweetText(articleElement);
    const { author, handle } = getAuthorInfo(articleElement);
    
    if (!tweetText) {
      alert('无法获取推文内容');
      return;
    }
    
    // 显示加载状态
    const originalText = aiButton.innerHTML;
    aiButton.innerHTML = '⏳ 生成中...';
    aiButton.disabled = true;
    
    try {
      // 从storage获取用户设置
      const settings = await chrome.storage.sync.get(['apiKey', 'customPrompt']);
      
      if (!settings.apiKey) {
        alert('请先在插件选项中设置OpenAI API密钥');
        chrome.runtime.openOptionsPage();
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
      
      if (response.error) {
        alert('生成回复失败: ' + response.error);
      } else {
        // 填充回复输入框
        fillReplyBox(response.reply);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('发生错误: ' + error.message);
    } finally {
      aiButton.innerHTML = originalText;
      aiButton.disabled = false;
    }
  });
  
  buttonContainer.appendChild(aiButton);
}

// 填充回复输入框
function fillReplyBox(replyText) {
  // 查找回复输入框
  const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') || 
                   document.querySelector('[contenteditable="true"]');
  
  if (replyBox) {
    // 如果是contenteditable元素
    if (replyBox.contentEditable === 'true') {
      replyBox.innerText = replyText;
      replyBox.focus();
      
      // 触发input事件以更新X的内部状态
      const inputEvent = new Event('input', { bubbles: true });
      replyBox.dispatchEvent(inputEvent);
      
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
      alert('回复已复制到剪贴板，请粘贴到回复框中');
    });
  }
}

// 处理页面上的所有推文
function processAllTweets() {
  const articles = document.querySelectorAll('article[role="article"]');
  articles.forEach(article => {
    injectAIButton(article);
  });
}

// 初始化：处理已有的推文
processAllTweets();

// 监听DOM变化，处理动态加载的推文
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'ARTICLE') {
            injectAIButton(node);
          } else {
            // 检查子元素中是否有article
            const articles = node.querySelectorAll('article[role="article"]');
            articles.forEach(article => {
              injectAIButton(article);
            });
          }
        }
      });
    }
  });
});

// 开始监听
observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('X AI回复生成器已加载');
