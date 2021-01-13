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
                    updateGrid(val);
                } else if(key === "message"){
                    //error message
                    document.getElementById("gameMsg").innerText = val;
                } else if(key === "end"){
                    document.getElementById("playerturn").innerText = "It is your turn " + val + "!";
                    if(val === "Player 1"){
                        //document.getElementById("playerturn").className = "alert alert-warning col-md-auto";
                    } else {
                       // document.getElementById("playerturn").className = "alert alert-success col-md-auto";
                    }
                }
            });
        }
    };
}

let colSize;
let rowSize;
let firstGrid;
function loadJSON(){
    $.ajax({
        method: "GET",
        url: "/json",
        dataType: "json",
        async: false,
        success: function(result){
            colSize = result.colIdx;
            rowSize = result.rowIdx;
            firstGrid = result.fields;
        }
    });
}

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
function updateGrid(grid){
    for(i in grid){
        document.getElementById(i.toString()).className = "clickable grid-item c" + grid[i].owner
        document.getElementById(i.toString()).innerHTML = pieceMap.get(grid[i].gamepiece)
    }
}
function command(commandstring){
    $.ajax(commandstring);
}


// bools for commands to check
let coord0set = false;
let coord1set = false;
function setupCoordButtons(){
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
}
function getIndex(idnumber){
    let colidx = String.fromCharCode(idnumber % (colSize+1) + 65);
    let rowIdx = Math.floor(idnumber / (colSize+1)) + 1
    return colidx + rowIdx;
}


$(document).ready(function (){
    console.log("Document ready");
    //get first grid synchronously
    loadJSON();

    //initialize vue

    new Vue({
        el: '#app',
        vuetify: new Vuetify(),
        methods: {
            buy: function (){
                if (coord0set && !coord1set) command('/buy/' + $('#coord0').text())
            },
            combine: function (){
                if (coord0set && coord1set) command('/cmb/' + $('#coord0').text() + '/' + $('#coord1').text())
            },
            move: function (){
                if (coord0set && coord1set) command('/mov/' + $('#coord0').text() + '/' + $('#coord1').text())
            },
            castle: function (){
                if (coord0set && !coord1set) command('/plc/' + $('#coord0').text())
            },
            balance: function (){
                if (coord0set && !coord1set) command('/bal/' + $('#coord0').text())
            },
            endturn: function (){
                command('/end')
            },
            surrender: function (){
                if (confirm('Are you sure you want to surrender?')) command('/ff20')
            },
        }
    })


    //websocket
    connectWebSocket();

    //coordbuttons
    setupCoordButtons();

})

Vue.component('gamefield', {
    template:`
        <div class="grid-container">
            <div v-for="idx in colSize" class="grid-item c0" style="background: #343a40; color: #fff;">{{colIdx(idx)}}</div>
            <div v-for="(value, index) in grid" :id="index" :class="[playerClass(value.owner)]" class="clickable grid-item" v-html="gamepiece(value.gamepiece)"></div>
        </div>
    `,
    data: function (){
        return {
            grid: firstGrid,
            colSize: colSize + 1,
            colIdx: function (index){
                return String.fromCharCode(index+64);
            },
            playerClass: function (owner){
                return 'c' + owner;
            },
            gamepiece: function (gp){
                return pieceMap.get(gp);
            }
        }
    }
})




