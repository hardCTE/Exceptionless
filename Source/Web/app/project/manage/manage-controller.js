(function () {
    'use strict';

    angular.module('app.project')
        .controller('Manage', ['$state', '$stateParams', 'projectService', 'tokenService', 'webHookService', 'notificationService', 'featureService', 'dialogs', 'dialogService', function ($state, $stateParams, projectService, tokenService, webHookService, notificationService, featureService, dialogs, dialogService) {
            var projectId = $stateParams.id;
            var vm = this;

            function addConfiguration() {
                dialogs.create('/app/project/manage/add-configuration-dialog.tpl.html', 'AddConfigurationDialog as vm').result.then(function(data) {
                    function onSuccess(response) {
                        vm.config.push(response.data);
                        notificationService.success('Successfully added the configuration setting.');
                    }

                    function onFailure() {
                        notificationService.error('An error occurred while saving the configuration setting.');
                    }

                    return projectService.setConfig(projectId, data.key, data.value).then(onSuccess, onFailure);
                });
            }

            function addToken(){
                function onSuccess(response) {
                    vm.tokens.push(response.data);
                    notificationService.success('Successfully created a new API key.');
                }

                function onFailure() {
                    notificationService.error('An error occurred while creating a new API key for your project.');
                }

                var options = { organization_id: vm.project.organization_id, project_id: projectId };
                return tokenService.create(options).then(onSuccess, onFailure);
            }

            function addWebHook() {
                dialogs.create('/components/web-hook/add-web-hook-dialog.tpl.html', 'AddWebHookDialog as vm').result.then(function(data) {
                    function onSuccess(response) {
                        vm.webHooks.push(response.data);
                        notificationService.success('Successfully added the configuration setting.');
                    }

                    function onFailure() {
                        notificationService.error('An error occurred while saving the configuration setting.');
                    }

                    data.organization_id = vm.project.organization_id;
                    data.project_id = projectId;
                    return webHookService.create(data).then(onSuccess, onFailure);
                });
            }

            function get() {
                return projectService.getById(projectId)
                    .then(function (response) {
                        vm.project = response.data;
                    }, function() {
                        $state.go('app.dashboard');
                        notificationService.error('The project "' + $stateParams.id + '" could not be found.');
                    });
            }

            function getTokens() {
                return tokenService.getByProjectId(projectId)
                    .then(function (response) {
                        vm.tokens = response.data;
                    }, function() {
                        notificationService.error('An error occurred loading the api keys.');
                    });
            }

            function getConfiguration() {
                return projectService.getConfig(projectId)
                    .then(function (response) {
                        angular.forEach(response.data.settings, function(value, key){
                            if (key === '@@DataExclusions') {
                                vm.data_exclusions = value;
                            } else {
                                vm.config.push({key: key, value: value});
                            }
                        });
                    }, function() {
                        notificationService.error('An error occurred loading the notification settings.');
                    });
            }

            function getWebHooks() {
                return webHookService.getByProjectId(projectId)
                    .then(function (response) {
                        vm.webHooks = response.data;
                    }, function() {
                        notificationService.error('An error occurred loading the notification settings.');
                    });
            }

            function hasConfiguration(){
                return vm.config.length > 0;
            }

            function hasPremiumFeatures(){
                return featureService.hasPremium();
            }

            function hasTokens(){
                return vm.tokens.length > 0;
            }

            function hasWebHook() {
                return vm.webHooks.length > 0;
            }

            function removeToken(token){
                return dialogService.confirmDanger('Are you sure you want to remove the API key?', 'REMOVE API KEY').then(function() {
                    function onSuccess() {
                        vm.tokens.splice(vm.tokens.indexOf(token), 1);
                        notificationService.success('Successfully removed the API key.');
                    }

                    function onFailure() {
                        notificationService.error('An error occurred while trying to remove the API Key.');
                    }

                    return tokenService.remove(token.id).then(onSuccess, onFailure);
                });
            }

            function removeConfig(config){
                return dialogService.confirmDanger('Are you sure you want to remove this configuration setting?', 'REMOVE CONFIGURATION SETTING').then(function() {
                    function onSuccess() {
                        vm.config.splice(vm.config.indexOf(config), 1);
                        notificationService.success('Successfully removed the configuration setting.');
                    }

                    function onFailure() {
                        notificationService.error('An error occurred while trying to remove the configuration setting.');
                    }

                    return projectService.removeConfig(projectId, config.key).then(onSuccess, onFailure);
                });
            }

            function removeWebHook(hook){

            }

            function resetData() {
                return dialogService.confirmDanger('Are you sure you want to reset the data for this project?', 'RESET PROJECT DATA').then(function() {
                    function onSuccess() {
                        notificationService.success('Successfully reset project data.');
                    }

                    function onFailure() {
                        notificationService.error('An error occurred while resetting project data.');
                    }

                    return projectService.resetData(projectId).then(onSuccess, onFailure);
                });
            }

            function save(isValid) {
                if (!isValid){
                    return;
                }

                function onSuccess() {
                    notificationService.success('Successfully saved the project.');
                }

                function onFailure() {
                    notificationService.error('An error occurred while saving the project.');
                }

                return projectService.update(projectId, vm.project).then(onSuccess, onFailure);
            }

            function saveConfiguration() {
                function saveDataExclusion() {
                    if (vm.data_exclusions) {
                        return projectService.setConfig(projectId, '@@DataExclusions', vm.data_exclusions);
                    } else {
                        return projectService.removeConfig(projectId, '@@DataExclusions');
                    }
                }

                function saveDeleteBotDataEnabled(){
                    return projectService.save(projectId, { 'delete_bot_data_enabled': vm.project.delete_bot_data_enabled });
                }

                function onSuccess() {
                    notificationService.success('Successfully saved the project.');
                }

                function onFailure() {
                    notificationService.error('An error occurred while saving the project.');
                }

                return saveDataExclusion().then(saveDeleteBotDataEnabled, onFailure).then(onSuccess, onFailure);
            }

            vm.addToken = addToken;
            vm.addConfiguration = addConfiguration;
            vm.addWebHook = addWebHook;
            vm.config = [];
            vm.data_exclusions = null;
            vm.hasConfiguration = hasConfiguration;
            vm.hasPremiumFeatures = hasPremiumFeatures;
            vm.hasTokens = hasTokens;
            vm.hasWebHook = hasWebHook;
            vm.project = {};
            vm.removeConfig = removeConfig;
            vm.removeToken = removeToken;
            vm.removeWebHook = removeWebHook;
            vm.resetData = resetData;
            vm.save = save;
            vm.saveConfiguration = saveConfiguration;
            vm.tokens = [];
            vm.webHooks = [];

            get().then(getTokens).then(getConfiguration).then(getWebHooks);
        }
    ]);
}());