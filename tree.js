class Node {
  constructor(msgs, endState, specificness){
    this.msgs = msgs;
    this.endState = endState;
    this.specificness = specificness;
  }

  // getters
  get msgs() {
    return this.msgs;
  }
  get endState() {
    return this.endState;
  }
  get specificness() {
    return this.specificness;
  }

  // setters
  set msgs(inpmsgs) {
    this.msgs = inpmsgs;
  }
  set endState(inpendState) {
    this.endState = inpendState;
  }
  set specificness(inpspecificness) {
    this.specificness = inpspecificness;
  }
}


function dfs(node, nodes){
  node.msgs = push(node.endState.choices);
  node.specificness = node.specificness+1;
  for(var i=0; i<node.endState.nextStates; i++)
  {
    if(node.endState.nextStates[i]!=topConv)
    {
      var newNode = new Node(node.msgs,node.endState.nextStates[i],
        node.specificness);
      dfs(newNode);
    }
  }
  nodes.push(node);
}

rootNode = new Node([],topConv,0)
curState = topConv;
nodes = [];
dfs(rootNode, nodes);
console.log(nodes);