function getResponse (text, callback) {
  $.ajax({
    url: 'https://api.wit.ai/message',
    data: {
      'q': text,
      'access_token' : '67453HLLYIEHMNZPGKIVK6TOLP3GPGF4'
    },
    dataType: 'jsonp',
    method: 'GET',
    success:function(response) {
              callback(response.entities);
            }
  });
}

function doResponse(resp) {
    console.log(resp['opening_hours']);
    console.log(resp['vacation_period'])
}

getResponse("library open in holiday", doResponse);
