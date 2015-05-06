jQuery(function($){
  var socket = io();

  $( document ).ready(function() {
    $("#nickNameId").focus();
    $("#nickErrorMessage").hide();
    $("#ChatWrapId").hide();
  });

  $('#theform').submit(function(){
    if($('#chatMessage').val() != ''){
      socket.emit('chat message', $('#nickNameId').val(),$('#chatMessage').val());
      $('#chatMessage').val('');
    }
    return false;
  });

  socket.on('chat message', function(username,msg){    
    if(username === $('#nickNameId').val()){
      $('#messages').append($('<div class="bubble bubble-alt white">').text(username +' : '+ msg));
    }else{
      $('#messages').append($('<div class="bubble green">').text(username +' : '+ msg));
    }
  });

  socket.on('updateUserCount', function(msg){
    $('#numUsers').val(msg);
    $("label[for='userCount']").text(msg);
  });

  $('#nickNameForm').submit(function(event){
    //event.preventDefault();
    socket.emit('add user',$('#nickNameId').val(),function(data){
      if(data){
        $("#ChatWrapId").show();
        $("#nickNameWrapId").hide();
        $("label[for='currentUserName']").text($('#nickNameId').val());
        $('#chatMessage').focus();
      }else{
        $("#NickError").html('');
        $("#nickNameDiv").addClass('has-error');
        $("#nickErrorMessage").show();
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
