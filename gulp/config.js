// @file config.js
var path = require('path');
var babel = require('babel-core/register');

var src = './src';
var dest = './build';
var docs = './docs';

var relativeSrcPath = path.relative('.', src);

module.exports = {
  dest: dest,

  js: {
    src: [
      src + '/js/**',
      'modules/DH3DLibrary/src/js/**',
    ],
    dest: dest + '/js',
    uglify: false
  },

  esdoc: {
    destination: docs
  },

  eslint: {
    src: [
      src + '/js/**',
      './test/**/*.js',
      '!' + src + '/js/third_party/*.js',
      '!' + src + '/js/etc/*.js'
    ],
    opts: {
      useEslintrc: true,
    }
  },

  webpack: {
    entry: src + '/js/app.js',
    output: {
      filename: 'IQRevenge.js',
      library: 'IQRevenge',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['', '.js']
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }
      ]
    }
  },

  mocha: {
    src: ['test/**/*.js', 'src/**/*.js'],
    compilers: {
      js: babel
    },
    opts: {
      ui: 'bdd',
      reporter: 'spec', // or nyan
      globals: [],
      require: ['chai']
    }
  },

  copy: {
    src: [
      src + '/www/index.html',
      src + '/resources/**/*'
    ],
    dest: dest
  },

  clean: {
    src: [
      dest + '/**/*',
      docs + '/**/*',
      '!**/.git'
    ]
  },

  stylus: {
    src: [
      src + '/styl/**/!(_)*'
    ],
    dest: dest + '/css/',
    output: 'iq.css',
    autoprefixer: {
      browsers: ['last 2 versions']
    },
    minify: false
  },

  watch: {
    js:   relativeSrcPath + '/js/**',
    styl: relativeSrcPath + '/styl/**',
    www:  relativeSrcPath + '/www/index.html'
  },

  webserver: {
    src: 'build',
    webserver: {
      host: 'localhost',
      port: 8000,
      livereload: true,
      open: true
    }
  },

  karma: {
    configFile: __dirname + '/../karma.conf.js',
    singleRun: true
  }
}

