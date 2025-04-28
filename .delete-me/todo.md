1. Replace filter value with dynamic function that figures out the config 
[] Severity 
[] Tenant 
[] 


### Running a single unit test 
npm run test:unit /Users/jezhu/Git/logging-view-plugin/web/src/__tests__/parse-resource.spec.ts


1. url includes Schema 
2. if schema is changed, then remove current query 
    - update URL to have schema 
    ```
      React.useEffect(() => {
    const queryToUse = updateQuery(filters, tenant);

    runQuery({ queryToUse });
  }, [timeRange, isHistogramVisible, direction, tenant]);
   ```

3. Next iteration should replace with otel vs. viaq 