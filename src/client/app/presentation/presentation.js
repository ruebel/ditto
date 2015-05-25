(function(){
    'use strict';

    angular
        .module('app.presentation')
        .controller('Presentation', Presentation);

    Presentation.$inject = ['$scope', 'common', 'store'];

    function Presentation($scope, common, store){
        /*jshint validthis: true */
        var vm = this;
        var constants = common.constants;
        var logger = common.logger;

        vm.mode = '';

        activate();

        ////////////////////

        function activate(){
            vm.mode = store.get('userMode');

            $scope.$on(constants.socketPrefix + constants.socketEvents.message, function(event, data){
                logger.info('Message received: ' + data.payload);
            });
        }
    }
})();