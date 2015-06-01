jQuery(function($){
  var socket = io();
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 400; // ms

  $( document ).ready(function() {
    $("#nickNameId").focus();
    $("#nickErrorMessage").hide();
    $("#ChatWrapId").hide();
  });

  $('#theform').submit(function(){
    var message = $('#chatMessage').val();
    //message
    if(message != ''){
      socket.emit('chat message', $('#nickNameId').val(),$('#chatMessage').val());
      $('#chatMessage').val('');
    }
    return false;
  });

  $('#chatMessage').on('input', function() {
    updateTyping();
  });

  // Updates the typing event
  function updateTyping () {
      if (!typing) {
        typing = true;
        socket.emit('typing',$('#nickNameId').val());
      }
      lastTypingTime = (new Date()).getTime();
      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing',$('#nickNameId').val());
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
  }

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (userName) {
      $('#typingMessage').append($('<div id="'+userName+'typing">').text(userName +' is typing'));
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    //removeChatTyping(data);
    $('#'+data+'typing').remove();
  });

  socket.on('chat message', function(username,msg){
    var inputNode = '';
    if(username === $('#nickNameId').val()){
      //$('#messages').append($('<div id="chatMessageId" class="bubble bubble-alt white">').text(msg));
      inputNode = $('<div id="chatMessageId" class="bubble bubble-alt white">').text(msg);
    }else{
      //$('#messages').append($('<div id="chatMessageId" class="bubble green">').text(username +' : '+ msg));
      inputNode = $('<div id="chatMessageId" class="bubble green">').text(username +' : '+ msg);
    }
    $('#messages').append(inputNode);
    $('#messageDisplayBox')[0].scrollTop = $('#messageDisplayBox')[0].scrollHeight;
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
