# NTU DPI ChatBot Report
 
## Without NLP (Natural Language Processing)
We created the possible conversation in a tree
Here is a look of a section of the tree
![Here is a look of a section of the tree](https://ia601504.us.archive.org/2/items/ScreenShot20180517At3.17.40PM/Screen%20Shot%202018-05-17%20at%203.17.40%20PM.png)
In the conventional chatbot that just use button, the user can only click the options to moving through the nodes of the tree.
The implementation was quite straightforward.

#### Modifying the tree
Maintaining the tree is also not so diffifult. When one need to change to flow of the tree or the messages in a node, all they need to do is just to modify a CSV file, accessible via excel, and just execute a single line command through terminal.
> **Possible Improvement:**
> We should be able to make the interface to modify the tree better from the user perspective. But currently it is not our focus.
-------
## Augmenting NLP -  wit.ai
In order to augment NLP to the chatbot (to let user input texts instead of just clicking buttons), we use the NLP service from wit.ai to classify the texts using keyword identification method. Currently we use https://wit.ai/kevinwinatamichael/chatbotdpi/entities app to classify the text.

### Why wit.ai?
#### Free
The service is totally free. There is no limit on number of request (they do ask us to let them know when we are going to use it heavily [*above 1 request/sec in average]).*
#### Nice training interface
Training the NLP app through wit.ai is really easy and has nice interface. Suitable for long-term usage
#### Allow constant training
We don't need to deliberately train the NLP app. The requests while using the chatbot will be recorded and we can look at it as inbox. We can help the user to learn by validating the NLP classification, and correct them if it got it wrong.
#### Support HTTP API
As far as we had seen, not many NLP has this functionallity. By using HTTP API we can directly connect to the wit.ai server, send them our input, and get the analysis result. What's better is that we can do all of it front-end in JavaScript. Since campuspress just allow us to access the content management system Wordpress, we need to host another server to process the NLP by ourselves if we don't have the HTTP API, which is quite tedious, and might be costly.
#### Modular & Simple
We can just classify the texts using keyword classification method. It's simple, don't require any coding, and we can easily transfer the keywords for other purposes. Since question and asking in customer service, oftenly, does not require complex context analysis, wit.ai seems good to go for basic usage.

----
## Our steps in NLP

#### The idea
The idea here, is that for every next node (possible next response from the chatbot) in our current node (current state of conversation), we assign a corresponding keyword.
So the we will move to the next node by the best matching keyword (which is easily done by the wit.ai).
Consider this example,
The conversation is currently in the node `a`, which has three possible next nodes, named `b`, `c`, and `d`. The next node will be either from three of them, depending on the keywords attached to them. We might go to the node `b`, if the user said something about, let say `fish`. And we'll go to the node `c`, if the user say `pizza`, and `d` if the user say `bread`.
> A message, in order to be classified as the keyword `fish`, does not have to be directly related to the word 'fish'. It could be anything. We can modify it by our self. For example, I might want to teach the wit.ai NLP, to classify the word 'mouse', as `fish`. And it's totally okay in wit.ai, though it's not a good practice.


#### First problem
Let us give an example of how the above idea might not work as desired.
Consider this scenario, the user asked the library opening time. The bot is intended to ask `At which period? Is it vacation, or semester, or extended?`, and then `When is it? Weekdays, Saturday, or Sunday?`.
The user might answer it by `At the extended period` and then after the bot asked the day, `Sunday, please`, as expected by the bot.
But how if the user directly said `At an extended period Sunday`. Remember that the classification is not our major problem now. So the bot will successfully identify which period it is, `extended period`. But the bot, will once again, asked `When is it? Weekdays, Saturday, or Sunday?`, and the user will be mad.

**Solution**
Fortunately it's not a big problem, we can solve this by allowing the bot to take the input `At an extended period Sunday`, first extract the period as `extended period`, and pass it directly to the next node which asks the day of the week, without asking the user. And it will repeatedly doing it untill the input match no keywords of the node.

#### Second problem
Consider this scenario, at the top of the conversation (before the user told the bot that she want to ask about opening hours), the user asked `What's the library opening hour this Monday?`. The bot, at the top conversation, might successfuly classify the first keyword to `opening hours`, and then, go to that node, and it supposed to ask `At which period? Is it vacation, or semester, or extended?`. By using our solution in the first solution, the bot should be able to continue going down through the node. But unfortunately, at this example, the user provided the wrong information, the `Sunday` won't be extracted since it's not in the list of possible keywords. So the bot asks `At which period? Is it vacation, or semester, or extended?`. The user, without knowing that the information has not been extracted properly, will answer, `At the vacation`, for example. But then, after that, the bot will asks `When is it? Weekdays, Saturday, or Sunday?`, and the user will be mad.

**Solution**
Fortunately, once again, we have the solution for this problem.
So the initial condition is that
`Opening hours`->`semseter`, `vacation`, `extended`
`semester`->`weekdaySemseter`,`saturdaySemester`,`sundaySemester`
`vacation`->`weekdayVacation`,`saturdayVacation`,`sundayVacation`
`extended`->`weekdayExtended`,`saturdayExtended`,`sundayExtended`
*'->' indicates the keywords for next nodes.*
To solve the problem, we can append it so to be
`Opening hours`->`semseter`, `vacation`, `extended`,`generalWeekday`,`generalSaturday`,`generalSunday`
`semester`->`weekdaySemseter`,`saturdaySemester`,`sundaySemester`
`vacation`->`weekdayVacation`,`saturdayVacation`,`sundayVacation`
`extended`->`weekdayExtended`,`saturdayExtended`,`sundayExtended`
`generalWeekday`->`weekdaySemseter`,`weekdayVacation`,`weekdayExtended`
`generalSaturday`->`saturdaySemester`,`saturdayVacation`,`saturdayExtended`
`generalSunday`->`sundaySemester`,`sundayVacation`,`sundayExtended`
And now as you can see, the bot will be able to extract the information from `What's the library opening hour this Monday?`, to move down to the `Opening hours` node, and them to the `generalSunday` node. Then asks `At which period? Is it vacation, or semester, or extended?`, the user answered `vacation`, and both of them is happy.

#### Third Problem
Sometimes, the user might not always want to complete the conversation, and maybe directly jump to a node within a tree.
`user`: when does the library open in Sunday?
`bot`: at which period?
`user`: how do I borrow a book?
Using the solution from the second solution, the bot will not be able to detect any keyword to `borrow book`, since it's not on the list.

**Solution**
Fortunately, third time, we have solved this problem. The solution is that we simply add one more column to the CSV file, to add the keyword to a node so that the user can directly jumps to that node using that keyword.

So, now jumping to a node `sundaySemester`, could be achieved from two different ways, by following the tree in the path `Opening hours` -> `Sunday` -> `semester`, or directly accessing keyword associated with it, `opening hours sunday semester`, for example.

The former one is preferable, since we're now saving the usage of keyword. Training a bot to recognize keyword is costly, and having `opening hours sunday semester` will have a lot of overlap with keyword `sunday`, or `opening hours`, which will confuse the bot.

So, the actual solution is not adding direct access keyword to all nodes. We just adding them to the node that might be accessed without providing any keyword of its parent node. For example, `borrow book` is a child of the node `requesting material`, but to ask `how do I borrow a book?` does not require the user to say anything about `requesting material`. But in `opening hours in vacation sunday?`, have all the keywords of its parent node.

So now, what we have is a tree, that some of the node has a direct access link, and some don't (just accessible from the parent). And it pretty much solve the problems.

#### Fourth problem
After we developed the system of how the tree works. The problem is internally in wit.ai. The fact that we were using keyword classification method, is not really scalable. Having direct links to most of the node will cause us a really big problem if the tree is to big, since there will be overlapping of classification from different context. There might be a way to put and connect subtrees in a hierarchical way, but we need to let the user know how to navigate between those subtrees, and it's more like talking to different chatbot based on its context (maybe financial, academic, administrative, etc.)

**Solution**
But there is a way to tackle this problem. Keep the chatbot simple by not growing the tree to be to big. Especially not to many direct access keyword node. And as our library chatbot is intended to that purpose, we think that it should not be a big problem.

## The real problem
Finally, actually, the real problem is quite obvious, it takes time to develop the tree, and it takes time to train the keyword. But we are quite sure that given enough time it will work quite well.

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