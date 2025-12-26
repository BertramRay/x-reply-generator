// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    generateReply(request, sendResponse);
    return true; // 保持通道打开以支持异步响应
  }
});

// 生成回复的主函数
async function generateReply(request, sendResponse) {
  try {
    const { tweetText, author, handle, customPrompt } = request;
    
    // 从storage获取API配置
    const settings = await chrome.storage.sync.get(['apiKey', 'baseUrl', 'model']);
    const apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    const model = settings.model || 'gpt-4o';
    
    if (!apiKey) {
      sendResponse({ error: '未设置API密钥' });
      return;
    }
    
    // 构建系统提示词
    let systemPrompt = `你是一个在X（Twitter）上的活跃用户。你的任务是为推文生成一个恰当的回复。
回复应该：
- 相关且有见地
- 简洁明了（通常在50-200字之间）
- 保持友好和专业的语气
- 如果适当，可以提出问题或补充观点`;

    if (customPrompt) {
      systemPrompt += `\n\n用户自定义指示：${customPrompt}`;
    }

    // 构建用户消息
    const userMessage = `请为以下推文生成一个回复：

作者：${author} (${handle})
推文内容：
${tweetText}

请直接生成回复内容，不要包含任何前缀或解释。`;

    // 构建API端点URL
    const apiUrl = baseUrl.endsWith('/') 
      ? `${baseUrl}chat/completions` 
      : `${baseUrl}/chat/completions`;

    // 调用API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API错误 (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // 兼容不同API的响应格式
    let reply = '';
    if (data.choices && data.choices[0]) {
      reply = data.choices[0].message?.content || data.choices[0].text || '';
    } else if (data.content) {
      reply = data.content;
    } else {
      throw new Error('无法解析API响应');
    }
    
    reply = reply.trim();

    sendResponse({ reply: reply });
  } catch (error) {
    console.error('Error generating reply:', error);
    sendResponse({ error: error.message });
  }
}
