import { Skeleton, Tooltip, chakra } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import type {
  TxInterpretationSummary,
  TxInterpretationVariable,
  TxInterpretationVariableString,
} from 'types/api/txInterpretation';

import config from 'configs/app';
import dayjs from 'lib/date/dayjs';
import * as mixpanel from 'lib/mixpanel/index';
import { currencyUnits } from 'lib/units';
import Tag from 'ui/shared/chakra/Tag';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import EnsEntity from 'ui/shared/entities/ens/EnsEntity';
import TokenEntity from 'ui/shared/entities/token/TokenEntity';
import IconSvg from 'ui/shared/IconSvg';

import { extractVariables, getStringChunks, fillStringVariables, checkSummary, NATIVE_COIN_SYMBOL_VAR_NAME } from './utils';

type Props = {
  summary?: TxInterpretationSummary;
  isLoading?: boolean;
  ensDomainNames?: Record<string, string>;
  className?: string;
}

type NonStringTxInterpretationVariable = Exclude<TxInterpretationVariable, TxInterpretationVariableString>

const TxInterpretationElementByType = (
  { variable, ensDomainNames }: { variable?: NonStringTxInterpretationVariable; ensDomainNames?: Record<string, string> },
) => {
  const onAddressClick = React.useCallback(() => {
    mixpanel.logEvent(mixpanel.EventTypes.TX_INTERPRETATION_INTERACTION, { Type: 'Address click' });
  }, []);

  const onTokenClick = React.useCallback(() => {
    mixpanel.logEvent(mixpanel.EventTypes.TX_INTERPRETATION_INTERACTION, { Type: 'Token click' });
  }, []);

  const onDomainClick = React.useCallback(() => {
    mixpanel.logEvent(mixpanel.EventTypes.TX_INTERPRETATION_INTERACTION, { Type: 'Domain click' });
  }, []);

  if (!variable) {
    return null;
  }

  const { type, value } = variable;
  switch (type) {
    case 'address': {
      let address = value;
      if (!address.ens_domain_name && ensDomainNames?.[address.hash]) {
        address = { ...address, ens_domain_name: ensDomainNames[address.hash] };
      }
      return (
        <chakra.span display="inline-block" verticalAlign="top" _notFirst={{ marginLeft: 1 }}>
          <AddressEntity
            address={ address }
            truncation="constant"
            onClick={ onAddressClick }
            whiteSpace="initial"
          />
        </chakra.span>
      );
    }
    case 'token':
      return (
        <chakra.span display="inline-block" verticalAlign="top" _notFirst={{ marginLeft: 1 }}>
          <TokenEntity
            token={ value }
            onlySymbol
            noCopy
            width="fit-content"
            _notFirst={{ marginLeft: 1 }}
            mr={ 2 }
            whiteSpace="initial"
            onClick={ onTokenClick }
          />
        </chakra.span>
      );
    case 'domain': {
      if (config.features.nameService.isEnabled) {
        return (
          <chakra.span display="inline-block" verticalAlign="top" _notFirst={{ marginLeft: 1 }}>
            <EnsEntity
              name={ value }
              width="fit-content"
              _notFirst={{ marginLeft: 1 }}
              whiteSpace="initial"
              onClick={ onDomainClick }
            />
          </chakra.span>
        );
      }
      return <chakra.span color="text_secondary" whiteSpace="pre">{ value + ' ' }</chakra.span>;
    }
    case 'currency': {
      let numberString = '';
      if (BigNumber(value).isLessThan(0.1)) {
        numberString = BigNumber(value).toPrecision(2);
      } else if (BigNumber(value).isLessThan(10000)) {
        numberString = BigNumber(value).dp(2).toFormat();
      } else if (BigNumber(value).isLessThan(1000000)) {
        numberString = BigNumber(value).dividedBy(1000).toFormat(2) + 'K';
      } else {
        numberString = BigNumber(value).dividedBy(1000000).toFormat(2) + 'M';
      }
      return <chakra.span>{ numberString + ' ' }</chakra.span>;
    }
    case 'timestamp': {
      return <chakra.span color="text_secondary" whiteSpace="pre">{ dayjs(Number(value) * 1000).format('MMM DD YYYY') }</chakra.span>;
    }
    case 'method': {
      return (
        <Tag
          colorScheme={ value === 'Multicall' ? 'teal' : 'gray' }
          isTruncated
          ml={ 1 }
          mr={ 2 }
          verticalAlign="text-top"
        >
          { value }
        </Tag>
      );
    }
  }
};

const TxInterpretation = ({ summary, isLoading, ensDomainNames, className }: Props) => {
  if (!summary) {
    return null;
  }

  const template = summary.summary_template;
  const variables = summary.summary_template_variables;

  if (!checkSummary(template, variables)) {
    return null;
  }

  const intermediateResult = fillStringVariables(template, variables);

  const variablesNames = extractVariables(intermediateResult);
  const chunks = getStringChunks(intermediateResult);

  return (
    <Skeleton isLoaded={ !isLoading } className={ className } fontWeight={ 500 } whiteSpace="pre-wrap" >
      <Tooltip label="Transaction summary">
        <IconSvg name="lightning" boxSize={ 5 } color="text_secondary" mr={ 2 } verticalAlign="text-top"/>
      </Tooltip>
      { chunks.map((chunk, index) => {
        return (
          <chakra.span key={ chunk + index }>
            <chakra.span color="text_secondary">{ chunk.trim() + (chunk.trim() && variablesNames[index] ? ' ' : '') }</chakra.span>
            { index < variablesNames.length && (
              variablesNames[index] === NATIVE_COIN_SYMBOL_VAR_NAME ?
                <chakra.span>{ currencyUnits.ether + ' ' }</chakra.span> :
                (
                  <TxInterpretationElementByType
                    variable={ variables[variablesNames[index]] as NonStringTxInterpretationVariable }
                    ensDomainNames={ ensDomainNames }
                  />
                )
            ) }
          </chakra.span>
        );
      }) }
    </Skeleton>
  );
};

export default chakra(TxInterpretation);
