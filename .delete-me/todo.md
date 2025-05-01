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



### Scraps that may be useful 
```
  addSelectorMatcher = (matchers?: LabelMatcher | Array<LabelMatcher>) => {
    if (!matchers) {
      return this;
    }

    const matchersArray = Array.isArray(matchers) ? matchers : [matchers];

    const isEquivalentLabel = (a: string, b: string): boolean => {
      for (const key in ResourceToStreamLabels) {
        const { otel, viaq } = ResourceToStreamLabels[key as keyof typeof ResourceToStreamLabels];
        if (
          (a === otel && b === viaq) ||
          (a === viaq && b === otel) ||
          (a === otel && b === otel) ||
          (a === viaq && b === viaq)
        ) {
          return true;
        }
      }
      return a === b;
    };

    matchersArray.forEach((matcher) => {
      const existingSelectorIndex = this.streamSelector.findIndex(({ label }) =>
        isEquivalentLabel(matcher.label as string, label as string),
      );

      if (existingSelectorIndex !== -1) {
        this.streamSelector[existingSelectorIndex] = matcher;
      } else {
        this.streamSelector.push(matcher);
      }
    });

    return this;
  };
```