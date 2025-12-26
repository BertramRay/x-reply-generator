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
    
    console.log('Background: 收到生成请求');
    console.log('推文:', tweetText);
    
    // 从storage获取API配置
    const settings = await chrome.storage.sync.get(['apiKey', 'baseUrl', 'model']);
    const apiKey = settings.apiKey;
    let baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    const model = settings.model || 'gpt-4o';
    
    console.log('API配置:', {
      hasApiKey: !!apiKey,
      baseUrl: baseUrl,
      model: model
    });
    
    if (!apiKey) {
      sendResponse({ error: '未设置API密钥，请在插件设置中配置' });
      return;
    }
    
    // 确保baseUrl格式正确
    baseUrl = baseUrl.trim();
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    
    // 移除末尾的斜杠
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // 构建系统提示词
    let systemPrompt = `你是一个在X（Twitter）上的活跃用户。你的任务是为推文生成一个恰当的回复。

回复要求：
- 相关且有见地
- 简洁明了（通常在50-200字之间）
- 保持友好和专业的语气
- 如果适当，可以提出问题或补充观点
- 使用中文回复（除非推文是其他语言）`;

    if (customPrompt) {
      systemPrompt += `\n\n用户自定义指示：${customPrompt}`;
    }

    // 构建用户消息
    const userMessage = `请为以下推文生成一个回复：

作者：${author} (${handle})
推文内容：
${tweetText}

请直接生成回复内容，不要包含任何前缀、引号或解释。`;

    // 构建API端点URL
    let apiUrl;
    if (baseUrl.includes('generativelanguage.googleapis.com')) {
      // Google Gemini API
      apiUrl = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    } else if (baseUrl.includes('anthropic.com')) {
      // Anthropic Claude API
      apiUrl = `${baseUrl}/messages`;
    } else {
      // OpenAI-compatible API
      apiUrl = `${baseUrl}/chat/completions`;
    }
    
    console.log('API URL:', apiUrl);
    
    // 构建请求体
    let requestBody;
    let headers = {
      'Content-Type': 'application/json'
    };
    
    if (baseUrl.includes('generativelanguage.googleapis.com')) {
      // Gemini API格式
      requestBody = {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      };
    } else if (baseUrl.includes('anthropic.com')) {
      // Claude API格式
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      requestBody = {
        model: model,
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `${systemPrompt}\n\n${userMessage}`
        }]
      };
    } else {
      // OpenAI-compatible格式
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = {
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
      };
    }
    
    console.log('发送API请求...');
    
    // 调用API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    console.log('API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      
      let errorMessage = `API错误 (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText.substring(0, 200) || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API响应数据:', data);
    
    // 兼容不同API的响应格式
    let reply = '';
    
    if (baseUrl.includes('generativelanguage.googleapis.com')) {
      // Gemini响应格式
      if (data.candidates && data.candidates[0]) {
        reply = data.candidates[0].content?.parts?.[0]?.text || '';
      }
    } else if (baseUrl.includes('anthropic.com')) {
      // Claude响应格式
      if (data.content && data.content[0]) {
        reply = data.content[0].text || '';
      }
    } else {
      // OpenAI-compatible响应格式
      if (data.choices && data.choices[0]) {
        reply = data.choices[0].message?.content || data.choices[0].text || '';
      } else if (data.content) {
        reply = data.content;
      }
    }
    
    if (!reply) {
      console.error('无法解析API响应:', data);
      throw new Error('无法解析API响应，请检查API配置是否正确');
    }
    
    reply = reply.trim();
    console.log('生成的回复:', reply);

    sendResponse({ reply: reply });
  } catch (error) {
    console.error('生成回复时出错:', error);
    sendResponse({ 
      error: error.message || '未知错误',
      details: error.toString()
    });
  }
}
