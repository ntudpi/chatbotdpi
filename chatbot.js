class State {
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


var chatStack = [];


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


function userResponse(choiceIndex) {
  // things to do when user click the appropriate button
  chatStack.push(curState);
  addHistory("user", curState.getChoices[choiceIndex]);
  document.getElementById("choices").innerHTML = "";
  curState = curState.getNextStates[choiceIndex];
  window.setTimeout(botResponse,500);
}



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


function backChat(){
  addHistory("user", "Back");
  document.getElementById("choices").innerHTML = "";
  curState = chatStack.pop();
  window.setTimeout(botResponse,500);
}