import { Button, Flex, Grid, PageSection, Tooltip } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import React from 'react';
import { useParams } from 'react-router';
import {
  availableAttributes,
  availableDevConsoleAttributes,
  filtersFromQuery,
  queryFromFilters,
} from '../attribute-filters';
import { Filters } from '../components/filters/filter.types';
import { LogsHistogram } from '../components/logs-histogram';
import { LogsTable } from '../components/logs-table';
import { LogsToolbar } from '../components/logs-toolbar';
import { RefreshIntervalDropdown } from '../components/refresh-interval-dropdown';
import { TimeRangeDropdown } from '../components/time-range-dropdown';
import { ToggleHistogramButton } from '../components/toggle-histogram-button';
import { useLogs } from '../hooks/useLogs';
import { defaultQueryFromTenant, useURLState } from '../hooks/useURLState';
import { Direction } from '../logs.types';
import { TestIds } from '../test-ids';
import { getInitialTenantFromNamespace } from '../value-utils';

/*
This comment creates an entry in the translations catalogue for console extensions

t('plugin__logging-view-plugin~Logs')

*/

const LogsDevPage: React.FunctionComponent = () => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const [isHistogramVisible, setIsHistogramVisible] = React.useState(false);
  let tenant = getInitialTenantFromNamespace(namespace);

  const {
    query,
    setQueryInURL,
    areResourcesShown,
    setShowResourcesInURL,
    filters,
    setFilters,
    setTimeRangeInURL,
    timeRange,
    interval,
    direction,
    setDirectionInURL,
  } = useURLState({ attributes: availableAttributes, defaultTenant: tenant });

  const {
    histogramData,
    histogramError,
    isLoadingLogsData,
    isLoadingMoreLogsData,
    isLoadingHistogramData,
    isStreaming,
    logsData,
    logsError,
    getLogs,
    getMoreLogs,
    hasMoreLogsData,
    getHistogram,
    toggleStreaming,
    config,
  } = useLogs();

  const handleToggleStreaming = () => {
    toggleStreaming({ query, namespace });
  };

  const handleLoadMoreData = (lastTimestamp: number) => {
    if (!isLoadingMoreLogsData) {
      getMoreLogs({ lastTimestamp, query, namespace });
    }
  };

  const handleSortByDate = (directionValue?: Direction) => {
    setDirectionInURL(directionValue);
  };

  const runQuery = ({ queryToUse }: { queryToUse?: string } = {}) => {

    console.warn("runQuery() > 2 > query ", query)
    getLogs({
      query: queryToUse ?? query,
      namespace,
      timeRange,
      direction,
      tenant,
    });

    if (isHistogramVisible) {
      getHistogram({ query: queryToUse ?? query, namespace, timeRange, tenant });
    }
  };

  const handleFiltersChange = (selectedFilters?: Filters) => {
    setFilters(selectedFilters);
    updateQuery(selectedFilters, tenant);
  };

  const handleQueryChange = (queryFromInput: string) => {
    setQueryInURL(queryFromInput);

    const updatedFilters = filtersFromQuery({
      query: queryFromInput,
      attributes: availableAttributes,
    });

    setFilters(updatedFilters);
  };

  const handleRefreshClick = () => {
    runQuery();
  };

  const updateQuery = (selectedFilters?: Filters, selectedTenant?: string): string => {
    if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
      const defaultQuery = defaultQueryFromTenant(selectedTenant);

      setQueryInURL(defaultQuery);

      return defaultQuery;
    } else {
      const updatedQuery = queryFromFilters({
        existingQuery: query,
        filters: selectedFilters,
        attributes: availableAttributes,
        tenant: selectedTenant,
      });

      setQueryInURL(updatedQuery);

      return updatedQuery;
    }
  };

  const attributeList = React.useMemo(() => availableDevConsoleAttributes(namespace), [namespace]);

  React.useEffect(() => {
    tenant = getInitialTenantFromNamespace(namespace);

    const queryToUse = updateQuery(filters, tenant);

    runQuery({ queryToUse });
  }, [timeRange, isHistogramVisible, namespace, direction]);

  const isQueryEmpty = query === '';

  return (
    <PageSection>
      <Grid hasGutter>
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
          <Flex>
            <ToggleHistogramButton
              isToggled={isHistogramVisible}
              onToggle={() => setIsHistogramVisible(!isHistogramVisible)}
              data-test={TestIds.ToggleHistogramButton}
            />
            <TimeRangeDropdown
              value={timeRange}
              onChange={setTimeRangeInURL}
              isDisabled={isQueryEmpty}
            />
            <RefreshIntervalDropdown onRefresh={runQuery} isDisabled={isQueryEmpty} />
            <Tooltip content={<div>Refresh</div>}>
              <Button
                onClick={handleRefreshClick}
                aria-label="Refresh"
                variant="primary"
                data-test={TestIds.SyncButton}
                isDisabled={isQueryEmpty}
              >
                <SyncAltIcon />
              </Button>
            </Tooltip>
          </Flex>
        </Flex>

        {isHistogramVisible && (
          <LogsHistogram
            histogramData={histogramData}
            timeRange={timeRange}
            interval={interval}
            isLoading={isLoadingHistogramData}
            error={histogramError}
            onChangeTimeRange={setTimeRangeInURL}
          />
        )}

        <LogsTable
          logsData={logsData}
          onLoadMore={handleLoadMoreData}
          onSortByDate={handleSortByDate}
          isLoading={isLoadingLogsData}
          isLoadingMore={isLoadingMoreLogsData}
          hasMoreLogsData={hasMoreLogsData}
          direction={direction}
          showResources={areResourcesShown}
          isStreaming={isStreaming}
          error={logsError}
        >
          <LogsToolbar
            query={query}
            onQueryChange={handleQueryChange}
            onQueryRun={runQuery}
            isStreaming={isStreaming}
            onStreamingToggle={handleToggleStreaming}
            enableStreaming={config.isStreamingEnabledInDefaultPage}
            showResources={areResourcesShown}
            onShowResourcesToggle={setShowResourcesInURL}
            enableTenantDropdown={false}
            isDisabled={isQueryEmpty}
            attributeList={attributeList}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </LogsTable>
      </Grid>
    </PageSection>
  );
};

export default LogsDevPage;
