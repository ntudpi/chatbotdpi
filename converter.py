"""
state,msg,choices,nextStates
topConv,hello world!,"['a', 'b', 'c']","[topConv, test]"

IMPORTANT:
SET topConv as your top conversation in the CSV
Don't use any newline in the CSV
if you would like to use single quote (') in msg, use \'
"""
import csv
state = []
msg = []
choices = []
nextStates = []
with open('chart2.csv', newline='') as csvfile:
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

text_file = open("output.js", "w")
text_file.write(jscommand)
text_file.close()