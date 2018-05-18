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

function getResponse (textInput, callback) {
  // get the analysis result from wit.ai

  jQuery( document ).ready(function( $ ) { // to tackle wordpress Jquery conflict

    $.ajax({ // ajax call to wit.ai HTTP API

      url: 'https://api.wit.ai/message',
      data: {
        'q': textInput,
        'access_token' : 'I43BTVDXSJDIUJ6X5RSQKHVOPOPIPPQU'  // token to wit.ai
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
const topConv = new State('Hello, we are NTU Libraries! <br>We are here to help answer some of your questions! <br>What would you like to find out about?',['Opening Hours','Booking Spaces', 'Library Locations', 'Requesting Materials', 'Exam Materials'],[],['opening_hours', 'booking_spaces', 'library_locations','requesting_materials','exam_materials']);
const openingHours = new State('Choose your time period:',['Vacation', 'Semester Period', 'LWN Extended Hours'],[],['vacation', 'semester_period', 'extended_period', 'mon_to_fri', 'saturday', 'sunday_ph']);
const vacation = new State('Choose the day:',['Mon-Fri', 'Saturday', 'Sunday & PH'],[],['mon_to_fri', 'saturday', 'sunday_ph']);
const semPeriod = new State('Choose the day:',['Mon-Fri', 'Saturday', 'Sunday & PH'],[],['mon_to_fri', 'saturday', 'sunday_ph']);
const extendedPeriod = new State('Choose the day:',['Mon-Fri', 'Saturday', 'Sunday & PH'],[],['mon_to_fri', 'saturday', 'sunday_ph']);
const mon = new State('Choose your time period:',['Vacation', 'Semester Period', 'LWN Extended Hours'],[],['vacation', 'semester_period', 'extended_period']);
const sat = new State('Choose your time period:',['Vacation', 'Semester Period', 'LWN Extended Hours'],[],['vacation', 'semester_period', 'extended_period']);
const sun = new State('Choose your time period:',['Vacation', 'Semester Period', 'LWN Extended Hours'],[],['vacation', 'semester_period', 'extended_period']);
const monFriVac = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 7.00pm</b><br>Close at 5.00pm:<br>- Art, Design & Media Library<br>- Communication & Information Library<br>- Wang Gungwu Library<br>',['Ok'],[],['ok']);
const satVac = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 5.00pm</b><br>Closed:<br>- Art, Design & Media Library<br>- Communication & Information Library<br>- Wang Gungwu Library<br>',['Ok'],[],['ok']);
const sunVac = new State('Sorry &#9785;,<br>Libraries are <b>closed</b> on Sundays and Public Holidays!',['Ok'],[],['ok']);
const monFriSem = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 9.30pm</b><br><i>Wang Gungwu Library closes at 5.00pm.</i>',['Ok'],[],['ok']);
const satSem = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 5.00pm</b><br><i>- Communication & Information Library closes at 1.00pm.<br>- Wang Gungwu Library: Closed</i>',['Ok'],[],['ok']);
const sunSem = new State('Sorry &#9785;,<br>Libraries are <b>closed</b> on Sundays and Public Holidays!',['Ok'],[],['ok']);
const monFriExt = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 11.30pm</b><br><br>Services available during extended hours:<br>1. The following are available at all times during the library\'s opening hours:<br>&mdash; PCs, Self-check machines, Self-service photocopying, Network printing. <br>2. The main printing room will be closed during extended hours on weekdays, but will be open during the weekends.<br>3. Facilities at Level 2 Learning Commons are not available during extended hours.<br>',['Ok'],[],['ok']);
const satExt = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 7.00pm</b><br><br>Services available during extended hours:<br>1. The following are available at all times during the library\'s opening hours:<br>&mdash; PCs, Self-check machines, Self-service photocopying, Network printing. <br>2. The main printing room will be closed during extended hours on weekdays, but will be open during the weekends.<br>3. Facilities at Level 2 Learning Commons are not available during extended hours.<br>',['Ok'],[],['ok']);
const sunExt = new State('Here you go! The opening hours are:<br><br><b>8.30am &mdash; 7.00pm</b><br><br>Only at Lee Wee Nam Library! &#9786;<br>Services available during extended hours:<br>1. The following are available at all times during the library\'s opening hours:<br>&mdash; PCs, Self-check machines, Self-service photocopying, Network printing<br>2. The main printing room will be closed during extended hours on weekdays, but will be open during the weekends.<br>3. Facilities at Level 2 Learning Commons are not available during extended hours.<br>',['Ok'],[],['ok']);
const libLocations = new State('Choose your preferred library:<br>1. Art, Design & Media Library<br>2. Business Library<br>3. Chinese Library<br>4. Communication &amp; Information Library<br>5. Humanities &amp; Social Sciences Library<br>6. Lee Wee Nam Library<br>7. Library Outpost<br>',['ADM','Business','Chinese','Com&Info','HSS','LWN','Outpost'],[],['adm_library', 'business_library', 'chinese_library', 'communication_library', 'hss_library', 'lwn_library', 'library_outpost']);
const admLoc = new State('Here you go! &#9786;<br><br>Art, Design & Media Library<br><b>ART &mdash; 01 &mdash; 03</b><br><a target=\'_blank\' href=\'http://maps.ntu.edu.sg/maps#q:Art%2c%20Design%20&%20Media%20Library%20%28ADM%29\'>Locate us</a> <br> Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const bizlibLoc = new State('Here you go! &#9786;<br><br>Business Library<br><b>N2 &mdash; B2b &mdash; 07</b><br><a target=\'_blank\' href=\'http://maps.ntu.edu.sg/maps#q:BUSINESS%20LIBRARY\'>Locate us</a><br>Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const chilibLoc = new State('Here you go! &#9786;<br><br>Chinese Library<br><b>S3.2 &mdash; B5 &mdash; 01</b><br><a href=\'http://maps.ntu.edu.sg/maps#q:Chinese%20Library\' target=\'_blank\'>Locate us</a> <br>Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const comLoc = new State('Here you go! &#9786;<br><br>Communication &amp; Information Library<br><b>CS &mdash; 01 &mdash; 18</b><br><a href=\'http://maps.ntu.edu.sg/maps#q:CMIL\' target=\'_blank\'>Locate us</a> <br>Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const hssLoc = new State('Here you go! &#9786;<br><br>Humanities &amp; Social Sciences Library<br><b>S4 &mdash; B3c</b><br><a href=\'http://maps.ntu.edu.sg/maps#q:hss%20LIBRARY\' target=\'_blank\'>Locate us</a> <br>Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const lwnLoc = new State('Here you go! &#9786;<br><br>Lee Wee Nam Library<br><b>NS3 &mdash; 03 &mdash; 01</b><br><a href=\'http://maps.ntu.edu.sg/maps#q:lwn%20LIBRARY\' target=\'_blank\'>Locate us</a> <br>Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const outpostLoc = new State('Here you go! &#9786;<br><br>Library Outpost<br><b>LHS &mdash; 01 &mdash; 03</b><br><a href=\'http://maps.ntu.edu.sg/maps#q:the%20hive\' target=\'_blank\'>Locate us</a> <br>Hope you enjoy your experience at NTU Library!',['Ok'],[],['ok']);
const bookSpaces = new State('To book PCs, discussion pods, AV rooms, and others, please visit this <a target=\'_blank\' href=\'https://ntufbs.ntu.edu.sg\'>link</a>',['Ok'],[],['ok']);
const reqMat = new State('What would you like to find out about?',['Reserve/Place hold', 'Interlibrary loan', 'Buy new books/journals', 'Closed stacks', 'Research documents delivery', 'Check my Account'],[],['reserve_place_hold', 'interlibrary_loan', 'buy_new_books', 'closed_stacks', 'document_delivery', 'check_my_account']);
const reservePlaceHold = new State('Reserve/Place hold for items currently on loan:',['Making Reservation', 'View or cancel requests'],[],['making_reservation', 'view_or_cancel_requests']);
const makingReservation = new State('<b>Use OneSearch:</b><br>&mdash; Find the item you require.<br>&mdash; Click \"Find Details or Reserve This Item\".<br>&mdash; Click \"Place Hold\" on the left.<br>&mdash; Login using your username and password.<br>&mdash; Select your Pickup Library and click \"Place Hold\".<br><b>Approach Service Desk for following reservations:</b><br>&mdash; Items that are being catalogued<br>&mdash; Items that consist of multiple volumes (e.g. periodicals or journals)<br><br><b>Reserved items must be collected within 6 days after you receive our email!</b><br><br>Note:<br>Items in the Course Reserves cannot be reserved.<br>You cannot place a request for an item which is currently on loan to you.<br>',['Ok'],[],['ok']);
const viewOrCancelRequests = new State('Login to your <a href=\'https://eps.ntu.edu.sg/\'>library account</a> to view or cancel your reservations!',['Ok'],[],['ok']);
const interLibraryLoan = new State('Borrow books from other libraries if NTU Library do not have what you need!<br>However, materials are restricted to teaching or research related only.<br> Email the <a target=\'_blank\' href=\'http://www.ntu.edu.sg/Library/Documents/ILL-request.docx\'>ILL Form</a> to <a href=\'mailto:library@ntu.edu.sg\'>library@ntu.edu.sg</a>. <br>You are limited to 2 ILL items at any one time.<br>Turnaround time:<br>3-7 days depending on difficulty in search of item<br><br>Charges:<br>You will be notified of the relevant charges.<br><br>Loan Period:<br>Most loan items are for 2-3 weeks. <br>All requests and renewals are subject to the approval of lending library.<br>',['Ok'],[],['ok']);
const buyNewBooks = new State('Before you recommend, please make sure that the title is not available in our Library.<br>Check via Library Catalogue and E-Journal Listing!<br>For urgent journal articles, please use Research Documents Delivery service.<br><br>Are you a student or a staff?<br>',['Student', 'Staff'],[],['student', 'staff']);
const buyStudent = new State('Fill up the <a target=\'_blank\' href=\'https://blogs.ntu.edu.sg/lib-contact-us/?option=lib_resources&src=resources_request\'>request form</a> with the following information:<br><br>1. Title, Author, Edition, Publisher, ISBN, Price of the item<br>2. Your full name, school and matriculation card number<br>3. Reason for your recommendation<br><br>Recommendations will be processed within a week.<br>Approved recommendations will be available for borrowing within 3&mdash;12 weeks!<br>Do indicate if you would like to be notified when the item is available for borrowing.',['Ok'],[],['ok']);
const buyStaff = new State('1. Login toÊstaffLink <br> 2. Find the online Recommendation Form. Look underÊresource requestÊ>Êlibrary servicesÊ> journal recommendation. <br>3. Follow the instructions on the form. <br><br>Recommendations will be processed within 1&mdash;6 months. <br>StaffLink will update you on the process. <br>',['Ok'],[],['ok']);
const closedStacks = new State('Closed stack items are kept in off-site storage facilities!<br>Identified by the status of its location when you use the Library Catalogue.<br><br>Placing a request:<br>NTU Students and Staff with NTU network account: <a target=\'blank\'  href=\'https://venus.wis.ntu.edu.sg/lib/ServiceRequest/Login.aspx\'>Click Here</a><br>Associate members and staff without StaffLink: <a target=\'_blank\' href=\'https://blogs.ntu.edu.sg/lib-contact-us/?option=others \'>Click Here</a><br><br>Turnaround time:<br>Requests generally fulfilled within 2-3 working days (weekdays excluding public holidays)<br>',['Ok'],[],['ok']);
const researchDocumentsDelivery = new State('Helping researchers locate and obtain copies of research materials that are not found in our Library. <br>Delivery of digital or print copies of journal articles, conference papers, technical papers, theses, etc.<br><br>SIMtech staff and associate members can request for document delivery by sending <a target=\'_blank\' href=\'http://www.ntu.edu.sg/Library/Documents/DDS_form.doc\'>DDS Form</a> to <a href=\'mailto:library@ntu.edu.sg\'>library@ntu.edu.sg</a> <br><br><b>This service is not available to other users which were not stated, sorry. &#9785;</b><br><br>Turnaround time:<br>1-3 days depending on difficulty in search of item<br><br>Charges:<br>You will be notified of the relevant charges.',['Ok'],[],['ok']);
const checkMyAccount = new State('To view your loans & holds, renew your items and to check for outstanding fines, you will need an NTU network account and log in <a target=\'_blank\' href=\'http://www.ntu.edu.sg/Library/LibAccount\'>here</a> <br><br><b>View your loans & holds:</b><br>Login > Checkouts (loans) or Holds<br><br><b>Renew your items:</b><br>Renewal limit is according to your borrowing privileges <a target=\'_blank\' href=\'http://www.ntu.edu.sg/Library/Pages/access/privileges-overview.aspx\'>here</a> <br>Items in the Reserves can only be renewed at the service desk.',['Query on overdue loans', 'Ok'],[],['query_overdue', 'ok']);
const queryOverdue = new State('<b>Overdue loans: </b>Login > Fines<br><br>- Fines are calculated from due date of item excluding Sundays and Public Holidays.<br>- Fines for items in the Course Reserves are charged by the hour.<br>- Borrowing privileges are stopped when outstanding fines max $10.00.<br>- Payment of fines via CashCard, EZ-Link card, NETS or Cheque. <br><br>More information at <a target=\'_blank\' href=\'http://www.ntu.edu.sg/Library/Pages/access/overdue.aspx\'>here</a>',['Ok'],[],['ok']);
const examPapers = new State('Alumni library members have no access to past year exam papers. <br><br><b>Past-year examination papers available</b> at <a target=\'_blank\' href=\'https://ts.ntu.edu.sg/sites/lib-repository/exam-question-papers\'>here</a>.<br>Up to 5 years of exam papers (3 years only for Nanyang Business School)<br>Some courses have multiple codes, identify the main course code.<br><br>Schools may not want certain papers to be made available on web. As such, there will be an *asterisk next to the course code.<br>Send an email to Librarians if you cannot find your exam papers.',['Ok'],[],['ok']);
topConv.setNextStates = [openingHours, bookSpaces, libLocations,reqMat,examPapers];
openingHours.setNextStates = [vacation, semPeriod, extendedPeriod, mon, sat, sun];
vacation.setNextStates = [monFriVac, satVac, sunVac];
semPeriod.setNextStates = [monFriSem, satSem, sunSem];
extendedPeriod.setNextStates = [monFriExt, satExt, sunExt];
mon.setNextStates = [monFriVac, monFriSem, monFriExt];
sat.setNextStates = [satVac, satSem, satExt];
sun.setNextStates = [sunVac, sunSem, sunExt];
monFriVac.setNextStates = [topConv];
satVac.setNextStates = [topConv];
sunVac.setNextStates = [topConv];
monFriSem.setNextStates = [topConv];
satSem.setNextStates = [topConv];
sunSem.setNextStates = [topConv];
monFriExt.setNextStates = [topConv];
satExt.setNextStates = [topConv];
sunExt.setNextStates = [topConv];
libLocations.setNextStates = [admLoc, bizlibLoc, chilibLoc, comLoc, hssLoc, lwnLoc, outpostLoc];
admLoc.setNextStates = [topConv];
bizlibLoc.setNextStates = [topConv];
chilibLoc.setNextStates = [topConv];
comLoc.setNextStates = [topConv];
hssLoc.setNextStates = [topConv];
lwnLoc.setNextStates = [topConv];
outpostLoc.setNextStates = [topConv];
bookSpaces.setNextStates = [topConv];
reqMat.setNextStates = [reservePlaceHold, interLibraryLoan, buyNewBooks, closedStacks, researchDocumentsDelivery, checkMyAccount];
reservePlaceHold.setNextStates = [makingReservation, viewOrCancelRequests];
makingReservation.setNextStates = [topConv];
viewOrCancelRequests.setNextStates = [topConv];
interLibraryLoan.setNextStates = [topConv];
buyNewBooks.setNextStates = [buyStudent, buyStaff];
buyStudent.setNextStates = [topConv];
buyStaff.setNextStates = [topConv];
closedStacks.setNextStates = [topConv];
researchDocumentsDelivery.setNextStates = [topConv];
checkMyAccount.setNextStates = [queryOverdue, topConv];
queryOverdue.setNextStates = [topConv];
examPapers.setNextStates = [topConv];
var  directAccessStates = [];
directAccessStates.push([topConv,'ok']);
directAccessStates.push([openingHours,'opening_hours']);
directAccessStates.push([libLocations,'library_locations']);
directAccessStates.push([bookSpaces,'booking_spaces']);
directAccessStates.push([reqMat,'requesting_materials']);
directAccessStates.push([reservePlaceHold,'reserve_place_hold']);
directAccessStates.push([makingReservation,'making_reservation']);
directAccessStates.push([viewOrCancelRequests,'view_or_cancel_requests']);
directAccessStates.push([interLibraryLoan,'interlibrary_loan']);
directAccessStates.push([buyNewBooks,'buy_new_books']);
directAccessStates.push([closedStacks,'closed_stacks']);
directAccessStates.push([researchDocumentsDelivery,'document_delivery']);
directAccessStates.push([checkMyAccount,'check_my_account']);
directAccessStates.push([queryOverdue,'query_overdue']);
directAccessStates.push([examPapers,'exam_materials']);
curState = topConv; botResponse();