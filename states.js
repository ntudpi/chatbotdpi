const topConv = new State('Let\'s play a quiz',['Ok'],['curState = s1; score=0;'],'');
const s1 = new State('Rome is the capital of which country?',['Czech','Italy','Cuba','China'],['score += 0;','score+=1;','score+=0;','score+=0;'],'curState = s2;');
const s2 = new State('Moscow is the capital of which country?',['Czech', 'Germany', 'Sweden', 'Russia'],['score += 0;','score+=0;','score+=0;','score+=1;'],'curState = result;');
const result = new State('Your scored',['Ok'],[''],'curState = topConv; addHistory(\'bot\',score.toString());');
curState = topConv; botResponse();