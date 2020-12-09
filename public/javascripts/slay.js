if (window.console) {
  console.log("Welcome to your Play application's JavaScript!");
}

// websocket-stuff

function connectWebSocket() {
  console.log("Connecting to Websocket");
  let websocket = new WebSocket("ws://localhost:9000/websocket");
  console.log("Connected to Websocket");

  websocket.onopen = function(event) {
    console.log("Trying to connect to Server");
    websocket.send("Trying to connect to Server");
  }

  websocket.onclose = function () {
    console.log('Connection Closed!');
  };

  websocket.onerror = function (error) {
    console.log('Error Occured: ' + error);
  };

  websocket.onmessage = function (e) {
    if (typeof e.data === "string") {
      //console.log('String message received: ' + e.data);
      $.each(JSON.parse(e.data), function(key, val){
        if(key === "fields"){
          //update fields
          const pieceMap = new Map([
            [' ', ' '],
            ['T', '<i class="fas fa-tree"></i>'],
            ['C', '<i class="fas fa-home"></i>'],
            ['B', '<img src="/assets/images/castle.png">'],
            ['G', '<img src="/assets/images/grave.png">'],
            ['1', '<img src="/assets/images/peasant.gif">'],
            ['2', '<img src="/assets/images/spearman.gif">'],
            ['3', '<img src="/assets/images/knight.gif">'],
            ['4', '<img src="/assets/images/baron.gif">'],
          ]);
          for(i in val){
            document.getElementById(i.toString()).className = "clickable grid-item c" + val[i].owner
            document.getElementById(i.toString()).innerHTML = pieceMap.get(val[i].gamepiece)
          }
        } else if(key === "message"){
          //error message
          document.getElementById("gameMsg").innerText = val;
        }
      });
    }
  };
}

// number to corresponding letter
function letter(l) {
  switch (l) {
    case 1: return 'A';
    case 2: return 'B';
    case 3: return 'C';
    case 4: return 'D';
    case 5: return 'E';
    case 6: return 'F';
    case 7: return 'G';
    case 8: return 'H';
    case 9: return 'I';
    case 10: return 'J';
    case 11: return 'K';
    case 12: return 'L';
    case 13: return 'M';
    case 14: return 'N';
    case 15: return 'O';
    case 16: return 'P';
    case 17: return 'Q';
    case 18: return 'R';
    case 19: return 'S';
    case 20: return 'T';
    case 21: return 'U';
    case 22: return 'V';
    case 23: return 'W';
    case 24: return 'X';
    case 25: return 'Y';
    default: return 'Z';
  }
}

const colSize = parseInt(document.getElementById("col").innerText);
const rowSize = parseInt(document.getElementById("row").innerText);

function getIndex(idnumber){
  let colidx = letter(idnumber % (colSize+1) + 1);
  let rowIdx = Math.floor(idnumber / (colSize+1)) + 1
  return colidx + rowIdx;
}

// bools for commands to check
let coord0set = false;
let coord1set = false;

$( document ).ready(function() {
  // Hide coord buttons on start
  $('.coordButton').hide();

  // Coord selection by clicking on game table
  $('.clickable').click(function(){
    if (!coord0set) {
      $('#coord0').text(getIndex(parseInt(this.id))).show();
      coord0set = true;
    } else if (!coord1set) {
      $('#coord1').text(getIndex(parseInt(this.id))).show();
      coord1set = true;
    } else {
      $('#coord0').text(getIndex(parseInt(this.id))).show();
      coord0set = true;
      $('#coord1').hide();
      coord1set = false;
    }
    if ($('#coord0').text() === $('#coord1').text()) {
      $('#coord1').hide();
      coord1set = false;
    }
  });

  // Deselect the coord buttons
  $('#coord0').click(function(){
    $(this).hide();
    coord0set = false;
  })
  $('#coord1').click(function(){
    $(this).hide();
    coord1set = false;
  })

  const pieceMap = new Map([
    [' ', ' '],
    ['T', '<i class="fas fa-tree"></i>'],
    ['C', '<i class="fas fa-home"></i>'],
    ['B', '<img src="/assets/images/castle.png">'],
    ['G', '<img src="/assets/images/grave.png">'],
    ['1', '<img src="/assets/images/peasant.gif">'],
    ['2', '<img src="/assets/images/spearman.gif">'],
    ['3', '<img src="/assets/images/knight.gif">'],
    ['4', '<img src="/assets/images/baron.gif">'],
  ]);
  function command(commandstring){
    $.getJSON(commandstring, function(data){
      // let obj = { "rowIdx": 7, "colIdx": 10, "fields": [{"owner": 1, "gamepiece": "T"}, {"owner": 0, "gamepiece": " "}]}
      $.each(data, function(key, val){
        if(key === "fields"){
          //update fields
          for(i in val){
            document.getElementById(i.toString()).className = "clickable grid-item c" + val[i].owner
            document.getElementById(i.toString()).innerHTML = pieceMap.get(val[i].gamepiece)
          }
        } else if(key === "message"){
          //error message
          document.getElementById("gameMsg").innerText = val;
        }
      });
    });
  }

  // Command buttons
  $('#buyBtn').click(function() {
    if (coord0set && !coord1set) {
      //window.location = '/buy/' + $('#coord0').text();
      command('/buy/' + $('#coord0').text())
    }
  })
  $('#combineBtn').click(function() {
    if (coord0set && coord1set) {
      //window.location = '/cmb/' + $('#coord0').text() + '/' + $('#coord1').text();
      command('/cmb/' + $('#coord0').text() + '/' + $('#coord1').text())
    }
  })
  $('#moveBtn').click(function() {
    if (coord0set && coord1set) {
      //window.location = '/mov/' + $('#coord0').text() + '/' + $('#coord1').text();
      command('/mov/' + $('#coord0').text() + '/' + $('#coord1').text())
    }
  })
  $('#castleBtn').click(function() {
    if (coord0set && !coord1set) {
      //window.location = '/plc/' + $('#coord0').text();
      command('/plc/' + $('#coord0').text())
    }
  })
  $('#balanceBtn').click(function() {
    if (coord0set && !coord1set) {
      //window.location = '/bal/' + $('#coord0').text();
      command('/bal/' + $('#coord0').text());
    }
  })
  $('#endTurnBtn').click(function() {
    window.location = '/end';
  })
  $('#surrenderBtn').click(function() {
    if (confirm('Are you sure you want to surrender?')) {
      window.location = '/ff20';
    }
  })
  connectWebSocket()
});
