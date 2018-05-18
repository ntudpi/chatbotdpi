function getResponse (textInput, callback) {
  // get the analysis result from wit.ai

  jQuery( document ).ready(function( $ ) { // to tackle wordpress Jquery conflict

    $.ajax({ // ajax call to wit.ai HTTP API

      url: 'https://api.wit.ai/message',
      data: {
        'q': textInput,
        'access_token' : '67453HLLYIEHMNZPGKIVK6TOLP3GPGF4'  // token to https://wit.ai/kevinwinatamichael/chatbotdpi/entities
      },
      dataType: 'jsonp',
      method: 'GET',
      success:function(response) {
                callback(response.entities, 0, 0, curState); // call the callback function after the AJAX response
              }
      // we can't directly manipulate the response there, since the request is asynchronous
      // https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
    });
  });
};

function doResponse(entities, numCall, directAccessDepth, initialState) {
  // handle the response based on the classified result from wit.ai
  // entities is the result, numCall indicates the level of the recursion of this function
  // initialState is the last state the bot responsed
  // ( we don't want to store intermediate states into the chatStack )

  console.log(entities);

  // check which of the keyword best matches the input
  var maxVal=0.2; // ignore the result if the confidence level is below 0.2
  var maxInd=-1; // for easy checking
  for(var i=0; i<curState.getNextStates.length; i++)
  {
    if(typeof entities[curState.getNextStrings[i]] != "undefined") // if the keyword exist in the entities dictionary
    {
      if(entities[curState.getNextStrings[i]][0]['confidence']>maxVal) // if it's better (more confidence)
      {
        maxVal = entities[curState.getNextStrings[i]][0]['confidence']; // update the best confidence
        maxInd = i; // update the best confidence owner
      }
    }
  }

  if(typeof entities['back'] != "undefined") // if the keyword 'back' exist (not included in the previous loop)
  {
    if(entities['back'][0]['confidence']>maxVal) // only accept if it's more confident than others
    {
      // similar to the implementation of backChat
      document.getElementById("choices").innerHTML = ""; // clear the buttons
      curState = chatStack.pop(); // get and remove the latest recorded chat state
      window.setTimeout(botResponse,500); // put the curState response, continue as normal
      return;
    }
  }

  // beginning of direct access implementation
  // (jump to state instead of following the tree)
  var bestValDirect=maxVal; // ignore the result if less confident
  var bestIndDirect=-1; // for easy checking
  for(var i=0; i<directAccessStates.length; i++)
  {
    if(typeof entities[directAccessStates[i][1]] != "undefined") // if the keyword exist in the entities dictionary
    {
      if(entities[directAccessStates[i][1]][0]['confidence']>bestValDirect) // if it's better (more confidence)
      {
        bestValDirect = entities[directAccessStates[i][1]][0]['confidence']; // update the best confidence
        bestIndDirect = i; // update the best confidence owner
      }
    }
  }
  if(bestIndDirect!=-1 && directAccessDepth==0) // try the direct access first before the usual chat (following the tree)
  { // jump if it's the first try to directAccessOnly
    chatStack.push(initialState); // put the latest state into history before jumping
    curState = directAccessStates[bestIndDirect][0]; // go to next state
    doResponse(entities, numCall+1, directAccessDepth+1, initialState); // continue as normal
    return;
  }
  // end of direct access implementation

  if(maxInd == -1 && numCall!=0) // if it's not the first call, but no keyword match
  {
    chatStack.push(initialState); // put the latest state into history before changing
    botResponse(); // continue as normal
    return;
  }
  if(maxInd == -1 && numCall==0) // if it's not the first call but no keyword match
  {
    if(typeof entities['thanks'] != "undefined") // if there is greetings
    {
      addHistory("bot", "My pleasure");
      curState = topConv;
      botResponse();
      return; 
    }
    else if(typeof entities['greetings'] != "undefined") // if there is greetings
    {
      addHistory("bot", "Hi, nice to meet you!<br>");
      botResponse();
      return; 
    }
    var sorry = "Sorry I can't understand you, or it's beyond my scope &#9785;<br>Can you please restate your input in different way?<br>\
                Or you can <a target='_blank' href='http://bit.ly/ntuaskalibrarian'>ask a librarian</a>."
    addHistory("bot", sorry); // let the bot say sorry, but no changes 
    return; // (no button clearing, no state change, wait for next input)
  }
  curState = curState.getNextStates[maxInd];
  doResponse(entities, numCall+1, directAccessDepth, initialState);
  return;
}

// When the user hits the enter key trigger.
jQuery( document ).ready(function( $ ) { // to tackle wordpress Jquery conflict
  $(document).on('keypress', function(event) { // on keypress
    if (event.which === 13) { // if key pressed is enter, else ignore
      var textInput = document.getElementById("answer").value; // get the value
      if (textInput !== '') { // if it's not empty
        addHistory("user", textInput); // put user's text into chat history
        document.getElementById("answer").value = ''; // clear the input field
        getResponse(textInput, doResponse); // get the bot response (passing doResponse as callback function)
      }
    }
  });
});
