function getResponse (textInput, callback) {
  $.ajax({
    url: 'https://api.wit.ai/message',
    data: {
      'q': textInput,
      'access_token' : '67453HLLYIEHMNZPGKIVK6TOLP3GPGF4'
    },
    dataType: 'jsonp',
    method: 'GET',
    success:function(response) {
              callback(response.entities, 0);
            }
  });
}

function doResponse(entities, numCall) {
  var choiceLen = curState.getChoices.length;

  var score = Array(choiceLen);
  for(var i=0; i<choiceLen; i++) score[i]=0;

  console.log(entities);
  console.log(curState.getNextStrings);
  for(var i=0; i<choiceLen; i++)
  {
    if(typeof entities[curState.getNextStrings[i]] != "undefined")
    {
      score[i] += entities[curState.getNextStrings[i]][0]['confidence'];
    }
  }
  console.log(score);

  var maxVal=0.2;
  var maxInd=-1;
  for(var i=0; i<choiceLen; i++)
  {
    if(score[i]>maxVal)
    {
      maxVal = score[i];
      maxInd = i;
    }
  }
  if(maxInd == -1 && numCall!=0)
  {
    botResponse();
    return;
  }
  if(maxInd == -1 && numCall==0)
  {
    var sorry = "Sorry I can't understand you &#9785;<br>Can you please restate your input in different way?"
    addHistory("bot", sorry);
    return;
  }
  curState = curState.getNextStates[maxInd];
  doResponse(entities, numCall+1);
}

textInput = "semester period";
curState=topConv;



$(document).on('keypress', function(event) {
  // When the user hits the enter key trigger.
  if (event.which === 13) {
    var textInput = document.getElementById("answer").value;
    if (textInput !== '') {
      addHistory("user", textInput);
      document.getElementById("answer").value = '';
      chatStack.push(curState);
      getResponse(textInput, doResponse);
    }
  }
});