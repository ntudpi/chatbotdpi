const topConv = new State('Let\'s play a quiz',['Ok'],['curState = s1; var score=0;'],'');
const s1 = new State('Rome is the capital of which country?',['Czech','Italy','Cuba','China'],['score += 0;','score+=1','score+=0','score+=1'],'curState = s2;');
const s2 = new State('',,,'');
const s3 = new State('',,,'');
const s4 = new State('',,,'');
const s5 = new State('',,,'');
const s6 = new State('',,,'');
const s7 = new State('',,,'');
const s8 = new State('',,,'');
const s9 = new State('',,,'');
const s10 = new State('',,,'');
curState = topConv; botResponse();