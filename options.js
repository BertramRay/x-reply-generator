// 页面加载时恢复设置
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get(['apiKey', 'baseUrl', 'model', 'customPrompt']);
  
  document.getElementById('apiKey').value = settings.apiKey || '';
  document.getElementById('baseUrl').value = settings.baseUrl || 'https://api.openai.com/v1';
  document.getElementById('model').value = settings.model || 'gpt-4o';
  document.getElementById('customPrompt').value = settings.customPrompt || '';
});

// 保存设置
document.getElementById('saveBtn').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const baseUrl = document.getElementById('baseUrl').value.trim();
  const model = document.getElementById('model').value.trim();
  const customPrompt = document.getElementById('customPrompt').value.trim();
  
  if (!apiKey) {
    showStatus('❌ 请输入API密钥', 'error');
    return;
  }
  
  if (!baseUrl) {
    showStatus('❌ 请输入Base URL', 'error');
    return;
  }
  
  if (!model) {
    showStatus('❌ 请输入模型名称', 'error');
    return;
  }
  
  // 验证Base URL格式
  try {
    new URL(baseUrl);
  } catch (e) {
    showStatus('❌ Base URL格式不正确', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      apiKey: apiKey,
      baseUrl: baseUrl,
      model: model,
      customPrompt: customPrompt
    });
    
    showStatus('✅ 设置已保存', 'success');
  } catch (error) {
    showStatus('❌ 保存失败: ' + error.message, 'error');
  }
});

// 重置为默认设置
document.getElementById('resetBtn').addEventListener('click', async () => {
  if (confirm('确定要重置所有设置吗？API密钥将被清除。')) {
    try {
      await chrome.storage.sync.clear();
      document.getElementById('apiKey').value = '';
      document.getElementById('baseUrl').value = 'https://api.openai.com/v1';
      document.getElementById('model').value = 'gpt-4o';
      document.getElementById('customPrompt').value = '';
      showStatus('✅ 已重置为默认设置', 'success');
    } catch (error) {
      showStatus('❌ 重置失败: ' + error.message, 'error');
    }
  }
});

// 快速模板按钮
document.querySelectorAll('.template-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('customPrompt').value = btn.dataset.template;
  });
});

// 快速选择模型按钮
document.querySelectorAll('.model-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const model = btn.dataset.model;
    document.getElementById('model').value = model;
    
    // 根据模型自动设置推荐的Base URL
    const baseUrlInput = document.getElementById('baseUrl');
    if (model.startsWith('claude-')) {
      baseUrlInput.value = 'https://api.anthropic.com/v1';
      showStatus('💡 已自动设置Claude API Base URL', 'info');
    } else if (model.startsWith('gemini-')) {
      baseUrlInput.value = 'https://generativelanguage.googleapis.com/v1beta';
      showStatus('💡 已自动设置Gemini API Base URL', 'info');
    } else {
      baseUrlInput.value = 'https://api.openai.com/v1';
      showStatus('💡 已自动设置OpenAI API Base URL', 'info');
    }
  });
});

// 显示状态消息
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = 'status-message ' + type;
  
  // 3秒后清除消息
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status-message';
  }, 3000);
}
