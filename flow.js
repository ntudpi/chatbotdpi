var msg="";
var choices = [];

const topConv = new State("Hello, we are NTU Libraries! We are here to help answer some of your questions! What would you like to find out about?",['Opening Hours','Booking Spaces', 'Library Locations', 'Exam Materials'],[]);
const openingHours = new State("Choose your time period", ['Vacation', 'Semester Period', 'LWM Extended Hours'], []);
const vacation = new State("Choose the day", ['Mon-Fri', 'Saturday', 'Sunday & PH'], []);
const semPeriod = new State("Choose the day", ['Mon-Fri', 'Saturday', 'Sunday & PH'], []);
const extendedPeriod = new State("Choose the day", ['Mon-Fri', 'Saturday', 'Sunday & PH'], []);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 7.00pm</b><br>\
Close at 5.00pm:<br>\
- Art, Design & Media Library<br>\
- Communication & Information Library<br>\
- Wang Gungwu Library<br>";
const monFriVac = new State(msg, ['Ok'], [topConv]);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 5.00pm</b><br>\
Closed:<br>\
- Art, Design & Media Library<br>\
- Communication & Information Library<br>\
- Wang Gungwu Library<br>";
const satVac = new State(msg, ['Ok'], [topConv]);

msg = "Sorry<br>\
Libraries are <b>closed</b> on Sundays and Public Holidays!"
const sunVac = new State(msg, ['Ok'], [topConv]);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 9.30pm</b><br>\
<i>Wang Gungwu Library closes at 5.00pm.</i>";
const monFriSem = new State(msg, ['Ok'], [topConv]);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 5.00pm</b><br>\
<i>Communication & Information Library closes at 1.00pm.<br>\
Wang Gungwu Library: Closed</i>";
const satSem = new State(msg, ['Ok'], [topConv]);

msg = "Sorry<br>\
Libraries are <b>closed</b> on Sundays and Public Holidays!"
const sunSem = new State(msg, ['Ok'], [topConv]);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 11.30pm</b><br>\
<br>\
Services available during extended hours:<br>\
1. The following are available at all times during the library's opening hours:<br>\
&mdash; PCs, Self-check machines, Self-service photocopying, Network printing<br>\
2. The main printing room will be closed during extended hours on weekdays, but will be open during the weekends. <br>\
3. Facilities at Level 2 Learning Commons are not available during extended hours.<br>";
const monFriExt = new State(msg, ['Ok'], [topConv]);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 7.00pm</b><br>\
<br>\
Services available during extended hours:<br>\
1. The following are available at all times during the library's opening hours:<br>\
&mdash; PCs, Self-check machines, Self-service photocopying, Network printing<br>\
2. The main printing room will be closed during extended hours on weekdays, but will be open during the weekends. <br>\
3. Facilities at Level 2 Learning Commons are not available during extended hours.<br>";
const satExt = new State(msg, ['Ok'], [topConv]);

msg = "Here you go! The opening hours are:<br>\
<br>\
<b>8.30am &mdash; 7.00pm</b><br>\
<br>\
Only at Lee Wee Nam Library! &#9786;<br>\
Services available during extended hours:<br>\
1. The following are available at all times during the library's opening hours:<br>\
&mdash; PCs, Self-check machines, Self-service photocopying, Network printing<br>\
2. The main printing room will be closed during extended hours on weekdays, but will be open during the weekends. <br>\
3. Facilities at Level 2 Learning Commons are not available during extended hours.<br>";
const sunExt = new State(msg, ['Ok'], [topConv]);

msg = "\
Choose your preferred library:<br>\
1. Art, Design & Media Library<br>\
2. Business Library<br>\
3. Chinese Library<br>\
4. Communication &amp; Information Library<br>\
5. Humanities &amp; Social Sciences Library<br>\
6. Lee Wee Nam Library<br>\
7. Library Outpost<br>";
choices=['1','2','3','4','5','6','7'];
const libLocations = new State(msg, choices, []);

msg = "\
Here you go! &#9786;<br><br>\
Art, Design & Media Library<br>\
<b>ART &mdash; 01 &mdash; 03</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:Art%2c%20Design%20&%20Media%20Library%20%28ADM%29' target='_blank'>Locate us<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const admLoc = new State(msg, choices, [topConv]);

msg = "\
Here you go! &#9786;<br><br>\
Business Library<br>\
<b>N2 &mdash; B2b &mdash; 07</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:BUSINESS%20LIBRARY' target='_blank'>Locate us<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const bizlibLoc = new State(msg, choices, [topConv]);

msg = "\
Here you go! &#9786;<br><br>\
Chinese Library<br>\
<b>S3.2 &mdash; B5 &mdash; 01</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:Chinese%20Library' target='_blank'>Locate us<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const chilibLoc = new State(msg, choices, [topConv]);

msg = "\
Here you go! &#9786;<br><br>\
Communication &amp; Information Library<br>\
<b>CS &mdash 01 &mdash; 18</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:CMIL' target='_blank'>Locate us<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const comLoc = new State(msg, choices, [topConv]);

msg = "\
Here you go! &#9786;<br><br>\
Humanities &amp; Social Sciences Library<br>\
<b>S4 &mdash; B3c</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:hss%20LIBRARY' target='_blank'>Locate us<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const hssLoc = new State(msg, choices, [topConv]);

msg = "\
Here you go! &#9786;<br><br>\
Lee Wee Nam Library<br>\
<b>NS3 &mdash; 03 &mdash; 01</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:lwn%20LIBRARY' target='_blank'>Locate us<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const lwnLoc = new State(msg, choices, [topConv]);

msg = "\
Here you go! &#9786;<br><br>\
Library Outpost<br>\
<b>LHS &mdash; 01 &mdash; 03</b><br>\
<a href='http://maps.ntu.edu.sg/maps#q:the%20hive' target='_blank'>Locate us\<\a><br>\
Hope you enjoy your experience at NTU Library!";
choices = ['Ok'];
const outpostLoc = new State(msg, choices, [topConv]);

const bookSpaces = new State("Under Construction<br>Sorry", ['Ok'], [topConv]);

topConv.setNextStates = [openingHours, bookSpaces, libLocations, openingHours];
openingHours.setNextStates = [vacation, semPeriod, extendedPeriod];
vacation.setNextStates = [monFriVac, satVac, sunVac];
semPeriod.setNextStates = [monFriSem, satSem, sunSem];
extendedPeriod.setNextStates = [monFriExt, satExt, sunExt];
libLocations.setNextStates = [admLoc, bizlibLoc, chilibLoc, comLoc, hssLoc, lwnLoc, outpostLoc];

curState = topConv;
botResponse();