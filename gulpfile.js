/* jshint camelcase:false */
/////////////////////////////////////////////////
// PLUGINS
var gulp = require('gulp');
var common = require('./gulp/common.js');
var merge = require('merge-stream');
var pkg = require('./package.json');
var plug = require('gulp-load-plugins')({
    replaceString: /^gulp(-|\.)/, // what to remove from the name of the module when adding it to the context
    scope: ['dependencies', 'devDependencies'],
    camelize: true, // if true, transforms hyphenated plugins names to camel case
    lazy: true // whether the plugins should be lazy loaded on demand
});
//var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var inject = require('gulp-inject');
var exec = require('child_process').exec;

var env = plug.util.env;
var log = plug.util.log;

/////////////////////////////////////////////////
// TASKS
gulp.task('help', plug.taskListing);

/**
 *  Get index and sources
 */
gulp.task('index', function () {
    var target = gulp.src('./src/client/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./src/client/**/*.js', './src/client/**/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./src'));
});

/**
 *  Create $templateCache from the html templates
 */
gulp.task('templatecache', function() {
    log('Creating an AngularJS $templateCache');

    return gulp
        .src(pkg.paths.htmltemplates)
        .pipe(plug.angularTemplatecache('templates.js', {
            module: 'app.core',
            standalone: false,
            root: 'app/'
        }))
        .pipe(gulp.dest(pkg.paths.clientstage));
});

/**
 *  Change settings file to production settings
 */
gulp.task('stage-settings', function() {
    log('Changing settings to be production settings');

    return gulp
        .src('src/client/app/core/constants.js')
        .pipe(plug.replaceTask({
            patterns: [
            ]
        }))
        .pipe(gulp.dest(pkg.paths.clientstage));
});

/**
 *  Minify and bundle the app's JavaScript
 */
gulp.task('js', ['templatecache', 'stage-settings'], function() {
    log('Bundling, minifying, and copying the app\'s JavaScript');

    var source = [].concat(pkg.paths.js, pkg.paths.clientstage + 'templates.js', pkg.paths.clientstage + 'constants.js');
    return gulp
        .src(source)
        .pipe(plug.sourcemaps.init()) // get screwed up in the file rev process
        .pipe(plug.concat('all.min.js'))
        .pipe(plug.ngAnnotate({add: true, single_quotes: true}))
        .pipe(plug.bytediff.start())
        .pipe(plug.uglify({mangle: true}))
        .pipe(plug.bytediff.stop(common.bytediffFormatter))
        .pipe(plug.sourcemaps.write('./'))
        .pipe(gulp.dest(pkg.paths.clientstage));
});

/**
 *  Copy the Vendor JavaScript
 */
gulp.task('vendorjs', function() {
    log('Bundling, minifying, and copying the Vendor JavaScript');
    return gulp.src(pkg.paths.vendorjs)
        .pipe(plug.concat('vendor.min.js'))
        .pipe(plug.bytediff.start())
        .pipe(plug.uglify())
        .pipe(plug.bytediff.stop(common.bytediffFormatter))
        .pipe(gulp.dest(pkg.paths.clientstage)); // + 'vendor'));
});

/**
 *  Minify and bundle the CSS
 */
gulp.task('css', function() {
    log('Bundling, minifying, and copying the app\'s CSS');
    return gulp.src(pkg.paths.css)
        .pipe(plug.concat('all.min.css')) // Before bytediff or after
        .pipe(plug.autoprefixer('last 2 version', '> 5%'))
        .pipe(plug.bytediff.start())
        .pipe(plug.minifyCss({}))
        .pipe(plug.bytediff.stop(common.bytediffFormatter))
//        .pipe(plug.concat('all.min.css')) // Before bytediff or after
        .pipe(gulp.dest(pkg.paths.clientstage + 'content'));
});

/**
 *  Minify and bundle the Vendor CSS
 */
gulp.task('vendorcss', function() {
    log('Compressing, bundling, copying vendor CSS');
    return gulp.src(pkg.paths.vendorcss)
        .pipe(plug.concat('vendor.min.css'))
        .pipe(plug.bytediff.start())
        .pipe(plug.minifyCss({}))
        .pipe(plug.bytediff.stop(common.bytediffFormatter))
        .pipe(gulp.dest(pkg.paths.clientstage + 'content'));
});

/**
 *  Copy fonts
 */
gulp.task('fonts', function() {
    var dest = pkg.paths.clientstage + 'fonts';
    log('Copying fonts');
    return gulp
        .src(pkg.paths.fonts)
        .pipe(gulp.dest(dest));
});

/**
 *  Compress images
 */
gulp.task('images', function() {
    var dest = pkg.paths.clientstage + 'content/images';
    log('Compressing, caching, and copying images');
    return gulp
        .src(pkg.paths.images)
        .pipe(plug.cache(plug.imagemin({optimizationLevel: 3})))
        .pipe(gulp.dest(dest));
});

/**
 *  Inject all the files into the new index.html
 */
gulp.task('inject',
    ['js', 'vendorjs', 'css', 'vendorcss'], function() {
        log('Injecting files and building index.html');

        var minified = pkg.paths.clientstage + '**/*.min.*';
        var index = pkg.paths.client + 'index.html';
        var minFilter = plug.filter(['**/*.min.*', '!**/*.map']);
        var indexFilter = plug.filter(['index.html']);

        var stream = gulp
            // Write the revisioned files
            .src([].concat(minified, index))    // add all staged min files and index.html
            .pipe(minFilter)                    // filter the stream to minified css and js
            .pipe(gulp.dest(pkg.paths.clientstage))   // write the rev files
            .pipe(minFilter.restore())          // remove filter, back to original stream

            // inject the files into index.html
            .pipe(indexFilter)                  // filter to index.html
            .pipe(inject('content/vendor.min.css', 'inject-vendor'))
            .pipe(inject('content/all.min.css'))
            .pipe(inject('vendor.min.js', 'inject-vendor'))
            .pipe(inject('all.min.js'))
            .pipe(gulp.dest(pkg.paths.clientstage)) // write the files
            .pipe(indexFilter.restore())        // remove filter, back to original stream

            // replace the files referenced in index.html with the rev'd files
            .pipe(gulp.dest(pkg.paths.clientstage)) // write the index.html file changes

        function inject(path, name) {
            var glob = pkg.paths.clientstage + path;
            var options = {
                ignorePath: pkg.paths.clientstage.substring(1),
                read: false
            };
            if (name) { options.name = name; }
            return plug.inject(gulp.src(glob), options);
        }
    });

/**
 *  Stage the server
 */
gulp.task('build-server', function(){
    log('Building Server');
    var dest = pkg.paths.stage;
    // Copy server code over
    gulp.src(['./src/server/**/*', '!./src/server/data/**'])
        .pipe(gulp.dest(dest));
    // Package.json is needed to load node modules
    gulp.src('package.json')
        .pipe(gulp.dest(dest));
    // Shell.html is needed to load client shell
    gulp.src(pkg.paths.client + './app/layout/shell.html')
        .pipe(gulp.dest(pkg.paths.clientstage + './app/layout/'));
});

/**
 *  Stage the optimized app
 */
gulp.task('stage',
    ['inject', 'images', 'fonts', 'build-server'], function() {
        log('Staging the optimized app');

        return gulp.src('').pipe(plug.notify({
            onLast: true,
            message: 'Deployed code to stage!'
        }));
    });

/**
 * Remove all files from the build folder
 * One way to run clean before all tasks is to run
 * from the cmd line: gulp clean && gulp stage
 */
gulp.task('clean', function() {
    var paths = pkg.paths.build;
    log('Cleaning: ' + plug.util.colors.blue(paths));

    //return gulp
    //    .src(paths, {read: false})
    //    .pipe(plug.rimraf({force: true}));
});

/**
 *  Watch files and build
 */
gulp.task('watch', function() {
    log('Watching all files');

    var css = ['gulpfile.js'].concat(pkg.paths.css, pkg.paths.vendorcss);
    var images = ['gulpfile.js'].concat(pkg.paths.images);
    var js = ['gulpfile.js'].concat(pkg.paths.js);
    // Watch JS changes
    gulp
        .watch(js, ['js', 'vendorjs'])
        .on('change', logWatch);
    // Watch CSS changes
    gulp
        .watch(css, ['css', 'vendorcss'])
        .on('change', logWatch);
    // Watch Image chnages
    gulp
        .watch(images, ['images'])
        .on('change', logWatch);

    function logWatch(event) {
        log('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
});

/**
 * serve the dev environment, with debug,
 * and with node inspector
 */
gulp.task('serve-dev-debug', function() {
    serve({mode: 'dev', debug: '--debug'});
    startLiveReload('development');
});

/**
 * serve the dev environment, with debug-brk,
 * and with node inspector
 */
gulp.task('serve-dev-debug-brk', function() {
    serve({mode: 'dev', debug: '--debug-brk'});
    startLiveReload('development');
});

/**
 * serve the dev environment
 */
gulp.task('serve-dev', function() {
    serve({mode: 'dev'});
    startLiveReload('development');
});

/**
 * serve the staging environment
 */
gulp.task('serve-stage', function() {
    serve({mode: 'stage'});
    startLiveReload('stage');
});

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
function startLiveReload(mode) {
    if (!env.liveReload) { return; }

    var path = (env === 'dev' ? [pkg.paths.client + '/**'] : [pkg.paths.clientstage, pkg.paths.client + '/**']);
    var options = {auto: true};
    plug.livereload.listen(options);
    gulp.watch(path)
        .on('change', function(file) {
            plug.livereload.changed(file.path);
        });

    log('Serving from ' + mode);
}

function serve(args) {
    var options = {
        script: (args.mode === 'dev' ? pkg.paths.server : pkg.paths.stage) + 'server.js',
        delayTime: 1,
        ext: 'html js',
        env: {'NODE_ENV': args.mode},
        watch: [
            'gulpfile.js',
            'package.json',
            pkg.paths.server,
            pkg.paths.client,
            pkg.paths.routes
        ]
    };

    if (args.debug) {
        gulp.src('', {read: false})
            .pipe(plug.shell(['node-inspector']));
        options.nodeArgs = [args.debug + '=5858'];
    }

    if(!!env.mongo) {
        log('Starting MongoDB');
        gulp.src('', {read: false})
            .pipe(plug.shell(['c:/mongo --config src/server/data/mongodb.config']));
    }

    return plug.nodemon(options)
        .on('restart', function() {
            log('restarted!');
        });
}

function runCommand(command){
    return function(cb){
        exec(command, function(err, stdout, stderr){
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
}

