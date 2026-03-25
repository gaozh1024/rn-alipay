# React Native 示例

下面给出一个可直接放进宿主项目的最小调用示例。

## 一、支付封装

```ts
import Alipay from 'rn-alipay';

type CreateOrderResponse = {
  orderInfo: string;
  outTradeNo: string;
};

export async function createAlipayOrder(amount: string) {
  const response = await fetch('https://your-api.example.com/pay/alipay/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      subject: '测试支付',
      outTradeNo: `trade_${Date.now()}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`create order failed: ${response.status}`);
  }

  return (await response.json()) as CreateOrderResponse;
}

export async function payWithAlipay(amount: string) {
  const installed = await Alipay.isAlipayInstalled();
  if (!installed) {
    throw new Error('请先安装支付宝客户端');
  }

  const { orderInfo, outTradeNo } = await createAlipayOrder(amount);
  const payResult = await Alipay.pay(orderInfo, { showLoading: true });

  return {
    outTradeNo,
    payResult,
  };
}
```

## 二、页面调用示例

```tsx
import React, { useState } from 'react';
import { Alert, Button, View } from 'react-native';
import { payWithAlipay } from './payWithAlipay';

export default function PayScreen() {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (loading) return;

    try {
      setLoading(true);
      const { outTradeNo, payResult } = await payWithAlipay('0.01');

      if (payResult.succeeded) {
        Alert.alert('支付结果', `客户端返回成功，订单号：${outTradeNo}`);
      } else if (payResult.pending) {
        Alert.alert('支付结果', '支付确认中，请稍后刷新订单状态');
      } else if (payResult.cancelled) {
        Alert.alert('支付结果', '用户已取消支付');
      } else {
        Alert.alert(
          '支付结果',
          `支付失败：${payResult.statusMessage}（${payResult.resultStatus}）`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      Alert.alert('支付异常', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 24 }}>
      <Button title={loading ? '支付中...' : '支付宝支付'} onPress={handlePay} />
    </View>
  );
}
```

## 三、成功页建议

不要在 `payResult.succeeded === true` 时直接把订单标记为最终成功。

推荐做法：

- 进入“支付结果确认中”页面
- 调用服务端订单查询接口
- 轮询到 `SUCCESS` 后再展示最终成功页
