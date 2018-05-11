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
    choiceHTML += '<button class="button" onclick="userResponse('+i+')">' + inp[i] + '</button>';
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
  var elem = document.getElementById("history");
  elem.scrollTop = elem.scrollHeight;
}

var msg="";
const topConv = new State("Hello, we are NTU Libraries! We are here to help answer some of your questions! What would you like to find out about?",['Opening Hours','Booking Spaces', 'Requesting Materials', 'Exam Materials'],[]);
const openingHours = new State("Choose your time period", ['Vacation', 'Semester Period'], []);
const vacation = new State("Choose the day", ['Mon-Fri', 'Saturday', 'Sunday & PH'], []);
const semPeriod = new State("Choose the day", ['Mon-Fri', 'Saturday', 'Sunday & PH'], []);
const monFriVac = new State('8.30am to 7.00pm', ['Ok'], [topConv]);
const satVac = new State('8.30am to 5.00pm', ['Ok'], [topConv]);
const sunVac = new State('Closed', ['Ok'], [topConv]);
const monFriSem = new State('8.30am to 9.30pm', ['Ok'], [topConv]);
const satSem = new State('8.30am to 5.00pm', ['Ok'], [topConv]);
const sunSem = new State('Closed', ['Ok'], [topConv]);

topConv.setNextStates = [openingHours, openingHours, openingHours, openingHours];
openingHours.setNextStates = [vacation, semPeriod];
vacation.setNextStates = [monFriVac, satVac, sunVac];
semPeriod.setNextStates = [monFriSem, satSem, sunSem];
curState = topConv;
botResponse();
