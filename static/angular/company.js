console.log('company .js connected');
app.controller('companyController', function($scope,$http,$timeout,NgMap) {
  $scope.map = null
   NgMap.getMap().then(function(map) {
      $scope.map = map;
      $timeout(() => {google.maps.event.trigger(map, 'resize')}, 1000)

    });  
  $scope.add_form_stage = 1
  $scope.lat = 77.1025 ;
  $scope.long = 28.7041 ;
  $scope.company_listing = null;
  $scope.zip_regex =  " \d+"
  $scope.add_company = 0; 
  $scope.edit_company = 0 ;

  $scope.name = '';

  $scope.address_form_view = 1
  $scope.address_choice = {};
  $scope.address_choices = [];

  $scope.contact_form_view = 1 ;
  $scope.contact_choice = {};  
  $scope.contact_choices = [];
 
  $scope.company_list_view = 1

  $scope.hide_company_list = function(){
    $scope.company_list_view = 0 ;  
  }
    $scope.show_company_list = function(){
    $scope.company_list_view = 1 ;    
  }

$scope.get_companies = function(){
    $http({
            method: 'GET',
            url: '/api/get_companies'
            }).then(function successCallback(response){
              // console.log("response",response)
              $scope.company_listing = response.data;
              console.log($scope.company_listing) ;
            },
            function errorCallback(response) {
                console.log(response) ;
            });
  };

  
// #------------- Adding multiple address -------------#

  

  // address methods
  $scope.add_new_address = function() {
    $scope.address_form_view = 1
    $scope.address_choice = {} ;  
  };

  $scope.remove_address = function(address_to_remove) {
    var resp = confirm("Are you sure you want to remove this address ?");

    console.log("remove");
    console.log($scope.address_choices.indexOf(address_to_remove));
    console.log($scope.address_choices);

    if (resp){
         $scope.address_choices.splice($scope.address_choices.indexOf(address_to_remove))
         $scope.address_choice = {}
      if ($scope.address_choices.length == 0){
        $scope.address_form_view = 1
      }
  }

  };

  $scope.save_address  = function(single_address){
    console.log(single_address);
    if ($scope.address_choices.indexOf(single_address) == -1 ){
          $scope.address_choices.push(single_address);
          $scope.address_form_view = 0;
        }
    else
    {
      console.log($scope.address_choices);
      console.log("inside else part");
      var index = $scope.address_choices.indexOf(single_address) ;
      $scope.address_choices.splice(index,1,single_address);
      console.log($scope.address_choices);
      $scope.address_form_view = 0;
    }
    
  };
  $scope.cancel_address = function(){
    var resp = confirm("Are you sure you want to remove this address ?");
    if (resp){
      $scope.address_form_view = 0
      $scope.address_choice = {}
    }
  };
  $scope.edit_address = function(single_address){
  
    $scope.address_choice = single_address ;
    $scope.address_form_view = 1

  };

// #--------------- addidng multiple contacts---------------#


  // adress methods
  $scope.show_contact_form = function(){
    $scope.contact_form_view = 1 ;
  };
  $scope.hide_contact_form = function(){
    $scope.contact_form_view = 0 ;
    $scope.contact_choice = {}
  };

  $scope.save_contact = function(a_contact_model) {
    console.log(a_contact_model);
    $scope.contact_choices.push(a_contact_model);
    contact_choice = {} ;
    $scope.hide_contact_form();
  };
  $scope.edit_contact = function(a_contact_model){
    $scope.contact_choice = a_contact_model ;
    $scope.show_contact_form();
  };
  $scope.cancel_contact =function(){
    var resp = confirm("Are you sure you want to remove this contact ?");
    if (resp){
       $scope.hide_contact_form() ;
       $scope.contact_choice = {}
    }
  }

  $scope.remove_contact = function() {
    var resp = confirm("Are you sure you want to remove this contact ?");
    if (resp){
     
    var lastItem = $scope.contact_choices.length-1;
    $scope.contact_choices.splice(lastItem);  
    console.log("Thre contact response is true");
    if ($scope.contact_choices.length == 0){
        $scope.show_contact_form();
        }
    }
  };


// #------------------------ edit company modal methods -------------------------

$scope.edit_company_info = function(a_company_model){
  $scope.hide_company_list();
  $scope.a_company = a_company_model 
  $scope.add_form_stage = 1 ;
  $scope.company_id = a_company_model.id

  
  $scope.name = a_company_model.name;
  $scope.contact_choices = a_company_model.contacts ;
  $scope.address_choices = a_company_model.addresses ;
  
  $scope.address_choice = {} ;
  $scope.contact_choice = {} ;
  if ($scope.contact_choices.length > 0) {
    $scope.contact_form_view = 0  
  }
  if ($scope.contact_choices.length > 0) {
    $scope.address_form_view = 0
  }

  console.log($scope.name);
  console.log($scope.address_choices);
  console.log($scope.name);
  $scope.edit_company =1 ;
  $scope.add_company = 0

}

$scope.cancel_edit_company = function(){
  resp = confirm("Are you sure you want to exit");
  console.log("inside cancel_contact_company ");
  if (resp){
    $scope.show_company_list() ;
    $scope.edit_company = 0 ;
    $scope.name = "" ;
    $scope.address_choices = [] ;
    $scope.contact_choices = [] ;
    $scope.address_choice = {} ;
    $scope.address_choice = {} ;
  }
  

}

// new company add modal methods

$scope.add_new_company = function(){
    $scope.hide_company_list() ;
    $scope.add_form_stage = 1 ;
    $scope.name = "" ;
    $scope.address_choices = [] ;
    $scope.contact_choices = [] ;
    $scope.address_choice = {} ;
    $scope.address_choice = {} ;
  
    $scope.add_company = 1;
    $scope.edit_company = 0 ;
    

} ;

$scope.cancel_new_company = function(){
  resp = confirm("Are you sure you want to exit");
  if (resp){
    $scope.show_company_list() ;
    $scope.add_company = 0;
    $scope.name = "" ;
    $scope.address_choices = [] ;
    $scope.contact_choices = [] ;
    $scope.address_choice = {} ;
    $scope.address_choice = {} ;
  }
  }   



$scope.add_form_next_stage = function(){
    $scope.add_form_stage = $scope.add_form_stage + 1 ;
  }
  $scope.add_form_previous_stage = function(){
      $scope.add_form_stage = $scope.add_form_stage - 1 ;

  }


// #-------------------- Submiting company form ---------------------#

  $scope.save_details_to_db = function(){
    console.log("-------------------------------");
    console.log($scope.contact_choices)
    var address_only = {}
    var company_data = {'name':$scope.name ,'address_details':$scope.address_choices,'contact_details':$scope.contact_choices, 'id': 0 }
    console.log(company_data);
    $http({
                method: 'POST',
                data: company_data,
                url: '/api/post/add_company'
                }).then(function successCallback(response){
                  alert("company added sucessfully ")
                  $scope.add_company = 0;
                  $scope.show_company_list() ;
                  $scope.get_companies()
                },
                function errorCallback(response) {
                    console.log(response)
                    $scope.show_company_list() ;
                    

                });

   
  
  };
  $scope.edit_save_details_to_db = function(){
    console.log("-------------------------------");
    var address_only = {}
    var company_data = {'name':$scope.name ,'address_details':$scope.address_choices,'contact_details':$scope.contact_choices,'id': 1,'company_id':$scope.company_id }
    console.log(company_data);
    $http({
                method: 'POST',
                data: company_data,
                url: '/api/post/add_company'
                }).then(function successCallback(response){
                  alert("company added sucessfully ")
                  $scope.add_company = 0;
                  $scope.get_companies()
                },
                function errorCallback(response) {
                    console.log(response)
                    $scope.show_company_list() ;

                });

   
  
  };



  $scope.drag = function(){
    console.log("drag in progress");
  }
  $scope.mapLoc = function(e){
    console.log(e.target.value);
    $http({
      method: 'GET',
      url : 'https://maps.googleapis.com/maps/api/geocode/json?address=india,haryana,panchkula,sector12-A,house%20number%2012&key=AIzaSyAlMQrWo9Pmiz0hM5b9ZPkAdG6QVN2xzQM',
    })
    .then(function successCallback(response){
          console.log(response.data.results[0].geometry.location); });

  }

//-------------------------- getting ----- city , state , country --------------------------    
  $scope.get_country_list = function(){
    console.log("get_country_list");
    $http({
      method: 'GET',
      url: '/api/get/country_list'
    }).then(function successCallback(response){
      console.log(response)
      $scope.country_list = response.data.country_list;
    });
  }
  $scope.get_state_list = function(country_id){
    var state_list_data = {'country_id' : country_id }
    console.log("get_state_list");
    console.log(state_list_data);
    $http({
            method: 'POST',
            data: state_list_data,
            url: '/api/get/state_list'
              }).then(function successCallback(response){
                $scope.state_list = response.data.state_list
        
            });

  }
  $scope.get_city_list = function(state_id){
    console.log(state_id);
    var city_list_data = {'state_id' : state_id }
    console.log("get_state_list");
    console.log(city_list_data);
    $http({
            method: 'POST',
            data: city_list_data,
            url: '/api/get/city_list'
              }).then(function successCallback(response){
                  $scope.city_list = response.data.city_list        
            });

  }

});



