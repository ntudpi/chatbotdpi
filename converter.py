"""
state,msg,choices,nextStates
topConv,hello world!,"['a', 'b', 'c']","[topConv, test]"
"""
import csv
state = []
msg = []
choices = []
nextStates = []
with open('chart.csv', newline='') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		print(row)
		state.append(row['state'])
		msg.append(row['msg'])
		choices.append(row['choices'])
		nextStates.append(row['nextStates'])

jscommand=""
for i in range(len(state)):
	jscommand += "const "+state[i]+"= new State('"+msg[i]+"',"+choices[i]+",[]);\n"

for i in range(len(state)):
	jscommand += state[i] + ".setNextStates = " + nextStates[i] + ";\n"

print(jscommand)