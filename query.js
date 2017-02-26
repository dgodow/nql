const pg = require('pg')
const program = require('commander');

// PARSER SETUP

class Parser {

    constructor (text) {
        this.text = text;
    }

    tokenize () {
        // Divides sentences into words, removes punctuation
        var regex = /\s*(=>|["-+*\][\/\%:\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
        return this.text.split(regex).filter(function (s) { return !s.match(/^\s*$/); }).filter(function (word) {return word !== 'the' && word !== 'of'});
    }
}

class QueryEngine {

    constructor () {
        this.verbDictionary = {
            'how many': ['SELECT COUNT(*)'],
            'what are': ['SELECT *'],
            'what were': ['SELECT *'],
            'when were': ['SELECT DISTINCT ON', 'GROUP BY modifieddate']
        }
    }

    createQuery (tokenList) {
        let query = this.findVerb(tokenList), target = this.findTarget(tokenList);
        const schema = 'person';

        if (query.length > 1) {
            target = target + ' ' + query[1];
            query = query[0] + ' (modifieddate) modifieddate';
        }

        return query + ' FROM ' + schema + '.' + target;
    }

    // HELPER FUNCTIONS

    findVerb (tokenList) {
        const verbs = tokenList.slice(0, 2);
        // if (this.verbDictionary[verbs].length > 1) return this.verbDictionary[verbs];
        return this.verbDictionary[verbs.join(' ').toLowerCase()]
    }

    findTarget (tokenList) {
        let target = tokenList.slice(2,3)[0];
        if (target[target.length-1] === 's') target = target.slice(0, target.length-1);

        if (target === 'email') target = 'emailaddress';
        if (target === 'phone') target = 'personphone';

        return target;
    }
}

// DATABASE SETUP

const config = {
    user: 'dgodow',
    database: 'adventureworks',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
}
const client = new pg.Client(config);

program
    .version('0.0.1')
    .command('query <str>')
    .action(function (str) {
        const parser = new Parser(str);
        const tokens = parser.tokenize();
        const queryEngine = new QueryEngine();
        const loadedQuery = queryEngine.createQuery(tokens);

        client.connect(function (err) {
            if (err) throw err;

            client.query(loadedQuery, function (err, result) {
                if (err) throw err;

                console.log(result.rows)

                client.end(function (err) {
                    if (err) throw err;
                })
            })
        })
    })

program.parse(process.argv);