module.exports = function (grunt) {

    grunt.initConfig({
        // Import package manifest
        pkg: grunt.file.readJSON("miss.js.json"),
        // Banner definitions
        meta: {
            banner: "/*\n" +
                " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
                " *  <%= pkg.description %>\n" +
                " *  <%= pkg.homepage %>\n" +
                " *\n" +
                " *  Made by <%= pkg.author.name %>\n" +
                " *  Under <%= pkg.licenses[0].type %> License\n" +
                " */\n"
        },

        // Concat definitions
        concat: {
            dist: {
                src: ["src/miss.coffee"],
                dest: "dist/miss.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },
        // Lint definitions
        jshint: {
            files: ["dist/miss.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        // Minify definitions
        uglify: {
            my_target: {
                src: ["dist/miss.js"],
                dest: "dist/miss.min.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },
        // Watchers
        watch: {
            coffee: {
                files: ["src/miss.coffee"],
                tasks: ["coffee:compile"]
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },
        // CoffeeScript compilation
        coffee: {
            compile: {
                files: {
                    "dist/miss.js" : "src/miss.coffee"
                }
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },
        // Codo documentation
        codo: {
            options: {
                title: "Miss.js",
                output: "doc",
                inputs: ["src/miss.coffee"]
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-codo");
    grunt.registerTask("default", ["coffee", "jshint", "uglify", "codo"]);
    grunt.registerTask("travis", ["jshint"]);

};
