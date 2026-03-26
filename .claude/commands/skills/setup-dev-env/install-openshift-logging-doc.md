Source: https://docs.redhat.com/en/documentation/red_hat_openshift_logging/6.4/html-single/installing_logging/index#installing-loki-and-logging-cli_installing-logging

Chapter 1. Installing Logging 

OpenShift Container Platform Operators use custom resources (CRs) to manage applications and their components. You provide high-level configuration and settings through the CR. The Operator translates high-level directives into low-level actions, based on best practices embedded within the logic of the Operator. A custom resource definition (CRD) defines a CR and lists all the configurations available to users of the Operator. Installing an Operator creates the CRDs to generate CRs.

To get started with logging, you must install the following Operators:

Loki Operator to manage your log store.
Red Hat OpenShift Logging Operator to manage log collection and forwarding.
Cluster Observability Operator (COO) to manage visualization.
You can use either the OpenShift Container Platform web console or the OpenShift Container Platform CLI to install or configure logging.

Important
You must configure the Red Hat OpenShift Logging Operator after the Loki Operator.
You must install the Red Hat OpenShift Logging Operator and the Loki Operator with the same major and minor version.
1.1. Installation by using the CLI 

The following sections describe installing the Loki Operator and the Red Hat OpenShift Logging Operator by using the CLI.

1.1.1. Installing the Loki Operator by using the CLI 

Install Loki Operator on your OpenShift Container Platform cluster to manage the log store Loki by using the OpenShift Container Platform command-line interface (CLI). You can deploy and configure the Loki log store by reconciling the resource LokiStack with the Loki Operator.

Prerequisites

You have administrator permissions.
You installed the OpenShift CLI (oc).
You have access to a supported object store. For example: AWS S3, Google Cloud Storage, Azure, Swift, Minio, or OpenShift Data Foundation.
Procedure

Create a Namespace object for Loki Operator:

Example Namespace object


apiVersion: v1
kind: Namespace
metadata:
  name: openshift-operators-redhat  1 
  labels:
    openshift.io/cluster-monitoring: "true"  2



Show less
1
You must specify openshift-operators-redhat as the namespace. To enable monitoring for the operator, configure Cluster Monitoring Operator to scrape metrics from the openshift-operators-redhat namespace and not the openshift-operators namespace. The openshift-operators namespace might contain community operators, which are untrusted and could publish a metric with the same name as an OpenShift Container Platform metric, causing conflicts.
2
A string value that specifies the label as shown to ensure that cluster monitoring scrapes the openshift-operators-redhat namespace.
Apply the Namespace object by running the following command:

$ oc apply -f <filename>.yaml


Create an OperatorGroup object.

Example OperatorGroup object


apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: loki-operator
  namespace: openshift-operators-redhat  1 
spec:
  upgradeStrategy: Default



Show less
1
You must specify openshift-operators-redhat as the namespace.
Apply the OperatorGroup object by running the following command:

$ oc apply -f <filename>.yaml


Create a Subscription object for Loki Operator:

Example Subscription object


apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: loki-operator
  namespace: openshift-operators-redhat  1 
spec:
  channel: stable-6.<y>  2 
  installPlanApproval: Automatic  3 
  name: loki-operator
  source: redhat-operators  4 
  sourceNamespace: openshift-marketplace



Show less
1
You must specify openshift-operators-redhat as the namespace.
2
Specify stable-6.<y> as the channel.
3
If the approval strategy in the subscription is set to Automatic, the update process initiates as soon as a new operator version is available in the selected channel. If the approval strategy is set to Manual, you must manually approve pending updates.
4
Specify redhat-operators as the value. If your OpenShift Container Platform cluster is installed on a restricted network, also known as a disconnected cluster, specify the name of the CatalogSource object that you created when you configured Operator Lifecycle Manager (OLM).
Apply the Subscription object by running the following command:

$ oc apply -f <filename>.yaml


Create a namespace object for deploy the LokiStack:

Example namespace object


apiVersion: v1
kind: Namespace
metadata:
  name: openshift-logging  1 
  labels:
    openshift.io/cluster-monitoring: "true"  2



Show less
1
The openshift-logging namespace is dedicated for all logging workloads.
2
A string value that specifies the label, as shown, to ensure that cluster monitoring scrapes the openshift-logging namespace.
Apply the namespace object by running the following command:

$ oc apply -f <filename>.yaml


Create a secret with the credentials to access the object storage. For example, create a secret to access Amazon Web Services (AWS) s3.

Example Secret object


apiVersion: v1
kind: Secret
metadata:
  name: logging-loki-s3  1 
  namespace: openshift-logging
stringData:  2 
  access_key_id: <access_key_id>
  access_key_secret: <secret_access_key>
  bucketnames: <s3_bucket_name>
  endpoint: https://s3.eu-central-1.amazonaws.com
  region: eu-central-1



Show less
1
Use the name logging-loki-s3 to match the name used in LokiStack.
2
For the contents of the secret see the Loki object storage section.
Important
If there is no retention period defined on the s3 bucket or in the LokiStack custom resource (CR), then the logs are not pruned and they stay in the s3 bucket forever, which might fill up the s3 storage.

Apply the Secret object by running the following command:

$ oc apply -f <filename>.yaml


Create a LokiStack CR:

Example LokiStack CR


apiVersion: loki.grafana.com/v1
kind: LokiStack
metadata:
  name: logging-loki  1 
  namespace: openshift-logging  2 
spec:
  managementState: Managed
  limits:
    global:  3 
      retention:  4 
        days: 20 # Set the value as per requirement
  size: 1x.small  5 
  storage:
    schemas:
    - version: v13
      effectiveDate: "<yyyy>-<mm>-<dd>"  6 
    secret:
      name: logging-loki-s3  7 
      type: s3  8 
  storageClassName: <storage_class_name>  9 
  tenants:
    mode: openshift-logging  10



Show less
1
Use the name logging-loki.
2
You must specify openshift-logging as the namespace.
3
Define global limits that apply to the LokiStack instance. For information about setting stream-based retention, see Enabling stream-based retention with Loki. This field does not impact the retention period for stored logs in object storage.
4
Retention is enabled in the cluster when this block is added to the CR.
5
Specify the deployment size. Supported size options for production instances of Loki are 1x.extra-small, 1x.small, or 1x.medium. Additionally, 1x.pico is supported starting with logging 6.1.
6
Set the date two months ago.
7
Specify the name of your log store secret.
8
Specify the corresponding storage type.
9
Specify the name of a storage class for temporary storage. For best performance, specify a storage class that allocates block storage. You can list the available storage classes for your cluster by using the oc get storageclasses command.
10
The openshift-logging mode is the default tenancy mode where a tenant is created for log types, such as audit, infrastructure, and application. This enables access control for individual users and user groups to different log streams.
Apply the LokiStack CR object by running the following command:

$ oc apply -f <filename>.yaml


Verification

Verify the installation by running the following command:

$ oc get pods -n openshift-logging


Example output


$ oc get pods -n openshift-logging
NAME                                               READY   STATUS    RESTARTS   AGE
logging-loki-compactor-0                           1/1     Running   0          42m
logging-loki-distributor-7d7688bcb9-dvcj8          1/1     Running   0          42m
logging-loki-gateway-5f6c75f879-bl7k9              2/2     Running   0          42m
logging-loki-gateway-5f6c75f879-xhq98              2/2     Running   0          42m
logging-loki-index-gateway-0                       1/1     Running   0          42m
logging-loki-ingester-0                            1/1     Running   0          42m
logging-loki-querier-6b7b56bccc-2v9q4              1/1     Running   0          42m
logging-loki-query-frontend-84fb57c578-gq2f7       1/1     Running   0          42m



Show less
1.1.2. Installing Red Hat OpenShift Logging Operator by using the CLI 

Install Red Hat OpenShift Logging Operator on your OpenShift Container Platform cluster to collect and forward logs to a log store by using the OpenShift CLI (oc).

Prerequisites

You have administrator permissions.
You installed the OpenShift CLI (oc).
You installed and configured Loki Operator.
You have created the openshift-logging namespace.
Procedure

Create an OperatorGroup object:

Example OperatorGroup object


apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: cluster-logging
  namespace: openshift-logging  1 
spec:
  upgradeStrategy: Default



Show less
1
You must specify openshift-logging as the namespace.
Apply the OperatorGroup object by running the following command:

$ oc apply -f <filename>.yaml


Create a Subscription object for Red Hat OpenShift Logging Operator:

Example Subscription object


apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: cluster-logging
  namespace: openshift-logging  1 
spec:
  channel: stable-6.<y>  2 
  installPlanApproval: Automatic  3 
  name: cluster-logging
  source: redhat-operators  4 
  sourceNamespace: openshift-marketplace



Show less
1
You must specify openshift-logging as the namespace.
2
Specify stable-6.<y> as the channel.
3
If the approval strategy in the subscription is set to Automatic, the update process initiates as soon as a new operator version is available in the selected channel. If the approval strategy is set to Manual, you must manually approve pending updates.
4
Specify redhat-operators as the value. If your OpenShift Container Platform cluster is installed on a restricted network, also known as a disconnected cluster, specify the name of the CatalogSource object that you created when you configured Operator Lifecycle Manager (OLM).
Apply the Subscription object by running the following command:

$ oc apply -f <filename>.yaml


Create a service account to be used by the log collector:

$ oc create sa logging-collector -n openshift-logging


Assign the necessary permissions to the service account for the collector to be able to collect and forward logs. In this example, the collector is provided permissions to collect logs from both infrastructure and application logs.

$ oc adm policy add-cluster-role-to-user logging-collector-logs-writer -z logging-collector -n openshift-logging


$ oc adm policy add-cluster-role-to-user collect-application-logs -z logging-collector -n openshift-logging


$ oc adm policy add-cluster-role-to-user collect-infrastructure-logs -z logging-collector -n openshift-logging


Create a ClusterLogForwarder CR:

Example ClusterLogForwarder CR


apiVersion: observability.openshift.io/v1
kind: ClusterLogForwarder
metadata:
  name: instance
  namespace: openshift-logging  1 
spec:
  serviceAccount:
    name: logging-collector  2 
  outputs:
  - name: lokistack-out
    type: lokiStack  3 
    lokiStack:
      target:  4 
        name: logging-loki
        namespace: openshift-logging
      authentication:
        token:
          from: serviceAccount
    tls:
      ca:
        key: service-ca.crt
        configMapName: openshift-service-ca.crt
  pipelines:
  - name: infra-app-logs
    inputRefs:  5 
    - application
    - infrastructure
    outputRefs:
    - lokistack-out



Show less
1
You must specify the openshift-logging namespace.
2
Specify the name of the service account created before.
3
Select the lokiStack output type to send logs to the LokiStack instance.
4
Point the ClusterLogForwarder to the LokiStack instance created earlier.
5
Select the log output types you want to send to the LokiStack instance.
Apply the ClusterLogForwarder CR object by running the following command:

$ oc apply -f <filename>.yaml


Verification

Verify the installation by running the following command:

$ oc get pods -n openshift-logging


Example output


$ oc get pods -n openshift-logging
NAME                                               READY   STATUS    RESTARTS   AGE
cluster-logging-operator-fb7f7cf69-8jsbq           1/1     Running   0          98m
instance-222js                                     2/2     Running   0          18m
instance-g9ddv                                     2/2     Running   0          18m
instance-hfqq8                                     2/2     Running   0          18m
instance-sphwg                                     2/2     Running   0          18m
instance-vv7zn                                     2/2     Running   0          18m
instance-wk5zz                                     2/2     Running   0          18m
logging-loki-compactor-0                           1/1     Running   0          42m
logging-loki-distributor-7d7688bcb9-dvcj8          1/1     Running   0          42m
logging-loki-gateway-5f6c75f879-bl7k9              2/2     Running   0          42m
logging-loki-gateway-5f6c75f879-xhq98              2/2     Running   0          42m
logging-loki-index-gateway-0                       1/1     Running   0          42m
logging-loki-ingester-0                            1/1     Running   0          42m
logging-loki-querier-6b7b56bccc-2v9q4              1/1     Running   0          42m
logging-loki-query-frontend-84fb57c578-gq2f7       1/1     Running   0          42m



Show less
1.1.3. Installing the logging UI plugin by using the CLI 

Install the logging UI plugin by using the command-line interface (CLI) so that you can visualize logs.

Prerequisites

You have administrator permissions.
You installed the OpenShift CLI (oc).
You installed and configured Loki Operator.
Procedure

Install the Cluster Observability Operator. For more information, see Installing the Cluster Observability Operator.
Create a UIPlugin custom resource (CR):

Example UIPlugin CR


apiVersion: observability.openshift.io/v1alpha1
kind: UIPlugin
metadata:
  name: logging   1 
spec:
  type: Logging   2 
  logging:
    lokiStack:
      name: logging-loki   3 
    logsLimit: 50
    timeout: 30s
    schema: otel  4



Show less
1
Set name to logging.
2
Set type to Logging.
3
The name value must match the name of your LokiStack instance. If you did not install LokiStack in the openshift-logging namespace, set the LokiStack namespace under the lokiStack configuration.
4
schema is one of otel, viaq, or select. The default is viaq if no value is specified. When you choose select, you can select the mode in the UI when you run a query.
Note
These are the known issues for the logging UI plugin - for more information, see OU-587.

The schema feature is only supported in Red Hat OpenShift Logging 4.15 and later. In earlier versions of Red Hat OpenShift Logging, the logging UI plugin will only use the viaq attribute, ignoring any other values that might be set.
Non-administrator users cannot query logs using the otel attribute with logging for Red Hat OpenShift versions 5.8 to 6.2. This issue will be fixed in a future logging release. (LOG-6589)
In logging for Red Hat OpenShift version 5.9, the severity_text Otel attribute is not set.
Apply the UIPlugin CR object by running the following command:

$ oc apply -f <filename>.yaml


Verification

Access the Red Hat OpenShift Logging web console, and refresh the page if a pop-up message instructs you to do so.
Navigate to the Observe → Logs panel, where you can run LogQL queries. You can also query logs for individual pods from the Aggregated Logs tab of a specific pod
