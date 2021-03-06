import angular from 'angular';
import ngRoute from 'angular-route';
import scroll_glue from 'angularjs-scroll-glue';

module.exports = angular.module('tanks.chat', [ ngRoute, 'luegg.directives'])

.controller('ChatController', ChatController)

.directive('chat',function() {
    return {
          restrict: 'C',
          controller: ChatController,
          templateUrl: 'chat/chat.html'
    };
});

function ChatController($scope,socket)
{
     $scope.messages = [];
     $scope.inputMessage = '';

     if(socket)
     {
          socket.on('outputMessage', getMessages);

          $scope.sentEventListener = function(event) {
               const inputMessage = $scope.inputMessage;
               const name = localStorage.getItem('userName');
               const date = new Date();
               function getWeekDay(date) {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return days[date.getDay()];
               }
               const formattedDate = date.getHours() + ':' + date.getMinutes() + ', ' + getWeekDay(date);

               socket.emit('inputMessage', {
                    name,
                    message: inputMessage,
                    time: formattedDate
               });

               $scope.inputMessage = null;

          };
     }

     function getMessages(data)
     {
          if(data.length)
          {
               for(let x = data.length-1;x>=0; --x){
                    $scope.messages.push({
                         "chater_name": data[x].name,
                         "chater_message": data[x].message,
                         "chater_time": data[x].time
                    });
               }
               
               $scope.$apply(function () {
                    $scope.messages
               });
          }
     }
}
