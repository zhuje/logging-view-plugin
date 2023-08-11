import { Button, Flex, Grid, PageSection, Title, Tooltip } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { availableAttributes, filtersFromQuery, queryFromFilters } from '../attribute-filters';
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

const LogsPage: React.FC = () => {
  const { t } = useTranslation('plugin__logging-view-plugin');

  const [isHistogramVisible, setIsHistogramVisible] = React.useState(false);
  const {
    query,
    setQueryInURL,
    tenant,
    setTenantInURL,
    areResourcesShown,
    setShowResourcesInURL,
    filters,
    setFilters,
    setTimeRangeInURL,
    timeRange,
    interval,
    direction,
    setDirectionInURL,
  } = useURLState({ attributes: availableAttributes });

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
    toggleStreaming({ query });
  };

  const handleLoadMoreData = (lastTimestamp: number) => {
    if (!isLoadingMoreLogsData) {
      getMoreLogs({ lastTimestamp, query });
    }
  };

  const handleSortByDate = (directionValue?: Direction) => {
    setDirectionInURL(directionValue);
  };

  const runQuery = ({ queryToUse }: { queryToUse?: string } = {}) => {
    console.warn("runQuery() > logPage > query, queryToUSe ", query, queryToUse)


    getLogs({ query: queryToUse ?? query, tenant, timeRange, direction });

    if (isHistogramVisible) {
      getHistogram({ query: queryToUse ?? query, tenant, timeRange });
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

  const updateQuery = (selectedFilters?: Filters, selectedTenant?: string): string => {
    if ((!selectedFilters || Object.keys(selectedFilters).length === 0) && !selectedTenant) {
      const defaultQuery = defaultQueryFromTenant();

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

  const handleRefreshClick = () => {
    runQuery();
  };

  React.useEffect(() => {
    const queryToUse = updateQuery(filters, tenant);

    runQuery({ queryToUse });
  }, [timeRange, isHistogramVisible, direction, tenant]);

  const isQueryEmpty = query === '';

  return (
    <PageSection>
      <Grid hasGutter>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <Title headingLevel="h1" size="lg">
            {t('Logs')}
          </Title>
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
          showResources={areResourcesShown}
          direction={direction}
          isStreaming={isStreaming}
          error={logsError}
        >
          <LogsToolbar
            query={query}
            onQueryChange={handleQueryChange}
            onQueryRun={runQuery}
            onTenantSelect={setTenantInURL}
            tenant={tenant}
            isStreaming={isStreaming}
            onStreamingToggle={handleToggleStreaming}
            enableStreaming={config.isStreamingEnabledInDefaultPage}
            showResources={areResourcesShown}
            onShowResourcesToggle={setShowResourcesInURL}
            isDisabled={isQueryEmpty}
            attributeList={availableAttributes}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </LogsTable>
      </Grid>
    </PageSection>
  );
};

export default LogsPage;
