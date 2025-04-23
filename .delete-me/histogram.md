Histrogram aggreates the types of logs (e.g. 'warning', 'info', 'critical', 'debug', 'unknown', 'other'). 
Loki returns the results.metric.level as the only attribute for level/severity when queried so we don't need to modify the this. 

### Request 
https://console-openshift-console.apps.chat-bot-aiorq-3k9uqo.crt-mce-aws.devcluster.openshift.com/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/infrastructure/loki/api/v1/query_range?query=sum+by+%28level%29+%28count_over_time%28%7B+log_type%3D%22infrastructure%22+%7D+%7C+json+%5B30s%5D%29%29&start=1744056568971000000&end=1744058368971000000&step=30s

### Payload
query: sum by (level) (count_over_time({ log_type="infrastructure" } | json [30s]))
start: 1744056568971000000
end: 1744058368971000000
step: 30s

### Preview 
{
    "status": "success",
    "data": {
        "resultType": "matrix",
        "result": [
            {
                "metric": {
                    "level": "default"
                },
                "values": [
                    [
                        1744057470,
                        "50"
                    ],
                    [
                        1744057500,
                        "97"
                    ],
                    [
                        1744057530,
                        "110"
                    ],
                    [
                        1744057560,
                        "97"
                    ],
                    [
                        1744057590,
                        "96"
                    ],
                    [
                        1744057620,
                        "141"
                    ],
                    [
                        1744057650,
                        "148"
                    ],
                    [
                        1744057680,
                        "97"
                    ],
                    [
                        1744057710,
                        "96"
                    ],
                    [
                        1744057740,
                        "99"
                    ],
                    [
                        1744057770,
                        "102"
                    ],
                    [
                        1744057800,
                        "133"
                    ],
                    [
                        1744057830,
                        "176"
                    ],
                    [
                        1744057860,
                        "97"
                    ],
                    [
                        1744057890,
                        "96"
                    ],
                    [
                        1744057920,
                        "97"
                    ],
                    [
                        1744057950,
                        "96"
                    ],
                    [
                        1744057980,
                        "97"
                    ],
                    [
                        1744058010,
                        "171"
                    ],
                    [
                        1744058040,
                        "97"
                    ],
                    [
                        1744058070,
                        "99"
                    ],
                    [
                        1744058100,
                        "103"
                    ],
                    [
                        1744058130,
                        "96"
                    ],
                    [
                        1744058160,
                        "99"
                    ],
                    [
                        1744058190,
                        "97"
                    ],
                    [
                        1744058220,
                        "170"
                    ],
                    [
                        1744058250,
                        "96"
                    ],
                    [
                        1744058280,
                        "97"
                    ],
                    [
                        1744058310,
                        "96"
                    ],
                    [
                        1744058340,
                        "97"
                    ]
                ]
            },
            {
                "metric": {
                    "level": "error"
                },
                "values": [
                    [
                        1744057440,
                        "1"
                    ],
                    [
                        1744057470,
                        "9"
                    ],
                    [
                        1744057500,
                        "7"
                    ],
                    [
                        1744057530,
                        "5"
                    ],
                    [
                        1744057560,
                        "2"
                    ],
                    [
                        1744057620,
                        "2"
                    ],
                    [
                        1744057650,
                        "5"
                    ],
                    [
                        1744057680,
                        "1"
                    ],
                    [
                        1744057710,
                        "2"
                    ],
                    [
                        1744057740,
                        "6"
                    ],
                    [
                        1744057770,
                        "15"
                    ],
                    [
                        1744057800,
                        "8"
                    ],
                    [
                        1744057830,
                        "3"
                    ],
                    [
                        1744057860,
                        "3"
                    ],
                    [
                        1744057890,
                        "6"
                    ],
                    [
                        1744057920,
                        "2"
                    ],
                    [
                        1744057950,
                        "4"
                    ],
                    [
                        1744057980,
                        "1"
                    ],
                    [
                        1744058010,
                        "1"
                    ],
                    [
                        1744058040,
                        "3"
                    ],
                    [
                        1744058070,
                        "16"
                    ],
                    [
                        1744058100,
                        "8"
                    ],
                    [
                        1744058130,
                        "6"
                    ],
                    [
                        1744058160,
                        "3"
                    ],
                    [
                        1744058190,
                        "1"
                    ],
                    [
                        1744058220,
                        "5"
                    ],
                    [
                        1744058250,
                        "3"
                    ],
                    [
                        1744058280,
                        "3"
                    ],
                    [
                        1744058310,
                        "1"
                    ],
                    [
                        1744058340,
                        "5"
                    ]
                ]
            },
            {
                "metric": {
                    "level": "info"
                },
                "values": [
                    [
                        1744057440,
                        "3"
                    ],
                    [
                        1744057470,
                        "237"
                    ],
                    [
                        1744057500,
                        "570"
                    ],
                    [
                        1744057530,
                        "616"
                    ],
                    [
                        1744057560,
                        "575"
                    ],
                    [
                        1744057590,
                        "310"
                    ],
                    [
                        1744057620,
                        "4053"
                    ],
                    [
                        1744057650,
                        "3668"
                    ],
                    [
                        1744057680,
                        "556"
                    ],
                    [
                        1744057710,
                        "278"
                    ],
                    [
                        1744057740,
                        "480"
                    ],
                    [
                        1744057770,
                        "3619"
                    ],
                    [
                        1744057800,
                        "1860"
                    ],
                    [
                        1744057830,
                        "547"
                    ],
                    [
                        1744057860,
                        "493"
                    ],
                    [
                        1744057890,
                        "619"
                    ],
                    [
                        1744057920,
                        "2323"
                    ],
                    [
                        1744057950,
                        "283"
                    ],
                    [
                        1744057980,
                        "340"
                    ],
                    [
                        1744058010,
                        "397"
                    ],
                    [
                        1744058040,
                        "485"
                    ],
                    [
                        1744058070,
                        "364"
                    ],
                    [
                        1744058100,
                        "3138"
                    ],
                    [
                        1744058130,
                        "1669"
                    ],
                    [
                        1744058160,
                        "544"
                    ],
                    [
                        1744058190,
                        "390"
                    ],
                    [
                        1744058220,
                        "407"
                    ],
                    [
                        1744058250,
                        "273"
                    ],
                    [
                        1744058280,
                        "341"
                    ],
                    [
                        1744058310,
                        "419"
                    ],
                    [
                        1744058340,
                        "420"
                    ]
                ]
            },
            {
                "metric": {
                    "level": "notice"
                },
                "values": [
                    [
                        1744057500,
                        "1"
                    ],
                    [
                        1744057530,
                        "8"
                    ],
                    [
                        1744057560,
                        "1"
                    ],
                    [
                        1744057620,
                        "2"
                    ],
                    [
                        1744057650,
                        "8"
                    ],
                    [
                        1744057710,
                        "2"
                    ],
                    [
                        1744057770,
                        "3"
                    ],
                    [
                        1744057800,
                        "17"
                    ],
                    [
                        1744057830,
                        "3"
                    ],
                    [
                        1744057860,
                        "1"
                    ],
                    [
                        1744057950,
                        "1"
                    ],
                    [
                        1744058070,
                        "2"
                    ],
                    [
                        1744058100,
                        "5"
                    ],
                    [
                        1744058160,
                        "3"
                    ]
                ]
            },
            {
                "metric": {
                    "level": "trace"
                },
                "values": [
                    [
                        1744058280,
                        "2"
                    ]
                ]
            },
            {
                "metric": {
                    "level": "warn"
                },
                "values": [
                    [
                        1744057470,
                        "2"
                    ],
                    [
                        1744057500,
                        "2"
                    ],
                    [
                        1744057530,
                        "4"
                    ],
                    [
                        1744057560,
                        "3"
                    ],
                    [
                        1744057620,
                        "3"
                    ],
                    [
                        1744057710,
                        "1"
                    ],
                    [
                        1744057770,
                        "1"
                    ],
                    [
                        1744057860,
                        "1"
                    ],
                    [
                        1744057890,
                        "2"
                    ],
                    [
                        1744057980,
                        "2"
                    ],
                    [
                        1744058010,
                        "2"
                    ],
                    [
                        1744058100,
                        "2"
                    ],
                    [
                        1744058160,
                        "2"
                    ],
                    [
                        1744058190,
                        "1"
                    ],
                    [
                        1744058220,
                        "1"
                    ],
                    [
                        1744058310,
                        "2"
                    ],
                    [
                        1744058340,
                        "1"
                    ]
                ]
            }
        ],
        "stats": {
            "summary": {
                "bytesProcessedPerSecond": 261108552,
                "linesProcessedPerSecond": 185779,
                "totalBytesProcessed": 52934569,
                "totalLinesProcessed": 37663,
                "execTime": 0.202730123,
                "queueTime": 0,
                "subqueries": 0,
                "totalEntriesReturned": 6,
                "splits": 2,
                "shards": 2,
                "totalPostFilterLines": 37663,
                "totalStructuredMetadataBytesProcessed": 3487494
            },
            "querier": {
                "store": {
                    "totalChunksRef": 2,
                    "totalChunksDownloaded": 2,
                    "chunksDownloadTime": 886166,
                    "queryReferencedStructuredMetadata": true,
                    "chunk": {
                        "headChunkBytes": 0,
                        "headChunkLines": 0,
                        "decompressedBytes": 3122385,
                        "decompressedLines": 4456,
                        "compressedBytes": 210551,
                        "totalDuplicates": 4451,
                        "postFilterLines": 4456,
                        "headChunkStructuredMetadataBytes": 0,
                        "decompressedStructuredMetadataBytes": 935760
                    },
                    "chunkRefsFetchTime": 1346496,
                    "congestionControlLatency": 0,
                    "pipelineWrapperFilteredLines": 0
                }
            },
            "ingester": {
                "totalReached": 2,
                "totalChunksMatched": 267,
                "totalBatches": 67,
                "totalLinesSent": 32769,
                "store": {
                    "totalChunksRef": 0,
                    "totalChunksDownloaded": 0,
                    "chunksDownloadTime": 0,
                    "queryReferencedStructuredMetadata": true,
                    "chunk": {
                        "headChunkBytes": 10956046,
                        "headChunkLines": 14636,
                        "decompressedBytes": 38856138,
                        "decompressedLines": 18571,
                        "compressedBytes": 3472571,
                        "totalDuplicates": 0,
                        "postFilterLines": 33207,
                        "headChunkStructuredMetadataBytes": 1082984,
                        "decompressedStructuredMetadataBytes": 1468750
                    },
                    "chunkRefsFetchTime": 0,
                    "congestionControlLatency": 0,
                    "pipelineWrapperFilteredLines": 0
                }
            },
            "cache": {
                "chunk": {
                    "entriesFound": 2,
                    "entriesRequested": 2,
                    "entriesStored": 0,
                    "bytesReceived": 461618,
                    "bytesSent": 0,
                    "requests": 4,
                    "downloadTime": 11380,
                    "queryLengthServed": 0
                },
                "index": {
                    "entriesFound": 0,
                    "entriesRequested": 0,
                    "entriesStored": 0,
                    "bytesReceived": 0,
                    "bytesSent": 0,
                    "requests": 0,
                    "downloadTime": 0,
                    "queryLengthServed": 0
                },
                "result": {
                    "entriesFound": 1,
                    "entriesRequested": 1,
                    "entriesStored": 1,
                    "bytesReceived": 630,
                    "bytesSent": 0,
                    "requests": 2,
                    "downloadTime": 6781,
                    "queryLengthServed": 990000000000
                },
                "statsResult": {
                    "entriesFound": 0,
                    "entriesRequested": 0,
                    "entriesStored": 0,
                    "bytesReceived": 0,
                    "bytesSent": 0,
                    "requests": 0,
                    "downloadTime": 0,
                    "queryLengthServed": 0
                },
                "volumeResult": {
                    "entriesFound": 0,
                    "entriesRequested": 0,
                    "entriesStored": 0,
                    "bytesReceived": 0,
                    "bytesSent": 0,
                    "requests": 0,
                    "downloadTime": 0,
                    "queryLengthServed": 0
                },
                "seriesResult": {
                    "entriesFound": 0,
                    "entriesRequested": 0,
                    "entriesStored": 0,
                    "bytesReceived": 0,
                    "bytesSent": 0,
                    "requests": 0,
                    "downloadTime": 0,
                    "queryLengthServed": 0
                },
                "labelResult": {
                    "entriesFound": 0,
                    "entriesRequested": 0,
                    "entriesStored": 0,
                    "bytesReceived": 0,
                    "bytesSent": 0,
                    "requests": 0,
                    "downloadTime": 0,
                    "queryLengthServed": 0
                },
                "instantMetricResult": {
                    "entriesFound": 0,
                    "entriesRequested": 0,
                    "entriesStored": 0,
                    "bytesReceived": 0,
                    "bytesSent": 0,
                    "requests": 0,
                    "downloadTime": 0,
                    "queryLengthServed": 0
                }
            },
            "index": {
                "totalChunks": 0,
                "postFilterChunks": 0,
                "shardsDuration": 0,
                "usedBloomFilters": false
            }
        }
    }
}

