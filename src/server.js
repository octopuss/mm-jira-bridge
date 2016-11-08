import app from './app';

const port = process.env.PORT || 5000;
app.set('port', port);

app.listen(app.get('port'), '0.0.0.0', () => {
    console.log('Express server listening on port ' + port);
}).on('error', (err) => {
    console.error('Cannot start server, port most likely in use');
    console.error(err);
});
