# B站动态视频简介关键词屏蔽器

>  自动屏蔽 Bilibili 动态中**视频简介**包含指定关键词的动态，支持自定义关键词管理、导入导出、一键清空。

![示例图：屏蔽视频简介关键词含“116864”的动态](https://github.com/CSCTACG/Bilibili-dynamic-video-introduction-keyword-blocker/blob/main/assets/%E5%85%B3%E9%94%AE%E8%AF%8D%E5%B1%8F%E8%94%BD%E8%84%9A%E6%9C%AC%E6%95%88%E6%9E%9C%E5%9B%BE.png)

##  功能特点

- **精准屏蔽**：仅针对动态中视频简介（`.bili-dyn-card-video__desc`）文本
- **关键词管理**：
  - 添加/删除关键词
  - **导入/导出** JSON 格式关键词列表（便于备份或分享）
  - **清空关键词**（带二次确认）
- **持久化存储**：关键词保存在本地，刷新不丢失
- **实时生效**：动态加载的新内容自动过滤

##  安装方法

### 方式一：直接安装（推荐）
1. 安装 [Tampermonkey 扩展](https://www.tampermonkey.net/)
2. 点击下方链接自动安装：
   - [安装最新版脚本](https://raw.githubusercontent.com/CSCTACG/Bilibili-dynamic-video-introduction-keyword-blocker/main/bilibili-dynamic-video-introduction-keyword-blocker.user.js)

### 方式二：手动安装
1. 下载 [`Bilibili-dynamic-video-introduction-keyword-blocker.user.js`](https://raw.githubusercontent.com/CSCTACG/Bilibili-dynamic-video-introduction-keyword-blocker/main/bilibili-dynamic-video-introduction-keyword-blocker.user.js)
2. 双击文件或拖入浏览器 → Tampermonkey 自动弹出安装界面

##  使用指南

1. 访问 [B站动态页](https://t.bilibili.com)
2. 点击浏览器右上角 **Tampermonkey 图标**
3. 在下拉菜单中点击 **「打开关键词屏蔽设置」**
4. 在弹出面板中管理关键词：
   - **添加**：输入关键词 → 点击“添加关键词”
   - **删除**：点击关键词右侧“删除”按钮
   - **导出**：将当前关键词列表生成 JSON 字符串复制到剪切板
   - **导入**：粘贴 JSON 字符串实现批量导入
   - **清空**：重置为默认关键词（含二次确认）

##  许可证

MIT License - 自由使用、修改、分发。

##  反馈与贡献

- 发现 Bug？ → [提交 Issue](https://github.com/CSCTACG/Bilibili-dynamic-video-introduction-keyword-blocker/issues)
- 想要新功能？ → 欢迎 PR！
