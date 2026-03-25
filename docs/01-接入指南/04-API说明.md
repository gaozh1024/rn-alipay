# API 说明

本文档描述 `rn-alipay` 暴露给 React Native 的全部 API。

## 一、导出方式

```ts
import Alipay, {
  RESULT_STATUS,
  getVersion,
  isAlipayInstalled,
  normalizePayResult,
  pay,
} from 'rn-alipay';
```

默认导出和具名导出都可用。

## 二、`pay(orderInfo, options?)`

### 方法签名

```ts
function pay(
  orderInfo: string,
  options?: {
    showLoading?: boolean;
  },
): Promise<AlipayPayResult>
```

### 参数说明

#### `orderInfo`

- 类型：`string`
- 必填：是
- 含义：服务端生成并签名后的完整订单字符串

传空值时，JS 层会直接抛出：

```ts
TypeError('orderInfo 必须是非空字符串。')
```

#### `options.showLoading`

- 类型：`boolean`
- 默认值：`true`
- 含义：是否显示支付宝 SDK 内部 loading

### 返回结构

```ts
interface AlipayPayResult {
  raw: Record<string, string>;
  resultStatus: string;
  result: string;
  memo: string;
  succeeded: boolean;
  pending: boolean;
  cancelled: boolean;
  duplicated: boolean;
  networkError: boolean;
  statusMessage: string;
}
```

### 字段含义

- `raw`：支付宝 SDK 原始返回对象
- `resultStatus`：支付状态码
- `result`：原始结果字符串
- `memo`：备注信息
- `succeeded`：是否为同步成功
- `pending`：是否为确认中或未知
- `cancelled`：是否为用户取消
- `duplicated`：是否为重复请求
- `networkError`：是否为网络错误
- `statusMessage`：中文状态说明

## 三、`getVersion()`

```ts
function getVersion(): Promise<string>
```

返回支付宝 Android SDK 版本号。

## 四、`isAlipayInstalled()`

```ts
function isAlipayInstalled(): Promise<boolean>
```

判断设备是否安装支付宝客户端。

## 五、`normalizePayResult(rawResult)`

```ts
function normalizePayResult(
  rawResult?: Record<string, string>,
): AlipayPayResult
```

把支付宝原始返回值转成统一结构。

通常业务不需要单独调用，因为 `pay()` 已经自动做了标准化。

## 六、`RESULT_STATUS`

```ts
const RESULT_STATUS = {
  SUCCESS: '9000',
  PROCESSING: '8000',
  FAILED: '4000',
  DUPLICATE_REQUEST: '5000',
  USER_CANCELLED: '6001',
  NETWORK_ERROR: '6002',
  UNKNOWN: '6004',
}
```
