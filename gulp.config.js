module.exports = function () {
    var build = './build/';
    var client = './src/client/';
    var clientApp = client + 'app/';
    var report = './report/';
    var root = './';
    var server = './src/server/';
    var specRunnerFile = 'specs.html';
    var temp = './.tmp/';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];

    var config = {
        /*
        * File Paths
        */
        alljs: [
            './src/**/*.js',
            './*.js'
        ],
        api: '/api',
        build: build,
        client: client,
        clientApp: clientApp,
        clientBuild: build + 'client/',
        css: temp + 'styles.css',
        data: '/../../data/',
        fonts: [
            './bower_components/font-awesome/fonts/**/*.*'
        ],
        html: client + '**/*.html',
        htmltemplates: clientApp + '**/*.html',
        images: [
            client + 'images/**/*'
        ],
        index: client + 'index.html',
        js: [
            clientApp + '**/*module*.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        less: client + 'styles/styles.less',
        nodejs: [
            server + '**/**/*.js'
        ],
        openshift: [
            '!' + build + '.openshift',
            '!' + build + '.git'
        ],
        report: report,
        root: root,
        routes: server + 'routes/',
        server: server,
        serverCode: [
            server + '**/*',
            '!' + server + 'data/**',
            'package.json'
        ],
        temp: temp,

        /*
         * optimized files
         */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },

        /*
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },

        /*
         * browser sync
         */
        browserReloadDelay: 1000,

        /*
        * Bower and NPM Locations
        */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        packages : [
            './package.json',
            './bower.json'
        ],

        /*
         * specs.html, our HTML spec runner
         */
        specRunner: client + specRunnerFile,
        specRunnerFile: specRunnerFile,

        /*
         * Karma and testing settings
         */
        specHelpers: [client + 'test-helpers/*.js'],
        serverIntegrationSpecs: [client + 'tests/server-integration/**/*.spec.js'],
        testlibraries: [
            'node_modules/mocha/mocha.js',
            'node_modules/chai/chai.js',
            'node_modules/mocha-clean/index.js',
            'node_modules/sinon-chai/lib/sinon-chai.js'
        ],
        specs: [clientApp + '**/*.spec.js'],

        /*
        * Node Settings
        */
        defaultPort: 8080,
        nodeServer: server + 'server.js',
        buildNodeServer: build + 'server.js'
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    config.karma = getKarmaOptions();

    return config;

    /////////////////////////

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                temp + config.templateCache.file,
                config.serverIntegrationSpecs
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}
                ]
            },
            preprocessors: {}
        };
        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }
};
