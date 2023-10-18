# webapp

CSYE6225 - webapp

Name: PRAMOD BEGUR NAGARAJ

NUID: 002708842

Description: HealthZApplication
Checks the health of Database Server
Application:Objective is to manage the Assignment details of Application Users.
The entire Application has 6 API EndPoints.

1.  GET --/v1/assignments
2.  POST-- /v1/assignments
3.  GET--/v1/assignments/{id}
4.  DELETE--/v1/assignments/{id}
5.  PUT--/v1/assignments/{id}
6.  GET--/healthz

## Prerequisites

1.Visual studio code (IDE)
2.POSTMAN
3.Database - Postgres
4.Node.js

## Responds with following HTTP messages

"200 OK - The request was successful."

"201 Created - A new resource was created as a result of the request, often sent in response to a POST or some PUT requests."

"204 No Content - The request was successful, but there's no need for the client to navigate away from its current page."

"400 Bad Request - The server could not process the request due to an invalid syntax."

"401 Unauthenticated - The client must provide authentication to receive the requested response."

"403 Forbidden - The client does not have access to the requested resource."

"500 Internal Server Error - The server encountered an issue it couldn't handle."

Test the api

Please create a pull request with a detailed description of changes.
