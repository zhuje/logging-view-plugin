import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom-v5-compat';
import { filtersFromQuery } from '../attribute-filters';
import { AttributeList, Filters } from '../components/filters/filter.types';
import { DEFAULT_SCHEMA, Schema, Direction, TimeRange } from '../logs.types';
import { intervalFromTimeRange } from '../time-range';
import { useQueryParams } from './useQueryParams';
import { useLogs } from './useLogs';
import { ResourceLabel, ResourceToStreamLabels } from '../parse-resources';

interface UseURLStateHook {
  defaultQuery?: string;
  defaultTenant?: string;
  attributes: AttributeList;
}

const QUERY_PARAM_KEY = 'q';
const TIME_RANGE_START = 'start';
const TIME_RANGE_END = 'end';
const DIRECTION = 'direction';
const TENANT_PARAM_KEY = 'tenant';
const SCHEMA_PARAM_KEY = 'schema';
const SHOW_RESOURCES_PARAM_KEY = 'showResources';
const SHOW_STATS_PARAM_KEY = 'showStats';

export const DEFAULT_TENANT = 'application';
const DEFAULT_SHOW_RESOURCES = '0';
const DEFAULT_SHOW_STATS = '0';

export const defaultQueryFromTenant = (tenant: string = DEFAULT_TENANT, schema?: Schema) => {
  const logType = ResourceToStreamLabels[ResourceLabel.LogType];

  if (schema === 'otel') {
    return `{ ${logType.otel}="${tenant}" } `;
  }
  return `{ ${logType.viaq}="${tenant}" } | json`;
};

const getDirectionValue = (value?: string | null): Direction =>
  value !== null ? (value === 'forward' ? 'forward' : 'backward') : 'backward';

export const useURLState = ({
  defaultQuery,
  defaultTenant = DEFAULT_TENANT,
  attributes,
}: UseURLStateHook) => {
  const queryParams = useQueryParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useLogs();

  const initialTenant = queryParams.get(TENANT_PARAM_KEY) ?? defaultTenant;
  const initialSchema = queryParams.get(SCHEMA_PARAM_KEY) ?? config?.schema;
  const initialQuery =
    queryParams.get(QUERY_PARAM_KEY) ?? defaultQuery ?? defaultQueryFromTenant(initialTenant);
  const initialTimeRangeStart = queryParams.get(TIME_RANGE_START);
  const initialTimeRangeEnd = queryParams.get(TIME_RANGE_END);
  const initialDirection = queryParams.get(DIRECTION);
  const initialResorcesShown =
    (queryParams.get(SHOW_RESOURCES_PARAM_KEY) ?? DEFAULT_SHOW_RESOURCES) === '1';

  const intitalStatsShown = (queryParams.get(SHOW_STATS_PARAM_KEY) ?? DEFAULT_SHOW_STATS) === '1';

  const [query, setQuery] = React.useState(initialQuery);
  const [tenant, setTenant] = React.useState(initialTenant);
  const [schema, setSchema] = React.useState(initialSchema);
  const [filters, setFilters] = React.useState<Filters | undefined>(
    filtersFromQuery({ query: initialQuery, attributes }),
  );
  const [areResourcesShown, setAreResourcesShown] = React.useState<boolean>(initialResorcesShown);
  const [areStatsShown, setAreStatsShown] = React.useState<boolean>(intitalStatsShown);
  const [direction, setDirection] = React.useState<Direction>(getDirectionValue(initialDirection));
  const [timeRange, setTimeRange] = React.useState<TimeRange | undefined>(
    initialTimeRangeStart && initialTimeRangeEnd
      ? {
          start: initialTimeRangeStart,
          end: initialTimeRangeEnd,
        }
      : undefined,
  );

  const setTenantInURL = (selectedTenant: string) => {
    queryParams.set(TENANT_PARAM_KEY, selectedTenant);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const setSchemaInURL = (selectedSchema: Schema) => {
    queryParams.set(SCHEMA_PARAM_KEY, selectedSchema);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const setShowResourcesInURL = (showResources: boolean) => {
    queryParams.set(SHOW_RESOURCES_PARAM_KEY, showResources ? '1' : '0');
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const setShowStatsInURL = (showStats: boolean) => {
    queryParams.set(SHOW_STATS_PARAM_KEY, showStats ? '1' : '0');
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const setQueryInURL = (newQuery: string) => {
    const trimmedQuery = newQuery.trim();
    queryParams.set(QUERY_PARAM_KEY, trimmedQuery);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const setTimeRangeInURL = (selectedTimeRange: TimeRange) => {
    queryParams.set(TIME_RANGE_START, String(selectedTimeRange.start));
    queryParams.set(TIME_RANGE_END, String(selectedTimeRange.end));
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const setDirectionInURL = (selectedDirection?: 'forward' | 'backward') => {
    if (selectedDirection) {
      queryParams.set(DIRECTION, selectedDirection);
    } else {
      queryParams.delete(DIRECTION);
    }
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  React.useEffect(() => {
    const queryValue = queryParams.get(QUERY_PARAM_KEY) ?? initialQuery;
    const tenantValue = queryParams.get(TENANT_PARAM_KEY) ?? DEFAULT_TENANT;
    const schemaValue = queryParams.get(SCHEMA_PARAM_KEY) ?? DEFAULT_SCHEMA;
    const showResourcesValue = queryParams.get(SHOW_RESOURCES_PARAM_KEY) ?? DEFAULT_SHOW_RESOURCES;
    const showStatsValue = queryParams.get(SHOW_STATS_PARAM_KEY) ?? DEFAULT_SHOW_STATS;
    const timeRangeStartValue = queryParams.get(TIME_RANGE_START);
    const timeRangeEndValue = queryParams.get(TIME_RANGE_END);
    const directionValue = queryParams.get(DIRECTION);

    setQuery(queryValue.trim());
    setTenant(tenantValue);
    setSchema(schemaValue);
    setDirection(getDirectionValue(directionValue));
    setAreResourcesShown(showResourcesValue === '1');
    setAreStatsShown(showStatsValue === '1');
    setFilters(filtersFromQuery({ query: queryValue, attributes }));
    setTimeRange((prevTimeRange) => {
      if (!timeRangeStartValue || !timeRangeEndValue) {
        return undefined;
      }

      if (
        prevTimeRange?.start === timeRangeStartValue &&
        prevTimeRange?.end === timeRangeEndValue
      ) {
        return prevTimeRange;
      }

      return {
        start: timeRangeStartValue,
        end: timeRangeEndValue,
      };
    });
  }, [queryParams]);

  return {
    query,
    setQueryInURL,
    tenant,
    setTenantInURL,
    schema,
    setSchemaInURL,
    areResourcesShown,
    setShowResourcesInURL,
    areStatsShown,
    setShowStatsInURL,
    filters,
    setFilters,
    timeRange,
    setTimeRangeInURL,
    setDirectionInURL,
    direction,
    interval: timeRange ? intervalFromTimeRange(timeRange) : undefined,
  };
};
