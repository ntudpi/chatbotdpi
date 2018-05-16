$.ajax({
  url: 'https://api.wit.ai/message',
  data: {
    'q': 'set an alarm in 10min',
    'access_token' : '67453HLLYIEHMNZPGKIVK6TOLP3GPGF4'
  },
  dataType: 'jsonp',
  method: 'GET',
  success: function(response) {
      console.log("wit success!", response);
  }
});
