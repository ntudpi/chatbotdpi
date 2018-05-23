const topConv = new State('Let\'s play a quiz',['Start'],['score=0;'],'curState = s1; ');
const s1 = new State('Rome is the capital of which country?',['Czech','Italy','Cuba','China'],['score += 0;','score+=1;','score+=0;','score+=0;'],'curState = s2;');
const s2 = new State('Moscow is the capital of which country?',['Czech', 'Germany', 'Sweden', 'Russia'],['score += 0;','score+=0;','score+=0;','score+=1;'],'curState = result;');
const result = new State('Click to show your score',['ShowScore'],[''],'curState = end; addHistory(\'bot\',score.toString());');
const end = new State('Thanks for playing',[],[],'');
curState = topConv; botResponse();