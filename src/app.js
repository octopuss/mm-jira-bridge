import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import router from './router';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(err.statusCode || 500);
  res.write(err.message);
  next(err);
});

export default app;
