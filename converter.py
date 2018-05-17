import csv
state = []
msg = []
choices = []
nextStates = []
nextStrings = []
directs = []

with open('chart2.csv', newline='') as csvfile:
	reader = csv.DictReader(csvfile)
	for row in reader:
		# append the cell to appropriate lists
		state.append(row['state'])
		msg.append(row['msg'])
		choices.append(row['choices'])
		nextStates.append(row['nextStates'])
		nextStrings.append(row['nextStrings'])
		directs.append(row['directAccess'])

jscommand="" # store the string of command

for i in range(len(state)): # constructing the objects
	jscommand += "const "+state[i]+" = new State('"+msg[i]+"',"+choices[i]+","+"[],"+nextStrings[i]+");\n"

for i in range(len(state)): # linking the next states
	jscommand += state[i] + ".setNextStates = " + nextStates[i] + ";\n"

jscommand += "var  directAccessStates = [];\n"; # initialize empty array

for i in range(len(state)):
	if(directs[i]!="null"): # append the [state, keyword] list pair
		jscommand += "directAccessStates.push([" + state[i] + ",'" + directs[i] + "']);\n"

text_file = open("output.js", "w")
text_file.write(jscommand)
text_file.close()