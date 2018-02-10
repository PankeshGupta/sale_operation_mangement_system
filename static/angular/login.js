console.log("login.js attached success")
var app = angular.module('myApp', ['ngCookies']);
app.controller('login', function($scope,$http,$window,$cookies) {
    $scope.gen_otp_text = 'Generate OTP'
    $scope.verify_otp_text = 'Verify OTP' 

    $("#phone").focus();

    $scope.otp_generated = false;
    $scope.email_error = false;
    $scope.otp_error = false;
    
    $scope.verify_user = function(valid){
        console.log($scope.user);
        var data = {'user_data':$scope.user,'type':'admin'}

        if (valid) {

        $scope.loading = true ; 
        $scope.gen_otp_text = 'generating otp ....'
        
        $http({
            method: 'POST',
            data:data,
            url: '/login/verify_username'
        }).then(function successCallback(response){
            $scope.loading = false;
            $scope.otp_generated = true;
            $scope.errors.email_error = undefined;
            $scope.email_error = undefined;
            
        },
        function errorCallback(response) {
            if (response.data.message != undefined){
                $scope.loading = false ; 
                $scope.gen_otp_text = 'Generate OTP'  
                         
                $scope.email_error = response.data.message ;
                console.log($scope.errors.email_error);    
            }

    
        });
        }
    }
    $scope.verify_otp = function(otp){
    	var data = {'user_data':$scope.user,'type':'admin'} 
        
        $scope.loading = true ;
        $scope.verify_otp_text = 'Verifying OTP ....'

        $http({
            method: 'POST',
            data:data,
            url: '/login/verify_otp'
        }).then(function successCallback(response)
        {

            $scope.user_name = response.data.user_name
            $scope.token = response.data.token
            $scope.user_id = response.data.user_id

            $cookies.put('user_name', $scope.user_name);
            $cookies.put('token', $scope.token);
            $cookies.put('user_id', $scope.user_id);
            $window.location.href = '/engineers';
        },
        function errorCallback(response)
        {
            console.log(response)
            $scope.otp_error = response.data.message
            $scope.loading = false ;
            $scope.verify_otp_text = 'Verify OTP'            

        }
        );
    }
    $scope.reset_phone = function(){
        $scope.otp_generated = false;
        $("#phone").focus();
        $scope.gen_otp_text = 'Generate OTP'
        $scope.verify_otp_text = 'Verify OTP'

        // $("#phone").select();
    }


});