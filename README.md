
# NTU DPI ChatBot Documentation
 
## Requirements
JQuery
``` html
<script
  src="https://code.jquery.com/jquery-3.3.1.min.js"
  integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
  crossorigin="anonymous"></script>
  ```
  Wit.ai app access token
`67453HLLYIEHMNZPGKIVK6TOLP3GPGF4`

## Files
Development files:
1. `chatbot.html`
2. `chatbot.js`
3. `chart.csv`
4. `chart2.csv`
5. `chatbot.css`
6. `converter.py`
7. `wit.js`


Production files:
1. `chatbot.js`
2. `output.js `
3. `wit.js`

## `chatbot.js`
### The class
The chatbot is built up from some *state*-s. Each state has a message of what to tell the user, choices texts and the link to the next states.
``` js
class State {
  // the class that stores the story in chatbot

  constructor(response, choices, nextStates, nextStrings, directAccess){
    this.response = response;
    this.choices = choices;
    this.nextStates = nextStates;
    this.nextStrings = nextStrings;
    this.directAccess = directAccess;
  }

  // getters
  get getResponse() {
    return this.response;
  }
  get getChoices() {
    return this.choices;
  }
  get getNextStates() {
    return this.nextStates;
  }
  get getNextStrings() {
    return this.nextStrings;
  }
  get getDirectAccess() {
    return this.directAccess;
  }

  // setters
  set setChoices(inputChoices) {
    this.choices = inputChoices;
  }
  set setNextStates(inputNextStates) {
    this.nextStates = inputNextStates;
  }
  set setResponse(inputResponse) {
    this.response = inputResponse;
  }
  set setNextStrings(inputNextStrings) {
    this.nextStrings = inputNextStrings;
  }
  set getDirectAccess(inputDirectAccess) {
    this.directAccess = inputDirectAccess;
  }
}
```
### Chat history
``` js
var chatStack = [];
```
initializes and empty stack to store the chat history.
### botResponse()
``` js
function botResponse() {
  // put the bot response in history and create the choices in current state

  addHistory("bot", curState.getResponse); //put to history

  if(curState===topConv) //if it's top of conversation, then clear the history
  {
    chatStack = [];
  }

  makeChoices(curState.getChoices); // put the choices button

  return;
}
```
The assumption held is that the object name of the top of the conversation is `topConv`. So it will check whether the current state or `curState` is `topConv`. If it is, we will empty the `chatStack`. Then it calls the function `makeChoices`, with it's choices texts as parameter.


`addHistory` will help us to put the `state.msg` into our chat box history. (do not be confused with history in `chatStack`)
### makeChoices()
``` js
function makeChoices(inp) {
  // put the choices available to the HTML
  
  var choiceHTML = "";

  for(var i=0; i<inp.length; i++) // inp is the array of choices strings
  {
    choiceHTML += '<button class="button" onclick="userResponse('+i+')">' + inp[i] + '</button>';
  }
  
  if(chatStack.length!==0) // if the history is not empty, then allow going back
  {
    choiceHTML += '<button class="button" onclick=backChat()>Back</button>';
  }

  document.getElementById("choices").innerHTML = choiceHTML; // put the buttons into the div
  
  return;
}
```
The assumption here is that our HTML file has a div with id `choices`, which is a container where we can put our buttons as input means for user.


Here is a segment of the HTML file
``` html
<body>
        <div class="mycontainer history" id="history"></div>
        <div class="mycontainer choices" id="choices"></div>
</body>
```
So what it does is basically make a the HTML into a string `choiceHTML`, and then assign it to the innerHTML of the element `choices`.


It also check if the `chatStack` is not empty, thus we can go back, appending the back button.


Each of the choices and back button calls the function `userResponse(i)` and `backChat()`, resp. `i` indicates the index of choices from the array of text choices. This index will help us to determine the next state which the user chosen. (\*each element in text choices (`this.choices`) corresponds with its next states in the `this.nextStates` array.

### User response
```js
function userResponse(choiceIndex) {
  // things to do when user click the appropriate button

  addHistory("user", curState.getChoices[choiceIndex]); // put user response to the history
  document.getElementById("choices").innerHTML = ""; // clear the buttons

  chatStack.push(curState); // add the previous state into the history before changing
  curState = curState.getNextStates[choiceIndex]; // get to the next state

  window.setTimeout(botResponse,500); // wait for a while, for better UX
}
```
First we record the chat history by `push` -ing the `chatStack`, and also put the choice into the chat box using `addHistory`.
After that we clear the buttons.


`curState.getNextStates` returns the array which contains the next states, which element will we specify using the `choiceIndex`, which is `i`, from the `makeChoices` function.


`setTimeout` is there for aesthetic reason.


### backChat()
``` js
function backChat(){
  // when user clicked back

  addHistory("user", "Back"); // put 'back' to the history

  document.getElementById("choices").innerHTML = ""; // clear the buttons

  curState = chatStack.pop(); // get and remove the latest state
  
  window.setTimeout(botResponse,500); // wait a while for UX
}
```
This function does about the same thing as userResponse, but it goes to the stack on top of the `chatStack`.


### addHistory()
``` js
function addHistory(role, msg) {
  // add new chat to the history

  var history = document.getElementById("history").innerHTML; // get the current history content

  if(role=="bot")
  {
    history += '<div class="chat bot">' + msg + '</div>'; // append the html
  }
  else // role == "user"
  {
    history += '<div class="chat user">' + msg + '</div>'; // append the html
  }

  document.getElementById("history").innerHTML = history; // put back the appended html

  var elem = document.getElementById("history");
  elem.scrollTop = elem.scrollHeight; // auto scroll the chat window down
}
```
Put a new div with the specified class into the chat history container. `elem.scrollTop = elem.scrollHeight;` is to auto scroll the history down so that the latest thread is visible.


## `chart.csv`
The format of the CSV file looks like this
```
state,msg,choices,nextStates,nextStrings,directAccess
STATENAME,"MSG","['CHOICE_1','CHOICE_2']","[STATE_1,STATE_2]", "['KEYWORD_1','KEYWORD_2']",'DIRECT_ACCESS_KYWD_LINK'
STATENAME,"MSG","['CHOICE_1','CHOICE_2']","[STATE_1,STATE_2]", "['KEYWORD_1','KEYWORD_2']",'DIRECT_ACCESS_KYWD_LINK'
...
```
The number of choices must be same to the number of states.

*You may work with or edit chart.csv in MS Excel.*

Check the example [here.](https://github.com/ntudpi/chatbotdpi/blob/master/chart.csv)

#### Requirements for STATENAME
1. `STATENAME` must fulfil the criteria for a variable naming rules.
         -   Names can contain letters, digits, underscores, and dollar signs.
        -   Names must begin with a letter
        -   Names can also begin with $ and _ 
        -   Names are case sensitive (y and Y are different variables)
        -   Reserved words (like JavaScript keywords) cannot be used as names
2. The top (the starting state) of the conversation state name must be `topConv`. (could be changed, but need some other changes in the html to make it work)


#### Requirements for MSG and CHOICE_X
1. Must not has newline (`\n`) character.
2. Must not has special characters, use html code instead, e.g., `&amp;` for `&`.
3. Whenever `"` or `'` is used, put `\` infront of it, i.e., `\"` and `\'`.


#### Requirements for STATE_X
1. Must exist in `STATENAME`.

#### Requirements for KEYWORD_X
1. Must exists in the wit.ai app (will be discussed more later)
2. Correspond to the desired next states in choices.

#### Requirements for directAccess DIRECT_ACCESS_KYWD_LINK
1. Must exists in the wit.ai app (will be discussed more later)
2. Correspond to the state.

## `converter.py`


### Data gathering
``` python
import csv
state = []
msg = []
choices = []
nextStates = []
nextStrings = []
directs = []

with open('chart2.csv', newline='') as csvfile:
  reader = csv.DictReader(csvfile)
  for row in reader:
    # append the cell to appropriate lists
    state.append(row['state'])
    msg.append(row['msg'])
    choices.append(row['choices'])
    nextStates.append(row['nextStates'])
    nextStrings.append(row['nextStrings'])
    directs.append(row['directAccess'])
```
The code block above convert the CSV file to an array of dictionary with each dictionary has `state`, `msg`, `choices`, `nextStates`, etc. as its keywords.


### Writing
The main purpose of `converter.py` is to convert the csv into JS script, which contains the instantiation of the *state* objects, linking between the objects, and create the list for direct access functionallity.
``` python
jscommand="" # store the string of command

for i in range(len(state)): # constructing the objects
  jscommand += "const "+state[i]+" = new State('"+msg[i]+"',"+choices[i]+","+"[],"+nextStrings[i]+");\n"

for i in range(len(state)): # linking the next states
  jscommand += state[i] + ".setNextStates = " + nextStates[i] + ";\n"

jscommand += "var  directAccessStates = [];\n"; # initialize empty array

for i in range(len(state)):
  if(directs[i]!="null"): # append the [state, keyword] list pair
    jscommand += "directAccessStates.push([" + state[i] + ",'" + directs[i] + "']);\n"

text_file = open("output.js", "w")
text_file.write(jscommand)
text_file.close()
```
### `chart2.csv`
For some reason, data encoding from excel might not be compatible to thus decoded by python. Therefore, I recommend to copy and paste the raw text from `chart.csv` and paste it to `chart2.csv`, hence use `chart2.csv` as input file to python.


### `output.js`
`converter.py` do the conversion from csv to js file to `output.js`.

### `wit.js`
#### `getResponse()`
``` js
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
                callback(response.entities, 0, curState); // call the callback function after the AJAX response
              }
      // we can't directly manipulate the response there, since the request is asynchronous
      // https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
    });
  });
};
```
### doResponse()
``` js
function doResponse(entities, numCall, initialState) {
  // handle the response based on the classified result from wit.ai
  // entities is the result, numCall indicates the level of the recursion of this function
  // initialState is the last state the bot responsed
  // ( we don't want to store intermediate states into the chatStack )

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
  if(bestIndDirect!=-1) // try the direct access first before the usual chat (following the tree)
  {
    chatStack.push(initialState); // put the latest state into history before jumping
    curState = directAccessStates[bestIndDirect][0]; // go to next state
    botResponse(); // continue as normal
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
    var sorry = "Sorry I can't understand you &#9785;<br>Can you please restate your input in different way?"
    addHistory("bot", sorry); // let the bot say sorry, but no changes 
    return; // (no button clearing, no state change, wait for next input)
  }
  curState = curState.getNextStates[maxInd];
  doResponse(entities, numCall+1, initialState);
  return;
}
```
#### Check for enter key being pressed
``` js
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
```
### `chatbot.html`
``` html
<html>
<head>
  <link rel="stylesheet" type="text/css" href="./chatbot.css">
<script
  src="https://code.jquery.com/jquery-3.3.1.min.js"
  integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
  crossorigin="anonymous"></script>
</head>
<body>
  <div class="mycontainer history" id="history"></div>
  <div class="mycontainer choices" id="choices"></div>
  <input class="inputField" type="text" id="answer" placeholder="Enter your response" required/>
</body>
<script src="./chatbot.js"></script>
<script src="./output.js"></script>
<script>
  curState = topConv;
  botResponse();
</script>
<script src="./wit.js"></script>

```
Here we integrates all component of the chat bot, including two additional lines of JS to set the current state to be `topConv` and call the initial function `botResponse`.
### `chatbot.css`
 
Chatbot.css just do necessary styling. The code is self-explanatory.
``` css
.chat {
  text-align:right;
  margin:1em;
  padding:0.7em;
  border: 2px;
  border-radius: 1em;
  min-width:1em;
  max-width:30em;
  overflow:auto;
  display:inline-block;
}

.bot {
  background-color:#ffffff;
  text-align:left;
  float:left;
  clear:both;
}

.user {
  background-color:#66b3ff;
  text-align:right;
  color:#ffffff;
  float:right;
  clear:both;
}

.mycontainer {
  float: center;
  width: 100%;
  max-width:40em;
  padding: 1em;
    margin: 0;
}

.history {
  background-color:#e0e0e0;
  overflow-y:auto;
  height:600px;
}

.choices {
  background-color:#66b3ff;
  text-align:right;
  min-height:3em;
}

.button {
    background-color: #66b3ff;
    border: none;
    color: #000000;
    padding: 0.5em 1em;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    border-radius:1em;
}

.inputField {
  width:100%;
  min-height:2em;
  text-align:center;
  font-size:120%;
  float:center;
}
```