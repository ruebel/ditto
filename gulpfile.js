/* jshint camelcase:false */
/* jshint -W079 */
/////////////////////////////////////////////////
// PLUGINS

var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var path = require('path');
var _ = require('lodash');
var $ = require('gulp-load-plugins')({lazy: true});
var port = process.env.PORT || config.defaultPort;
var exec = require('child_process').exec;
var env = $.util.env;

/////////////////////////////////////////////////
// TASKS

gulp.task('help', $.taskListing);
// Use help as default task
gulp.task('default', ['help']);

gulp.task('vet', function () {
    log('Analyzing source with JSHint and JSCS');

    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function () {
    log('Compiling Less -> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: ['last 2 version', '> 5%']
        }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('fonts', ['clean-fonts'], function () {
    log('Copying fonts');

    return gulp.src(config.fonts)
        .pipe(gulp.dest(config.clientBuild + 'fonts'));
});

gulp.task('images', ['clean-images'], function () {
    log('Copying and compressing images');

    return gulp.src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.clientBuild + 'images'));
});

gulp.task('clean', function (done) {
    var delconfig = [].concat(config.build + '*', config.temp, config.openshift);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

gulp.task('clean-fonts', function (done) {
    clean(config.clientBuild + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function (done) {
    clean(config.clientBuild + 'images/**/*.*', done);
});

gulp.task('clean-styles', function (done) {
    clean(config.clientBuild + '**/*.css', done);
});

gulp.task('clean-code', function (done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    clean(files, done);
});

gulp.task('less-watcher', function () {
    gulp.watch([config.less], ['styles']);
});

gulp.task('templatecache', ['clean-code'], function () {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

gulp.task('wiredep', function () {
    log('Wire up the bower css js and our app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('build', ['optimize', /*'images',*/ 'fonts', 'build-server'], function () {
    log('Building everything');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running `gulp serve-build`'
    };
    del(config.temp);
    log(msg);
    notify(msg);
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
    log('Wire up the bower css js and our app js into the html');
    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('optimize', ['inject'/*, 'test'*/], function () {
    log('Optimizing the js, css, html');

    var assets = $.useref.assets({searchPath: './'});
    var templateCache = config.temp + config.templateCache.file;
    var cssFilter = $.filter('**/*.css');
    var jsLibFilter = $.filter('**/' + config.optimized.lib);
    var jsAppFilter = $.filter('**/' + config.optimized.app);
    // Build Pipeline
    return gulp
        .src(config.index)              // Get index
        .pipe($.plumber())              // Handle errors
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- inject:templates:js -->'
        }))                             // Inject template cache
        .pipe(assets)                   // Gather assests
        // CSS
        .pipe(cssFilter)                // filter down to css
        .pipe($.csso())                 // css minify
        .pipe(cssFilter.restore())      // restore from css filter
        // LIB JS
        .pipe(jsLibFilter)              // filter down to library js
        .pipe($.uglify())               // js minify
        .pipe(jsLibFilter.restore())    // restore from lib js filter
        // APP JS
        .pipe(jsAppFilter)              // filter down to app js
        .pipe($.ngAnnotate())           // Annotate Angular Injection
        .pipe($.uglify())               // js minify
        .pipe(jsAppFilter.restore())    // restore from app js filter
        // REV
        .pipe($.rev())                  // Rev files
        .pipe(assets.restore())         // Concatenate assets
        .pipe($.useref())               // Replace with proper script tags
        .pipe($.revReplace())           // Replace the reved / renamed file names
        .pipe(gulp.dest(config.clientBuild));  // Output
});

gulp.task('build-server', function () {
    return gulp
        .src(config.serverCode)
        .pipe(gulp.dest(config.build));
});

/**
 * Bump the version
 * --type=pre will bump the prerelease version *.*.*-x
 * --type=patch or no flag will bump the patch version *.*.x
 * --type=minor will bump the minor version *.x.*
 * --type=major will bump the major version x.*.*
 * --version=1.2.3 will bump to a specific version and ignore other flags
 */
gulp.task('bump', function () {
    var msg = 'Bumping versions';
    var type = args.type;
    var version = args.version;
    var options = {};
    if (version) {
        options.version = version;
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += 'for a ' + type;
    }
    log(msg);
    return gulp
        .src(config.packages)
        .pipe($.print())
        .pipe($.bump(options))
        .pipe(gulp.dest(config.root));
});

gulp.task('serve-build', ['build'], function () {
    serve(false);
});

gulp.task('serve-dev', ['inject'], function () {
    serve(true);
});

/////////////////////////////////////////////////
// TESTING

gulp.task('serve-specs', ['build-specs'], function(done) {
    log('run the spec runner');
    serve(true /* isDev */, true /* specRunner */);
    done();
});

gulp.task('build-specs', ['templatecache'], function () {
    log('bulding the spec runner');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();
    var specs = config.specs;

    options.devDependencies = true;

    if (args.startServers) {
        specs = [].concat(specs, config.serverIntegrationSpecs);
    }

    return gulp
        .src(config.specRunner)                             // get spec runner file
        .pipe(wiredep(options))                             // inject bower compnents
        .pipe($.inject(gulp.src(config.testlibraries),      // inject test libraries
            {name: 'inject:testlibraries', read: false}))
        .pipe($.inject(gulp.src(config.js)))                // inject js files
        .pipe($.inject(gulp.src(config.specHelpers),        // inject spec helpers
            {name: 'inject:spechelpers', read: false}))
        .pipe($.inject(gulp.src(specs),                     // inject specs
            {name: 'inject:specs', read: false}))
        .pipe($.inject(gulp.src(config.temp + config.templateCache.file),   // inject template cache
            {name: 'inject:templates', read: false}))
        .pipe(gulp.dest(config.client));
});

gulp.task('test', ['vet', 'templatecache'], function(done) {
    startTests(true, done);
});

gulp.task('autotest', ['vet', 'templatecache'], function(done) {
    startTests(false, done);
});

/////////////////////////////////////////////////
// MONGO

/**
 * Start mongo server
 */
gulp.task('start-mongo', runCommand('mongod --dbpath ./src/server/data/'));

/**
 * Stop mongo server
 */
gulp.task('stop-mongo', runCommand('mongo --eval "use admin; db.shutdownServer();"'));

/////////////////////////////////////////////////
// FUNCTIONS

function runCommand(command) {
    return function (cb) {
        exec(command, function(err, stdout, stderr) {
            log(stdout);
            log(stderr);
            cb(err);
        });
    };
}

function serve(isDev, specRunner) {
    var nodeOptions = {
        script: isDev ? config.nodeServer : config.buildNodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    if (!!env.mongo) {
        log('Starting MongoDB');
        gulp.src('', {read: false})
            .pipe($.shell(['c:/mongo/mongod --config mongodb.config']));
    }

    return $.nodemon(nodeOptions)
        .on('restart', function (ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function () {
                browserSync.notify('reloading now...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function () {
            log('*** nodemon started');
            startBrowserSync(isDev, specRunner);
        })
        .on('crash', function () {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function () {
            log('*** nodemon exited cleanly');
        });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon: path.join(__dirname, 'gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}

function startBrowserSync(isDev, specRunner) {
    // Don't start up browser sync if --nosync argument
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch([config.less], ['styles'])
            .on('change', function (event) { changeEvent(event); });
    } else {
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', function (event) { changeEvent(event); });
    }
    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };

    if (specRunner) {
        options.startPath = config.specRunnerFile;
    }

    browserSync(options);
}

function startTests(singleRun, done) {
    var child;
    var fork = require('child_process').fork;
    var karma = require('karma').server;
    var excludeFiles = [];
    var serverSpecs = config.serverIntegrationSpecs;

    if (args.startServers) { // gulp test --startServers
        log('Starting server');
        var savedEnv = process.env;
        savedEnv.NODE_ENV = 'dev';
        savedEnv.PORT = 8888;
        child = fork(config.nodeServer);
    } else {
        if (serverSpecs && serverSpecs.length) {
            excludeFiles = serverSpecs;
        }
    }

    karma.start({
        configFile: __dirname + '/karma.conf.js',
        exclude: excludeFiles,
        singleRun: !!singleRun
    }, karmaCompleted);

    function karmaCompleted(karmaResult) {
        log('Karma completed!');
        if (child) {
            log('Shutting down the child process');
            child.kill();
        }
        if (karmaResult === 1) {
            done('karma: tests failed with code ' + karmaResult);
        } else {
            done();
        }
    }
}

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
