myApp.controller('aboutController', ['$scope', '$http', function ($scope, $http) {

    const path = require('path')
    /*   const aboun = path.join(__dirname,'node','about.js')
     console.log(aboun)*/
    const about = require(path.join(__dirname, 'node', 'about.js'))
    $scope.aboutText = 'Hi Text from controller'

    $scope.models = {
        queryPath: '',
        isFetchAction: false,
        error: '',
        enableMaster: false,
        masterData: []
    }

    $scope.gridOptions = {
        enableColumnMenus: false,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 10,
        columnDefs: [{ field: "folder", cellClass: 'red', width: '30%', name: 'Folder', enableCellEdit: false },
        {
            field: "file", width: '30%', name: 'File Name', enableCellEdit: false
        }, {
            field: "isSelected", width: '30%', name: 'isSelected', enableCellEdit: true,
            editableCellTemplate: 'ui-grid/dropdownEditor',
            cellFilter: 'mapSelection', editDropdownValueLabel: 'selection', editDropdownOptionsArray: [
                { id: 1, selection: true },
                { id: 0, selection: false }
            ]
        }]
    };

    $scope.fetchQuery = function () {
        $scope.models.isFetchAction = true;
        if ($scope.models.queryPath) {
            about.fetchSqlfiles($scope.models.queryPath, (err, res) => {
                if (err) {
                    $scope.models.error = err;
                } else {
                    $scope.gridOptions.data = res;
                    $scope.models.enableMaster = true;
                }
            })
        }
    }

    $scope.addToMaster = function () {
        $scope.models.enableMaster = false;
        $scope.models.masterData = about.uniqBy(about.concat(JSON.parse(JSON.stringify($scope.models.masterData)), JSON.parse(JSON.stringify($scope.gridOptions.data))), function (e) {
            return `${e.folder}\\${e.file}`
        })
        $scope.gridOptions.data = JSON.parse(JSON.stringify($scope.models.masterData))
    }

    $scope.saveJob = function () {
        about.saveJob(JSON.stringify($scope.gridOptions.data))
    }

}]).filter('mapSelection', function () {
    var dataTypesHash = {
        1: true,
        0: false
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return dataTypesHash[input];
        }
    };
})