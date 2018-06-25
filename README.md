# drachtio-sample-webapp

A simple [express-based](https://expressjs.com/) web callback for [drachtio](https://drachtio.org/).  This app provides a simple example of a web callback that illustrates the possible ways to provide routing instructions for an incoming call.

Do not take this application as a normative example.  The structure here, of using a config file to contain routes (vs a database, or something else) and the use of express as http middleware were simply a choice made by the author.  You can implement this however you like, in whatever language or framework you like.

## Installation
* copy `config/default.json.example` to `config/local.json`
* edit as appropriate for your need
* `npm start`.