# 机器人借口生成器

输入一件拖延中的任务，选择紧急程度和发生场景，生成一条带系统日志风格的荒谬借口。生成结果可以复制，并会以「时间 · 任务 · 置信度」的形式保留在页面底部的借口日志里（最多 6 条，可一键清空）。

直接打开 `index.html` 即可使用，无需服务器、无联网、无 API key、无运行时依赖。

## 用法

1. 在「要解释的任务」里填写没做完的事，留空时会记为「这件事」。
2. 选择紧急程度（不太急 / 今天要交 / 现在就要）和发生场景（家里 / 办公室 / 太空站 / 咖啡店）。
3. 点「生成一条借口」，结果出现在右侧面板，同时写入下方借口日志。
4. 点「复制」把当前借口复制到剪贴板；点「清空」清空日志。

## 开发

```bash
npm run check   # node --check app.js，语法检查
npm test        # 运行 tests/excuse.test.js（无依赖，纯 Node assert）
```

`app.js` 里的纯逻辑（文案表、`cleanTaskValue`、`buildExcuse`、`rollConfidence`、`addLog`）在 Node 下通过 `module.exports` 导出，供 `tests/excuse.test.js` 直接断言；浏览器里这些函数仍然作为页面脚本直接运行，两者共用同一份代码。`addLog` 的容器由调用方传入，因此测试可以用假 DOM 驱动它。

CI 见 `.github/workflows/ci.yml`，在 push 和 pull request 时运行 `npm run check` 与 `npm test`。

## 可访问性

借口日志区域带有 `role="log"` 与 `aria-live="polite"`，新条目会被屏幕阅读器播报；空日志的占位文字对比度满足 WCAG AA；装饰性图标为 `aria-hidden`。

MIT 许可证见 `LICENSE`。
