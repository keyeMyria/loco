module.exports = function (grunt) {
    "use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		htmlmin: {
		    main: {
		        files: [{
			        expand: true,
			        src: ['templates/*.html', 'static/js/**/*.html', 'static/layouts/**/*.html'],
			        dest: "."
		        }]
		    }
		},

		clean: [ 'static/build', '.tmp', '.htmlminTmp'],
		copy: {
			preusemin:{
				files: [
					{
						expand: true,
						cwd: './static/build/static/build',
						src: '*',
						dest: './static/build'
					},
					{
						expand: true,
						src: 'templates/*.html',
						dest: '.tmp'
					},
				],
			},
			prehtmlmin:{
				files: [{
						expand: true,
						src: ['templates/*.html', 'static/js/**/*.html', 'static/layouts/**/*.html'],
						dest: '.htmlminTmp'
					}]
			},
			cleanBuild: {
				files: [{
					src: '.tmp/*.html',
					dest: 'templates/'},
					{
						expand: true,
						cwd: '.htmlminTmp',
						src: '**',
						dest: '.'}]
			}
		},
		useminPrepare: {
			html: 'templates/*.html',
            options: {
                root: '.',
                dest: '.'
            }
		},

		imagemin: {
		    dynamic: {
		      files: [{
		        expand: true,
		        src: ['static/images/**/*.{png,jpg,gif}'],
		      }]
		    }
		 },
		 filerev: {
		    options: {
		      algorithm: 'md5',
		      length: 8
		    },
		    files: {
		      src: [
			      'static/build/*.js',
			      'static/build/*.css',
			    ]
		    }
	   },

		usemin: {
			html: ['templates/*.html'],
			css: ['static/build/{,*/}*.css', 'static/build/*.css', 'static/build/'],
			options: {
		        assetsDirs: ['.']
		    }
		},

		'string-replace': {
  			inline: {
			    files: {
			      'templates/': 'templates/*.html',
			    },
		    options: {
				replacements: [
		        {
					pattern: /\/static\/build\/(.*[^\"])/,
					replacement: 'https://d1qp59yxlq7zhd.cloudfront.net/static/build/$1'
		        }
		      ]
		    }
		  }
		}
	});

    // require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('validate', ["jshint"]);

    grunt.registerTask('build', [
    	'copy:prehtmlmin',
	    'useminPrepare',
	    'concat:generated',
	    'cssmin:generated',
	    'copy:preusemin',
	    'filerev',
	    'usemin',
	]);

	grunt.registerTask('cleanBuild', ['copy:cleanBuild', 'clean']);
};