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

type LokiTailQueryParams = {
  query: string;
  delay_for?: string; 
  limit?: number; 
  start?: number; 
}

interface CustomTailQueryParams extends LokiTailQueryParams {
  config?: Config;
  namespace?: string;
  tenant: string;
}

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
}: CustomTailQueryParams) => {

  console.log('JZ loki-client > query: ', query);
  console.log('JZ loki-client > query.replace()', query.replace(/\s+/g, ''));

  // const trimmedQuery = {
  //   query: `${query.replace(/\s+/g, '')}`
  // }
  // console.log('JZ loki-client > trimmedQuery: ', trimmedQuery);

  // TODO: extend query is replacing ' ' with '+'
  const extendedQuery = queryWithNamespace({
    query: query.replace(/\s+/g, ''),
    namespace,
  });

  console.log("JZ loki-client extendedQuery: ", extendedQuery);


  const trimmedQuery = extendedQuery.replace(/\s+/g, '')

  console.log('JZ loki-client > trimmedQuery', trimmedQuery);

  // Query parma has to be first for this to work 
  const params = {
    query: trimmedQuery,
    limit: String(config?.logsLimit ?? 200),
  };

  console.log("JZ connectToTailSocket params: ", params)

  const { endpoint } = getFetchConfig({ config, tenant });



  // JZ TODO: 1. check if the params are being correctedly formatted
  // -- UPDATE : the params were NOT being formatted correctly. 
  // - START TIME : the start time was calculated as 60 minutes
  // but this should actually be the UNIX Epoch timestamp so instead of 60 minutes it should be currentTime - 1hr 
  // the real values of these would look like start:1685039916 UNIX epoch time instead of start:360000000000000 nanoseconds  
  // - extendedQuery = queryWithNameSpace(query, namespace) is replacing the ' ' (spaces) with '+' so,
  // { job= 'varlogs' } becomes 
  // {+job=+'varlogs'+}
  // ws://localhost:9000/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/infrastructure/loki/api/v1/tail?query={+kubernetes_pod_name="apiserver-54f7f8947-2bkk2"+}+|+json&start=3600000000000&limit=200
  // JZ TODO: 2. check if the data returned is being parsed correctly
  // --UPDATE: that data returned was NOT being parsed correctly in useLogs > ws.current.onmessage((data)) ==>
  // the 'data' object is the response from loki which is structured as 
  // response >> 
  //       'streams: 
  //                { 
  //                   streams: 
  //                            [log1, log2,log3 ...]
  //                 }
  //        '
  // the payload.logsData.data.results was not accessing the response correctly it was accessing it as 
  // "payload.logsData.data.results = response.streams" but instead it should be accessing 
  // "payload.logsData.data.results = response.streams.streams"
  //
  // let ws; 
  // const url = `ws://localhost:3200/loki/api/v1/tail?query=${encodeURIComponent('{job="varlogs"}')}`;
  // ws?.destroy();
  // ws = new WSFactory(url, {
  //   host: url,
  //   path: '',
  //   subprotocols: ['json'],
  // });
  // return ws;


  // console.log("JZ test reload 7 -- this works!")
  // // JZ URL general format : ws://<host>/<proxy>/<config-tentant>/<loki-tail>/<query>
  // const url = `ws:localhost:9000/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/infrastructure/loki/api/v1/tail?query=${encodeURIComponent('{kubernetes_pod_name="alertmanager-main-0"}|json')}`;
  // console.log("JZ connectToTailSocket > url: ", url)
  // return new WSFactory(url, {
  //     host: url,
  //     path: '',
  //     subprotocols: ['json'],
  //   });

    // JZ ORIGINAL CODE 
//   const url = `${endpoint}/loki/api/v1/tail?${new URLSearchParams(params)}`;
//   return new WSFactory(url, {
//     host: 'auto',
//     path: url,
//     subprotocols: ['json'],
//     jsonParse: true,
//   });
// };

  //const testParams = encodeURIComponent('{ kubernetes_pod_name = "alertmanager-main-0"}|json')

  const testParams = new URLSearchParams(params)

  // const testParams = `query={kubernetes_pod_name="\alertmanager-main-0\"}&limit=200&start=1685050716000000000`

  console.log("JZ connectToTailSocket testParams: " + testParams)

  console.log("JZ reload 40")
  // const url = `${endpoint}/loki/api/v1/tail?query=${testParams}&limit=200&start=1685039916`
  const url = `${endpoint}/loki/api/v1/tail?${testParams}`;
  console.log("JZ URL: ", url)

  return new WSFactory(url, {
    host: 'auto',
    path: url,
    subprotocols: ['json'],
    jsonParse: true,
  });

};

export const getRules = ({ config, tenant }: { config?: Config; tenant: string }) => {
  const { endpoint, requestInit } = getFetchConfig({
    config,
    tenant,
  });

  return cancellableFetch<RulesResponse>(`${endpoint}/prometheus/api/v1/rules`, requestInit);
};
