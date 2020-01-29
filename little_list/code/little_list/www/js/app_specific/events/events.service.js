(function () {
    'use strict';

    angular
        .module('eventsjs')
        .factory('eventsSrvc', eventsSrvc);

        eventsSrvc.$inject = [
            '$q', // promises service
            '$timeout', // timeout service
            'moment' // does dates really well
        ];

    function eventsSrvc(
        $q,
        $timeout,
        moment
    ) {
        var eventsArray = [];
        var service = {
            
        };
        var isScanning = false;
        var TIMEOUT_MS = 10000;


        function startScan(){
            var deferred = $q.defer();
            isScanning = true;

            $timeout(
                function(){
                    stopScan();
                    deferred.resolve();
                }
            ,TIMEOUT_MS);
            
            ble.startScan(
                [],
                function(device){
                    eventsArray.push({
                        id: device.id,
                        name: device.name
                    });
                },
                function(error){
                    console.log("BLE: error " + JSON.stringify(error,null,2) );
                    deferred.reject(error);
                    
                }
            );

            return deferred.promise;
        }

        function stopScan(){
            if(isScanning){
                isScanning = false;
                ble.stopScan();
            }

        }

        function asyncScan(){
            var deferred = $q.defer();

            if(!isScanning){
                startScan().then(
                    function(){
                        deferred.resolve();
                    },
                    function(){
                        deferred.reject();
                    }
                );
            }else{
                $timeout(function(){
                    deferred.resolve();
                });
            }

            return deferred.promise;
        }


        service.updateEvents = function(){
            return asyncScan(); 
        } 

        function getNames(eventsArray){
            var result = [];
            eventsArray.forEach(function (event){
                result.push(event.id);
            });
            return result;
        }


        service.getEvents = function(){
            return getNames(eventsArray);
        }

        service.getNumEvents = function(){
            return eventsArray.length;
        }

        service.getEventAt = function(index){
            return angular.copy(eventsArray[index]);
        }


        return service;

    }

    
})();