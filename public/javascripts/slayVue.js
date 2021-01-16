const serverURL = "localhost:9000";

// websocket-stuff
function connectWebSocket() {
    console.log("Connecting to Websocket");
    let websocket = new WebSocket("ws://" + serverURL + "/websocket");
    console.log("Connected to Websocket");

    websocket.onopen = function(event) {
        console.log("Trying to connect to Server");
        websocket.send("Trying to connect to Server");
    }

    websocket.onclose = function (event) {
        console.log('Connection Closed! ' + event.message);
    };

    websocket.onerror = function (error) {
        console.log('Error Occured: ' + error);
    };

    websocket.onmessage = function (e) {
        if (typeof e.data === "string") {
            // console.log('String message received: ' + e.data);
            $.each(JSON.parse(e.data), function(key, val){
                if(key === "fields"){
                    //update fields
                    updateGrid(val);
                } else if(key === "message"){
                    //error message
                    document.getElementById("gameMsg").innerText = val;
                } else if(key === "player"){
                    //next player
                    document.getElementById("playername").innerText = "It is your turn " + val.playername + "!";
                    document.getElementById("playercolor").className = "v-avatar accent-4 " + val.playercolor;
                }
            });
        }
    };
}

let colSize;
let rowSize;
let firstGrid;
let firstPlayer;
let firstPlayerColor;
function loadJSON(){
    $.ajax({
        method: "GET",
        url: "http://" + serverURL + "/json",
        dataType: "json",
        async: false,
        success: function(result){
            // console.log("get /json:" + JSON.stringify(result))
            colSize = result.colIdx;
            rowSize = result.rowIdx;
            firstGrid = result.fields;
            firstPlayer = result.player.playername;
            firstPlayerColor = result.player.playercolor;
        }
    });
}

const pieceMap = new Map([
    [' ', ' '],
    ['T1', 'mdi-palm-tree'],
    ['T2', 'mdi-pine-tree'],
    // ['T', 'mdi-pine-tree'],
    ['C', 'mdi-home'],
    ['B', 'mdi-castle'],
    ['G', 'mdi-grave-stone'],
    ['1', 'mdi-account'],
    ['2', 'mdi-account-multiple'],
    ['3', 'mdi-account-group'],
    ['4', 'mdi-alien'],
]);
const fieldMap = new Map([
    [2, 'https://cdn.discordapp.com/attachments/766231770445512715/786534037024014336/ryan-o-connor-tileable-grass.png'],
    [1, 'https://cdn.discordapp.com/attachments/766231770445512715/786534077545185300/dbwm528-78b11079-6ce9-4182-9166-d6c07af7d494.png'],
    [0, 'https://cdn.discordapp.com/attachments/766231770445512715/786534055566376990/f1a7ed42b092b013089dafb1774ef2ea.png']
]);
function updateGrid(grid){
    for(i in grid){
        document.getElementById(i.toString()).className = "clickable c" + grid[i].owner // grid-item
        document.getElementById(i.toString()).children[0].children[2].children[0].className = "v-icon notranslate material-icons theme--light mdi " + gamepieceIcon(grid[i].gamepiece, grid[i].owner) + " " + gamepieceColor(grid[i])
        document.getElementById(i.toString()).children[0].children[1].style.backgroundImage = "url(" + fieldMap.get(grid[i].owner) + ")"
    }
}

function gamepieceIcon(gamepiece, owner){
    if(gamepiece === 'T'){
        return pieceMap.get(gamepiece + owner);
    } else {
        return pieceMap.get(gamepiece);
    }
}

function gamepieceColor(field, setup=false){
    let color = "blue-grey lighten-4"; //default

    if(field.owner === 1){ //yellow player
        //tree
        if(field.gamepiece === "T"){
            color = "green darken-4"
        }
        //unit gamepiece
        if(field.gamepiece === '1' || field.gamepiece === '2' || field.gamepiece === '3' || field.gamepiece === '4'){
            if(!field.hasMoved){
                color = "amber darken-4"
            }else{
                color = "grey darken-1"
            }
        }
        //capital, castle, grave
        if(field.gamepiece === "C" || field.gamepiece === "B" || field.gamepiece === "G"){
            color = "brown darken-2"
        }
    }else if (field.owner === 2){ //green player
        //tree
        if(field.gamepiece === "T"){
            color = "green darken-1"
        }
        //unit gamepiece
        if(field.gamepiece === '1' || field.gamepiece === '2' || field.gamepiece === '3' || field.gamepiece === '4'){
            if(!field.hasMoved){
                color = "light-green lighten-3"
            }else{
                color = "grey darken-1"
            }
        }
        //capital, castle, grave
        if(field.gamepiece === "C" || field.gamepiece === "B" || field.gamepiece === "G"){
            color = "blue-grey lighten-2"
        }
    }

    if(setup) {
        return color
    }else{
        return color.replace(" ", "--text text--")
    }
}

function command(commandstring){
    $.ajax("http://" + serverURL + commandstring);
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
        },
        theme: {dark:true},
        data() {
            return {
                drawer: true
            };
        }
    })

    document.getElementById("playername").innerText = "It is your turn " + firstPlayer + "!";
    document.getElementById("playercolor").className = "v-avatar accent-4 " + firstPlayerColor;

    //websocket
    connectWebSocket();

    //coordbuttons
    setupCoordButtons();

})
//<v-img max-width="80" :src="fieldImage(value.owner)"></v-img>
//<v-icon style="position: relative; z-index: 5">{{gamepiece(value.gamepiece)}}</v-icon>
//<img style='height: 100%; width: 100%; object-fit: contain;' :src="fieldImage(value.owner)"/>
Vue.component('gamefield', {
    template:`
        <div class="grid-container">
            <div v-for="idx in colSize" class="grid-item c0" style="background: #343a40; color: #fff;">{{colIdx(idx)}}</div>
            <div v-for="(value, index) in grid" :id="index" :class="[playerClass(value.owner)]" class="clickable ">
                <v-img max-width="4vw" min-width="40" :src="fieldImage(value.owner)" style="display: flex; align-items: center;">
                    <v-icon :color="gpColor(value)" x-large style="display: flex; justify-content: center;">
                        {{gp(value.gamepiece, value.owner)}}
                    </v-icon>
                </v-img>
            </div>
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
            gp: function (gp, owner){
                return gamepieceIcon(gp, owner)
            },
            gpColor: function(field){
                return gamepieceColor(field, true);
            },
            fieldImage: function (field){
                return fieldMap.get(field);
            },

        }
    }
})




