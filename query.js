const pg = require('pg')
const config = {
    user: 'dgodow',
    database: 'adventureworks',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
}
const client = new pg.Client(config);

client.connect(function (err) {
    if (err) throw err;

    client.query('SELECT * from humanresources.department', function (err, result) {
        if (err) throw err;

        console.log(result.rows)

        client.end(function (err) {
            if (err) throw err;
        })
    })
})