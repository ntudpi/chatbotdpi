 <link rel="stylesheet" type="text/css" href="https://rawgit.com/ntudpi/chatbotdpi/master/chatbot.css">
<div class="mycontainer history" id="history"></div>
<div class="mycontainer choices" id="choices"></div>
<input class="inputField" type="text" id="answer" placeholder="Enter your response" required/>
<script src="https://rawgit.com/ntudpi/chatbotdpi/master/chatbot.js"></script>
<script src="https://rawgit.com/ntudpi/chatbotdpi/master/output.js"></script>
<script>
curState = topConv;
botResponse();
</script>
<script src="https://rawgit.com/ntudpi/chatbotdpi/master/wit.js"></script>
<div id="readme">
	# NTU DPI ChatBot Documentation


## Requirements
No library required


## Files
Development files:
1. `chatbot.html`
2. `chatbot.js`
3. `chart.csv`
4. `chart2.csv`
5. `chatbot.css`
6. `converter.py`


Production files:
1. `chatbot.js`
2. `output.js `


## `chatbot.js`
### The class
The chatbot is built up from some *state*-s. Each state has a message of what to tell the user, choices texts and the link to the next states.
``` js
class State {
  constructor(response, choices, nextStates){
    this.response = response;
    this.choices = choices;
    this.nextStates = nextStates;
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
  // bot chat and give choices
  addHistory("bot", curState.getResponse);
  if(curState===topConv)
  {
    chatStack = [];
  }
  makeChoices(curState.getChoices);
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
  for(var i=0; i<inp.length; i++)
  {
    choiceHTML += '<button class="button" onclick="userResponse('+i+')">' + inp[i] + '</button>';
  }
  if(chatStack.length!==0)
  {
    choiceHTML += '<button class="button" onclick=backChat()>Back</button>';
  }
  document.getElementById("choices").innerHTML = choiceHTML;
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


Each of the choices and back button calls the function `userResponse(i)` and `backChat()`, resp. `i` indicates the index of choices from the array of text choices. This index will help us to determine the next state which the user chosen. (*each element in text choices (`this.choices`) corresponds with its next states in the `this.nextStates` array.


### User response
```js
function userResponse(choiceIndex) {
  // things to do when user click the appropriate button
  chatStack.push(curState);
  addHistory("user", curState.getChoices[choiceIndex]);
  document.getElementById("choices").innerHTML = "";
  curState = curState.getNextStates[choiceIndex];
  window.setTimeout(botResponse,500);
}
```
First we record the chat history by `push` -ing the `chatStack`, and also put the choice into the chat box using `addHistory`.
After that we clear the buttons.


`curState.getNextStates` returns the array which contains the next states, which element will we specify using the `choiceIndex`, which is `i`, from the `makeChoices` function.


`setTimeout` is there for aesthetic reason.


### backChat()
``` js
function backChat(){
  addHistory("user", "Back");
  document.getElementById("choices").innerHTML = "";
  curState = chatStack.pop();
  window.setTimeout(botResponse,500);
}
```
This function does about the same thing as userResponse, but it goes to the stack on top of the `chatStack`.


### addHistory()
``` js
function addHistory(role, msg)
{
  // add new chat to the history
  var history = document.getElementById("history").innerHTML;
  if(role=="bot")
  {
    history += '<div class="chat bot">' + msg + '</div>';
  }
  else
  {
    history += '<div class="chat user">' + msg + '</div>';
  }
  document.getElementById("history").innerHTML = history;
  var elem = document.getElementById("history");
  elem.scrollTop = elem.scrollHeight;
}
```
Put a new div with the specified class into the chat history container. `elem.scrollTop = elem.scrollHeight;` is to auto scroll the history down so that the latest thread is visible.


## `chart.csv`
The format of the CSV file looks like this
```
state,msg,choices,nextStates
STATENAME,"MSG","['CHOICE_1','CHOICE_2']","[STATE_1,STATE_2]"
STATENAME,"MSG","['CHOICE_1','CHOICE_2']","[STATE_1,STATE_2]"
...
```
The number of choices must be same to the number of states.


*You may work with or edit chart.csv in MS Excel.*
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


## `converter.py`


### Data gathering
``` python
import csv
state = []
msg = []
choices = []
nextStates = []
with open('chart2.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
                print(row)
                state.append(row['state'])
                msg.append(row['msg'])
                choices.append(row['choices'])
                nextStates.append(row['nextStates'])
```
The code block above convert the CSV file to an array of dictionary with each dictionary has `state`, `msg`, `choices`, and `nextStates` as its keywords.


### Writing
The main purpose of `converter.py` is to convert the csv into JS script, which contains the instantiation of the *state* objects and linking between the objects.
``` python
jscommand=""
for i in range(len(state)):
        jscommand += "const "+state[i]+"= new State('"+msg[i]+"',"+choices[i]+",[]);\n"


for i in range(len(state)):
        jscommand += state[i] + ".setNextStates = " + nextStates[i] + ";\n"


text_file = open("output.js", "w")
text_file.write(jscommand)
text_file.close()
```
### `chart2.csv`
For some reason, data encoding from excel might not be compatible to thus decoded by python. Therefore, I recommend to copy and paste the raw text from `chart.csv` and paste it to `chart2.csv`, hence use `chart2.csv` as input file to python.


### `output.js`
`converter.py` do the conversion from csv to js file to `output.js`.


### `chatbot.html`
``` html
<html>
<head>
        <link rel="stylesheet" type="text/css" href="./chatbot.css">
</head>
<body>
        <div class="mycontainer history" id="history"></div>
        <div class="mycontainer choices" id="choices"></div>
</body>
<script src="./chatbot.js"></script>
<script src="./output.js"></script>
<script>
        curState = topConv;
        botResponse();
</script>
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
```
</div>