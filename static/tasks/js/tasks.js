
  $(document).ready(function(){
  // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal({complete: function() {
    var element = angular.element("#add_task");
    var controller = element.controller();
    var $scope = element.scope();

     //as this happends outside of angular you probably have to notify angular of the change by wrapping your function call in $apply
    $scope.$apply(function(){
      $scope.title         = ""
      $scope.description   = ""
      $scope.engineer      = ""
      $scope.markers           = [];
      $scope.task_id       = 0;
      $scope.address          = ""
      $(".highlight").removeClass("highlight");
      angular.element('.datepicker').val('')
    });

    var element1 = angular.element("#MainWrapper");
    var controller1 = element.controller();
    var $scope1 = element1.scope();


     //as this happends outside of angular you probably have to notify angular of the change by wrapping your function call in $apply
    $scope1.$apply(function(){
      if(!$scope1.is_open){
        $scope1.open_previous_sidebar()
      }
      else {
        $("#task_details").modal('open')
        $("#task_details").css('z-index','1011')
        $scope1.is_open = false;
      }
    });

     
   }});
  
  //$("select").select2();

  // $('.datepicker').pickadate({
  //   selectMonths: true, // Creates a dropdown to control month
  //   selectYears: 15, // Creates a dropdown of 15 years to control year,
  //   today: 'Today',
  //   clear: 'Clear',
  //   close: 'Ok',
  //   min: -1,
  //   dateFormat: 'yy-mm-dd',
  //   closeOnSelect: false // Close upon selecting a date,

  // });

  angular.element(".modal-overlay").trigger('click');
  

  //$('select').material_select();

  $('.timepicker').pickatime({
    default: 'now', // Set default time: 'now', '1:30AM', '16:30'
    fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
    twelvehour: false, // Use AM/PM or 24-hour format
    donetext: 'OK', // text for done-button
    cleartext: 'Clear', // text for clear-button
    canceltext: 'Cancel', // Text for cancel-button
    autoclose: false, // automatic close timepicker
    ampmclickable: true, // make AM PM clickable
    aftershow: function(){} //Function for after opening timepicker
  });

  var select2_backup = [];
  
});


  // var app = app || angular.module('myApp', ['ngMap','ngCookies', 'ngFileUpload', 'ngMaterial', 'ngSanitize']);

  // app.config(['$interpolateProvider', function($interpolateProvider) {
  //   $interpolateProvider.startSymbol('{*');
  //   $interpolateProvider.endSymbol('*}');
  // }]);
  var app = app || angular.module('myApp', [
    'angular-momentjs',
    'ngMap',
    'ngCookies', 
    'ngFileUpload', 
    'ngMaterial', 
    'ngSanitize'
  ]) // you're able to set Default settings
  
  app.config(function($momentProvider){
    $momentProvider.asyncLoading(false).scriptUrl('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min.js');
  });

  app.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{*');
    $interpolateProvider.endSymbol('*}');
  }]);



  app.directive("select2", function($timeout, $parse) {
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function(scope, element, attrs) {
        console.log(attrs);
        $timeout(function() {
          console.log(element)
          element.select2();
          element.select2Initialized = true;
        });

        var refreshSelect = function() {
          if (!element.select2Initialized) return;
          $timeout(function() {
            element.trigger('change');
          });
        };

        var recreateSelect = function () {
          if (!element.select2Initialized) return;
          $timeout(function() {
            element.select2('destroy');
            element.select2();
          });
        };

        scope.$watch(attrs.ngModel, refreshSelect);

        if (attrs.ngOptions) {
          var list = attrs.ngOptions.match(/ in ([^ ]*)/)[1];
        // watch for option list change
        scope.$watch(list, recreateSelect);
      }

      if (attrs.ngDisabled) {
        scope.$watch(attrs.ngDisabled, refreshSelect);
      }
    }
  };
});

  app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

  app.filter('reverse', function() {
  return function(items) {
    if(items){
      return items.slice().reverse();
    }
    
  };
});

  app.filter('newlines', function () {
    return function(text) {
      return text.replace(/\n/g, ' ');
    }
  })
  .filter('noHTML', function () {
    return function(text) {
      return text
      .replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;');
    }
  });

  // controller 1 starts here--------------------------------------------------------------------

  app.controller('MyCtrl', function(NgMap, Upload, $scope, $q, $rootScope, $timeout, $scope, $http,$cookies,$cookieStore,$window, $moment, $timeout) {



    $scope.task_side_view = false ;

    $scope.action_bar_view = false;
    $scope.task_list_view = true ;
    $scope.task_list_header_view = true;
    $scope.date_range_result = false;
    $scope.center_latitude = 30.7333;
    $scope.center_longitude = -76.7794;

    $scope.show_filter = false;

    var vm = this;
    $scope.url = "";
    $scope.user_name = $cookies.user_name;
    var user_id = $cookies.user_id ;
    vm.zoom = 8;

    $rootScope.$on("refresh_task_list", function(e, added_task){
      // $scope.get_tasks();
      if(added_task != -1){

        console.log(added_task)
        if ($scope.task_id != 0){
            var indexoftask = arrayObjectIndexOf($scope.tasks, added_task.id, 'id');
            $scope.tasks[indexoftask] = recent_task
        }
        else{
          $scope.tasks.push(recent_task)
        }
      }
      else{
        $scope.get_tasks();
      }
      vm.map.hideInfoWindow('foo-iw');
      $(".left-nav-container").addClass("activated");
    });

    var iw = new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 600});

    $scope.checkIfPast  =  function(date_schedule, task_status){
      
      if(date_schedule == undefined) return false;
      spilt_date = date_schedule.split("-");

      var now = new Date();
      var a = spilt_date['2']+"-"+spilt_date['1']+"-"+spilt_date[0] + " 23:59:59"
      var d = new Date(a);
      
      if (d < now && task_status != "verified") return true;
      return false; 
    }

  NgMap.getMap({id:"task_map"}).then(function(map) {
    vm.map = map;
    
 });

  $scope.show_filter_res = function(){
      $scope.show_filter = !$scope.show_filter ;
      if(!$scope.show_filter) {
        $scope.engineer_schedule_date = ''
        $scope.formatted_date = ''
      }

  }
  $scope.toggle_task_list_view = function(view_status){
    $scope.task_list_view = view_status ;
  }
  $scope.toggle_task_list_header_view = function(view_status){
    $scope.task_list_header_view = view_status ;
  } 
    
  $scope.toggle_task_view = function(task_side_view_status){
    console.log("inside toggle task view");
    console.log(task_side_view_status);

    $scope.task_side_view = task_side_view_status;

  }

  $scope.back_to_home = function(){
    $window.location.href = '/engineers';
  }
    
  $scope.logout = function(){
  console.log("logout hit") ;
  $cookieStore.remove('user_name') ;
  $cookieStore.remove('user_id', {path: '/tasks'}) ;
  $cookieStore.remove('token', {path: '/tasks'}) ;
  $window.location.href = '/login';

  }
  $scope.show_image_full_activate = function(image_id){
    $scope.full_image_id = image_id ;
    $scope.show_image_full = true;
  }
  $scope.show_image_full_close = function(image_id){
    console.log("----------- close button trigger -------------")
    // $scope.full_image_id = undefined
    $scope.show_image_full = false;
  }



  $scope.schedule_date_selected = ""

    $scope.task_status_action = function(task_detail, operation){

      $scope.current_id = task_detail.id
      $scope.schedule_date_selected = task_detail.schedule_date

      $scope.action_bar_view = !($scope.action_bar_view)

      if(!$scope.action_bar_view) { $scope.current_id = "";
        $scope.schedule_date_selected = ""
      }

      if($scope.action_bar_view) $scope.engineer_status_sidebar = 0;
      
      if(operation == "close") {
        $scope.engineer_status_sidebar = 1;
        $scope.engineer_list_all();
      }

      else if (task_detail.task_status == "unassigned"  && operation == "open" ){

        $scope.get_engineer_list_by_schedule_date(task_detail.schedule_date)

        if($scope.action_bar_view && operation == "open" ) $scope.engineer_status_sidebar = 0;


        $scope.engineer_list_all();
        // angular.element("#slide-out-engineer").show();

        // angular.element("#right_open").trigger('click');

        // angular.element("#slide-out-engineer").show();
      }


    }

    $scope.task_pending_open = 0

    $scope.task_status_action_status = function(task_detail){

      $scope.current_id = task_detail.id

      $scope.schedule_date_selected = task_detail.schedule_date
    
      if($scope.task_pending_open) $scope.task_pending_open=0
      else $scope.task_pending_open = 1

      if($scope.task_pending_open) $scope.engineer_status_sidebar = 0;
      
      $scope.get_engineer_list_by_schedule_date(task_detail.schedule_date)

      if($scope.action_bar_view) $scope.engineer_status_sidebar = 0;

      $scope.engineer_list_all();
      
      
    }


    $scope.current_selected_engineer = '';

    $scope.non_assign_task_engineer_side_nav = function(engineer_id, engineer_name, index, description, lattitude, longitude){
      $scope.task_search_text = engineer_name;
      $scope.current_selected_engineer = engineer_id;
      $scope.current_selected_engineer_name = engineer_name;
      
      angular.element(".engineer-card").removeClass('active_engineer');
      angular.element("#engineer_card"+index).addClass('active_engineer');

      vm.non_assign_task_engineer_side_nav_map_auto_click(engineer_id, engineer_name, index, description, lattitude, longitude)
  

      // $scope.selected_engineer_detail = description
      // angular.element(".engineer-card").removeClass('active_engineer');
      // angular.element("#engineer_card"+index).addClass('active_engineer');
      // $scope.engineer_list_all_select()
      // index = index+1
      // creating_id = "E"+(index.toString());
      // vm.map.showInfoWindow('engineer_list_window', creating_id);
    

      // $timeout( function(){
      //   $scope.center_latitude  = lattitude;
      //   $scope.center_longitude = longitude;
      //   vm.zoom = 22;
      // }, 1000);
    }



    $scope.task_status_sidebar = 0;
    $scope.activate_task = function(){
      if($scope.task_status_sidebar == 0) {
        $('#slide-out').removeClass("deactive-sides-task");
        $('#slide-out').addClass("active-sides-task");
        $scope.task_status_sidebar = 1;
        $scope.task_list_view = true ;
        $scope.task_list_header_view = true;
        $scope.date_range_result = false;
        $scope.date_range_selector = false ;
        // $scope.date_range = 'today';
        // $scope.get_tasks();
      }
      else {
        $('#slide-out').addClass("deactive-sides-task");
        $('#slide-out').removeClass("active-sides-task");
        $scope.task_status_sidebar = 0;
      }
    }

    $scope.engineer_status_sidebar = 0;
    $scope.engineer_list_all = function(){
      if($scope.engineer_status_sidebar == 0) {
        $('#slide-out-engineer').removeClass("deactive-sides-engineer");
        $('#slide-out-engineer').addClass("active-sides-engineer");
        $scope.engineer_status_sidebar = 1;
      }
      else {
        $('#slide-out-engineer').addClass("deactive-sides-engineer");
        $('#slide-out-engineer').addClass("active-sides-engineer");
        $scope.engineer_status_sidebar = 0;
      }
    }

    $scope.engineer_list_status_sidebar = 0;
    $scope.engineer_list_all_select = function(){

      if($scope.engineer_list_status_sidebar == 0) {
        $('#slide-out-engineer-list').removeClass("deactive-sides-engineer");
        $('#slide-out-engineer-list').addClass("active-sides-engineer");
        $scope.engineer_list_status_sidebar = 1;
        $("#add_task>div").css("right","320px");

      }
      else {
        $('#slide-out-engineer-list').addClass("deactive-sides-engineer");
        $('#slide-out-engineer-list').addClass("active-sides-engineer");
        $scope.engineer_list_status_sidebar = 0;
        $("#add_task>div").css("right","6vh");
      }
    }

    $scope.open_previous_sidebar = function(){

      if($scope.task_status_sidebar){
        $scope.task_status_sidebar = 0;
        $scope.activate_task();
      }

      if($scope.engineer_status_sidebar){
        $scope.engineer_status_sidebar = 0;
        $scope.engineer_list_all();
      }

      if($scope.engineer_list_status_sidebar){
        $scope.engineer_list_status_sidebar = 0;
        $scope.engineer_list_all_select();
      }

    }

    $scope.reset_engineer_selection = function(){

      if($scope.current_selected_engineer=='' && $scope.engineer_list_status_sidebar==0) return true
      $scope.engineer_list_all_select();
      $scope.task_search_text = "";
      $scope.current_selected_engineer = "";
      $scope.current_selected_engineer_name = "";
      angular.element(".engineer-card").removeClass('active_engineer');
    }

    $scope.assign_task_engineer_side_nav = function(engineer_id){
      $scope.input_json = {}
      $scope.input_json['task_id']     = $scope.current_id
      $scope.input_json['engineer_id'] = engineer_id
      $scope.input_json['task_status'] = "assigned"


      // var indexoftask = arrayObjectIndexOf($scope.engineer_schedule_list, engineer_id, 'id');
      // if(indexoftask!=-1) {
      //   $scope.engineer_schedule_list[indexoftask].tasks_info.todays_tasks = $scope.engineer_schedule_list[indexoftask].tasks_info.todays_tasks+1
      //   $scope.engineer_schedule_list[indexoftask].tasks_info.todays_total_tasks = $scope.engineer_schedule_list[indexoftask].tasks_info.todays_total_tasks+1
      //   $scope.engineer_schedule_list[indexoftask].tasks_info.total_tasks = $scope.engineer_schedule_list[indexoftask].tasks_info.total_tasks+1
        
      // }

      // var indexoftask = arrayObjectIndexOf($scope.engineer_task_list, engineer_id, 'id');
      // if(indexoftask!=-1) {
      //   $scope.engineer_task_list[indexoftask].tasks_info.todays_tasks = $scope.engineer_task_list[indexoftask].tasks_info.todays_tasks+1
      //   $scope.engineer_task_list[indexoftask].tasks_info.todays_total_tasks = $scope.engineer_task_list[indexoftask].tasks_info.todays_total_tasks+1
      //   $scope.engineer_task_list[indexoftask].tasks_info.total_tasks = $scope.engineer_task_list[indexoftask].tasks_info.total_tasks+1
        
      // }

      $http({
        method: "POST",
        url: "/task/set_status",
        data : $scope.input_json
      }).then(function successCallback(response) {
        $scope.engineer      = ""
        var reload = -1;
        $rootScope.$emit("refresh_task_list", {reload});
        $scope.schedule_date_selected = ""
        $timeout(function() {
          $scope.engineer_list_all();
        }, 100);

        Materialize.toast("success" , 4000)
        
      }, function errorCallback(response) {
            ////console.log('fail with status '+response);
          });

    }

  $scope.query_status= function(query_status){
    var model = query_status;
    console.log(model);

    if (query_status == 'all'){
    $scope.query.completed=true;
    $scope.query.assigned=true;
    $scope.query.verified=true;
    $scope.query.unassigned=true;

    }
    else{
    $scope.query.all=false;
    if ($scope.query.completed==false && $scope.query.assigned==false && $scope.query.verified==false && $scope.query.unassigned==false){
        Materialize.toast( "Slecting a status is mandatory", 4000)
        // $scope.query.[model] = true;
        
      }
    }



  }


   $scope.task_date_range = function(){
    $scope.query = {};
    $scope.start_date = undefined ;
    $scope.end_date = undefined ;
    $scope.range_date_error = undefined ;
    $scope.date_range_selector = true;
    $scope.toggle_task_list_view(false) ;
    $scope.toggle_task_list_header_view(false) ;

    $scope.query.all = true ;
    $scope.query.all = true ;
    $scope.query.completed = true ;
    $scope.query.assigned = true ;
    $scope.query.unassigned = true ;
    $scope.query.verified = true;

  }
  $scope.query = {};
  $scope.date_range = undefined;
  $scope.submit_query = function(query_model,query_date_range){
    
    $scope.score = true

    if ($scope.date_range == 'custom' && $scope.start_date== undefined && $scope.end_date == undefined ){
          $scope.range_date_error = "Selecting one date is mandatory"
          $scope.score = false ;
    }

    else{

        if($scope.start_date != undefined && $scope.end_date != undefined){
          var spilt_date = $scope.start_date.split("-");
          var start = spilt_date['2']+"-"+spilt_date['1']+"-"+spilt_date[0] + " 23:59:59"
          var start_date = new Date(start);
          

          var spilt_date = $scope.end_date.split("-");
          var end_date_calculated = spilt_date['2']+"-"+spilt_date['1']+"-"+spilt_date[0] + " 23:59:59"
          var end_date = new Date(end_date_calculated);
          

          if (end_date < start_date){
            $scope.range_date_error = "End date should be greater than start date" 
            $scope.score = false
          }  
        }
    }

    if ($scope.query.all == false && $scope.query.completed == false && $scope.query.assigned == false && $scope.query.unassigned == false && $scope.query.verified == false ){
        $scope.range_status_error = "Selecting one status is mandatory" ;
        $scope.score = false ;
    }
    
    if ($scope.date_range== undefined){
        $scope.date_range = 'today'
    }
    
    
    
    
    

    if ($scope.score==true){
        var data = {"query_date":$scope.date_range,"status":$scope.query,"start_date": $scope.start_date,"end_date": $scope.end_date}
        console.log(data)
        $http({
        method: "POST",
        url: "/task/query_date_wise_preset",
        data : data
        }).then(function successCallback(response) {

          $scope.range_date_error = undefined;
          $scope.toggle_task_list_view(true) 
          $scope.date_range_result = true;

          $scope.tasks = response.data.tasks;
          $scope.query = {};
       
          // $scope.date_range_result = undefined;
          $scope.range_date_error = undefined ;
          $scope.date_range_selector = false;

          $scope.toggle_task_list_view(true) ;
          $scope.toggle_task_list_header_view(false) ;
          if ($scope.date_range == "today")
          {
            $scope.toggle_task_list_header_view(true) ;
            // $scope.task_list_header_view = true;
          }

          
          vm.positions= [];

          for(var i in $scope.tasks){
            $scope.positions_array = {}
            $scope.positions_array['pos'] = []
            $scope.positions_array['pos'][0] = $scope.tasks[i]['lattitude']
            $scope.positions_array['pos'][1] = $scope.tasks[i]['longitude']
            $scope.positions_array['labl'] = "T"+(parseInt(i)+1).toString();
            $scope.positions_array['description'] = $scope.tasks[i]

            vm.positions.push($scope.positions_array)
          }

          $timeout(function() {
            NgMap.getMap({id:"task_map"}).then(function(map) {
              var bounds = new google.maps.LatLngBounds();
              vm.dynMarkers = []
              for (var k in map.customMarkers) {
                var cm = map.customMarkers[k];
                vm.dynMarkers.push(cm);
                bounds.extend(cm.getPosition());
              };
              
              vm.markerClusterer = new MarkerClusterer(map, vm.dynMarkers, {});
              map.fitBounds(bounds);
              map.setCenter(bounds.getCenter());

              new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 600});
            });

          }, 1000);

        }, function errorCallback(response) {
              ////console.log('fail with status '+response);
            });



              }

    

       
  }


  $scope.task_date_range_list = function(query){
      
      console.log(query);
     

      if ($scope.start_date == undefined && $scope.end_date == undefined){
        $scope.range_date_error = "Selecting one date is mandatory"
      }
      else if($scope.start_date>$scope.end_date){
       $scope.range_date_error = "End date should be greater than start date" 
      }

      else{
        var date_data = {"start_date":$scope.start_date,"end_date":$scope.end_date,"query":query}
        console.log(date_data)
        $http({
        method: "POST",
        url: "/task/query_date_wise",
        data : date_data
        }).then(function successCallback(response) {
          $scope.range_date_error = undefined;
          $scope.toggle_task_list_view(true) 
          $scope.date_range_result = true;

          $scope.tasks = response.data.tasks;
          
          vm.positions= [];

          for(var i in $scope.tasks){
            $scope.positions_array = {}
            $scope.positions_array['pos'] = []
            $scope.positions_array['pos'][0] = $scope.tasks[i]['lattitude']
            $scope.positions_array['pos'][1] = $scope.tasks[i]['longitude']
            $scope.positions_array['labl'] = "T"+(parseInt(i)+1).toString();
            $scope.positions_array['description'] = $scope.tasks[i]

            vm.positions.push($scope.positions_array)

          }

          $timeout(function() {
            NgMap.getMap({id:"task_map"}).then(function(map) {
              var bounds = new google.maps.LatLngBounds();
              vm.dynMarkers = []
              for (var k in map.customMarkers) {
                var cm = map.customMarkers[k];
                vm.dynMarkers.push(cm);
                bounds.extend(cm.getPosition());
              };
              
              vm.markerClusterer = new MarkerClusterer(map, vm.dynMarkers, {});
              map.fitBounds(bounds);
              map.setCenter(bounds.getCenter());

              new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 600});
            });

          }, 1000);


        }, function errorCallback(response) {
              ////console.log('fail with status '+response);
            });


      }
      
    }

  $scope.task_date_range_preset_list=function(query_preset){
      

        
        $http({
        method: "POST",
        url: "/task/query_date_wise_preset",
        data : {"query_preset":query_preset}
        }).then(function successCallback(response) {
          $scope.range_date_error = undefined;
          $scope.toggle_task_list_view(true) 
          $scope.date_range_result = true;

          $scope.tasks = response.data.tasks;
          
          vm.positions= [];

          for(var i in $scope.tasks){
            $scope.positions_array = {}
            $scope.positions_array['pos'] = []
            $scope.positions_array['pos'][0] = $scope.tasks[i]['lattitude']
            $scope.positions_array['pos'][1] = $scope.tasks[i]['longitude']
            $scope.positions_array['labl'] = "T"+(parseInt(i)+1).toString();
            $scope.positions_array['description'] = $scope.tasks[i]

            vm.positions.push($scope.positions_array)
          }
          $timeout(function() {
            NgMap.getMap({id:"task_map"}).then(function(map) {
              var bounds = new google.maps.LatLngBounds();
              vm.dynMarkers = []
              for (var k in map.customMarkers) {
                var cm = map.customMarkers[k];
                vm.dynMarkers.push(cm);
                bounds.extend(cm.getPosition());
              };
              
              vm.markerClusterer = new MarkerClusterer(map, vm.dynMarkers, {});
              map.fitBounds(bounds);
              map.setCenter(bounds.getCenter());

              new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 600});
            });

          }, 1000);

        }, function errorCallback(response) {
              ////console.log('fail with status '+response);
            });


  }

  $scope.close_date_range = function(){
    $scope.query = {};
    $scope.start_date = undefined ;
    $scope.end_date = undefined ;
    $scope.date_range_result = undefined;
    $scope.range_date_error = undefined ;
    $scope.date_range_selector = false;
    $scope.toggle_task_list_view(true) ;
    $scope.toggle_task_list_header_view(true) ;


    $scope.get_tasks();


    } 

  $scope.reset_date_range= function(){

    $scope.start_date = undefined;
    $scope.end_date = undefined;
  }

  vm.engineers= [];
  $scope.formatted_date = ""
  $scope.get_engineer_task_list = function(){
    $scope.input_json = {}
    if($scope.engineer_schedule_date!=''){
        var today = new Date($scope.engineer_schedule_date);
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd;
        }
        if(mm<10){
            mm='0'+mm;
        }
    }

    if(!isNaN(dd)){

      $scope.formatted_date = dd+"-"+mm+"-"+yyyy
      $scope.input_json['schedule_date'] = $scope.formatted_date
    }


    $http({
      method: "POST",
      url: "/engineer/task/count/datetime",
      data: $scope.input_json

    }).then(function successCallback(response) {
      $scope.engineer_task_list = response.data.list

      vm.engineers= [];

      for(var i in $scope.engineer_task_list){
        
        if("location" in $scope.engineer_task_list[i]){
          $scope.positions_array = {}
          $scope.positions_array['pos'] = []
          $scope.positions_array['pos'][0] = $scope.engineer_task_list[i]['location']['lattitude']
          $scope.positions_array['pos'][1] = $scope.engineer_task_list[i]['location']['longitude']
          $scope.positions_array['description'] = $scope.engineer_task_list[i]
          vm.engineers.push($scope.positions_array)
        }
        

      }
      
      $timeout(function() {
        $scope.get_engineer_task_list();
        
      }, 30000);

    })

  }

  $scope.preview = ""

  $scope.readURL = function (input) {
      $scope.url = input.files;
      if (input.files) {
        for(i=0;i<input.files.length;i++)
        {
          var reader = new FileReader();
          $scope.imageUploaded = 1;
          reader.onload = function (e) {
            $scope.url.$ngfDataUrl = e.target.result ;
            $scope.preview = e.target.result
          };

          reader.readAsDataURL(input.files[i]);
        }
      }
    }

    $scope.resetImage = function(){
      $scope.preview = ""
      $scope.url = ""
    }
    $scope.set_current_task = function(task){

      $scope.current_task = task ;
    }


    $scope.upload = function (file) {
      Upload.upload({
        url:"/upload/image",
        method: 'POST',
        data:{file:file}
    }).then(function (resp) { //upload function returns a promise
      $scope.add_comment(resp.data.picname);
      $scope.url = ""
        //$scope.add_comment();
      })
  };


  $scope.comment_add = -1;
  $scope.center_latitude = 30.7333;
  $scope.center_longitude = -76.7794;
  $scope.add_address = 1;
  $scope.add_company = -1;
  $scope.add_address_new = -1;
  $scope.add_new_company = -1;
  $scope.add_contact = -1;
  $scope.company = "";
  vm.positions =[];
  $scope.comments_list = []
  vm.dynMarkers = []
  $scope.notification_list = [];

  $scope.comment = function(){
    $scope.preview = "";

    if($scope.url == "")
      $scope.add_comment('')
    else
      $scope.upload($scope.url);

  }

  $scope.cancel = function(){
    $scope.comment_add = -1;
    $scope.comment_description = "";
  }

  $scope.engineer_schedule_list = [];

  $scope.get_engineer_list_by_schedule_date = function(schedule_date){
    $http({
    method: "POST",
    url: "/engineer/task/count/datetime",
    data : {"schedule_date": schedule_date}
    }).then(function successCallback(response) {
      $scope.engineer_schedule_list = response.data.list

      $timeout(function() {
        $scope.schedule_date = $scope.schedule_date;
      }, 100);

    }, function errorCallback(response) {
       console.log('fail with status '+response);
    });
  }

  vm.zoom = 10;

  vm.showDetail = function(e, shop, id, index) {
    new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 700});
    e.preventDefault();
    e.stopPropagation();
      
    scroll_to = index*150
    $('.row').animate({
        scrollTop: scroll_to //#DIV_ID is an example. Use the id of your destination on the page
    }, 'slow');

    shop.index = index
    vm.shop = shop;
    vm.map.showInfoWindow('foo-iw', id);
    angular.element(".button-collapse-engineer").removeClass('highlight')
    angular.element(".task_list"+index).addClass('highlight')
    new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 700});
    
    $timeout( function(){
        $scope.center_latitude = shop.lattitude;
        $scope.center_longitude = shop.longitude;
        vm.zoom = 17;
    }, 1000);
    
  };

  $scope.maxZoomForSinglePOI = 10;
  

  vm.showDetail_ng = function(e, shop, id) {
    e.preventDefault();
    
    new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 700});
    angular.element(".button-collapse-engineer").removeClass('highlight')
    angular.element(".task_list"+id).addClass('highlight')
    shop.index = id
    t_id = 'T'+id;
    vm.shop = shop;
    vm.map.showInfoWindow('foo-iw', t_id);
    
    new google.maps.InfoWindow({ content: "hello", maxWidth:600, maxHeight: 700});

    $timeout( function(){
        $scope.center_latitude = shop.lattitude;
        $scope.center_longitude = shop.longitude;
        vm.zoom = 17;
    }, 1000);
    
  };

  $scope.selected_engineer_detail = "";

  vm.non_assign_task_engineer_side_nav_map = function(e, engineer_id, engineer_name, index, description, lattitude, longitude){
      e.preventDefault();
      

      $scope.task_search_text = engineer_name;
      $scope.current_selected_engineer = engineer_id;
      $scope.current_selected_engineer_name = engineer_name;
      $scope.selected_engineer_detail = description
      index = index+1

      creating_id = "E"+(index.toString());
      $scope.engineer_list_status_sidebar = 0;
      $scope.engineer_list_all_select()
      vm.map.showInfoWindow('engineer_list_window', creating_id);
      // angular.element(".engineer-card").removeClass('active_engineer');
      // angular.element("#engineer_card"+index).addClass('active_engineer');

      $timeout( function(){
        $scope.center_latitude  = lattitude;
        $scope.center_longitude = longitude;
        vm.zoom = 22;
      }, 1000);
  }

  vm.non_assign_task_engineer_side_nav_map_auto_click = function(engineer_id, engineer_name, index, description, lattitude, longitude){
      
      $scope.task_search_text = engineer_name;
      $scope.current_selected_engineer = engineer_id;
      $scope.current_selected_engineer_name = engineer_name;
      $scope.selected_engineer_detail = description
      index = index+1

      creating_id = "E"+(index.toString());
      $scope.engineer_list_status_sidebar = 0;
      $scope.engineer_list_all_select()
      vm.map.showInfoWindow('engineer_list_window', creating_id);
      // angular.element(".engineer-card").removeClass('active_engineer');
      // angular.element("#engineer_card"+index).addClass('active_engineer');

      $timeout( function(){
        $scope.center_latitude  = lattitude;
        $scope.center_longitude = longitude;
        vm.zoom = 22;
      }, 1000);
  }

  vm.showDetail_ng = function(e, shop, id) {
      e.preventDefault();
      
      new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 700});
      angular.element(".button-collapse-engineer").removeClass('highlight')
      angular.element(".task_list"+id).addClass('highlight')
      shop.index = id
      t_id = 'T'+id;
      vm.shop = shop;
      vm.map.showInfoWindow('foo-iw', t_id);
      
      new google.maps.InfoWindow({ content: "hello", maxWidth:600, maxHeight: 700});

      $timeout( function(){
          $scope.center_latitude = shop.lattitude;
          $scope.center_longitude = shop.longitude;
          vm.zoom = 17;
      }, 1000);
    
  };
  
  $timeout( function(){ $scope.get_latest_comment(); }, 10000);


  $scope.get_latest_comment = function(){
      $http({
          method: "POST",
          url: "/new/comment/admin",
          data: {"enginneer_id":$cookies['user_id']}
          }).then(function successCallback(response) {
            if(response.data.tasks!= undefined){
              for (i = 0; i < response.data.tasks.length; i++){

                var updated_comments_task_id = response.data.tasks[i].id
                var indexoftask = arrayObjectIndexOf($scope.tasks, updated_comments_task_id, 'id');
                if(indexoftask!=-1) {
                  $scope.tasks[indexoftask] = response.data.tasks[i]

                }

              }
            }

            if(response.data.notification!= undefined){
              notification_array = response.data.notification

              for (i = 0; i < notification_array.length; i++){
                $scope.notification_object = {}

                if("comments" in notification_array[i]){

                  comeent_text_update = notification_array[i].comment_text

                  $scope.notification_object['text'] = comeent_text_update
                  $scope.notification_object['data'] = notification_array[i]
                   
                  $scope.notification_list.push($scope.notification_object) 
                  Materialize.toast(  comeent_text_update, 4000)
                }
                else{

                    angular.forEach(notification_array[i].changed_keys, function(value, key) {

                      
                      Materialize.toast(notification_array[i].user_name+' changed '+key+' from '+value[0]+ " to "+  value[1] , 4000)

                      $scope.notification_object['text'] = notification_array[i].user_name+' changed '+key+' from '+value[0]+ " to "+  value[1]
                      $scope.notification_object['data'] = notification_array[i]
                      $scope.notification_list.push($scope.notification_object) 
                    });
                }
              }
            }
            // $scope.tasks = response.data.tasks;
            // alert(JSON.stringify(response));
            }, function errorCallback(response) {
            ////console.log('fail with status '+response);
          });
      $timeout( function(){ $scope.get_latest_comment(); }, 10000);
  }

  $scope.show_activity_log = function(){
    $('#modal2').modal('open');
    $timeout( function(){ $(".modal-overlay").css("opacity",0); }, 1000);
    
  }
  function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
      if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
  }

  $http({
      method: "POST",
      url: "/task/list",
      data: {"engineer_id":0,"offset":0}
        }).then(function successCallback(response) {
            $scope.tasks = response.data.tasks
            vm.positions= [];

            for(var i in $scope.tasks){
              $scope.positions_array = {}
              $scope.positions_array['pos'] = []
              $scope.positions_array['pos'][0] = $scope.tasks[i]['lattitude']
              $scope.positions_array['pos'][1] = $scope.tasks[i]['longitude']
              $scope.positions_array['labl'] = "T"+(parseInt(i)+1).toString();
              $scope.positions_array['description'] = $scope.tasks[i]
              vm.positions.push($scope.positions_array)
            }

            $timeout( function(){ 
              NgMap.getMap({id:"task_map"}).then(function(map) {
                var bounds = new google.maps.LatLngBounds();
                for (var k in map.customMarkers) {
                  var cm = map.customMarkers[k];
                  if(cm['class']=="task"){
                    vm.dynMarkers.push(cm);
                    bounds.extend(cm.getPosition());
                  }

                };
                
                vm.markerClusterer = new MarkerClusterer(map, vm.dynMarkers, {});
                map.setCenter(bounds.getCenter());
                map.fitBounds(bounds);
                new google.maps.InfoWindow({ content: "hello", maxWidth: 600, maxHeight: 600});
                $scope.center_latitude = 30.7333;
                $scope.center_longitude = -76.7794;
              }); 
            }, 1000);

          }, function errorCallback(response) {
          ////console.log('fail with status '+response);
      });
  
  

  $scope.mark_as_completed = function(task_id){

    $http({
      method: "POST",
      url: "/task/update_status",
      data : {"task_id":task_id, "task_status":"completed"}
    }).then(function successCallback(response) {
      $scope.get_tasks();
    }, function errorCallback(response) {
              ////console.log('fail with status '+response);
            });
    
  }

  $scope.mark_as_verified = function(task_id){
    $http({
      method: "POST",
      url: "/task/update_status",
      data : {"task_id":task_id, "task_status":"verified"}
    }).then(function successCallback(response) {
      $scope.get_tasks();
    }, function errorCallback(response) {
              ////console.log('fail with status '+response);
            });
    
  }

  $scope.mark_as_assigned = function(task_id){
    $http({
      method: "POST",
      url: "/task/update_status",
      data : {"task_id":task_id, "task_status":"assigned"}
    }).then(function successCallback(response) {
      $scope.get_tasks();
    }, function errorCallback(response) {
              ////console.log('fail with status '+response);
            });
    
  }

  
  $scope.is_open = false;

  $scope.edit_function =function(index, taskDetail){

    if($("#task_details").hasClass('open')){
      $scope.is_open = true;
      $("#task_details").css('z-index','-1')
    }

    id = 'T'+index;
    vm.shop = taskDetail;
    $scope.center_latitude = taskDetail.lattitude;
    $scope.center_longitude = taskDetail.longitude;
    $scope.title = vm.shop.title;
    $scope.description = vm.shop.description;

    $('#slide-out-engineer-list').removeClass("active-sides-engineer");
    $('#slide-out').removeClass("active-sides-task");
    $('#slide-out-engineer').removeClass("active-sides-engineer");

    $('#slide-out-engineer-list').addClass("deactive-sides-engineer");
    $('#slide-out').addClass("deactive-sides-task");
    $('#slide-out-engineer').addClass("deactive-sides-engineer");

    $rootScope.$emit("edit", {taskDetail});

    $('.modal-overlay').click(function(){
      $scope.$apply( function() {
        $scope.title         = ""
        $scope.description   = ""
        $scope.engineer      = ""
        vm1.markers          = [];
        $scope.task_id       = 0;
        vm1.address          = ""
        $(".highlight").removeClass("highlight");
        angular.element('.datepicker').val('')
        $scope.preview = "";
    
      });
    });

  }

  $scope.add_comment = function(filename){
    $scope.comment_json = {}
    $scope.comment_json['comment_text']       = $scope.comment_description
    $scope.comment_json['image_id']           = filename
    $scope.comment_json['task_id']            = vm.shop.id
    $scope.comment_json['comment_by_id']      = user_id
    $scope.comment_json['comment_by_name']    = ""
    $scope.comment_json['comment_id']         = 0



    $http({
      method: "POST",
      url: "/comment/add/edit",
      data : $scope.comment_json
    }).then(function successCallback(response) {
      $scope.comment_list()
      $scope.url = ""
      $scope.comment_description = ""
      $scope.comment_add=-1
      var indexoftask = arrayObjectIndexOf($scope.tasks, vm.shop.task_id, 'task_id');

      if(indexoftask!=-1) {
        $scope.tasks[indexoftask].unread_comment = 0
        $scope.tasks[indexoftask].total_comments = $scope.tasks[indexoftask].total_comments+1
      }
    }, function errorCallback(response) {
            ////console.log('fail with status '+response);
          });

  }
  

  $scope.comment_list = function(index, taskDetail){

    $('#slide-out-engineer-list').removeClass("active-sides-engineer");
    $('#slide-out').removeClass("active-sides-task");
    $('#slide-out-engineer').removeClass("active-sides-engineer");

    $('#slide-out-engineer-list').addClass("deactive-sides-engineer");
    $('#slide-out').addClass("deactive-sides-task");
    $('#slide-out-engineer').addClass("deactive-sides-engineer");
    
    $scope.preview = "";
    if(taskDetail !=undefined){
      $(".left-nav-container").removeClass("activated");
      id = 'T'+index;
      taskDetail['index'] = index
      vm.shop = taskDetail;
    }

    $http({
      method: "POST",
      url: "/comment/list",
      data : {"offset": 0, "task_id": vm.shop.id}
    }).then(function successCallback(response) {

      $scope.comments_list = response.data.comment_list;

      
      $timeout(function() {
        $scope.comment_tab_click()
      }, 2000);

    }, function errorCallback(response) {
            ////console.log('fail with status '+response);
          });
  }

  $scope.comment_tab_click = function(){

    $(".modal-content").animate({ scrollTop: 5000 }, 1000);
      
  }
  $scope.reset_unread_comment = function(){
    var indexoftask = arrayObjectIndexOf($scope.tasks, vm.shop.task_id, 'task_id');
    if(indexoftask!=-1) {
      $scope.tasks[indexoftask].unread_comment = 0
      $scope.tasks[indexoftask].total_comments = total_comments
    }
  }

  $scope.get_tasks = function(){
    vm.positions= [];

    $http({
      method: "POST",
      url: "/task/list",
      data: {"engineer_id":0,"offset":0}
        }).then(function successCallback(response) {

            $scope.tasks = response.data.tasks
            

            vm.positions= [];
            $scope.get_engineer_task_list();

            for(var i in $scope.tasks){
              $scope.positions_array = {}
              $scope.positions_array['pos'] = []
              $scope.positions_array['pos'][0] = $scope.tasks[i]['lattitude']
              $scope.positions_array['pos'][1] = $scope.tasks[i]['longitude']
              $scope.positions_array['labl'] = "T"+(parseInt(i)+1).toString();
              $scope.positions_array['description'] = $scope.tasks[i]

              if(vm.shop){
                if(vm.shop.taskid ==  $scope.tasks[i].taskid){
                vm.shop = $scope.tasks[i]
                }
              }
              
              vm.positions.push($scope.positions_array)

            }

            $timeout(function() {
                NgMap.getMap({id:"task_map"}).then(function(map) {
                  var bounds = new google.maps.LatLngBounds();
                  vm.dynMarkers = []
                  for (var k in map.customMarkers) {


                    var cm = map.customMarkers[k];
                    if(cm['class']=="task"){
                      vm.dynMarkers.push(cm);
                      bounds.extend(cm.getPosition());
                    }
                  };
                  
                  console.log(vm.dynMarkers.length);
                  
                  vm.markerClusterer = new MarkerClusterer(map, vm.dynMarkers, {});
                  
                  map.fitBounds(bounds);
                  map.setCenter(bounds.getCenter());
                  

                });
            }, 1000);

            

          }, function errorCallback(response) {
          ////console.log('fail with status '+response);
      });
  }

  function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
      if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
  }

  
  
});

  app.controller('AddTaskController', function(NgMap, $rootScope, $scope, $q, $timeout, $scope, $http, $window, $cookies, $cookieStore, $moment) {

    var vm1 = this;
    $scope.task_id = 0;

    var user_id = $cookies.user_id

    $scope.maxZoomForSinglePOI = 10;
    var storableLocation = {}
    vm1.types = "geocode";
    vm1.markers = [];
    vm1.shop = "";
    $scope.center_latitude = 30.7333;
    $scope.center_longitude = 76.7794;

    vm1.placeChanged = function() {

      vm1.place = this.getPlace();
      // center_latitude = vm1.place.geometry.location.lat()
      
      // center_longitude = vm1.place.geometry.location.lng()
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': vm1.place.geometry.location}, function(results, status) {
        console.log(results)
        console.log(status)
        if (status == google.maps.GeocoderStatus.OK) {
          

            for (var ac = 0; ac < results[0].address_components.length; ac++) {
                var component = results[0].address_components[ac];
                console.log(component)

                switch(component.types[0]) {
                    case 'locality':
                        storableLocation.city = component.long_name;
                        break;
                    case 'administrative_area_level_1':
                        storableLocation.state = component.long_name;
                        break;
                    case 'country':
                        storableLocation.country = component.long_name;
                        break;
                }
            };
          
        }
      });
      
      vm1.map.setCenter(vm1.place.geometry.location);

      vm1.markers =[
      {pos:[vm1.place.geometry.location.lat(), vm1.place.geometry.location.lng()]},
      ];

      vm1.map.setCenter(vm1.place.geometry.location);
      
      vm1.map.setZoom(14);
  }


  $rootScope.$on("edit", function(e,taskdetail){
      //vm1.shop = taskdetail

      $scope.task_id       = taskdetail.taskDetail.id
      $scope.title         = taskdetail.taskDetail.title
      $scope.description   = taskdetail.taskDetail.description
     
      $scope.schedule_date = taskdetail.taskDetail.schedule_date
      angular.element('.datepicker').val($scope.schedule_date)
      $scope.get_engineer_list_by_schedule_date_selected(taskdetail.taskDetail.assigned_user_id)

      vm1.address          = "" 
      vm1.markers = []
      $scope.engineer      = taskdetail.taskDetail.assigned_user_id
      vm1.markers =[
      {pos:[taskdetail.taskDetail.lattitude, taskdetail.taskDetail.longitude]},
      ];

      $("#input_text").focus()

      $timeout(function() {
        $window.dispatchEvent(new Event("resize"));
        $scope.center_latitude = taskdetail.taskDetail.lattitude;
        $scope.center_longitude = taskdetail.taskDetail.longitude;
        Materialize.updateTextFields();
        $("#input_text").focus()
        $scope.engineer      = taskdetail.taskDetail.assigned_user_id
      }, 100);

      $timeout(function() {
        $scope.engineer      = taskdetail.taskDetail.assigned_user_id
      }, 1000);
  });




  NgMap.getMap({id:"add_task"}).then(function(map) {
    vm1.map = map;

    map.setZoom(14);
   
 });
  
  
    $scope.add_address = 1;
    $scope.add_company = -1;
    $scope.add_address_new = -1;
    $scope.add_new_company = -1;
    $scope.add_contact = -1;
    $scope.company = "";
    $scope.step=1;
  
 
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    

    if(!isNaN(dd)){

      $scope.schedule_date = dd+"-"+mm+"-"+yyyy

    }


  vm1.addMarker = function(event) {
    var ll = event.latLng;

    var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': ll}, function(results, status) {
        console.log(results)
        console.log(status)
        if (status == google.maps.GeocoderStatus.OK) {
          

            for (var ac = 0; ac < results[0].address_components.length; ac++) {
                var component = results[0].address_components[ac];
                console.log(component)

                switch(component.types[0]) {
                    case 'locality':
                        storableLocation.city = component.long_name;
                        break;
                    case 'administrative_area_level_1':
                        storableLocation.state = component.long_name;
                        break;
                    case 'country':
                        storableLocation.country = component.long_name;
                        break;
                }
            };
          
        }
      });

    vm1.markers =[
    {pos:[ll.lat(), ll.lng()]},
    ];
  }

  vm1.positions =[
  {pos:[40.71, -74.21]},

  ];


  $scope.engineer_schedule_list = []

  $scope.get_engineer_list_by_schedule_date = function(){
    $http({
    method: "POST",
    url: "/engineer/task/count/datetime",
    data : {"schedule_date": $scope.schedule_date}
    }).then(function successCallback(response) {
      $scope.engineer_schedule_list = response.data.list

      $timeout(function() {
        $scope.schedule_date = $scope.schedule_date;
      }, 100);

    }, function errorCallback(response) {
       console.log('fail with status '+response);
    });
  }

  $scope.get_engineer_list_by_schedule_date_selected = function(enginneer_id){
    $http({
    method: "POST",
    url: "/engineer/task/count/datetime",
    data : {"schedule_date": $scope.schedule_date}
    }).then(function successCallback(response) {
      $scope.engineer_schedule_list = response.data.list

      $timeout(function() {
        $scope.engineer = enginneer_id;
      }, 1000);


    }, function errorCallback(response) {
       console.log('fail with status '+response);
    });
  }
  var storableLocation = {}
  $scope.task_create = function(){

    if(vm1.markers[0] != undefined){

      $scope.input_json = {}
      $scope.input_json['task_id']          =    $scope.task_id;
      $scope.input_json['title']            =    $scope.title
      $scope.input_json['description']      =    $scope.description
      $scope.input_json['assigned_user_id'] =    $scope.engineer
      $scope.input_json['schedule_date']    =    $scope.schedule_date
      $scope.input_json['lattitude']        =    vm1.markers[0]['pos'][0];
      $scope.input_json['longitude']        =    vm1.markers[0]['pos'][1];
      $scope.input_json['reverse_geocode']  =    storableLocation
      $scope.tasks  = []

      $http({
        method: "POST",
        url: "/task/add/edit",
        data : $scope.input_json
      }).then(function successCallback(response) {
        recent_task = response.data.task_added;
        
        storableLocation = {}

        angular.element("#clickMe").trigger('click')

        $scope.title         = ""
        $scope.description   = ""
        $scope.engineer      = ""
        vm1.markers          = [];
        $scope.task_id       = 0;
        vm1.address          = ""
        $(".highlight").removeClass("highlight");
        angular.element('.datepicker').val('')
        $rootScope.$emit("refresh_task_list", {recent_task});
        Materialize.toast("success" , 4000)
        
        if($(".modal-overlay").length == 1) angular.element(".modal-overlay").trigger('click');
        else $("#taskadd").modal('close')

      }, function errorCallback(response) {
            ////console.log('fail with status '+response);
          });
    }
    else{
      Materialize.toast("Please set address marker" , 4000)
        
    }
  }



  $scope.engineer_list = []

  $http({
    method: "POST",
    url: "/engineer/task/count/datetime"
    }).then(function successCallback(response) {
      $scope.engineer_list = response.data.list

      $timeout(function() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd;
        }
        if(mm<10){
            mm='0'+mm;
        }
        $scope.engineer_schedule_date = today
      }, 100);

    }, function errorCallback(response) {
       console.log('fail with status '+response);
    });

  
  
  

  $scope.open_modal = function(){
    $scope.myForm.$submitted = false;

    $('#slide-out-engineer-list').removeClass("active-sides-engineer");
    $('#slide-out').removeClass("active-sides-task");
    $('#slide-out-engineer').removeClass("active-sides-engineer");

    $('#slide-out-engineer-list').addClass("deactive-sides-engineer");
    $('#slide-out').addClass("deactive-sides-task");
    $('#slide-out-engineer').addClass("deactive-sides-engineer");
    
    $("#input_text").focus()

    if(!isNaN(dd)){

      $scope.schedule_date = dd+"-"+mm+"-"+yyyy
      $scope.get_engineer_list_by_schedule_date();

    }

    $timeout(function() {
      $window.dispatchEvent(new Event("resize"));
      $("#input_text").focus()
       if(!isNaN(dd)){

        var today_date_jquery = dd+"-"+mm+"-"+yyyy
        $scope.schedule_date = dd+"-"+mm+"-"+yyyy
        $("#schedule_date").val(today_date_jquery);
        $scope.get_engineer_list_by_schedule_date();

      }
    }, 100);
  }


});
