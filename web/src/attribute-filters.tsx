import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { notEmptyString, notUndefined } from './value-utils';
import { cancellableFetch } from './cancellable-fetch';
import { AttributeList, Filters, Option } from './components/filters/filter.types';
import { LogQLQuery, LabelMatcher, PipelineStage } from './logql-query';
import { Severity, severityAbbreviations, severityFromString } from './severity';

const RESOURCES_ENDPOINT = '/api/kubernetes/api/v1';

type K8sResource = K8sResourceCommon & {
  spec?: { containers: Array<{ name: string }> };
};

type K8sResourceListResponse = {
  kind: string;
  apiVersion: string;
  metadata: {
    resourceVersion: string;
    continue: string;
    remainingItemCount: number;
  };
  items: Array<K8sResource>;
};

type ResourceOptionMapper = (resource: K8sResource) => Option | Array<Option>;

const resourceAbort: Record<string, null | (() => void)> = {};

const resourceDataSource =
  ({
    resource,
    namespace,
    mapper = (resourceToMap) => ({
      option: resourceToMap?.metadata?.name ?? '',
      value: resourceToMap?.metadata?.name ?? '',
    }),
  }: {
    resource: 'pods' | 'namespaces' | string;
    namespace?: string;
    mapper?: ResourceOptionMapper;
  }) =>
  async (): Promise<Array<{ option: string; value: string }>> => {
    const endpoint = namespace
      ? `${RESOURCES_ENDPOINT}/namespaces/${namespace}/${resource}`
      : `${RESOURCES_ENDPOINT}/${resource}`;

    const { request, abort } = cancellableFetch<K8sResourceListResponse>(endpoint);

    const abortFunction = resourceAbort[resource];
    if (abortFunction) {
      abortFunction();
    }

    resourceAbort[resource] = abort;

    const response = await request();

    const kind = response.kind;
    let listItems: Array<K8sResource> = [];

    switch (kind) {
      case 'Pod':
        listItems = [response];
        break;
      case 'NamespaceList':
      case 'PodList':
        listItems = response.items;
        break;
    }

    return listItems.flatMap(mapper).filter(({ value }) => notEmptyString(value));
  };

export const availableAttributes: AttributeList = [
  {
    name: 'Content',
    id: 'content',
    valueType: 'text',
  },
  {
    name: 'Namespaces',
    label: 'kubernetes_namespace_name',
    id: 'namespace',
    options: resourceDataSource({ resource: 'namespaces' }),
    valueType: 'checkbox-select',
  },
  {
    name: 'Pods',
    label: 'kubernetes_pod_name',
    id: 'pod',
    options: resourceDataSource({ resource: 'pods' }),
    valueType: 'checkbox-select',
  },
  {
    name: 'Containers',
    label: 'kubernetes_container_name',
    id: 'container',
    options: resourceDataSource({
      resource: 'pods',
      mapper: (resource) =>
        resource?.spec?.containers.map((container) => ({
          option: `${resource?.metadata?.name} / ${container.name}`,
          value: container.name,
        })) ?? [],
    }),
    valueType: 'checkbox-select',
  },
];

export const availableDevConsoleAttributes = (namespace: string): AttributeList => [
  {
    name: 'Content',
    id: 'content',
    valueType: 'text',
  },
  {
    name: 'Pods',
    label: 'kubernetes_pod_name',
    id: 'pod',
    options: resourceDataSource({ resource: 'pods', namespace }),
    valueType: 'checkbox-select',
  },
  {
    name: 'Containers',
    label: 'kubernetes_container_name',
    id: 'container',
    options: resourceDataSource({
      resource: 'pods',
      namespace,
      mapper: (resource) =>
        resource?.spec?.containers.map((container) => ({
          option: `${resource?.metadata?.name} / ${container.name}`,
          value: container.name,
        })) ?? [],
    }),
    valueType: 'checkbox-select',
  },
];

export const availablePodAttributes = (namespace: string, podId: string): AttributeList => [
  {
    name: 'Content',
    id: 'content',
    valueType: 'text',
  },
  {
    name: 'Containers',
    label: 'kubernetes_container_name',
    id: 'container',
    options: resourceDataSource({
      resource: `namespaces/${namespace}/pods/${podId}`,
      mapper: (resource) =>
        resource?.spec?.containers.map((container) => ({
          option: `${resource?.metadata?.name} / ${container.name}`,
          value: container.name,
        })) ?? [],
    }),
    valueType: 'checkbox-select',
  },
];

export const queryFromFilters = ({
  existingQuery,
  filters,
  attributes,
  tenant,
}: {
  existingQuery: string;
  filters?: Filters;
  attributes: AttributeList;
  tenant?: string;
}): string => {
  const query = new LogQLQuery(existingQuery);

  if (!filters) {
    return query.toString();
  }

  if (tenant) {
    query.addSelectorMatcher({ label: 'log_type', operator: '=', value: `"${tenant}"` });
  }

  const contentPipelineStage = getContentPipelineStage(filters);

  if (contentPipelineStage) {
    query.removePipelineStage({ operator: '|=' }).addPipelineStage(contentPipelineStage, {
      placement: 'start',
    });
  }

  if (filters?.content === undefined || filters.content.size === 0) {
    query.removePipelineStage({ operator: '|=' });
  }

  const severityPipelineStage = getSeverityFilterPipelineStage(filters);

  if (severityPipelineStage) {
    query.removePipelineStage({}, { matchLabel: 'level' }).addPipelineStage(severityPipelineStage, {
      placement: 'end',
    });
  }

  if (filters?.severity === undefined || filters.severity.size === 0) {
    query.removePipelineStage({}, { matchLabel: 'level' });
  }

  query.addSelectorMatcher(getMatchersFromFilters(filters));

  attributes.forEach(({ id, label }) => {
    if (label) {
      const filterValue = filters?.[id];
      if (filterValue === undefined || filterValue.size === 0) {
        query.removeSelectorMatcher({ label });
      }
    }
  });

  return query.toString();
};

const removeQuotes = (value?: string) => (value ? value.replace(/"/g, '') : '');

const removeQuotes2 = (value?: string) => {
  let newValue;  
  if (value) {
    newValue = value.substring(1, value.length-1);
  } else {
    newValue = '';
  }
  return newValue;
}

const removeBacktick = (value?: string) => {

  // console.log("JZ before removeBacktick", value)
  // const returnValue = (value ? value.replace(/`/g, '') : '')
  // console.log("JZ after removeBacktick ", returnValue);

  // remove back ticks at str[0] and str[-1] from string 
  
  console.log("JZ before removeQuotes2", value)
  const removeQuotes = removeQuotes2(value);
  console.log("JZ after removeQuotes2", value)
  const cheese = `${removeQuotes}`
  console.log("JZ after removeQuotes2 cheese:", cheese)
  return cheese;
}

export const filtersFromQuery = ({
  query,
  attributes,
}: {
  query?: string;
  attributes: AttributeList;
}): Filters => {
  const filters: Filters = {};

  const modQuery = (query ? query.split("|= ",2)[1]?.split("|",2)[0]?.slice(1, -2)?.replace(/`/g, "\`") : '');
  console.log("modQuery : ", modQuery)

  // if (query) {
  //   let modQuery = query
  //   modQuery = modQuery.split("|= ",2)[1]
  //   console.log("modQuery1 : ", modQuery)
  //   const v = modQuery?.split("|",2)[0]?.slice(1, -2)
  //   console.log("modQuery2 : ", v)

  // }


  // JZ note: have to isolate backtick here before it becomes a LogQLQuery 
  const logQLQuery = new LogQLQuery(query ?? '');

  for (const { label, id } of attributes) {
    if (label && label.length > 0) {
      for (const selector of logQLQuery.streamSelector) {
        if (selector.label === label && selector.value) {
          filters[id] = new Set(selector.value.split('|').map(removeQuotes));
        }
      }
    }
  }

  for (const pipelineStage of logQLQuery.pipeline) {
    if (
      pipelineStage.operator === '|' &&
      pipelineStage.labelsInFilter?.every(({ label }) => label === 'level') &&
      !filters.severity
    ) {
      const severityValues: Array<Severity> = pipelineStage.labelsInFilter
        .flatMap(({ value }) => (value ? value.split('|') : []))
        .map(removeQuotes)
        .map(severityFromString)
        .filter(notUndefined);
      filters.severity = new Set(severityValues);
    } else if (pipelineStage.operator === '|=' && !filters.content) {

      console.log("JZ pipelineStage.value :", pipelineStage.value)
      console.log( "JZ removeBacktick(pipelineStage.value) : " , removeBacktick(pipelineStage.value)) 

       filters.content = new Set([removeBacktick(pipelineStage.value)])
       // filters.content = new Set([modQuery]);
    }
  }

  console.warn("JZ filters ", filters)

  return filters;
};

export const getNamespaceMatcher = (namespace?: string): LabelMatcher | undefined => {
  if (namespace === undefined) {
    return undefined;
  }

  return {
    label: 'kubernetes_namespace_name',
    operator: '=',
    value: `"${namespace}"`,
  };
};

export const queryWithNamespace = ({ query, namespace }: { query: string; namespace?: string }) => {
  const logQLQuery = new LogQLQuery(query ?? '');

  console.log("CAKE queryWithNamespace > logQLQuery : ", logQLQuery)

  logQLQuery.addSelectorMatcher(getNamespaceMatcher(namespace));

  console.log("CAKE queryWithNamespace > logQLQuery.addSelectorMatcher : ", logQLQuery)

  return logQLQuery.toString();
};

export const getMatcherFromSet = (label: string, values: Set<string>): LabelMatcher | undefined => {
  const valuesArray = Array.from(values);
  if (valuesArray.length === 0) {
    return undefined;
  }

  if (valuesArray.length === 1) {
    return {
      label,
      operator: '=',
      value: `"${valuesArray[0]}"`,
    };
  }

  return {
    label,
    operator: '=~',
    value: `"${valuesArray.join('|')}"`,
  };
};

export const getMatchersFromFilters = (filters?: Filters): Array<LabelMatcher> => {
  if (!filters) {
    return [];
  }

  const matchers: Array<LabelMatcher | undefined> = [];

  for (const key of Object.keys(filters)) {
    const value = filters[key];
    if (value) {
      switch (key) {
        case 'namespace':
          matchers.push(getMatcherFromSet('kubernetes_namespace_name', value));
          break;
        case 'pod':
          matchers.push(getMatcherFromSet('kubernetes_pod_name', value));
          break;
        case 'container':
          matchers.push(getMatcherFromSet('kubernetes_container_name', value));
          break;
      }
    }
  }

  return matchers.filter(notUndefined);
};

export const getContentPipelineStage = (filters?: Filters): PipelineStage | undefined => {
  if (!filters) {
    return undefined;
  }

  const content = filters.content;

  if (!content) {
    return undefined;
  }

  const [textValue] = content;

  console.log("JZ textValue = ", textValue); 

  console.log("JZ `\`${textValue}\``", `\`${textValue}\``)

  if (textValue === undefined) {
    return undefined;
  }

  // JZ LEFT OFF HERE -- 
  // see issue : https://github.com/grafana/loki/issues/2016
  // it advises to use double backslashes to escape special characters
  const containsBacktick = textValue.includes('`')
  const containsQuotes = textValue.includes('"')
  if (containsBacktick || containsQuotes) {

    // const REGEXP_SPECIAL_CHAR = /[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;

    // //base query
    // const queryString = 'user+test@gmail.com';

    // // prepend a backslash and insert the matched character.
    // const escapedQuery = query.replace(REGEXP_SPECIAL_CHAR, '\\$&');

    // console.log(escapedQuery); // user\+test@gmail\.com

    // //for example if we want to use it in MongoDB:
    // // db.users.find({
    // //    email: {$regex: new RegExp(escapedQuery, "i")}
    // // })

    const REGEXP_SPECIAL_CHAR = /[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;
    const escapedQuery = textValue.replace(REGEXP_SPECIAL_CHAR, '\\$&');

    console.log("escapedQuery :", `"${escapedQuery}"`);


    return { operator: '|=', value: `"${escapedQuery}"`};
  }


  return { operator: '|=', value: `\`${textValue}\`` };
  // return { operator: '|=', value: `"${textValue}"` };
};

export const getSeverityFilterPipelineStage = (filters?: Filters): PipelineStage | undefined => {
  if (!filters) {
    return undefined;
  }

  const severity = filters.severity;

  if (!severity) {
    return undefined;
  }

  const unknownFilter = severity.has('unknown') ? 'level="unknown" or level=""' : '';

  const severityFilters = Array.from(severity).flatMap((group: string | undefined) => {
    if (group === 'unknown' || group === undefined) {
      return [];
    }

    return severityAbbreviations[group as Severity];
  });

  const levelsfilter = severityFilters.length > 0 ? `level=~"${severityFilters.join('|')}"` : '';

  const allFilters = [unknownFilter, levelsfilter].filter(notEmptyString);

  return allFilters.length > 0 ? { operator: '|', value: allFilters.join(' or ') } : undefined;
};
