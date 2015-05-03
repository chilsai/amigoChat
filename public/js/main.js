jQuery(function($){
  var socket = io();

  $("#ChatWrapId").addClass('hideDiv');
  $("#nickErrorMessage").addClass('hideDiv');

  $('#theform').submit(function(){
    socket.emit('chat message', $('#nickNameId').val() +':' +$('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('updateUserCount', function(msg){
    $('#numUsers').val(msg);
    $("label[for='userCount']").text(msg);
  });

  $('#nickNameForm').submit(function(event){
    //event.preventDefault();
    socket.emit('add user',$('#nickNameId').val(),function(data){
      if(data){
        $("#nickNameWrapId").addClass('hideDiv');
        $("#ChatWrapId").removeClass('hideDiv');
        $("label[for='currentUserName']").text($('#nickNameId').val());
      }else{
        $("#NickError").html('');
        $("#nickNameDiv").addClass('has-error');
        $("#nickErrorMessage").removeClass('hideDiv');
      }
    });
    $('#nickName').val('');
    return false;
  });


  socket.on('nickNames', function(nickNames){
    var userList = []
    $("label[for='userCount']").text(nickNames.length);
    for(i=0; i<nickNames.length; i++){
      if(nickNames[i] != $('#nickNameId').val()){
        userList.push('<a href="#" class="list-group-item glyphicon glyphicon-user">  '+ nickNames[i]+'</a>');
      }

    }
    $( "#userListULId" ).empty();
    $('#userListULId').append( userList.join('') );
  });

});
