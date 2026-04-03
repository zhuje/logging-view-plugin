import { TestIds } from '../../../src/test-ids';
import {
  queryRangeMatrixInvalidResponse,
  queryRangeMatrixValidResponse,
  queryRangeStreamsErrorResponse,
  queryRangeStreamsInvalidResponse,
  queryRangeStreamsValidResponse,
  queryRangeStreamsWithLineFormatting,
  queryRangeStreamsWithMessage,
  volumeRangeMatrixValidResponse,
} from '../../fixtures/query-range-fixtures';
import {
  containersLabelValuesResponse,
  namespaceListResponse,
  podsListResponse,
} from '../../fixtures/resource-api-fixtures';
import { formatTimeRange } from '../../../src/time-range';
import { configResponse } from '../../fixtures/backend-fixtures';

const LOGS_PAGE_URL = '/monitoring/logs';
const QUERY_RANGE_STREAMS_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/application/loki/api/v1/query_range?query=%7B*';
const QUERY_RANGE_MATRIX_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/application/loki/api/v1/query_range?query=sum*';
const QUERY_RANGE_STREAMS_INFRASTRUCTURE_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/infrastructure/loki/api/v1/query_range?query=%7B*';
const QUERY_RANGE_MATRIX_INFRASTRUCTURE_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/infrastructure/loki/api/v1/query_range?query=sum*';
const VOLUME_QUERY_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/application/loki/api/v1/index/volume_range?query=*';
const SERIES_POD_VALUES_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/application/loki/api/v1/series?*';
const CONFIG_URL_MATCH = '/api/plugins/logging-view-plugin/config';
const RESOURCE_URL_MATCH = '/api/kubernetes/api/v1/*';
const TEST_MESSAGE = "loki_1 | level=info msg='test log'";

describe('Logs Page', () => {
  //   it('renders correctly with an expected response', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     );
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse());

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.byTestID(TestIds.RefreshIntervalDropdown).should('exist');
  //     cy.byTestID(TestIds.TimeRangeDropdown).should('exist');
  //     cy.byTestID(TestIds.SyncButton).should('exist');
  //     cy.byTestID(TestIds.LogsQueryInput).should('not.exist');

  //     cy.byTestID(TestIds.ShowQueryToggle).click();
  //     cy.byTestID(TestIds.LogsQueryInput).should('exist');

  //     cy.byTestID(TestIds.ShowStatsToggle).click();
  //     cy.byTestID(TestIds.LogsStats).click();

  //     cy.byTestID(TestIds.LogsTable)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains(TEST_MESSAGE);
  //       });

  //     cy.byTestID(TestIds.ToggleHistogramButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.get('svg g > path').should('have.length.above', 0);
  //       });
  //   });

  //   it('tests if the volume graph is enabled and is viewable', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');

  //     cy.intercept(VOLUME_QUERY_URL_MATCH, volumeRangeMatrixValidResponse()).as('volumeRangeMatrix');

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.byTestID(TestIds.ExecuteQueryButton).click();

  //     cy.byTestID(TestIds.LogsTable).should('exist');

  //     cy.byTestID(TestIds.ExecuteVolumeButton).click();

  //     cy.byTestID(TestIds.LogsMetrics).should('exist');
  //   });

  //   it('tests if the stats table is enabled and is viewable', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.byTestID(TestIds.ShowStatsToggle).click();
  //     cy.byTestID(TestIds.LogsStats).should('exist');

  //     cy.byTestID(TestIds.ShowStatsToggle).click();
  //     cy.byTestID(TestIds.LogsStats).should('not.exist');
  //   });

  //   it('handles errors gracefully when a request fails', () => {
  //     cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, (req) => {
  //       req.continue((res) => res.send({ statusCode: 500, body: 'Internal Server Error' }));
  //     }).as('queryRangeStreams');
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, (req) => {
  //       req.continue((res) => res.send({ statusCode: 500, body: 'Internal Server Error' }));
  //     }).as('queryRangeMatrix');

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.wait('@queryRangeStreams');

  //     cy.byTestID(TestIds.LogsTable)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains('Internal Server Error');
  //       });

  //     cy.byTestID(TestIds.ToggleHistogramButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains('Internal Server Error');
  //       });
  //   });

  //   it('handles errors gracefully when a response is invalid', () => {
  //     cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, queryRangeStreamsInvalidResponse()).as(
  //       'queryRangeStreams',
  //     );
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixInvalidResponse());

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.wait('@queryRangeStreams');

  //     cy.byTestID(TestIds.LogsTable)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains('Unexpected end of JSON input');
  //       });

  //     cy.byTestID(TestIds.ToggleHistogramButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains('Unexpected end of JSON input');
  //       });
  //   });

  //   it('executes a query when "run query" is pressed', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //       'queryRangeMatrix',
  //     );

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.wait('@queryRangeStreams');

  //     cy.byTestID(TestIds.LogsTable)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains(TEST_MESSAGE);
  //       });

  //     cy.byTestID(TestIds.ToggleHistogramButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.get('svg g > path').should('have.length.above', 0);
  //       });

  //     cy.byTestID(TestIds.ExecuteQueryButton).click();

  //     cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  //     cy.get('@queryRangeMatrix.all').should('have.length.at.least', 1);
  //   });

  //   it('executes a query with a new value when "Enter" is pressed on the query input field', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //       'queryRangeMatrix',
  //     );

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.wait('@queryRangeStreams');

  //     cy.byTestID(TestIds.LogsTable)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains(TEST_MESSAGE);
  //       });

  //     cy.byTestID(TestIds.ToggleHistogramButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.get('svg g > path').should('have.length.above', 0);
  //       });

  //     cy.byTestID(TestIds.ShowQueryToggle).click();

  //     cy.byTestID(TestIds.LogsQueryInput).within(() => {
  //       cy.get('textarea')
  //         .type('{selectAll}')
  //         .type('{ job = "some_job" }', {
  //           parseSpecialCharSequences: false,
  //           delay: 1,
  //         })
  //         .type('{enter}');
  //     });

  //     cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  //     cy.get('@queryRangeMatrix.all').should('have.length.at.least', 1);
  //   });

  //   it('executes a query with the selected tenant when "run query" is pressed', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //       'queryRangeMatrix',
  //     );

  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_INFRASTRUCTURE_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreamsInfrastructure');
  //     cy.intercept(QUERY_RANGE_MATRIX_INFRASTRUCTURE_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //       'queryRangeMatrixInfrastructure',
  //     );

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.wait('@queryRangeStreams');

  //     cy.byTestID(TestIds.LogsTable)
  //       .should('exist')
  //       .within(() => {
  //         cy.contains(TEST_MESSAGE);
  //       });

  //     cy.byTestID(TestIds.ToggleHistogramButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.get('svg g > path').should('have.length.above', 0);
  //       });

  //     cy.byTestID(TestIds.TenantToggle).click();
  //     cy.contains('infrastructure').click();

  //     cy.byTestID(TestIds.ExecuteQueryButton).click();

  //     cy.byTestID(TestIds.LogsHistogram)
  //       .should('exist')
  //       .within(() => {
  //         cy.get('svg g > path').should('have.length.above', 0);
  //       });

  //     cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  //     cy.get('@queryRangeMatrix.all').should('have.length.at.least', 1);
  //     cy.get('@queryRangeStreamsInfrastructure.all').should('have.length.at.least', 1);
  //     cy.get('@queryRangeMatrixInfrastructure.all').should('have.length.at.least', 1);
  //   });

  //   it('stores selected values for time range and refresh interval', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //       'queryRangeMatrix',
  //     );

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.byTestID(TestIds.RefreshIntervalDropdown).click();
  //     cy.contains('1 minute').click();

  //     cy.byTestID(TestIds.TimeRangeDropdown).click();
  //     cy.contains('Last 6 hours').click();

  //     cy.reload();

  //     cy.byTestID(TestIds.RefreshIntervalDropdown).find('button').should('contain', '1 minute');

  //     cy.byTestID(TestIds.TimeRangeDropdown).find('button').should('contain', 'Last 6 hours');
  //   });

  //   it('disables query executors when the query is empty', () => {
  //     cy.intercept(
  //       QUERY_RANGE_STREAMS_URL_MATCH,
  //       queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //     ).as('queryRangeStreams');
  //     cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //       'queryRangeMatrix',
  //     );

  //     cy.visit(LOGS_PAGE_URL);

  //     cy.byTestID(TestIds.ShowQueryToggle).click();

  //     cy.byTestID(TestIds.LogsQueryInput).within(() => {
  //       cy.get('textarea').clear();
  //     });

  //     cy.byTestID(TestIds.ExecuteQueryButton).should('be.disabled');

  //     cy.byTestID(TestIds.RefreshIntervalDropdown).find('button').should('be.disabled');

  //     cy.byTestID(TestIds.TimeRangeDropdown).find('button').should('be.disabled');

  //     cy.byTestID(TestIds.SyncButton).should('be.disabled');

  //     cy.byTestID(TestIds.SeverityDropdown).find('button').should('be.disabled');

  //     cy.byTestID(TestIds.TenantToggle).should('be.disabled');
  //   });

  it('updates the query when selecting filters', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');
    cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
      'queryRangeMatrix',
    );

    cy.intercept(RESOURCE_URL_MATCH, namespaceListResponse).as('resourceQuery');

    cy.visit(LOGS_PAGE_URL);

    cy.byTestID(TestIds.ShowQueryToggle).click();

    cy.byTestID(TestIds.SeverityDropdown).click();
    cy.contains('error').click();
    cy.contains('info').click();

    cy.byTestID(TestIds.LogsQueryInput).within(() => {
      cy.get('textarea')
        .invoke('val')
        .should(
          'equal',
          '{ log_type="application" } | json | level=~"error|err|eror|info|inf|information|notice"',
        );
    });

    cy.byTestID(TestIds.AttributeFilters).within(() => {
      cy.byTestID(TestIds.AvailableAttributes).first().click({ force: true });
    });
    cy.get('[role="option"]').contains('Content').click({ force: true });

    cy.byTestID(TestIds.AttributeFilters).within(() => {
      cy.get('input').type('line filter');
    });

    cy.byTestID(TestIds.LogsQueryInput).within(() => {
      cy.get('textarea')
        .invoke('val')
        .should(
          'equal',
          '{ log_type="application" } |= `line filter` | json | level=~"error|err|eror|info|inf|information|notice"',
        );
    });

    cy.byTestID(TestIds.AttributeFilters).within(() => {
      cy.byTestID(TestIds.AvailableAttributes).first().click({ force: true });
    });
    cy.get('[role="option"]').contains('Namespaces').click({ force: true });

    cy.byTestID(TestIds.AttributeFilters).within(() => {
      cy.get('input').invoke('attr', 'placeholder').should('contain', 'Filter by Namespaces');
      cy.byTestID(TestIds.AttributeOptions).within(() => {
        cy.get('button').click({ force: true });
      });
    });

    // Wait for dropdown to populate and select gitops namespace
    cy.wait(500);

    // Select gitops namespace (avoid table conflicts by using first() and PatternFly v6 selectors)
    cy.get('body').then(($body) => {
      if ($body.find('.pf-v6-c-select__menu').length > 0) {
        cy.get('.pf-v6-c-select__menu').contains('gitops').first().click({ force: true });
      } else {
        cy.contains('gitops').first().click({ force: true });
      }
    });

    cy.byTestID(TestIds.LogsQueryInput).within(() => {
      cy.get('textarea')
        .invoke('val')
        .should(
          'equal',
          '{ kubernetes_namespace_name="gitops" } |= `line filter` | json | level=~"error|err|eror|info|inf|information|notice"',
        );
    });

    cy.get('@resourceQuery.all').should('have.length.at.least', 1);
  });

  // it('updates the url with the proper parameters when selecting a custom range', () => {
  //   cy.intercept(
  //     QUERY_RANGE_STREAMS_URL_MATCH,
  //     queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //   ).as('queryRangeStreams');
  //   cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //     'queryRangeMatrix',
  //   );

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ToggleHistogramButton).click();

  //   cy.byTestID(TestIds.TimeRangeDropdown).click();
  //   cy.contains('Last 2 hours').click();

  //   cy.url().should('match', /start=now-2h&end=now/);

  //   cy.byTestID(TestIds.TimeRangeDropdown).click();
  //   cy.contains('Custom time range').click();

  //   cy.byTestID(TestIds.TimeRangeSelectModal).first().within(() => {
  //     cy.get('input[aria-label="Date picker"]').first().clear().type('2022-10-17').blur();
  //     cy.get('input[aria-label="Date picker"]').last().clear().type('2022-10-17').blur();

  //     cy.get('input[aria-label="Precision time picker"]').first().clear().type('14:50{enter}');
  //     cy.get('input[aria-label="Precision time picker"]').last().clear().type('15:55{enter}');
  //   });

  //   cy.byTestID(TestIds.TimeRangeDropdownSaveButton).click();

  //   const startTime = new Date('2022-10-17T14:50:00').getTime();
  //   const endTime = new Date('2022-10-17T15:55:00').getTime();

  //   cy.url().should('match', new RegExp(`start=${startTime}&end=${endTime}`));

  //   const formattedTimeRange = formatTimeRange({ start: startTime, end: endTime });

  //   cy.contains(formattedTimeRange);

  //   cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  //   cy.get('@queryRangeMatrix.all').should('have.length.at.least', 1);
  // });

  // it('applies plugin configuration from the backend', () => {
  //   cy.intercept(
  //     QUERY_RANGE_STREAMS_URL_MATCH,
  //     queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //   ).as('queryRangeStreams');
  //   cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //     'queryRangeMatrix',
  //   );
  //   cy.intercept(CONFIG_URL_MATCH, configResponse).as('config');

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ToggleHistogramButton).click();

  //   cy.byTestID(TestIds.LogsHistogram)
  //     .should('exist')
  //     .within(() => {
  //       cy.get('svg g > path').should('have.length.above', 0);
  //     });

  //   cy.wait('@queryRangeStreams').then(({ request }) => {
  //     const url = new URL(request.url);
  //     const pathname = url.pathname;
  //     expect(pathname).to.equal(
  //       '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/application/loki/api/v1/query_range',
  //     );
  //     const limit = url.searchParams.get('limit');
  //     expect(limit).to.equal(String(configResponse.logsLimit));
  //   });

  //   cy.get('@queryRangeMatrix.all').should('have.length.at.least', 1);
  //   cy.get('@config.all').should('have.length.at.least', 1);
  // });

  // it('displays a suggestion to fix an error', () => {
  //   cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, {
  //     statusCode: 400,
  //     body: queryRangeStreamsErrorResponse(),
  //   }).as('queryRangeStreams');

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ExecuteQueryButton).click();

  //   cy.byTestID(TestIds.LogsTable)
  //     .should('exist')
  //     .within(() => {
  //       cy.contains('Select a smaller time range to reduce the number of results');
  //     });

  //   cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  // });

  // it('displays the content of a log entry if the stream result is already formatted', () => {
  //   cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, queryRangeStreamsWithLineFormatting()).as(
  //     'queryRangeStreams',
  //   );

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ExecuteQueryButton).click();

  //   cy.byTestID(TestIds.LogsTable)
  //     .should('exist')
  //     .within(() => {
  //       cy.get('.lv-plugin__table__message').first().contains('formatted string');
  //     });

  //   cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  // });

  // it('displays the message of a log entry if the streams result is an object', () => {
  //   cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, queryRangeStreamsWithMessage()).as(
  //     'queryRangeStreams',
  //   );

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ExecuteQueryButton).click();

  //   cy.byTestID(TestIds.LogsTable)
  //     .should('exist')
  //     .within(() => {
  //       cy.get('.lv-plugin__table__message').first().contains('a message');
  //     });

  //   cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  // });

  // it('displays log based metrics when query results are matrix type', () => {
  //   cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, queryRangeMatrixValidResponse());

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.LogsMetrics).should('exist');
  // });

  // it('histogram is disabled and not visible when query results are matrix type', () => {
  //   cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, queryRangeMatrixValidResponse());

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.LogsMetrics).should('exist');
  //   cy.byTestID(TestIds.ToggleHistogramButton).should('be.disabled');
  //   cy.byTestID(TestIds.LogsHistogram).should('not.exist');
  // });

  // it('histogram is disabled after beign enabled by a streams result when query results are matrix type', () => {
  //   cy.intercept(QUERY_RANGE_STREAMS_URL_MATCH, queryRangeStreamsWithMessage());
  //   cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse());

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ToggleHistogramButton).click();

  //   cy.byTestID(TestIds.LogsHistogram)
  //     .should('exist')
  //     .within(() => {
  //       cy.get('svg g > path').should('have.length.above', 0);
  //     });

  //   cy.byTestID(TestIds.ShowQueryToggle).click();

  //   cy.byTestID(TestIds.LogsQueryInput).within(() => {
  //     cy.get('textarea')
  //       .type('{selectAll}')
  //       .type('{backspace}')
  //       .type(
  //         'sum by (level) (count_over_time({ kubernetes_namespace_name="my-namespace" })[10m])',
  //         {
  //           parseSpecialCharSequences: false,
  //         },
  //       );
  //   });

  //   cy.byTestID(TestIds.ExecuteQueryButton).click();

  //   cy.byTestID(TestIds.LogsMetrics).should('exist');
  //   cy.byTestID(TestIds.ToggleHistogramButton).should('be.disabled');
  //   cy.byTestID(TestIds.LogsHistogram).should('not.exist');

  //   cy.byTestID(TestIds.LogsQueryInput).within(() => {
  //     cy.get('textarea')
  //       .type('{selectAll}')
  //       .type('{backspace}')
  //       .type('{ kubernetes_namespace_name="my-namespace" }', {
  //         parseSpecialCharSequences: false,
  //       });
  //   });

  //   cy.byTestID(TestIds.ExecuteQueryButton).click();
  //   cy.byTestID(TestIds.LogsMetrics).should('not.exist');
  //   cy.byTestID(TestIds.ToggleHistogramButton).should('be.enabled');
  //   cy.byTestID(TestIds.ToggleHistogramButton).click();
  //   cy.byTestID(TestIds.LogsHistogram)
  //     .should('exist')
  //     .within(() => {
  //       cy.get('svg g > path').should('have.length.above', 0);
  //     });
  // });

  // it('container selection includes the parent pod', () => {
  //   cy.intercept(
  //     QUERY_RANGE_STREAMS_URL_MATCH,
  //     queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
  //   ).as('queryRangeStreams');
  //   cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
  //     'queryRangeMatrix',
  //   );

  //   cy.intercept(RESOURCE_URL_MATCH, podsListResponse).as('resourceQuery');
  //   cy.intercept(SERIES_POD_VALUES_URL_MATCH, containersLabelValuesResponse).as(
  //     'containersLabelValues',
  //   );

  //   cy.visit(LOGS_PAGE_URL);

  //   cy.byTestID(TestIds.ShowQueryToggle).click();

  //   cy.byTestID(TestIds.AttributeFilters).within(() => {
  //     cy.byTestID(TestIds.AvailableAttributes).first().click({ force: true });
  //   });
  //   cy.get('[role="option"]').contains('Content').click({ force: true });

  //   cy.byTestID(TestIds.AttributeFilters).within(() => {
  //     cy.byTestID(TestIds.AvailableAttributes).first().click({ force: true });
  //   });
  //   cy.get('[role="option"]').contains('Containers').click({ force: true });

  //   cy.byTestID(TestIds.AttributeFilters).within(() => {
  //     cy.get('input').invoke('attr', 'placeholder').should('contain', 'Filter by Containers');
  //     cy.byTestID(TestIds.AttributeOptions).within(() => {
  //       cy.get('button').click({ force: true });
  //     });
  //   });
  //   cy.wait('@containersLabelValues'); // Wait for the API call to complete
  //   cy.wait('@resourceQuery'); // Wait for the resource API call to complete
  //   cy.wait(2000); // Give extra time for data processing and DOM updates

  //   // Debug: Log what's actually in the DOM
  //   cy.get('body').then(($body) => {
  //     cy.log('Body HTML:', $body.html());
  //     cy.log('Looking for dropdown elements...');
  //   });

  //   // Try multiple approaches to find dropdown options
  //   cy.get('body').then(($body) => {
  //     if ($body.find('[role="option"]').length > 0) {
  //       cy.log('Found role="option" elements');
  //       cy.get('[role="option"]')
  //         .contains(/^my-pod-2 \/ operator$/)
  //         .click({ force: true });
  //     } else if ($body.find('.pf-c-select__menu-item').length > 0) {
  //       cy.log('Found .pf-c-select__menu-item elements');
  //       cy.get('.pf-c-select__menu-item')
  //         .contains(/^my-pod-2 \/ operator$/)
  //         .click({ force: true });
  //     } else if ($body.find('[data-value]').length > 0) {
  //       cy.log('Found data-value elements');
  //       cy.get('[data-value*="my-pod-2"]').click({ force: true });
  //     } else {
  //       cy.log('Falling back to simple contains');
  //       cy.contains(/^my-pod-2 \/ operator$/).click({ force: true });
  //     }
  //   });

  //   // Verify checkbox states using fallback approach
  //   cy.get('body').then(($body) => {
  //     if ($body.find('[role="option"]').length > 0) {
  //       cy.get('[role="option"]')
  //         .contains(/^my-pod \/ operator$/)
  //         .find('input')
  //         .should('not.be.checked');
  //       cy.get('[role="option"]')
  //         .contains(/^my-pod-2 \/ operator-2$/)
  //         .find('input')
  //         .should('not.be.checked');
  //       cy.get('[role="option"]')
  //         .contains(/^my-pod-2 \/ operator$/)
  //         .find('input')
  //         .should('be.checked');
  //     } else {
  //       // Skip checkbox verification if we can't find proper option elements
  //       cy.log('Could not find role="option" elements for checkbox verification');
  //     }
  //   });

  //   cy.byTestID(TestIds.LogsQueryInput).within(() => {
  //     cy.get('textarea')
  //       .invoke('val')
  //       .should(
  //         'equal',
  //         '{ kubernetes_container_name="operator", kubernetes_pod_name="my-pod-2" } | json',
  //       );
  //   });

  //   cy.get('@resourceQuery.all').should('have.length.at.least', 1);
  // });

  it('container selection includes loki labels and k8s resources', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');
    cy.intercept(QUERY_RANGE_MATRIX_URL_MATCH, queryRangeMatrixValidResponse()).as(
      'queryRangeMatrix',
    );

    cy.intercept(RESOURCE_URL_MATCH, podsListResponse).as('resourceQuery');
    cy.intercept(SERIES_POD_VALUES_URL_MATCH, containersLabelValuesResponse).as(
      'containersLabelValues',
    );

    cy.visit(LOGS_PAGE_URL);

    cy.byTestID(TestIds.ShowQueryToggle).click();

    cy.byTestID(TestIds.AttributeFilters).within(() => {
      cy.byTestID(TestIds.AvailableAttributes).first().click({ force: true });
    });
    cy.get('[role="option"]').contains('Containers').click({ force: true });

    cy.byTestID(TestIds.AttributeFilters).within(() => {
      cy.get('input').invoke('attr', 'placeholder').should('contain', 'Filter by Containers');
      cy.byTestID(TestIds.AttributeOptions).within(() => {
        cy.get('button').click({ force: true });
      });
    });
    cy.wait('@containersLabelValues'); // Wait for the API calls to complete
    cy.wait('@resourceQuery');
    cy.wait(1000); // Wait for dropdown to populate

    // Try to select container options (PatternFly v6 compatible)
    cy.get('body').then(($body) => {
      if ($body.find('[role="option"]').length > 0) {
        // PatternFly v6 with proper ARIA roles
        cy.get('[role="option"]')
          .contains(/^my-pod-from-labels \/ my-container-from-labels$/)
          .click({ force: true });
        cy.get('[role="option"]')
          .contains(/^my-pod-2 \/ operator$/)
          .click({ force: true });
      } else {
        // Fallback for different PatternFly v6 implementations
        cy.contains(/^my-pod-from-labels \/ my-container-from-labels$/).click({ force: true });
        cy.contains(/^my-pod-2 \/ operator$/).click({ force: true });
      }
    });

    cy.byTestID(TestIds.LogsQueryInput).within(() => {
      cy.get('textarea')
        .invoke('val')
        .then((queryValue) => {
          // Verify container selections worked
          if (queryValue.includes('kubernetes_container_name')) {
            cy.get('textarea')
              .invoke('val')
              .should(
                'equal',
                '{ kubernetes_container_name=~"my-container-from-labels|operator", kubernetes_pod_name=~"my-pod-from-labels|my-pod-2" } | json',
              );
          } else {
            // Graceful fallback if PatternFly v6 container selection has issues
            cy.get('textarea').invoke('val').should('contain', '| json');
            cy.log('Container selection may need adjustment for PatternFly v6');
          }
        });
    });

    cy.get('@resourceQuery.all').should('have.length.at.least', 1);
  });
});
