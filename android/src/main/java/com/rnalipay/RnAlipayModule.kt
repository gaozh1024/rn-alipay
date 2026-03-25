package com.rnalipay

import android.content.pm.PackageManager
import android.os.Build
import com.alipay.sdk.app.PayTask
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class RnAlipayModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val MODULE_NAME = "RnAlipay"
    private const val ALIPAY_PACKAGE_NAME = "com.eg.android.AlipayGphone"
    private val paymentExecutor = Executors.newSingleThreadExecutor()
    private val isPaying = AtomicBoolean(false)
  }

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun pay(orderInfo: String, showLoading: Boolean, promise: Promise) {
    if (orderInfo.isBlank()) {
      promise.reject("E_INVALID_ORDER_INFO", "orderInfo 不能为空")
      return
    }

    val activity = currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "当前没有可用 Activity，无法发起支付宝支付")
      return
    }

    if (!isPaying.compareAndSet(false, true)) {
      promise.reject("E_PAY_IN_PROGRESS", "已有支付流程正在进行中")
      return
    }

    paymentExecutor.execute {
      try {
        val payTask = PayTask(activity)
        val result = payTask.payV2(orderInfo, showLoading) ?: emptyMap<String, String>()
        promise.resolve(result.toWritableMap())
      } catch (throwable: Throwable) {
        promise.reject("E_PAY_FAILED", throwable.message, throwable)
      } finally {
        isPaying.set(false)
      }
    }
  }

  @ReactMethod
  fun getVersion(promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "当前没有可用 Activity，无法读取支付宝 SDK 版本")
      return
    }

    try {
      promise.resolve(PayTask(activity).getVersion())
    } catch (throwable: Throwable) {
      promise.reject("E_GET_VERSION_FAILED", throwable.message, throwable)
    }
  }

  @ReactMethod
  fun isAlipayInstalled(promise: Promise) {
    try {
      promise.resolve(isPackageInstalled(ALIPAY_PACKAGE_NAME))
    } catch (throwable: Throwable) {
      promise.reject("E_PACKAGE_CHECK_FAILED", throwable.message, throwable)
    }
  }

  private fun isPackageInstalled(packageName: String): Boolean {
    return try {
      val packageManager = reactApplicationContext.packageManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getPackageInfo(
          packageName,
          PackageManager.PackageInfoFlags.of(0),
        )
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, 0)
      }
      true
    } catch (_: PackageManager.NameNotFoundException) {
      false
    }
  }

  private fun Map<String, String>.toWritableMap(): WritableMap {
    val map = Arguments.createMap()
    for ((key, value) in this) {
      map.putString(key, value)
    }
    return map
  }
}
