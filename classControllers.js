(function () {
    'use strict';
    angular.module('editor.classControllers', ['editor.services']);


    ClassController.$inject = ['$route', 'countryCodeFactory', 'idFactory', 'definitionFactory', 'domainFactory', 'classFactory', 'featureFactory', 'nameFactory', 'SaveClass', 'alertFactory', 'SaveIdentifier', 'searchesByIdFactory', '$mdDialog', '$scope'];

    function ClassController($route, countryCodeFactory, idFactory, definitionFactory, domainFactory, classFactory, featureFactory, nameFactory, SaveClass, alertFactory, SaveIdentifier, searchesByIdFactory, $mdDialog, $scope){

        var self = this;
        self.countryCode = []; //Contry codes array
		self.alerts = []; //alerts
        self.ids = []; //Array which lodges all the Domain ids with the structure: [{'countryCode':'id'},...]
        self.definitions = []; //Array which lodges all the Domain definitions with the structure: [{'countryCode':'definition'},...]
        self.domains = [];
        self.features = [];
        self.listParents = [];
        self.objectsId = [];

        //Y de aqui no permitir que estas características de dentro del rango puedan ser borradas


        /* METHODS */

        /**
        * Save the whole domain in the database.
        *
        */
        self.save = function(){
			self.countryCode = countryCodeFactory.countryCode;
            self.ids = idFactory.list;
			self.domains = domainFactory.list;
            self.definitions = definitionFactory.list;
			self.listParents = classFactory.listOfIds;
			self.features = featureFactory.list;
			self.alerts = alertFactory.list;
            self.objectsId = idFactory.objects;
             if (self.ids.length === 0){
                console.log( 'The saving process has been cancelled. (Cause: id missing)' );
				alertFactory.add( 'alert-danger', $scope.translation.alerts.identifier_required);
            } else {
                var i = 0;
                var lackname = false;
                while((i < self.features.length) && (!lackname)){
                    if (self.features[i].ids.length === 0){
                        console.log( 'The saving process has been cancelled. (Cause: name missing)' );
				        alertFactory.add( 'alert-danger', $scope.translation.alerts.name_required);
                        lackname = true;
                    }
                    i++;
                }

                if (!lackname){
                    //save class
                    var object = {
                        ids: angular.copy(self.ids),
                        type: 'class',
                        domains: angular.copy(self.domains),
                        features: angular.copy(self.features),
                        definition: angular.copy(self.definitions),
                        id_parent: angular.copy(self.listParents),
                        list_individual: [],
                        id_Child: []
                    };
                    console.log(self.features);
                    SaveClass.save(object, function(resClass) {
                        if(resClass.errmsg === undefined) {
                            console.log('Created class');
                            alertFactory.add('alert-success', $scope.translation.alerts.class_success);
                            self.showSaveConfirm();
                            self.alerts = alertFactory.list;
                            self.idClass = resClass._id;

                            //Guarda los ids en la colección de ids
                            for (var i = 0; i < self.objectsId.length; i++){
                                self.objectsId[i].reference = resClass._id;

                                SaveIdentifier.save(self.objectsId[i], function(resId){
                                    if(resId.errmsg === undefined) {
                                        console.log('Created id');
                                    } else {
                                        alertFactory.add('alert-danger', $scope.translation.alerts.class_error);
                                        searchesByIdFactory.classById().delete({_id: self.idClass},function(res) {
                                            console.log(res);
                                        },function(error) {
                                            console.log(error);
                                            /*alertFactory.add('alert-danger','No se ha podido eliminar el elemento.');
                                            self.alerts = alertFactory.list;
                                            alertFactory.wipeList();*/
                                      });
                                    }
                                });

                            }
                            self.reset();

                        } else {
                            console.log(resClass.errmsg);
                            console.log(resClass);
                            alertFactory.add('alert-danger', $scope.translation.alerts.class_error);
                            self.alerts = alertFactory.list;
                        }

                    });
                }
            }
			//alertFactory.wipeList();
        };

        /*
		* Function to reset form of class
		*/
		self.reset = function(){
			console.log('RESET class view');
            idFactory.wipeData();
            definitionFactory.wipeData();
            domainFactory.wipeList();
            classFactory.wipeList();
            featureFactory.wipeList();
            nameFactory.wipeData();
            $route.reload();
		};

        self.showSaveConfirm = function(){
            var confirm = $mdDialog.alert()
                  .title( $scope.translation.showSaveConfirm.title )
                  .textContent($scope.translation.showSaveConfirm.textcontent)
                  .clickOutsideToClose(true)
                  .ariaLabel('Delete')
                  .ok($scope.translation.buttons.ok);
            $mdDialog.show(confirm);
        };
    }

    InnerClassController.$inject = ['classFactory', 'featureFactory', '$scope', 'measureUnits'];

    function InnerClassController(classFactory, featureFactory, $scope, measureUnits){
        var self = this;

        self.classes = classFactory.list;   //classes
        self.classesIds = classFactory.listOfIds; //classes ids
		self.features = featureFactory.list;   //features

		self.addNewClass = function(newclass){
            classFactory.add(newclass);

			for (var i= 0; i < newclass.features.length; i++){
                var j = 0;
                var found = false; // true if the feature is repeated
                while(( j < featureFactory.list.length) && (!found)){
                    if (featureFactory.list[j].feature_id === newclass.features[i].feature_id){
                        found = true;
                    }
                    j++;
                }
                if (!found){
				    featureFactory.add(newclass.features[i]);
                    //Units within containers
                    if (newclass.features[i].feature_type === 'feature_container'){
                        for(var j = 0; j < newclass.features[i].value.length; j++){
                            if (newclass.features[i].value[j].feature_type === 'feature_quantifying'){
                                var idUnit = newclass.features[i].value[j].value[0].unit_measure;
                                if (!measureUnits.isIdRepeated(idUnit)){
                                    measureUnits.add(idUnit);
                                }
                            }
                        }
                    }
                }
			}

        };

        /*
        * Function saveClass
        */
        self.saveClass = function(newclass){
            //Check if the language is already in the array
            var isClassRepeated = classFactory.isClassRepeated(newclass);
            if (isClassRepeated === true){
                alertFactory.add('alert-danger', $scope.translation.alerts.class_asigned);
                console.log('The saving process has been cancelled. (Cause: repeated class)');
            } else {
                self.addNewClass(newclass);
                console.log(classFactory.list);
                console.log('The new class has been saved in the array succesfully!');
            }
        };

		/*
        * Function moveDownClass
        */
		self.moveDownClass = function(index){
            if (index < self.classes.length-1){
                self.classes[index] =  self.classes.splice(index+1, 1, self.classes[index])[0];
                self.classesIds[index] =  self.classesIds.splice(index+1, 1, self.classesIds[index])[0];
            }
        };
		/*
        * Function moveUpClass
        */
        self.moveUpClass = function(index){
            if (index > 0){
                self.classes[index] =  self.classes.splice(index-1, 1, self.classes[index])[0];
                self.classesIds[index] =  self.classesIds.splice(index-1, 1, self.classesIds[index])[0];
            }
        };
    }


    angular.module('editor.classControllers')
        .controller('ClassController', ClassController)
        .controller('InnerClassController', InnerClassController);


})();
