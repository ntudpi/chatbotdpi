import csv
state = []
msg = []
choices = []
functions = []

with open('chart2.csv', newline='') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		# append the cell to appropriate lists
		state.append(row['state'])
		msg.append(row['msg'])
		choices.append(row['choicesButton'])
		functions.append(row['nextFunc'])

jscommand="" # store the string of command

for i in range(len(state)): # constructing the objects
	jscommand += "const "+state[i]+" = new State('"+msg[i]+"',"+choices[i]+","+functions[i]+");\n"

jscommand += "curState = topConv; botResponse();"

text_file = open("states.js", "w")
text_file.write(jscommand)
text_file.close()