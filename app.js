var myApp = angular.module('myApp', ['ui.router', 'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.pagination']);

myApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    myApp.stateProvider = $stateProvider

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/home',
            templateUrl: './partials/home.html',
            controller: 'homeController'
        })

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            url: '/about',
            templateUrl: './partials/about.html',
            controller: 'aboutController'
        });

    $stateProvider.state('unsubscribe', {
        resolve: {
            loadFiles: ['$q', '$rootScope', '$timeout', function ($q, $rootScope, $timeout) {
                currentRenderingID = (new Date().getTime()).toString();

                lastLoadedFilePaths = [];
                var filePaths = [
                    '/widgets/unsubscribe/scripts/controller.js',
                    '/widgets/unsubscribe/css/style.css'
                ];
                return loadFiles($q, $rootScope, $timeout, filePaths);
            }],
            controllerConfig: function () {
                return {
                    dataAdapterSettings: {
                        unsubscribe: {
                            name: 'emailBlast.unSubscribeUser',
                            endpoint: 'emailBlast/unSubscribeUser',
                            disableCache: true
                        }
                    }
                };
            }
        },
        url: '/unsubscribe',
        templateUrl: '/widgets/unsubscribe/templates/template.html',
        controller: 'unsubscribeCtrl',
        authenticate: false
    });

    //$stateProvider.state(name, state);
});

