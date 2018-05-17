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

// store the chat history to allow user to go 'back'
var chatStack = [];


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


function userResponse(choiceIndex) {
  // things to do when user click the appropriate button

  addHistory("user", curState.getChoices[choiceIndex]); // put user response to the history
  document.getElementById("choices").innerHTML = ""; // clear the buttons

  chatStack.push(curState); // add the previous state into the history before changing
  curState = curState.getNextStates[choiceIndex]; // get to the next state

  window.setTimeout(botResponse,500); // wait for a while, for better UX
}



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


function backChat(){
  // when user clicked back

  addHistory("user", "Back"); // put 'back' to the history

  document.getElementById("choices").innerHTML = ""; // clear the buttons

  curState = chatStack.pop(); // get and remove the latest state
  
  window.setTimeout(botResponse,500); // wait a while for UX
}