(function(){

	'use strict';
	angular.module('veborEditor', ['ngMaterial', 'ngRoute',  'ngSanitize', '...' , 'editor.translationService', 'ui.bootstrap', 'ui.router']);

    config.$inject = ['$locationProvider', '$routeProvider', '$qProvider', '$compileProvider', '$httpProvider', '$stateProvider', '$urlRouterProvider'];

    /**
    * Configuration Block:
    * $locationProvider: to configure how the application deep linking paths are stored.
    *             - enabled – {boolean} – (default: false) If true, will rely on history.pushState to change urls where supported. Will fall back to hash-prefixed paths in browsers that do not support pushState.
    *             - requireBase - {boolean} - (default: true) When html5Mode is enabled, specifies whether or not a tag is required to be present. If enabled and requireBase are true, and a base tag is not present, an error will be thrown when $location is injected.
    *             - rewriteLinks - {boolean|string} - (default: true) When html5Mode is enabled, enables/disables URL rewriting for relative links. If set to a string, URL rewriting will only happen on links with an attribute that matches the given string. For example, if set to 'internal-link', then the URL will only be rewritten for <a internal-link> links. Note that attribute name normalization does not apply here, so 'internalLink' will not match 'internal-link'
    * $routeProvider: used for configuring routes.
    *             - when (path, route); Adds a new route definition to the $route service.
    * $qProvider: Retrieves or overrides whether to generate an error when a rejected promise is not handled. This feature is enabled by default.
    * $compileProvider: Register a new directive with the compiler. (Improves the performance in production.)
    * $httpProvider: used to change the default behavior of the $http service.
    *             - Configure $http service to combine processing of multiple http responses received at around the same time via $rootScope.$applyAsync.
    */
    function config ($locationProvider, $routeProvider, $qProvider, $compileProvider, $httpProvider, $stateProvider, $urlRouterProvider){

        $httpProvider.useApplyAsync(true);

        $compileProvider.debugInfoEnabled(false);
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $qProvider.errorOnUnhandledRejections(false);

        $urlRouterProvider.otherwise('/home');
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'home.html'
            })
            .state('createdomain', {
                url: '/createdomain',
                templateUrl: 'domains/domain-create.html',
                controller: 'DomainController',
                controllerAs: 'VDomainCtrl'
            })
            .state('createclass', {
                url: '/createclass',
                templateUrl: 'classes/class-create.html',
                controller: 'ClassController',
                controllerAs: 'VClassCtrl'
            })
            .state('createindividual', {
                url: '/createindividual',
                templateUrl: 'individuals/individual-create.html',
                controller: 'IndividualController',
                controllerAs: 'VIndividualCtrl'
            })
            .state('createfeature', {
                url: '/createfeature',
                templateUrl: 'features/feature-create.html',
                controller: 'FeatureController',
                controllerAs: 'VFeatureCtrl'
            })
            .state('listing.editdomain', {
                url: '/editdomain',
                templateUrl: 'domains/domain-edit.html'
            })
            .state('listing.editclass', {
                url: '/editclass',
                templateUrl: 'classes/class-edit.html'
            })
            
            .state('Modal', {
                views:{
                  'modal': {
                    templateUrl: 'views/editDataModal.html'
                  }
                },
                abstract: true
            })
            .state('editindividual', {
                url: '/editindividual',
                onEnter: ['$stateParams', '$state', '$modal', '$resource', function($stateParams, $state, $modal, $resource) {
                    $modal.open({
                        templateUrl: 'items/add',
                        resolve: {
                          item: function() {  }
                        },
                        controller: ['$scope', 'item', function($scope, item) {
                          $scope.dismiss = function() {
                            $scope.$dismiss();
                          };

                          $scope.save = function() {
                            item.update().then(function() {
                              $scope.$close(true);
                            });
                          };
                        }]
                    }).result.finally(function() {
                        $state.go('^');
                    });
                }]
            })
        
            .state('listing.editfeature', {
                url: '/editfeature',
                templateUrl: 'features/feature-edit.html'    
            })
            .state('listing', {
                url: '/listing',
                templateUrl: 'listing.html'     
            })
            .state('userhelp', {
                url: '/help',
                templateUrl: 'help/user-help-es.html'    
            });

	}

    run.$inject = ['$rootScope', 'measureUnits', 'translationService'];
    /**
    * Run Block:
    * 1. Gets unit measures
    * 2. Sets the translation service
    *
    */
    function run ($rootScope, measureUnits, translationService){
        measureUnits.loadAllUnits();
        $rootScope.unitsGlobalList = measureUnits.list;

        translationService.getSpanishTranslation($rootScope);
        
        $rootScope.menuOptions = [
            {name: 'domain', route: 'createdomain', url: 'domains/domain-create.html'},
            {name: 'class', route: 'createclass', url: 'classes/class-create.html'},
            {name: 'individual', route: 'createindividual', url: 'individuals/individual-create.html'},
            {name: 'feature', route: 'createfeature', url: 'features/feature-create.html'}
        ];
    }

    angular
        .module('veborEditor')
        .config(config)
        .run(run);
})();
