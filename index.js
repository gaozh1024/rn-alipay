'use strict';

const { NativeModules, Platform } = require('react-native');

const MODULE_NAME = 'RnAlipay';
const ANDROID_ONLY_ERROR = 'rn-alipay 目前只支持 Android。';
const LINKING_ERROR =
  `The package '${MODULE_NAME}' doesn't seem to be linked. ` +
  'Please run your Android build again after installing rn-alipay.';

const RESULT_STATUS = Object.freeze({
  SUCCESS: '9000',
  PROCESSING: '8000',
  FAILED: '4000',
  DUPLICATE_REQUEST: '5000',
  USER_CANCELLED: '6001',
  NETWORK_ERROR: '6002',
  UNKNOWN: '6004',
});

const STATUS_MESSAGE_MAP = Object.freeze({
  [RESULT_STATUS.SUCCESS]: '支付成功',
  [RESULT_STATUS.PROCESSING]: '支付结果确认中',
  [RESULT_STATUS.FAILED]: '支付失败',
  [RESULT_STATUS.DUPLICATE_REQUEST]: '重复请求',
  [RESULT_STATUS.USER_CANCELLED]: '用户取消支付',
  [RESULT_STATUS.NETWORK_ERROR]: '网络连接出错',
  [RESULT_STATUS.UNKNOWN]: '支付结果未知',
});

function getNativeModule() {
  if (Platform.OS !== 'android') {
    throw new Error(ANDROID_ONLY_ERROR);
  }

  const nativeModule = NativeModules[MODULE_NAME];

  if (!nativeModule) {
    throw new Error(LINKING_ERROR);
  }

  return nativeModule;
}

function normalizeString(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function getStatusMessage(resultStatus) {
  return STATUS_MESSAGE_MAP[resultStatus] || '未知支付状态';
}

function normalizePayResult(rawResult = {}) {
  const resultStatus = normalizeString(rawResult.resultStatus);
  const result = normalizeString(rawResult.result);
  const memo = normalizeString(rawResult.memo);
  const succeeded = resultStatus === RESULT_STATUS.SUCCESS;
  const pending =
    resultStatus === RESULT_STATUS.PROCESSING ||
    resultStatus === RESULT_STATUS.UNKNOWN;
  const cancelled = resultStatus === RESULT_STATUS.USER_CANCELLED;
  const duplicated = resultStatus === RESULT_STATUS.DUPLICATE_REQUEST;
  const networkError = resultStatus === RESULT_STATUS.NETWORK_ERROR;

  return {
    raw: { ...rawResult },
    resultStatus,
    result,
    memo,
    succeeded,
    pending,
    cancelled,
    duplicated,
    networkError,
    statusMessage: getStatusMessage(resultStatus),
  };
}

async function pay(orderInfo, options = {}) {
  if (typeof orderInfo !== 'string' || orderInfo.trim().length === 0) {
    throw new TypeError('orderInfo 必须是非空字符串。');
  }

  const nativeModule = getNativeModule();
  const showLoading = options.showLoading !== false;
  const rawResult = await nativeModule.pay(orderInfo, showLoading);

  return normalizePayResult(rawResult);
}

async function getVersion() {
  return getNativeModule().getVersion();
}

async function isAlipayInstalled() {
  return getNativeModule().isAlipayInstalled();
}

module.exports = {
  RESULT_STATUS,
  getVersion,
  isAlipayInstalled,
  normalizePayResult,
  pay,
  default: {
    RESULT_STATUS,
    getVersion,
    isAlipayInstalled,
    normalizePayResult,
    pay,
  },
};
