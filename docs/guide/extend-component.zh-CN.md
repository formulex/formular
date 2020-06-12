---
title: 自定义扩展组件
toc: menu
---

# 自定义扩展组件

Formular 具有竞争力的特性之一就是可以灵活地定制或接入第三方各种表单控件，包括下面三种组件：

1. 表单容器。类比 `<form>`
2. 表单项控件。用于提供标签 label、校验、布局等，类比一些典型 UI 库的 form control 概念
3. 表单部件。用于收集数据的最直接的组件，例如 `<input>`、`<select>`、`<textarea>`

对于上面三种组件，Formular 使用[高阶组件](https://reactjs.org/docs/higher-order-components.html)的设计模式轻松地对其进行自定义扩展

## 扩展表单容器

这里有一个 Formular 自定义扩展组件的示例：

<code src="./demo/basic.tsx" defaultShowCode />
