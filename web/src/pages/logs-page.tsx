import {
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  PageSection,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  availableAttributes,
  initialAvailableAttributes,
  filtersFromQuery,
  queryFromFilters,
} from '../attribute-filters';
import { Filters } from '../components/filters/filter.types';
import { LogsHistogram } from '../components/logs-histogram';
import { LogsMetrics } from '../components/logs-metrics';
import { LogsTable } from '../components/logs-table';
import { LogsToolbar } from '../components/logs-toolbar';
import { RefreshIntervalDropdown } from '../components/refresh-interval-dropdown';
import { TimeRangeDropdown } from '../components/time-range-dropdown';
import { ToggleHistogramButton } from '../components/toggle-histogram-button';
import { useLogs } from '../hooks/useLogs';
import { DEFAULT_TENANT, defaultQueryFromTenant, useURLState } from '../hooks/useURLState';
import { Direction, isMatrixResult, Schema } from '../logs.types';
import { TestIds } from '../test-ids';
import { CenteredContainer } from '../components/centered-container';
import { downloadCSV } from '../download-csv';

const LogsPage: React.FC = () => {
  const { t } = useTranslation('plugin__logging-view-plugin');

  const [isHistogramVisible, setIsHistogramVisible] = React.useState(false);

  const {
    histogramData,
    histogramError,
    isLoadingLogsData,
    isLoadingMoreLogsData,
    isLoadingHistogramData,
    isLoadingVolumeData,
    volumeError,
    showVolumeGraph,
    isStreaming,
    logsData,
    volumeData,
    logsError,
    getLogs,
    getVolume,
    getMoreLogs,
    hasMoreLogsData,
    getHistogram,
    toggleStreaming,
    config,
  } = useLogs();

  const {
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
    setTimeRangeInURL,
    timeRange,
    interval,
    direction,
    setDirectionInURL,
  } = useURLState({ attributes: initialAvailableAttributes });

  const handleToggleStreaming = () => {
    toggleStreaming({ query });
  };

  const handleLoadMoreData = (lastTimestamp: number) => {
    if (!isLoadingMoreLogsData) {
      getMoreLogs({ lastTimestamp, query, direction });
    }
  };

  const handleSortByDate = (directionValue?: Direction) => {
    setDirectionInURL(directionValue);
  };

  const runQuery = ({ queryToUse }: { queryToUse?: string } = {}) => {
    getLogs({ query: queryToUse ?? query, tenant, timeRange, direction });

    if (isHistogramVisible) {
      getHistogram({ query: queryToUse ?? query, tenant, timeRange, schema });
    }
  };

  const runVolume = () => {
    getVolume({ query, tenant, timeRange });
  };

  const handleFiltersChange = (selectedFilters?: Filters) => {
    setFilters(selectedFilters);
    updateQuery(selectedFilters, tenant);
  };

  const handleQueryChange = (queryFromInput: string) => {
    setQueryInURL(queryFromInput);

    const updatedFilters = filtersFromQuery({
      query: queryFromInput,
      attributes: initialAvailableAttributes,
      schema: schema,
    });

    setFilters(updatedFilters);
  };

  const updateQuery = (selectedFilters?: Filters, selectedTenant?: string): string => {
    if ((!selectedFilters || Object.keys(selectedFilters).length === 0) && !selectedTenant) {
      const defaultQuery = defaultQueryFromTenant(schema);

      setQueryInURL(defaultQuery);

      return defaultQuery;
    } else {
      const updatedQuery = queryFromFilters({
        existingQuery: query,
        filters: selectedFilters,
        attributes: initialAvailableAttributes,
        tenant: selectedTenant,
        schema: schema,
      });

      setQueryInURL(updatedQuery);

      return updatedQuery;
    }
  };

  const attributeList = React.useMemo(
    () => (tenant ? availableAttributes(tenant, config, schema) : []),
    [tenant, config],
  );

  const handleRefreshClick = () => {
    runQuery();
  };

  React.useEffect(() => {
    let model: Schema | undefined;
    const configSchema = config?.schema;
    if (configSchema) {
      if (configSchema == Schema.select) {
        model = schema; // get selected schema from dropdown
      } else {
        model = configSchema; // get schema from ConfigMap
        setSchemaInURL(configSchema);
      }
    }
    const queryToUse = defaultQueryFromTenant(DEFAULT_TENANT, model);

    setSchemaInURL(configSchema);
    setQueryInURL(queryToUse);

    runQuery({ queryToUse });
  }, [config?.schema, schema]);

  React.useEffect(() => {
    const queryToUse = updateQuery(filters, tenant);

    runQuery({ queryToUse });
  }, [timeRange, isHistogramVisible, direction, tenant]);

  const isQueryEmpty = query === '';

  const resultIsMetric = isMatrixResult(logsData?.data);

  React.useEffect(() => {
    if (resultIsMetric) {
      setIsHistogramVisible(false);
    }
  }, [resultIsMetric]);

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
              isDisabled={resultIsMetric}
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
                variant="secondary"
                data-test={TestIds.SyncButton}
                isDisabled={isQueryEmpty}
              >
                <SyncAltIcon />
              </Button>
            </Tooltip>
          </Flex>
        </Flex>

        {isHistogramVisible && !resultIsMetric && (
          <LogsHistogram
            histogramData={histogramData}
            timeRange={timeRange}
            interval={interval}
            isLoading={isLoadingHistogramData}
            error={histogramError}
            onChangeTimeRange={setTimeRangeInURL}
            schema={schema}
          />
        )}
        <LogsToolbar
          query={query}
          onQueryChange={handleQueryChange}
          onQueryRun={runQuery}
          onVolumeRun={runVolume}
          onTenantSelect={setTenantInURL}
          onSchemaSelect={setSchemaInURL}
          tenant={tenant}
          isStreaming={isStreaming}
          onStreamingToggle={handleToggleStreaming}
          enableStreaming={config.isStreamingEnabledInDefaultPage}
          showResources={areResourcesShown}
          onShowResourcesToggle={setShowResourcesInURL}
          showStats={areStatsShown}
          onShowStatsToggle={setShowStatsInURL}
          isDisabled={isQueryEmpty}
          attributeList={attributeList}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onDownloadCSV={() => downloadCSV(logsData)}
        />

        {isLoadingLogsData ? (
          <CenteredContainer>{t('Loading...')}</CenteredContainer>
        ) : showVolumeGraph ? (
          <Card>
            <CardBody>
              <LogsMetrics
                logsData={volumeData}
                timeRange={timeRange}
                isLoading={isLoadingVolumeData}
                error={volumeError}
                height={350}
                displayLegendTable
              />
            </CardBody>
          </Card>
        ) : resultIsMetric ? (
          <Card>
            <CardBody>
              <LogsMetrics
                logsData={logsData}
                timeRange={timeRange}
                isLoading={isLoadingLogsData}
                error={logsError}
                height={350}
                displayLegendTable
              />
            </CardBody>
          </Card>
        ) : (
          <LogsTable
            logsData={logsData}
            onLoadMore={handleLoadMoreData}
            onSortByDate={handleSortByDate}
            isLoading={isLoadingLogsData}
            isLoadingMore={isLoadingMoreLogsData}
            hasMoreLogsData={hasMoreLogsData}
            showResources={areResourcesShown}
            showStats={areStatsShown}
            direction={direction}
            isStreaming={isStreaming}
            error={logsError}
          />
        )}
      </Grid>
    </PageSection>
  );
};

export default LogsPage;
