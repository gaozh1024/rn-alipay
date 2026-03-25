export type AlipayResultStatus =
  | '9000'
  | '8000'
  | '4000'
  | '5000'
  | '6001'
  | '6002'
  | '6004'
  | (string & {});

export interface PayOptions {
  showLoading?: boolean;
}

export interface AlipayPayResult {
  raw: Record<string, string>;
  resultStatus: AlipayResultStatus;
  result: string;
  memo: string;
  succeeded: boolean;
  pending: boolean;
  cancelled: boolean;
  duplicated: boolean;
  networkError: boolean;
  statusMessage: string;
}

export declare const RESULT_STATUS: Readonly<{
  SUCCESS: '9000';
  PROCESSING: '8000';
  FAILED: '4000';
  DUPLICATE_REQUEST: '5000';
  USER_CANCELLED: '6001';
  NETWORK_ERROR: '6002';
  UNKNOWN: '6004';
}>;

export declare function normalizePayResult(
  rawResult?: Record<string, string>,
): AlipayPayResult;

export declare function pay(
  orderInfo: string,
  options?: PayOptions,
): Promise<AlipayPayResult>;

export declare function getVersion(): Promise<string>;

export declare function isAlipayInstalled(): Promise<boolean>;

declare const _default: {
  RESULT_STATUS: typeof RESULT_STATUS;
  normalizePayResult: typeof normalizePayResult;
  pay: typeof pay;
  getVersion: typeof getVersion;
  isAlipayInstalled: typeof isAlipayInstalled;
};

export default _default;
