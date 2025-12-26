// 检查API密钥状态
async function checkStatus() {
  const settings = await chrome.storage.sync.get('apiKey');
  const statusEl = document.getElementById('status');
  
  if (settings.apiKey) {
    statusEl.innerHTML = '✅ API密钥已设置';
    statusEl.style.color = '#31a24c';
  } else {
    statusEl.innerHTML = '⚠️ 请先设置API密钥';
    statusEl.style.color = '#e74c3c';
  }
}

// 打开设置页面
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 显示帮助信息
document.getElementById('helpBtn').addEventListener('click', () => {
  alert(`X AI回复生成器使用指南：

1. 在X（Twitter）上浏览推文
2. 在推文下方点击"✨ AI回复"按钮
3. 等待AI生成回复（通常需要几秒）
4. 生成的回复会自动加载到回复输入框
5. 您可以编辑回复内容
6. 点击发送按钮发布回复

设置：
- 点击"⚙️ 打开设置"配置API密钥和自定义提示词
- API密钥可从 https://platform.openai.com/api-keys 获取
- 自定义提示词可设置回复的风格和身份`);
});

// 页面加载时检查状态
document.addEventListener('DOMContentLoaded', checkStatus);
