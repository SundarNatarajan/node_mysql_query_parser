const node_config = {}
node_config.params_pattern = /\$.*?\}/gi

myApp.controller('homeController', ['$scope', '$http', '$filter','uiGridConstants', function ($scope, $http, $filter, uiGridConstants) {
    //npm dependencies
    const _ = require('lodash');
    const fs = require('fs');
    const path = require('path')
    const about = require(path.join(__dirname, 'node', 'about.js'))
    const cjson = require('cjson')
    // const jobPath = path.join(__dirname, 'jobs')

    $scope.models = {
        isClicked: false,
        isQuerySaveAction: false,
        isSaveJobClicked: false,    
        query: `Select * from Table  $P{Sundar} $P{mandatory} $P{filter}`,
        returnedParams: null,
        combinationPath: (path.join(__dirname, 'combinations.json')),
        currentQueryPath: path.join(__dirname, 'jobs'),
        jobName: ''
    }

    $scope.gridOptions = {
        enableColumnMenus: false,
        enableFiltering: true,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 10,
        columnDefs: [{ field: "column", cellClass: 'red', width: '50%', name: 'Column', enableCellEdit: false },
        {
            field: "type", width: '10%', name: 'Type', enableCellEdit: true,
            editableCellTemplate: 'ui-grid/dropdownEditor',
            filter: {
                term: null,
                type: uiGridConstants.filter.SELECT,
                selectOptions: [{ value: '3', label: 'null' }, { value: '1', label: 'string' }, { value: '2', label: 'number' }]
            },
            cellFilter: 'mapDataTypes', editDropdownValueLabel: 'dataTypes', editDropdownOptionsArray: [
                { id: 3, dataTypes: 'null' },
                { id: 1, dataTypes: 'string' },
                { id: 2, dataTypes: 'number' }                
            ]
        }, {
            field: "value", width: '30%', name: 'Value', enableCellEdit: true
        }, {
            field: "filterType", width: '10%', name: 'FilterType', enableCellEdit: true,
            filter: {
                term: null,
                type: uiGridConstants.filter.SELECT,
                selectOptions: [{ value: '1', label: 'filter' }, { value: '2', label: 'mandatory' }]
            },
            editableCellTemplate: 'ui-grid/dropdownEditor',
            cellFilter: 'mapType', editDropdownValueLabel: 'selection', editDropdownOptionsArray: [
                { id: 1, selection: 'filter' },
                { id: 2, selection: 'mandatory' }
            ]
        }]
    };

    $scope.parseParams = function (e) {
        // e.preventDefault();
        $scope.models.isClicked = true;
        if ($scope.models.query) {
            const query = $scope.models.query;

            const uniqueregex = _.uniq(query.match(node_config.params_pattern))
            $scope.gridOptions.data = arrayToObj(uniqueregex);
        }
        // $scope.gridOptions.data = $scope.parser($scope.models.query);
    }

    function arrayToObj(keys) {
        console.log(keys[0]);
        const formedObject = [];
        var keyVal = _.reduce(keys, function (formed, item) {
            //formed[item] = null
            formedObject.push({ column: item, value: null, type: 3, filterType: 1 })
            //return formed
        }, {});
        return formedObject;
    }

    function reform(keys) {
        const keyVal = _.reduce(keys, function (formed, item) {

            if (item.type == 2) //number
                formed[item.column] = item.value
            else if (item.type == 1) //string
                formed[item.column] = `'${item.value}'`
            else {
                formed[item.column] = null;
            }
            return formed
        }, {});
        return keyVal
    }

    function replacer(tpl, data) {
        var re = node_config.params_pattern, match;
        while (match = re.exec(tpl)) {
            tpl = tpl.replace(match[0], data[match[0]])
            re.lastIndex = 0;
        }
        return tpl;
    }

    $scope.getCombinations = function () {
        //const filteredData = $filter($scope.gridOptions.data)(filterType,'filter')
        const filteredData = $filter('filter')($scope.gridOptions.data, { filterType: 1 })
        const mandatoryFilters = $filter('filter')($scope.gridOptions.data, { filterType: 2 })
        //const combinatedFilters = about.getCombinations(filteredData, true)
        const combinatedFiltersDetails = about.getCombinations(filteredData)
        const defaultFilter = about.getCombinations(mandatoryFilters)
        var res = [];
        /*combinatedFilters.forEach(function (it) {
            res.push(it.concat(defaultFilter))
        })*/
        $scope.models.combinations = JSON.stringify({
            //filter: res,
            filter: combinatedFiltersDetails,
            mandatory: about.getCombinations(mandatoryFilters),
            limit: {
                min: 100,
                max: 100,
                range: 10
            },
            title: '',
            query: $scope.models.query
        })
    }

    $scope.updateQuery = function () {
        $scope.models.updatedQuery = '';
        const params = $scope.gridOptions.data;
        var reformedParam = reform(params);
        $scope.models.updatedQuery = replacer($scope.models.query, reformedParam)
    }

    $scope.saveCombination = function () {
        if ($scope.models.combinations) {
            console.log($scope.models.combinationPath)
            fs.readFile($scope.models.combinationPath, function (err, fileContents) {
                let res = []
                res = res.concat(fileContents)
                //const combinationsFormed = Array.isArray(fileContents) ? fileContents : [fileContents]

                res = res.concat([$scope.models.combinations])

                fs.writeFile($scope.models.combinationPath, res, function (er) {
                    if (err) {
                        $scope.models.error = err;
                        alert($scope.models.error);
                    } else {
                        $scope.models.success = 'Combination File Saved Successfully';
                    }
                })
            })
        }
    }

    $scope.saveQuery = function () {
        $scope.models.isQuerySaveAction = true;
        if ($scope.models.currentQueryPath && $scope.models.currentQueryFile && $scope.models.updatedQuery) {
            if (fs.existsSync($scope.models.currentQueryPath)) {
                fs.open(`${$scope.models.currentQueryPath}\\${$scope.models.currentQueryFile}.sql`, 'wx', (err, fd) => {
                    if (err) {
                        if (err.code === "EEXIST") {
                            $scope.models.error = `${$scope.models.currentQueryFile}.sql already exists`;
                            alert($scope.models.error);
                            return;
                        } else {
                            $scope.models.error = err;
                            alert($scope.models.error);
                        }
                    } else {
                        fs.writeFile(`${$scope.models.currentQueryPath}\\${$scope.models.currentQueryFile}.sql`, $scope.models.updatedQuery, function (er) {
                            if (err) {
                                $scope.models.error = err;
                                alert($scope.models.error);
                            } else {
                                alert(`${$scope.models.currentQueryPath}\\${$scope.models.currentQueryFile}.sql`)
                                $scope.models.success = 'File Saved Successfully';
                            }
                        })
                    }


                });

            } else {
                $scope.models.error = `Check the path:${$scope.models.currentQueryPath} exists are not `
                alert($scope.models.error);
            }
        }
    }

    $scope.saveJob = function () {
        $scope.models.isSaveJobClicked = true;
        if ($scope.models.combinations && $scope.models.jobName) {
            fs.readFile(`${models.currentQueryPath}\\${$scope.models.jobName}.json`, function (err, fileContents) {
                let jobDetails = null;
                if (err) {
                    jobDetails = []
                } else {
                    jobDetails = cjson.load(`${models.currentQueryPath}\\${$scope.models.jobName}.json`)
                }
                jobDetails.push(JSON.parse($scope.models.combinations))
                alert(`${models.currentQueryPath}\\${$scope.models.jobName}.json`)
                fs.writeFile(`${models.currentQueryPath}\\${$scope.models.jobName}.json`, JSON.stringify(jobDetails), function (er) {
                    if (!err) {
                        alert(`${models.currentQueryPath}\\${$scope.models.jobName}.json`);
                    }else{
                        alert(`Error: ${err}`);
                    }
                })
            })
        }
    }
    /*node functions*/
}]).filter('mapDataTypes', function () {
    var dataTypesHash = {
        3: 'null',
        1: 'string',
        2: 'number'
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return dataTypesHash[input];
        }
    };
}).filter('mapType', function () {
    var dataTypesHash = {
        1: 'filter',
        2: 'mandatory'
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return dataTypesHash[input];
        }
    };
})