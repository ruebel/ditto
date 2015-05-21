(function(){
    'use strict';

    angular
        .module('app.login')
        .service('loginModal', loginModal);

    loginModal.$inject = ['$mdDialog', '$rootScope'];

    function loginModal($mdDialog, $rootScope){

        var service = {
          createModal: createModal
        };

        return service;

        ////////////

        function assignCurrentUser(user){
            $rootScope.currentUser = user;
            return user;
        }

        function createModal(){
            return $mdDialog.show({
                templateUrl: 'app/login/login.html',
                controller: 'Login',
                controllerAs: 'vm'
            })
                .then(assignCurrentUser);
        }
    }
})();