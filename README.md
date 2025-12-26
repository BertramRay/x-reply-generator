# X AI回复生成器

一个Chrome浏览器插件，可以在X（Twitter）上使用AI生成推文回复，支持自定义prompt设置和多种AI模型。

## 功能特点

- ✨ **一键生成回复**：在任何推文下点击"AI回复"按钮，即可生成智能回复
- 🎨 **自定义提示词**：设置你的身份、回复风格、长度偏好等
- 📝 **快速模板**：内置多种回复风格模板（技术评论员、投资者、内容创作者等）
- 🤖 **多模型支持**：支持OpenAI、Anthropic Claude、Google Gemini等主流AI模型
- 🔧 **灵活配置**：支持自定义API Base URL，可使用中转服务
- 🔒 **隐私保护**：API密钥存储在本地，不会发送到任何第三方服务
- 🚀 **无缝集成**：自动加载生成的回复到X的回复输入框

## 支持的AI模型

### OpenAI
- **GPT-5.2** - 最新旗舰模型（2025年12月）
- **GPT-5.2-Codex** - 专业代码生成模型
- **GPT-4.1** - 标准模型
- **GPT-4.1-mini** - 高效低成本
- **GPT-4o** - 多模态模型
- **GPT-4-turbo** - 高速版本

### Anthropic Claude
- **Claude Opus 4** - 最新旗舰模型（2025年5月）
- **Claude Sonnet 4** - 平衡性能和速度
- **Claude Sonnet 3.7** - 上一代模型

### Google Gemini
- **Gemini 3 Pro** - 最新推理模型
- **Gemini 2.5 Flash** - 原生音频支持
- **Gemini 2.0 Flash** - 当前默认模型
- **Gemini 1.5 Pro** - 标准版本

## 安装步骤

### 1. 准备API密钥

根据你想使用的模型，从相应平台获取API密钥：
- OpenAI: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Anthropic: [https://console.anthropic.com/](https://console.anthropic.com/)
- Google: [https://aistudio.google.com/](https://aistudio.google.com/)

### 2. 安装插件

1. 下载或克隆此项目到本地
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 在右上角启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `x-reply-generator` 文件夹
6. 插件安装完成！

### 3. 配置插件

1. 点击Chrome工具栏中的插件图标
2. 点击"⚙️ 打开设置"
3. 配置以下选项：
   - **API Base URL**: 默认为OpenAI官方地址，可修改为中转服务或其他API
   - **API密钥**: 输入你的API密钥
   - **模型**: 输入模型名称或点击快速选择按钮
4. （可选）设置自定义提示词
5. 点击"💾 保存设置"

## 使用方法

1. 访问 [X (Twitter)](https://x.com)
2. 浏览推文
3. 在任何推文下方找到"✨ AI回复"按钮
4. 点击按钮，等待AI生成回复（通常需要几秒）
5. 生成的回复会自动加载到回复输入框
6. 编辑回复内容（如需要）
7. 点击发送按钮发布回复

## 配置示例

### 使用OpenAI
```
Base URL: https://api.openai.com/v1
API密钥: sk-...
模型: gpt-5.2
```

### 使用Claude
```
Base URL: https://api.anthropic.com/v1
API密钥: sk-ant-...
模型: claude-opus-4
```

### 使用Gemini
```
Base URL: https://generativelanguage.googleapis.com/v1beta
API密钥: AIza...
模型: gemini-3-pro
```

### 使用中转服务
```
Base URL: https://your-proxy-service.com/v1
API密钥: your-api-key
模型: gpt-4o
```

## 自定义提示词示例

### 技术评论员
```
你是一个专业的技术评论员。回复应该深入、有见地，长度在150-250字。
```

### 投资者
```
你是一个投资者。回复应该关注商业价值和市场机会，简洁有力。
```

### 内容创作者
```
你是一个幽默的内容创作者。回复应该有趣、轻松，可以使用表情符号和俏皮话。
```

### 学者
```
你是一个学者。回复应该引用相关研究或数据，保持学术严谨性。
```

### 简洁风格
```
回复应该简洁明了，最多50字。直接表达观点。
```

### 详细风格
```
回复应该详细全面，300字左右。提供背景、分析和建议。
```

## 项目结构

```
x-reply-generator/
├── manifest.json           # 插件配置
├── content.js              # 内容脚本（注入按钮、提取推文）
├── background.js           # 后台脚本（调用API）
├── popup.html              # 弹窗页面
├── popup.js                # 弹窗脚本
├── options.html            # 选项页面
├── options.js              # 选项脚本
├── styles.css              # 样式文件
├── icons/                  # 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md               # 使用说明
```

## 技术实现

### Content Script (content.js)
- 使用 `MutationObserver` 监听DOM变化
- 在每条推文的操作按钮区域动态注入"AI回复"按钮
- 提取推文文本和作者信息
- 将生成的回复填充到X的回复输入框

### Background Script (background.js)
- 接收来自content script的消息
- 调用配置的API生成回复
- 支持自定义Base URL和模型
- 兼容不同API的响应格式

### Options Page (options.html/js)
- 管理用户设置（Base URL、API密钥、模型、自定义提示词）
- 提供快速模板和模型选择按钮
- 自动根据模型设置推荐的Base URL
- 使用Chrome Storage API持久化设置

## 隐私和安全

- API密钥和配置存储在Chrome的本地存储中，不会被发送到任何第三方服务
- 推文内容仅发送到你配置的API端点用于生成回复
- 插件不会收集或存储任何用户数据
- 遵守X的服务条款和API使用政策

## 常见问题

### Q: 生成回复失败怎么办？
A: 请检查：
1. API密钥是否正确设置
2. Base URL是否正确
3. 模型名称是否正确
4. API密钥是否有足够的额度
5. 网络连接是否正常
6. 查看浏览器控制台是否有错误信息

### Q: 如何使用中转服务？
A: 在设置页面的"API Base URL"中输入中转服务的地址，然后输入对应的API密钥即可。

### Q: 如何更改回复风格？
A: 在插件设置页面的"自定义提示词"中输入你的指示，或使用快速模板按钮。

### Q: 生成的回复会自动发送吗？
A: 不会。生成的回复只会加载到输入框中，你可以编辑后再手动发送。

### Q: 支持哪些语言？
A: 插件界面为中文，但AI可以生成任何语言的回复，取决于推文的语言和你的提示词设置。

### Q: API调用费用是多少？
A: 费用取决于你选择的模型和使用频率。建议使用高效模型（如GPT-4.1-mini）以降低成本。

## 开发和贡献

欢迎提交Issue和Pull Request！

### 本地开发
1. 克隆项目
2. 在Chrome中加载未打包的扩展
3. 修改代码
4. 刷新扩展以查看更改

### 技术栈
- Manifest V3
- 原生JavaScript（无外部依赖）
- Chrome Extension APIs
- OpenAI-compatible API

## 许可证

MIT License

## 更新日志

### v1.1.0 (2025-12-26)
- 新增支持自定义API Base URL
- 新增支持自定义模型名称
- 更新支持最新AI模型（GPT-5.2、Claude Opus 4、Gemini 3 Pro等）
- 新增快速模型选择按钮
- 优化API错误处理
- 改进用户界面

### v1.0.0 (2025-12-26)
- 首次发布
- 支持在X推文下生成AI回复
- 支持自定义提示词
- 内置多种回复风格模板
- 支持多种AI模型选择
