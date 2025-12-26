# Chrome Web Store 资源文件

本目录包含上传到Chrome Web Store所需的所有资源文件。

## 文件清单

### Store Icon（商店图标）
- **store-icon-128.png** - 128x128像素，PNG格式
- 用于Chrome Web Store商店页面展示

### Screenshots（截图）
所有截图均为1280x800像素，JPEG格式，符合Chrome Web Store要求。

1. **screenshot-1-1280x800.jpg** - 主功能展示
   - 展示X推文界面上的"✨ AI回复"按钮
   - 显示插件如何集成到X的原生界面中

2. **screenshot-2-1280x800.jpg** - 设置页面
   - 展示API配置界面
   - 显示Base URL、API密钥、模型选择等配置选项
   - 展示快速模型选择按钮

3. **screenshot-3-1280x800.jpg** - 生成过程
   - 展示AI回复生成中的状态
   - 显示生成的回复自动填充到输入框

4. **screenshot-4-1280x800.jpg** - 多模型支持
   - 展示OpenAI、Claude、Gemini三大AI提供商的模型选择
   - 显示模型分类和快速选择功能

5. **screenshot-5-1280x800.jpg** - 自定义提示词
   - 展示自定义提示词功能
   - 显示6种快速模板选项

## 上传到Chrome Web Store的步骤

### 1. 访问Chrome Web Store开发者控制台
https://chrome.google.com/webstore/devconsole

### 2. 创建新项目或更新现有项目

### 3. 上传资源文件

#### Store Icon
- 位置：Store listing → Store icon
- 文件：`store-icon-128.png`
- 要求：128x128像素，PNG格式

#### Screenshots
- 位置：Store listing → Screenshots
- 文件：按顺序上传5个截图
  1. `screenshot-1-1280x800.jpg`
  2. `screenshot-2-1280x800.jpg`
  3. `screenshot-3-1280x800.jpg`
  4. `screenshot-4-1280x800.jpg`
  5. `screenshot-5-1280x800.jpg`
- 要求：1280x800像素，JPEG或24-bit PNG格式

### 4. 填写商店信息

#### 名称
```
X AI回复生成器
```

#### 简短描述（132字符以内）
```
在X（Twitter）上一键生成AI回复，支持OpenAI、Claude、Gemini等多种模型，可自定义提示词和API配置
```

#### 详细描述
```
X AI回复生成器是一个强大的Chrome浏览器插件，帮助你在X（Twitter）上快速生成高质量的AI回复。

🎯 主要功能

• 一键生成回复：在任何推文下点击"✨ AI回复"按钮，即可生成智能回复
• 多模型支持：支持OpenAI GPT-5.2、Claude Opus 4、Gemini 3 Pro等最新AI模型
• 灵活配置：支持自定义API Base URL，可使用官方API或中转服务
• 自定义提示词：设置你的身份、回复风格、长度偏好等
• 快速模板：内置6种回复风格模板（技术评论员、投资者、内容创作者、学者、简洁/详细风格）
• 隐私保护：API密钥存储在本地，不会上传到任何服务器
• 无缝集成：自动填充生成的回复到X的回复输入框

🤖 支持的AI模型

OpenAI：GPT-5.2、GPT-5.2-Codex、GPT-4.1、GPT-4.1-mini、GPT-4o、GPT-4-turbo
Anthropic：Claude Opus 4、Claude Sonnet 4、Claude Sonnet 3.7
Google：Gemini 3 Pro、Gemini 2.5 Flash、Gemini 2.0 Flash、Gemini 1.5 Pro

🚀 快速开始

1. 安装插件
2. 点击插件图标 → "⚙️ 打开设置"
3. 配置API Base URL、API密钥和模型
4. 访问X (Twitter)，在推文下点击"✨ AI回复"按钮
5. 等待AI生成回复，编辑后发送

💡 使用场景

• 技术讨论：使用技术评论员模板，生成专业深入的回复
• 商业话题：使用投资者模板，关注商业价值和市场机会
• 日常互动：使用内容创作者模板，生成轻松有趣的回复
• 学术交流：使用学者模板，引用研究和数据

🔒 隐私和安全

• API密钥存储在Chrome本地，不会上传到任何第三方服务
• 推文内容仅发送到你配置的API端点
• 插件不会收集或存储任何用户数据
• 开源项目，代码透明可审计

📚 开源项目

GitHub: https://github.com/BertramRay/x-reply-generator
欢迎Star、Fork和贡献代码！

---

需要帮助？访问GitHub仓库提交Issue或查看详细文档。
```

#### 分类
```
主分类：Social & Communication
```

#### 语言
```
中文（简体）
```

### 5. 上传插件ZIP文件
将整个 `x-reply-generator` 文件夹打包为ZIP文件上传。

### 6. 提交审核
填写完所有信息后，点击"提交审核"。

## 注意事项

1. **隐私政策**：如果插件收集用户数据，需要提供隐私政策链接
2. **权限说明**：需要在商店页面说明为什么需要这些权限
3. **审核时间**：通常需要1-3个工作日
4. **更新版本**：每次更新需要修改manifest.json中的版本号

## 技术规格

- **Store Icon**: 128x128px, PNG, 8-bit RGB
- **Screenshots**: 1280x800px, JPEG, 24-bit RGB
- **Maximum file sizes**: 
  - Icon: < 1MB
  - Screenshots: < 5MB each
- **Supported formats**: PNG, JPEG (no alpha channel for screenshots)

## 相关链接

- Chrome Web Store开发者控制台: https://chrome.google.com/webstore/devconsole
- Chrome Web Store发布指南: https://developer.chrome.com/docs/webstore/publish/
- 图片要求文档: https://developer.chrome.com/docs/webstore/images/
