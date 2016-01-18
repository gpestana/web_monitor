##Web Monitor

The web monitor is a tool that monitors websites and reports their availability. It runs inspections periodically on listed websites, logs their availability and checks their content against a set of predefined rules.
You can access the dashboard of a dev deployment (inspection running each 10m) at [http://178.79.165.86:8080/](http://178.79.165.86:8080/)

###Architecture & tech

![web monitor architecture](http://i.imgur.com/YaIDKlw.png)

The web monitor tool is divided in 3 self contained services as the picture shows.

- The **Monitor service** is responsible to inspect the websites listed in the configuration and check their content and availability. The inspection results are parsed and sent to the DB Manager service to be stored. The time interval between inspections, websites to be inspected and content rules are defined in a configuration file.

- The **DB Manager service** is responsible to keep the logs stored (in this initial version, only the latest log version is stored) and to expose a HTTP endpoint so that the Webserver service can request the latest log entry.

- The **Webserver service** implements a simple webservice that exposes the port 8080 and sends a HTML page with the last updated log to clients upon request. The Webserver works as a proxy between the DB manager and the web clients: When the clients request the latest log, it makes a request to the webserver service for the latest log and forwards the answer back to the clients in an HTML page with the results.

The communication between the Monitor service and the DB Manager is done through a work queue implemented with RabbitMQ in order take the first step towards a scalable implementation of the tool (more on this later on). It also offers more resilience, since if the DB Manager service goes down it will eventually recover the state and update the latest logs once it is back. In addition, a asynchronous way of communication between these services seems the best approach.

The communication between the DB Manager and the Webserver is done through a simple REST API exposed by the DB Manager. The only endpoint is *'/last_log'* that returns the last log and its timestamp in a JSON format.

#####Technology
The lang used to implement the different services was Node.JS. First, it seemed to me the best fit for the Monitor service, due to its non-blocking event loop. The non-blocking loop of the V8 engine is advantage when we need to make several HTTP requests to the webpages monitored in paralel, without having to block the whole program waiting for the replies. There are some caveats when scaling up the tool that are discussed on *'On latency'* section and *'Building web monitor at scale'*. Another reason was that Node.JS has good and stable modules to implement simple webservers exposing API and make HTTP requests.
RabbitMQ was used to run the messaging layer. RabbitMQ implements the AMQP protocol and offers easy ways to work queues with fair dispatch, message ack and message durability. 


###How to run

*Dependencies:* Node.JS [https://nodejs.org/en/download/](https://nodejs.org/en/download/), RabbitMQ [https://nodejs.org/en/download/](http://www.rabbitmq.com/download.html)

1) `$ git clone https://github.com/gpestana/web_monitor.git`

2) `$ cd web_monitor`

3) `$ cd monitor; npm install; cd ../db_manager; npm install; cd ../webserver; npm install webserver; cd ..`


4) `$ ./start_services -s` (silent mode, the logs for each service will be stored in ./web_monitor.log)

or

4) `$ ./start_services` (the logs will be output to stdout)

5) go to [http://localhost:8080](http://localhost:8080) to see the dashboard with the latest log

**Note:** this assumes that all the services will run in the same machine and for development purposes. The ideal would be to create a Docker image for each of the services (more on this on the next section).


###Next steps
For this version of the web monitor, the next steps would be:

1) Create a Docker image for each of the services a script that would easily deploy them separately (so we could deploy and run the services in different machines easily)

2) Go through the code and ensure that the code is robust in case of errors so that the services keep running or exit gracefully if any problem occurs. If the service exit, ensure that it logs the cause of the error and restarts.

3) Improve DB Manager service to keep all logs received by the Monitor service and redesign API to support requests for logs in a time-window (instead of only the latest log); This would require three main things: 1) that the logs would be stored in a DB and not in memory; 2) an improved db query layer to query logs in a given time window; and 3) improved API for the webserver to query logs stored;

4) Refactor architecture for more scalability and security (next section)

###Building web monitor at scale

Assuming to simultaneously monitor the connectivity and latencies from multiple geographically distributed locations and collect all the data to a single report that reflects the status across all locations.

####Architecture and scalability

- **Monitor Service** In order to ensure scalability in case of big quantity of websites to monitor spread over multiple distributed locations, we'd have to deploy several Monitor Services, each of them responsible to monitor a set of websites. In order to change the configuration file of every Monitor service, we could implement Configuration Manager service responsible to communicate with all Monitor services deployed and change the configuration files. This Configuration Manager would allow us to ensure that there were no overlaps in the set of websites each Monitor would inspect and to easily update configurations across all deployed services at once. The communication between the Monitor services and the Configuration Manager service could be asynchronous, using a work queue similar to what happens between the DB Manager and Monitor Manager (for the same reasons as well)

- **DB Manager service** Assuming that there would be a lot of data created by the Monitor services at a high throughput, we could deploy several DB Manager services in clusters. Each cluster has a set of DB Manager-like services (nodes). With this design, each Monitor service would publish messages to a pub/sub channel where a particular node of a cluster is subscribed to. Whithin a cluster, each DB manager service would contain a set of the whole log file. Eg:

```
CLUSTER_1 {
 DB_MANAGER_1: contains logs of website_0 to website_1000,
 DB_MANAGER_2: contains logs of website_1001 to website_2000,
 (...)
 DB_MANAGER_N: contains logs of website_n-1000 to website_n,
}
```
(...)
```
CLUSTER_N {
 DB_MANAGER_1: contains logs of website_0 to website_1000,
 DB_MANAGER_2: contains logs of website_1001 to website_2000,
 (...)
 DB_MANAGER_N: contains logs of website_n-1000 to website_n,
}
```

The communication between the Monitor services and the DB Managers in the clusters would be done with a Pub/Sub channel implemented with a work queue.

In this case, the Webserver service would need only to request data from 1 single cluster (since the clusters are keep the same (soft) state between themselves). The Webserver would then make a request to a Load balancer service. This Load balance service would multiplex the log request between the different clusters, so that they would not be overloaded with requests (assuming that would be A LOT of request from the users, wich might be an over-assumption). Another responsibility of the Load balancer service is to forward the request to another cluster if one of them is down. Again, there's no problem with one instance to be down, since we have a clean log state in each of the clusters.

This could be greatly simplified, if we loosen up the requirements. Eg: 

**a)** Instead of clustering, only replicate the whole logs state across DB Manager services (not helping if the throughput of the data coming from the Monitor service is so that the communication would be a bottleneck, but helping with keeping replicas for robustness, in case of one DB manager service goes down);

**b)** On the other hand, to have several DB manager-like services deployed and each of them would subscribe to the result of a set of websites. This would help to solve the hight throughput problem, but it would not give enough robustness in case of a DB manager is down. If one of the services is down, for example, the client could only obtain part of the log.

- **Webserver** I'd assume that only a restricted amount of people have authorization to access the logs and consequently, authorization to request log data from the Webserver service. Thus, I believe that we'd not neet several webservices deployed and a load balancer in front of them for the clients to be able to access the data without big latency. An interesting feature though, would'd be to have real-time data from the logs. This could be done is 2 ways: 

**1st** (and easiest) would be to have the client's browser making HTTP requests automatically at a pace similar to the pace that the logs are updated in the DB Managers and re-render the DOM as the data is received in the browser;

**2nd** (and more complex) would be to set up a bi-directional websocket connection between the Webserver and the clients and a bi-directional websocket between the Webserver and the Load balancer service (which would have to be notified by the DB manager when new data arrived). This way, the new data would be passed to the client as it reaches the DB services, without having to continously pool it.

Personally and given the client requirements (not many clients, we probably don't need a nearly-real-time monitorization but something close to it) and the complexity to implement both 1st and 2nd approaches, I'd go for the 1st approach.

In summary, this is the design I'd use for the web monitor service at scale:

![web monitor architecture at scale](http://i.imgur.com/gs5UUcl.png)



####Security

Security concerns and possible solutions for the Web monitor tool at scale:

- **TLS**: To use in the RESTful communication between clients, webservers and all the deployed instances. This would protect the traffic from between clients and webserver and would make it more difficult to eavedrop and man in the middle attacks. The TLS layer could also be used as a authentication layer for the clients.
- **Client authentication**: If not implemented by the TLS layer, then implement it using Kerberos or similar.
- **Instance security**: Since we are running multiple micro services potentally distributed across different machines or instances, we have to ensure that each instance is properly secure. Proper firewall configuration, TLS, updates, implement anti DDoS mechanisms are some examples.
- **Application level security**: use npm-shrinkwrap and keep modules updated. Try to depend the least on modules not implemented locally

###Notes
####On latency
Latency should be calculated as the time difference between when the HTTP request was made until the first chunk arrives. In this version of the Web montor tool, the latency is being calculated as the difference between the time when the *whole* response is received and when the HTTP request was schedule in the V8 machine. This differences will end distorting slightly the latency results. I believe for a more accurate way to calculate the latency, we could spin off a process running a C snippet that would make the HTTP request and in a more low-level way (and thus more accurately) calculate the latency, as close as possible to the formula above mentioned.


Currently reading [Passively Measuring TCP Round-trip Times (A close look at RTT measurements with TCP) - https://queue.acm.org/detail.cfm?id=2539132](https://queue.acm.org/detail.cfm?id=2539132) More on this soon.
