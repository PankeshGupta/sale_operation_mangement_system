
angular.module('SharedServices', [])
    .config(function ($httpProvider) {
        $httpProvider.responseInterceptors.push('myHttpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            // todo start the spinner here
            //alert('start spinner');
            $('#mydiv').show();
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    })
// register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('myHttpInterceptor', function ($q, $window) {
        return function (promise) {
            return promise.then(function (response) {
                // do something on success
                // todo hide the spinner
                //alert('stop spinner');
                $('#mydiv').hide();
                return response;

            }, function (response) {
                // do something on error
                // todo hide the spinner
                //alert('stop spinner');
                $('#mydiv').hide();
                return $q.reject(response);
            });
        };
    });




var app = angular.module('sna_oms', ['ngCookies']);

console.log('engineer. js connected');

app.controller('engineersController', function($scope,$http,$cookies,$window,$timeout) {
$scope.loader = true ;
$scope.engineer_id = 0;
$scope.snackbar = false ;
$scope.user_name = $cookies.get('user_name');
$scope.is_edit  = null  ;
console.log($scope.user_name);

$scope.form_view = false ;
$scope.filtered_engineer_list= []

$scope.toggle_loader = function(status){
    $scope.loader = status ;

}



$scope.toggle_engineer_form_view = function(view_status){
    $scope.form_view = view_status ;
    console.log(view_status);
    console.log("inside toggel engineer form view ")
    // $scope.engineers_form.$submitted = false ;    

}
        
$scope.engineers_add_update = function(valid){
	
    console.log("inside submit");
     $scope.engineers_form.$submitted= true;

	if (valid) {
		var engineer_data = {'name': $scope.engineer_name, 'phone': $scope.engineer_phone,"engineer_id": $scope.engineer_id}

        $scope.form_status_message = "Loading ....."
        $scope.snackbar = true;

		$http({
            method: 'POST',
            data: engineer_data,
            url: '/engineer/add/edit'
        }).then(function successCallback(response){
          	if($scope.engineer_id == 0){
                
                //alert("Engineer added sucessfully");
                $("#btn_close").click();
                $scope.get_engineer_list();
                $scope.form_status_message = "Engineer added sucessfully ....."
                $scope.snackbar = true;
                
                $timeout( function(){
                    console.log('inside timeout function')
                    $scope.snackbar = false;
                    $scope.snackbar = undefined;
                }, 2500 );

                }
            else{
                //alert("Engineer Updated sucessfully");
                $scope.engineer_id = 0;
                $scope.engineer_name = ""
                $scope.engineer_phone = ""
                $scope.engineers_form.$submitted= false;
            
                $scope.get_engineer_list();
                
                $scope.form_status_message = "Engineer Updated sucessfully ....."
                $scope.snackbar = true;
                $("#btn_close").click()
                 
                $timeout( function(){
                    console.log('inside timeout function')
                    $scope.snackbar = false;
                }, 2500 );

                
            }

        },
        function errorCallback(response) {
            console.log(response)
            $scope.add_form_error = response.data.message ;
            $scope.form_status_message = "Error adding engineer ...."
            $scope.snackbar = true;
            $timeout( function(){
                    console.log('Error adding engineer ..')
                    $scope.snackbar = false;
                }, 2500 );

        });
		
	}

}
$scope.get_engineer_list = function(){
	console.log("get engineer list ");
	var data = {"offset" : 0 }
	$http({
            method: 'POST',
            data: data,
            url: '/engineer/list_all'
        }).then(function successCallback(response){
          	$scope.engineer_list = response.data.engineers
          	console.log($scope.engineer_list)     
        },
        function errorCallback(response) {
            console.log(response)

        });


}

$scope.edit_engineer_info = function(engineer){
    $scope.toggle_edit(true)
    // $scope.toggle_engineer_form_view(true)
    $scope.engineer_name = engineer.name
    $scope.engineer_phone = engineer.phone
    $scope.engineer_id = engineer.id           
}

$scope.logout = function(){
    
	$cookies.remove('user_name') ;
	$cookies.remove('user_id') ;
	$cookies.remove('token') ;
	$window.location.href = '/login';

}
$scope.task_search = function(){
    console.log($scope.task_search_text);
}

$scope.toggle_edit = function(value){
    $scope.is_edit = value ;
} 
$scope.add_engineer = function(){
    $scope.toggle_edit(false);
    $scope.engineer_id = 0;
    $scope.engineer_name = ""
    $scope.engineer_phone = ""
    $scope.engineers_form.$submitted= false;
    $scope.add_form_error = undefined ;

    // $scope.toggle_engineer_form_view(true) ;
}

$scope.engineer_status_deactivate = function(engineer,status){
    // alert('are u sure u want to deactivate engineer');
    $scope.deactivate_engineer = undefined;
    $scope.deactivate_engineer = engineer ;
    var data = {"engineer_id": engineer.id,"deactivate_status":status }
   
    $http({
            method: 'POST',
            data: data,
            url: '/engineer/deactivate_engineer'
        }).then(function successCallback(response){
            
            $scope.deactivate_engineer.tasks = response.data.tasks

            if ($scope.deactivate_engineer.tasks == undefined){
                $scope.deactivate_engineer.tasks = [];
            }
            if (status){


                $scope.form_status_message = response.data.message
                $scope.snackbar = true;
                $('#close').trigger('click');
                $scope.get_engineer_list();
                $timeout( function(){

                    console.log('inside timeout function')
                    $scope.snackbar = false;
                    $scope.snackbar = undefined;
                }, 2500 );
            
            }

            // $scope.get_engineer_list();
            


        },
        function errorCallback(response) {
            
        });
    
}


$scope.engineer_status= function(status,engineer){
    console.log("inside status change") ;
    console.log(engineer);
    var data ={"engineer_id": engineer.id,"is_active": status,"name":engineer.name,"phone":engineer.phone}
    $http({
            method: 'POST',
            data: data,
            url: '/engineer/add/edit'
        }).then(function successCallback(response){
            $scope.get_engineer_list();     
        },
        function errorCallback(response) {
            $scope.add_form_error = response.data.message ;
        });
}


    });