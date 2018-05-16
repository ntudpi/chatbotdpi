function getResponse (textInput, curState, callback) {
  $.ajax({
    url: 'https://api.wit.ai/message',
    data: {
      'q': textInput,
      'access_token' : '67453HLLYIEHMNZPGKIVK6TOLP3GPGF4'
    },
    dataType: 'jsonp',
    method: 'GET',
    success:function(response) {
              callback(response.entities, curState);
            }
  });
}

function doResponse(entities) {
  var choiceLen = curState.getChoices.length;

  var score = Array(choiceLen);
  for(var i=0; i<choiceLen; i++) score[i]=0;

  console.log(choiceLen);

  for(var i=0; i<choiceLen; i++)
  {
    console.log(entities);
    console.log(curState);
    console.log(curState.getNextStrings[i]);
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
  if(maxInd == -1)
  {
    botResponse();
    return;
  }
  curState = curState.getNextStates[maxInd];
  doResponse(entities, curState);
}

textInput = "semester period";
curState=openingHours;

getResponse(textInput, curState, doResponse);