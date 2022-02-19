import * as express from 'express';
import createError from 'http-errors'

import {
    rootRouter
} from './router'

const app = express();

const allowCors = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
};
app.use(allowCors)

app.use('/', rootRouter)

app.use('*', function (req, res, next) {
    res.status(404).send({ error: 'error' })
    next(createError(404));
});
app.use(function (err, req, res, next) {

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

export default app