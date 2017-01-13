var myApp = angular.module('myApp', ['ui.router','ui.grid', 'ui.grid.edit', 'ui.grid.pagination']);

myApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/home',
            templateUrl: './partials/home.html',
            controller :'homeController'
        })
        
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            url: '/about',
            templateUrl: './partials/about.html',
            controller :'aboutController'
        });
});

