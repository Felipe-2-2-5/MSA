const express = require("express");
const serverResponses = require("../utils/helpers/responses");
const messages = require("../config/messages");
const { Todo } = require("../models/todos/todo");
const Prometheus = require('prom-client');

const routes = (app) => {
  const router = express.Router();
  const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
  const counter = new Prometheus.Counter({
    name: 'number_of_post_request_hit',
    help: 'sample custom metrics to track number of post request hit',
  });
  collectDefaultMetrics({
    //labels: { NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE },
    labels: { NODE_APP_INSTANCE: 'backend' },
  });

  router.post("/todos", (req, res) => {
    const todo = new Todo({
      text: req.body.text,
    });

    //sample custom metrics
    counter.inc();

    todo
      .save()
      .then((result) => {
        serverResponses.sendSuccess(res, messages.SUCCESSFUL, result);
      })
      .catch((e) => {
        serverResponses.sendError(res, messages.BAD_REQUEST, e);
      });
  });

  router.get('/metrics', function(req, res)
  {
      res.setHeader('Content-Type',Prometheus.register.contentType)

      Prometheus.register.metrics().then(data => {
        //serverResponses.sendSuccess(res, messages.SUCCESSFUL, data);
        res.end(data);
      })
  });

  router.get("/", (req, res) => {
    Todo.find({}, { __v: 0 })
      .then((todos) => {
        serverResponses.sendSuccess(res, messages.SUCCESSFUL, todos);
      })
      .catch((e) => {
        serverResponses.sendError(res, messages.BAD_REQUEST, e);
      });
  });


  //it's a prefix before api it is useful when you have many modules and you want to
  //differentiate b/w each module you can use this technique
  app.use("/api", router);
};
module.exports = routes;
