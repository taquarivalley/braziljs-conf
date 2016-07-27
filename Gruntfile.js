/* jshint node:true */
'use strict';

module.exports = function( grunt ) {
	
	// auto load grunt tasks
	require( 'load-grunt-tasks' )( grunt );

	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		
		// watch for changes for files and execute an execute a task
		watch: {
			livereload: {
				files: 'dist/**/*',
				options: {
					livereload: true
				}
			}
		},

		// create a static webserver
		connect: {
			server: {
				options: {
					base: 'dist',
					open: true,
					keepalive: true
				}
			}
		}
	});
};
