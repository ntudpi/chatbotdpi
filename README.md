# NTU DPI ChatBot Report
 
## Without NLP (Natural Language Processing)
We created the possible conversation in a tree  
Here is a look of a section of the tree  
![Here is a look of a section of the tree](https://ia601504.us.archive.org/2/items/ScreenShot20180517At3.17.40PM/Screen%20Shot%202018-05-17%20at%203.17.40%20PM.png)
In the conventional chatbot that just use button, the user can only click the options to moving through the nodes of the tree.  
That implementation was quite straightforward.  

#### Modifying the tree
Maintaining the tree is also not so diffifult. When one need to change to flow of the tree or the messages in a node, all they need to do is just to modify a CSV file, accessible via excel, and just execute a single line command through terminal.  
> **Possible Improvement:**
> We should be able to make the interface to modify the tree better from the user perspective. But currently it is not our focus.  
-------
## Augmenting NLP -  wit.ai
In order to augment NLP to the chatbot (to let user input texts instead of just clicking buttons), we use the NLP service from wit.ai to classify the texts using keyword identification method. Currently we use https://wit.ai/kevinwinatamichael/chatbotdpi/entities app to classify the text.  

### Why wit.ai?
#### Free
The service is totally free. There is no limit on number of request (they do ask us to let them know when we are going to use it heavily [*above 1 request/sec in average]).*
#### Nice training interface
Training the NLP app through wit.ai is really easy and has nice interface. Suitable for long-term usage
#### Allow constant training
We don't need to deliberately train the NLP app. The requests while using the chatbot will be recorded and we can look at it as inbox. We can help the user to learn by validating the NLP classification, and correct them if it got it wrong.
#### Support HTTP API
As far as we had seen, not many NLP has this functionallity. By using HTTP API we can directly connect to the wit.ai server, send them our input, and get the analysis result. What's better is that we can do all of it front-end in JavaScript. Since campuspress just allow us to access the content management system Wordpress, we need to host another server to process the NLP by ourselves if we don't have the HTTP API, which is quite tedious, and might be costly.
#### Modular & Simple
We can just classify the texts using keyword classification method. It's simple, don't require any coding, and we can easily transfer the keywords for other purposes. Since question and asking in customer service, oftenly, does not require complex context analysis, wit.ai seems good to go for basic usage.

----
## Our steps in NLP

#### The idea
The idea here, is that for every next node (possible next response from the chatbot) in our current node (current state of conversation), we assign a corresponding keyword.  
So the we will move to the next node by the best matching keyword (which is easily done by the wit.ai).
Consider this example,  
The conversation is currently in the node `a`, which has three possible next nodes, named `b`, `c`, and `d`. The next node will be either from three of them, depending on the keywords attached to them. We might go to the node `b`, if the user said something about, let say `fish`. And we'll go to the node `c`, if the user say `pizza`, and `d` if the user say `bread`.  
> A message, in order to be classified as the keyword `fish`, does not have to be directly related to the word 'fish'. It could be anything. We can modify it by our self. For example, I might want to teach the wit.ai NLP, to classify the word 'mouse', as `fish`. And it's totally okay in wit.ai, though it's not a good practice.


#### First problem
Let us give an example of how the above idea might not work as desired.  
Consider this scenario, the user asked the library opening time. The bot is intended to ask `At which period? Is it vacation, or semester, or extended?`, and then `When is it? Weekdays, Saturday, or Sunday?`.  
The user might answer it by `At the extended period` and then after the bot asked the day, `Sunday, please`, as expected by the bot.  
But how if the user directly said `At an extended period Sunday`. Remember that the classification is not our major problem now. So the bot will successfully identify which period it is, `extended period`. But the bot, will once again, asked `When is it? Weekdays, Saturday, or Sunday?`, and the user will be mad.

**Solution**
Fortunately it's not a big problem, we can solve this by allowing the bot to take the input `At an extended period Sunday`, first extract the period as `extended period`, and pass it directly to the next node which asks the day of the week, without asking the user. And it will repeatedly doing it untill the input match no keywords of the node.

#### Second problem
Consider this scenario, at the top of the conversation (before the user told the bot that she want to ask about opening hours), the user asked `What's the library opening hour this Monday?`. The bot, at the top conversation, might successfuly classify the first keyword to `opening hours`, and then, go to that node, and it supposed to ask `At which period? Is it vacation, or semester, or extended?`. By using our solution in the first solution, the bot should be able to continue going down through the node. But unfortunately, at this example, the user provided the wrong information, the `Sunday` won't be extracted since it's not in the list of possible keywords. So the bot asks `At which period? Is it vacation, or semester, or extended?`. The user, without knowing that the information has not been extracted properly, will answer, `At the vacation`, for example. But then, after that, the bot will asks `When is it? Weekdays, Saturday, or Sunday?`, and the user will be mad.

**Solution**
Fortunately, once again, we have the solution for this problem.  
So the initial condition is that  
`Opening hours`->`semseter`, `vacation`, `extended`  
`semester`->`weekdaySemseter`,`saturdaySemester`,`sundaySemester`  
`vacation`->`weekdayVacation`,`saturdayVacation`,`sundayVacation`  
`extended`->`weekdayExtended`,`saturdayExtended`,`sundayExtended`  
*'->' indicates the keywords for next nodes.*  
To solve the problem, we can append it so to be  
`Opening hours`->`semseter`, `vacation`, `extended`,`generalWeekday`,`generalSaturday`,`generalSunday`  
`semester`->`weekdaySemseter`,`saturdaySemester`,`sundaySemester`  
`vacation`->`weekdayVacation`,`saturdayVacation`,`sundayVacation`  
`extended`->`weekdayExtended`,`saturdayExtended`,`sundayExtended`  
`generalWeekday`->`weekdaySemseter`,`weekdayVacation`,`weekdayExtended`  
`generalSaturday`->`saturdaySemester`,`saturdayVacation`,`saturdayExtended`  
`generalSunday`->`sundaySemester`,`sundayVacation`,`sundayExtended`  
And now as you can see, the bot will be able to extract the information from `What's the library opening hour this Monday?`, to move down to the `Opening hours` node, and them to the `generalSunday` node. Then asks `At which period? Is it vacation, or semester, or extended?`, the user answered `vacation`, and both of them is happy.

#### Third Problem
Sometimes, the user might not always want to complete the conversation, and maybe directly jump to a node within a tree.  
`user`: when does the library open in Sunday?  
`bot`: at which period?  
`user`: how do I borrow a book?  
Using the solution from the second solution, the bot will not be able to detect any keyword to `borrow book`, since it's not on the list.  

**Solution**
Fortunately, third time, we have solved this problem. The solution is that we simply add one more column to the CSV file, to add the keyword to a node so that the user can directly jumps to that node using that keyword.  
  
So, now jumping to a node `sundaySemester`, could be achieved from two different ways, by following the tree in the path `Opening hours` -> `Sunday` -> `semester`, or directly accessing keyword associated with it, `opening hours sunday semester`, for example.  

The former one is preferable, since we're now saving the usage of keyword. Training a bot to recognize keyword is costly, and having `opening hours sunday semester` will have a lot of overlap with keyword `sunday`, or `opening hours`, which will confuse the bot.  

So, the actual solution is not adding direct access keyword to all nodes. We just adding them to the node that might be accessed without providing any keyword of its parent node. For example, `borrow book` is a child of the node `requesting material`, but to ask `how do I borrow a book?` does not require the user to say anything about `requesting material`. But in `opening hours in vacation sunday?`, have all the keywords of its parent node.

So now, what we have is a tree, that some of the node has a direct access link, and some don't (just accessible from the parent). And it pretty much solve the problems.


## Unsolved problems

#### Time consuming
It takes time to develop the tree (to the NLP), and it takes time to train the keyword. At the end, it is just typing less than 50 words for each keyword. The cost is actually when researching and listing the keywords. It may take about 10-20 minutes for each keyword, and in this case we have 33 keywords. So it may need hours for a small change.

#### Not scalable
As stated in the fourth problem, we can really grow the tree that much. Depending on the relatedness of the keywords (really different/similar), the ideal number of nodes might be around 10-50.

#### Low flexibility
Other than just changing the tree, implementing new functionallity is not really easy to do, and may need major changing of the chatbot. It is caused because this chatbot platform is built for that specific purposes. So any changes will require dirty change in the code.

#### Keyword overlapping
This problem is in the wit.ai. The fact that we were using keyword classification method, is not really scalable. Having direct links to most of the node will cause us a really big problem if the tree is to big, since there will be overlapping of classification from different context. There might be a way to put and connect subtrees in a hierarchical way, but we need to let the user know how to navigate between those subtrees, and it's more like talking to different chatbot based on its context (maybe financial, academic, administrative, etc.)

One strategy to handle is to keep the chatbot simple by not growing the tree to be to big. Especially not to many direct access keyword node. But it's not that easy. Consider the following example:

User could both asks `where is lee wee nam?` and `where is exam paper?`. From the `where is lee wee nam?` point of view, we have to put `where is` as a keyword to classify it as expression to ask a location of a library. Therefore, when the user asks `where is exam paper?`, it could direct it to the library locations instead of exam paper.

## Possible Improvements

If this chatbot is continued to be developed, there are some things that possibly could be improved and things that are less likely doable.

### Less possible
- Faster training. It's the base problem of using machine learning in NLP, we need a lot of data to train it well.
- Scalability. Given the same fundamental way of creating the bot. There is small hope that we can grow the bot to handle lots of things
- Context analysis to solve keyword overlapping. In order to do this, we need to change some of our analysis to intent based, so that the bot can know that whether a user ask a location or link to a webpage in  `where is adm?` and `where is exam papers?`. But there is a certain problem with this. Other than it's a bit more complicated, it also requires much more training, since the machine learning is less supervised. It's technologically feasible, but may need heavy manpower.

### More possible
- Better interface for librarian. We should be able to create a good interface to maintain the tree, the messages, node connections and keywords.
- Better interface for user. We should be able to make better design or as prefered.
- Make the bot more humanlike. Until now the main focus is not to make the bot really look like a human. The focus is to give ease for user to ask questions. We should be able to make the interaction more like human in unimportant conversation like greetings, asking the weathers, etc.
- Adding more synonyms to the keywords, i.e., make the classification work better.

## Next Step

If this project is continued, then

### Using a more advanced NLP services

We might want to use Dialogflow instead of wit.ai, to get better functionallity and also better support in developing our chatbot.

#### Context Analysis & Natural Language

Until now, we can very more or less classify four levels of chatbots.
1. Button clicking
2. Keyword matching
3. Context analysis
4. Natural interface

Roughly speaking, wit.ai might only capable to support until context analysis (which required much manpower), and might not be able to support really natural interface (at least, not a robust one). But we should be able to support natural interface if we are using more advanced chatbot framework. 

Sure, a bit of natural interface still needed to provide good UX, but not every chatbot really need natural interface, sincethe main purpose (at least in our case) is that to provide useful information, not chit chatting with the bot.
