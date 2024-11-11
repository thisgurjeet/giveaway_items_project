
# Re-Home

My Project "Re-Home" a sustainable giveaway platform, It is a backend project where users can upload unused or old items for giveaway allowing others users to claim them. This app incorporates gamification to encourage engagement by letting users earn reward points, reedemable for amazon gift cards.


## Table of Contents

 - Project Overview
 - Architecture
 - Tech Stack used
 - Installation and Setup
 - Usage/Documentation
 - Results
 - Future work

## Project Overview

Rehome tackles the problem of excessive waste and promote sustainable practices. Many people have items they no longer need, but instead of discarding them, Re-Home allows users to pass them on to others who might need them, reducing massive waste and supporting a circular economy.

## Architecture

Clean Architecture and Solid principles are used. Application is divided into 4 main components:

1. app.js (main file)
2. Routers (consists of all the routes in specific folders)
3. Controllers (All the business logic and functions execute here)
## Tech Stack

**Server:** Node.js, Express.js

**Database:** MongoDB

**API Management:** Postman


## Installation

    1. Clone the repository

```bash
  https://github.com/thisgurjeet/giveaway_items_project.git
```
    2. Install required dependencies

```bash
  set up the mongoose, node, express on your local system. Import 
  necessary files using npm install _ _ _
```    
  
    3. Run the Node server

```bash
  nodemon app.js
```     
## Usage

Once the node server is running, users can run the APIs using postman, authenticate and upload giveaway items to the platform, and other users can claim these items.

**A Link to Postman APIs and documentation:**

```bash
  https://web.postman.co/workspace/c61f3782-ebe1-487d-85d5-77d5d5a5404e/documentation/25886687-9d7d86c7-8da9-4d1f-a6ec-0426315f0204
```


## Results

The results of the apis will be shown as a response in the postman window in the form of json data. Routes are managed according to the type of requests sent.
## Future Work

1. Implementing a real time location tracker to fetch the location of users for delivery.

2. Building a fronted applicaion for clients either as a mobile app using flutter or a web app using react.
