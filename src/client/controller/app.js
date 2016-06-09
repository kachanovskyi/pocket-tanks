var app = angular.module('app', ['ui.bootstrap']);

app.controller('manageProfileController', ($scope, $uibModal, profileService) => {
    $scope.emailStatus = true;
    $scope.user = {
        name: "",
        age: "",
        password: "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    };

    let init = function () {
        //todo delete hardcode
        profileService.getProfileById("hw").then(function (resp) {
            $scope.user.name = resp.data.name;
        });
    };

    init();

    $scope.saveChanges = (user) => {

        if (user.newPassword === user.confirmNewPassword) {
            let userInfo = {
                name: user.name,
                age: user.age,
                password: user.newPassword
            };
            profileService.update(userInfo);


        } else {
            console.log('ERROR')
        }

    };

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        let modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: './app/views/myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size

        });
        modalInstance.result.then(function(){
            profileService.deleteAccount();
        })

    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

});

app.service('profileService', function ($http) {
    this.update = function (userInfo) {
        //todo all changes to config
        $http.post('http://localhost:8080/update', userInfo)
            .then(function (res) {

            });
    };

    this.getProfileById = function (id) {//todo all changes to config
        return $http.get("http://localhost:8080/" + id);
    };
    this.deleteAccount = () => {
        //todo add delete router
        return  $http.delete('http://localhost:8080/update', userInfo);


    }
});
app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
app.controller('LoginSubmitController', ['$scope', function($scope) {

    $scope.register = function() {
        $scope.message = 'You logged successfully';
    }

}]);
var directiveId = 'ngMatch';
app.directive(directiveId, ['$parse', function ($parse) {

    var directive = {
        link: link,
        restrict: 'A',
        require: '?ngModel'
    };
    return directive;

    function link(scope, elem, attrs, ctrl) {
// if ngModel is not defined, we don't need to do anything
        if (!ctrl) return;
        if (!attrs[directiveId]) return;

        var firstPassword = $parse(attrs[directiveId]);

        var validator = function (value) {
            var temp = firstPassword(scope),
                v = value === temp;
            ctrl.$setValidity('match', v);
            return value;
        }

        ctrl.$parsers.unshift(validator);
        ctrl.$formatters.push(validator);
        attrs.$observe(directiveId, function () {
            validator(ctrl.$viewValue);
        });

    }
}]);


