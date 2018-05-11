class State {
  constructor(response, choices, nextStates){
    this.response = response;
    this.choices = choices;
    this.nextStates = nextStates;
  }
  get getResponse() {
    return this.response;
  }
  get getChoices() {
    return this.choices;
  }
  get getNextStates() {
    return this.nextStates;
  }
  set setChoices(inputChoices) {
    this.choices = inputChoices;
  }
  set setNextStates(inputNextStates) {
    this.nextStates = inputNextStates;
  }
  set setResponse(inputResponse) {
    this.response = inputResponse;
  }
  static getNextState(userChoice) {
    for(var i=0; i<choices.length; i++)
      if(choices[i]==answer)
        return nextStates[i];
  }
}

var history = [];

function botResponse() {
  addHistory("bot", curState.getResponse);
  makeChoices(curState.getChoices);
  return;
}

function makeChoices(inp) {
  var choiceHTML = "";
  for(var i=0; i<inp.length; i++)
  {
    choiceHTML += '<button onclick="userResponse('+i+')">' + inp[i] + '</button>';
  }
  document.getElementById("choices").innerHTML = choiceHTML;
  return;
}

function userResponse(choiceIndex) {
  addHistory("user", curState.getChoices[choiceIndex]);
  document.getElementById("choices").innerHTML = "";
  curState = curState.getNextStates[choiceIndex];
  window.setTimeout(botResponse,500);
}

function addHistory(role, msg)
{
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
}

const s1 = new State('Hi',['s2','s3'],[]);
const s2 = new State('Thanks, S2', ['s1'], []);
const s3 = new State('Thanks, S3', ['s1'], []);
s1.setNextStates=[s2,s3];
s2.setNextStates=[s1];
s3.setNextStates=[s1];
curState = s1;
botResponse();