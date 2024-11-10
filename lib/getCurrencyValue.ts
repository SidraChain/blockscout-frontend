import BigNumber from 'bignumber.js';

import { ZERO } from 'lib/consts';

interface Params {
  value: string;
  exchangeRate?: string | null;
  accuracy?: number;
  accuracyUsd?: number;
  decimals?: string | null;
}

export default function getCurrencyValue({ value, accuracy, accuracyUsd, decimals, exchangeRate }: Params) {
  // Max 256-bit value (2^256 - 1)
  const MAX_255_BIT = new BigNumber(2).pow(255).minus(1);
  // Check if value is close to max 255-bit
  if (new BigNumber(value).gte(MAX_255_BIT)) {
    return { valueStr: '∞', usd: undefined, usdBn: ZERO };
  }
  const valueCurr = BigNumber(value).div(BigNumber(10 ** Number(decimals || '18')));
  const valueResult = accuracy ? valueCurr.dp(accuracy).toFormat() : valueCurr.toFormat();

  let usdResult: string | undefined;
  let usdBn = ZERO;

  if (exchangeRate) {
    const exchangeRateBn = new BigNumber(exchangeRate);
    usdBn = valueCurr.times(exchangeRateBn);
    if (accuracyUsd && !usdBn.isEqualTo(0)) {
      const usdBnDp = usdBn.dp(accuracyUsd);
      usdResult = usdBnDp.isEqualTo(0) ? usdBn.precision(accuracyUsd).toFormat() : usdBnDp.toFormat();
    } else {
      usdResult = usdBn.toFormat();
    }
  }

  return { valueStr: valueResult, usd: usdResult, usdBn };
}
