import React from 'react';

import { WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';
import { queryWithNamespace } from './attribute-filters';
import { CancellableFetch, cancellableFetch, RequestInitWithTimeout } from './cancellable-fetch';
import { Config, Direction, QueryRangeResponse, RulesResponse } from './logs.types';
import { durationFromTimestamp } from './value-utils';

const LOKI_ENDPOINT = '/api/proxy/plugin/logging-view-plugin/backend';

type QueryRangeParams = {
  query: string;
  start: number;
  end: number;
  config?: Config;
  namespace?: string;
  tenant: string;
  direction?: Direction;
};

type HistogramQuerParams = {
  query: string;
  start: number;
  end: number;
  interval: number;
  config?: Config;
  namespace?: string;
  tenant: string;
};

export const getFetchConfig = ({
  config,
  tenant,
}: {
  config?: Config;
  tenant: string;
  endpoint?: string;
}): { requestInit?: RequestInitWithTimeout; endpoint: string } => {
  if (config && config.useTenantInHeader === true) {
    return {
      requestInit: {
        headers: { 'X-Scope-OrgID': tenant },
        timeout: config?.timeout ? config.timeout * 1000 : undefined,
      },
      endpoint: LOKI_ENDPOINT,
    };
  }

  return {
    requestInit: {
      timeout: config?.timeout ? config.timeout * 1000 : undefined,
    },
    endpoint: `${LOKI_ENDPOINT}/api/logs/v1/${tenant}`,
  };
};

export const executeQueryRange = ({
  query,
  start,
  end,
  config,
  tenant,
  namespace,
  direction,
}: QueryRangeParams): CancellableFetch<QueryRangeResponse> => {
  const extendedQuery = queryWithNamespace({
    query,
    namespace,
  });

  const params: Record<string, string> = {
    query: extendedQuery,
    start: String(start * 1000000),
    end: String(end * 1000000),
    limit: String(config?.logsLimit ?? 100),
  };

  if (direction) {
    params.direction = direction;
  }

  const { endpoint, requestInit } = getFetchConfig({ config, tenant });

  return cancellableFetch<QueryRangeResponse>(
    `${endpoint}/loki/api/v1/query_range?${new URLSearchParams(params)}`,
    requestInit,
  );
};

export const executeHistogramQuery = ({
  query,
  start,
  end,
  interval,
  config,
  tenant,
  namespace,
}: HistogramQuerParams): CancellableFetch<QueryRangeResponse> => {
  const intervalString = durationFromTimestamp(interval);

  const extendedQuery = queryWithNamespace({
    query,
    namespace,
  });

  const histogramQuery = `sum by (level) (count_over_time(${extendedQuery} [${intervalString}]))`;

  const params = {
    query: histogramQuery,
    start: String(start * 1000000),
    end: String(end * 1000000),
    step: intervalString,
  };

  const { endpoint, requestInit } = getFetchConfig({ config, tenant });

  return cancellableFetch<QueryRangeResponse>(
    `${endpoint}/loki/api/v1/query_range?${new URLSearchParams(params)}`,
    requestInit,
  );
};

export const connectToTailSocket = ({
  query,
  start,
  config,
  tenant,
  namespace,
}: Omit<QueryRangeParams, 'end'>) => {
  // const extendedQuery = queryWithNamespace({
  //   query,
  //   namespace,
  // });

  // const params = {
  //   query: extendedQuery,
  //   start: String(start * 1000000),
  //   limit: String(config?.logsLimit ?? 200),
  // };

  // const { endpoint } = getFetchConfig({ config, tenant });

  // const url = `${endpoint}/loki/api/v1/tail?${new URLSearchParams(params)}`;



  // return new WSFactory(url, {
  //   host: 'auto',
  //   path: url,
  //   subprotocols: ['json'],
  //   jsonParse: true,
  // });

  const { endpoint } = getFetchConfig({ config, tenant });
  const extendedQuery = queryWithNamespace({
    query,
    namespace,
  });

  let ws;


  // JZ TODO: 1. check if the params are being correctedly formatted 
  // JZ TODO: 2. check if the data returned is being parsed correctly  

  const params = {
    query: extendedQuery,
    start: String(start * 1000000),
    limit: String(config?.logsLimit ?? 200),
  };

  // const url = `${endpoint}/loki/api/v1/tail?${new URLSearchParams(params)}`;

    // const onOpen = () => {
    //   buffer.current.clear();
    //   setStatus(STREAM_ACTIVE);
    // };
    // // Handler for websocket onclose event
    // const onClose = () => {
    //   setStatus(STREAM_EOF);
    // };
    // // Handler for websocket onerror event
    // const onError = () => {
    //   setError(true);
    // };
    // // Handler for websocket onmessage event
    // const onMessage = (msg) => {
    //   if (msg) {
    //     clearTimeout(timeoutIdRef.current);
    //     const text = Base64.decode(msg);
    //     countRef.current += buffer.current.ingest(text);
    //     // Set a timeout here to render more logs together when initializing
    //     timeoutIdRef.current = setTimeout(() => {
    //       setTotalLineCount((currentLineCount) => currentLineCount + countRef.current);
    //       countRef.current = 0;
    //       setLines(
    //         buffer.current.getTail() === ''
    //           ? [...buffer.current.getLines()]
    //           : [...buffer.current.getLines(), buffer.current.getTail()],
    //       );
    //       setHasTruncated(buffer.current.getHasTruncated());
    //     }, 10);
    //   }
    // };


    const url = `ws://localhost:3200/loki/api/v1/tail?query=${encodeURIComponent('{job="varlogs"}')}`

    ws?.destroy();
    ws = new WSFactory(url, {
      host: url,
      path: "",
      subprotocols: ['json'],
    })

  return ws 

};

export const getRules = ({ config, tenant }: { config?: Config; tenant: string }) => {
  const { endpoint, requestInit } = getFetchConfig({
    config,
    tenant,
  });

  return cancellableFetch<RulesResponse>(`${endpoint}/prometheus/api/v1/rules`, requestInit);
};
