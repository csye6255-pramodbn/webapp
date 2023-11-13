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
3.  GET--/v1/assignments/{id}xs
4.  DELETE--/v1/assignments/{id}
5.  PUT--/v1/assignments/{id}
6.  GET--/healthz

## Prerequisites

1.Visual studio code (IDE)
2.POSTMAN
3.GIT
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


## Overview

This project utilizes GitHub Actions and Packer to streamline the deployment of a web application environment. It combines automation workflows with shell scripting and systemd configuration to build application artifacts through GitHub Actions and create an Amazon Machine Image (AMI) using Packer.

## GitHub Actions Workflows

### 1. Integration Test

### 2. Packer Fmt and Validate Test

### 3. Integration Test and Build the Artifacts


## Packer AMI Build

- The Packer component is used to build an Amazon Machine Image (AMI) with the application artifact.
- The built AMI automatically starts the application using systemd, ensuring smooth deployment.

## Shell Script

### Purpose

This Bash script automates the setup and configuration of essential components for a web application, including:

- Installing required software packages
- Setting up the CloudWatch agent
- Managing user permissions and groups
- Configuring systemd for application management

### Permissions

The script enforces the following permissions:

- Ownership of the web application directory is given to the user 'pramod' and group 'pramodgroup.'
- The 'pramod' user is restricted from login access.
- Other users are denied access to the /opt/pramodhome/webapp directory, enhancing security.

### Logging

The script creates log files, manages permissions for log directories, and starts the web application service. Rsyslog is also installed to facilitate auditing and monitoring of system activities.
