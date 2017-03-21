myApp.controller('encryptionController', ['$scope', '$http', function ($scope, $http) {

    const path = require('path')
    const encryption = require(path.join(__dirname, 'node', 'EncryptionService.js'))

    $scope.models = {
        encryptedText: null,
        clearText: null
    }
    $scope.getEncryptedText = function () {
        $scope.models.encryptedText = encryption.encrypt($scope.models.clearText)
    }
    $scope.getClearText = function () {
        $scope.models.clearText = encryption.decrypt($scope.models.encryptedText)
    }
}])