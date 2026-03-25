# rn-alipay

一个 **仅支持 Android** 的 React Native 支付宝 App 支付桥接库。

它面向标准接入方式：**客户端只负责调起支付，服务端负责下单、签名、验签和最终订单确认**。

## 项目定位

`rn-alipay` 只解决一件事：

- 在 React Native 中调用支付宝 Android SDK，拉起支付宝支付

它**不负责**：

- 服务端创建订单
- 商户私钥签名
- `notify_url` 异步通知处理
- 服务端验签
- 最终订单状态确认

---

## 文档目录

### 一、接入指南

- [快速开始](./docs/01-接入指南/01-快速开始.md)
- [宿主应用接入](./docs/01-接入指南/02-宿主应用接入.md)
- [React Native 示例](./docs/01-接入指南/03-React-Native示例.md)
- [API 说明](./docs/01-接入指南/04-API说明.md)

### 二、服务端协作

- [服务端接口约定](./docs/02-服务端协作/01-服务端接口约定.md)
- [支付链路与时序](./docs/02-服务端协作/02-支付链路与时序.md)

### 三、联调与排障

- [测试清单](./docs/03-联调与排障/01-测试清单.md)
- [错误码与处理建议](./docs/03-联调与排障/02-错误码与处理建议.md)

---

## 当前能力

- `pay(orderInfo, options?)`
  - 调起支付宝支付
  - 在非 UI 线程执行支付调用
  - 防止并发重复支付
- `getVersion()`
  - 获取支付宝 Android SDK 版本
- `isAlipayInstalled()`
  - 判断设备是否安装支付宝客户端
- 统一支付结果结构
  - `succeeded`
  - `pending`
  - `cancelled`
  - `duplicated`
  - `networkError`
  - `statusMessage`

---

## 项目结构

```text
rn-alipay/
├── android/
│   ├── build.gradle
│   ├── consumer-rules.pro
│   ├── gradle.properties
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/rnalipay/
│           ├── RnAlipayModule.kt
│           └── RnAlipayPackage.kt
├── docs/
│   ├── 01-接入指南/
│   ├── 02-服务端协作/
│   └── 03-联调与排障/
├── index.js
├── index.d.ts
├── package.json
└── react-native.config.js
```

---

## 安装

```bash
pnpm add rn-alipay
# 或 npm install rn-alipay
```

安装后请重新编译 Android：

```bash
npx react-native run-android
```

---

## 最小示例

```ts
import Alipay from 'rn-alipay';

async function startPay() {
  const response = await fetch('https://your-api.example.com/pay/alipay/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: '0.01',
      subject: '测试商品',
      outTradeNo: `order_${Date.now()}`,
    }),
  });

  const { orderInfo } = await response.json();
  const result = await Alipay.pay(orderInfo, { showLoading: true });

  if (result.succeeded) {
    // 这里只表示客户端同步回调成功
    // 最终仍以后端异步通知或服务端查单为准
  }
}
```

---

## 接入原则

### 1. RN 侧通常不需要额外写原生代码

当前库已包含：

- React Native Android 自动链接配置
- 支付宝 SDK 调用桥接
- 必需的 AndroidManifest 声明
- 支付结果标准化

### 2. 服务端必须参与

你仍然必须准备：

- 服务端创建订单接口
- 服务端签名能力
- 服务端异步通知处理
- 服务端订单查询接口

### 3. 客户端结果不能作为最终成功依据

即使客户端返回 `9000`，也应以后端最终确认结果为准。

---

## 参考资料

- 支付宝开放平台文档：<https://opendocs.alipay.com/open/00dn75?pathHash=22ed0058>
- 支付宝 Android App 支付接入说明：<https://open.alitrip.com/docs/doc.htm?articleId=105296&docType=1&treeId=204>
- Maven 依赖页：<https://mvnrepository.com/artifact/com.alipay.sdk/alipaysdk-android>
