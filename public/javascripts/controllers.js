function MessagesCtrl($scope, $http){
    $scope.glitch = false;
    $glitcharea = $("#glitcharea");
    $http.get('/getmessages').
        success(function(data,status,headers,config){
            console.log("got messages: ", data);
            $scope.messages = data;
            $scope.glitch = true;
             
            //glitch();
        });
    $http.get('/getaverage').
        success(function(data,status,headers,config){
            $scope.average = data;
        });
    $scope.getDeviation=function(initial, average){
        console.log(average);
        return parseInt(initial)-parseInt(average);
    }
    var glitch = function(){
        var sglitch = $scope.glitch;
        $scope.$apply(function(){
            $scope.glitch = !$scope.glitch;
            console.log("glitch is ", $scope.glitch);
        });
        if(!sglitch){
            setTimeout(glitch, Math.floor(Math.random()*3000)+200);
            $glitcharea.toggleClass("glitch");
        }else{
            setTimeout(glitch, Math.floor(Math.random()*10000)+1);
        }
                    
    }
}
