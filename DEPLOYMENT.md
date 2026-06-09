# 📱 Netlify 部署指南

## 🚀 部署步骤

### 1. 本地测试
```bash
npm install
npm run build
npm run preview
```

### 2. Netlify 部署

#### 方式一：使用 Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### 方式二：连接 GitHub 仓库
1. 在 [Netlify Dashboard](https://app.netlify.com) 中创建新站点
2. 选择 GitHub 仓库连接
3. 构建命令：`npm run build`
4. 发布目录：`dist`

### 3. 设置环境变量

在 Netlify Dashboard 的 **Site settings → Environment** 中添加：

```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_APP_URL=your-site-name.netlify.app
```

## 📋 常见问题排查

### 问题：构建失败（Error building）
**解决方案：**
- 确保本地 `npm run build` 没有错误
- 检查 Node.js 版本（推荐 18+）
- 清除缓存：Netlify Dashboard → Site settings → Clear cache and redeploy

### 问题：页面显示空白或 404
**解决方案：**
- 检查 `netlify.toml` 中的 redirects 配置
- 确保 `dist` 文件夹中有 `index.html`
- 检查浏览器控制台的 JavaScript 错误

### 问题：相机、陀螺仪不工作
**解决方案：**
- 需要 HTTPS 连接（Netlify 自动提供）
- 手机需要允许权限请求
- 某些浏览器可能不支持（请使用 Chrome/Safari）

## 🔐 API 密钥获取

1. 访问 [Google AI Studio](https://ai.studio.google.com)
2. 创建新 API 密钥
3. 复制密钥到 Netlify 环境变量

## 📱 应用特性

- ✅ 响应式设计（支持移动端）
- ✅ 陀螺仪支持（平放设备自动熄灭蜡烛）
- ✅ 拍照功能（相机或上传）
- ✅ 3D 粒子效果和烟火动画
- ✅ URL 参数自定义（name & blessing）

## 🎯 使用 URL 参数

```
https://your-site.netlify.app/?name=小红&blessing=祝你生日快乐
```

参数：
- `name`: 寿星名字
- `blessing`: 生日祝福语
