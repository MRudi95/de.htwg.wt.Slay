if (window.console) {
  console.log("Welcome to your Play application's JavaScript!");
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

// bools for commands to check
let coord0set = coord1set = false;

$(function() {
  // Hide coord buttons on start
  $('.coordButton').hide();

  // Coord selection by clicking on game table
  $('.clickable').click(function(){
    if (!coord0set) {
      $('#coord0').text(letter(this.cellIndex) + this.parentNode.rowIndex);
      $('#coord0').show();
      coord0set = true;
    } else if (!coord1set) {
      $('#coord1').text(letter(this.cellIndex) + this.parentNode.rowIndex);
      $('#coord1').show();
      coord1set = true;
    } else {
      $('#coord0').text(letter(this.cellIndex) + this.parentNode.rowIndex);
      $('#coord0').show();
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

  // Command buttons
  $('#buyBtn').click(function() {
    if (coord0set && !coord1set) {
      window.location = '/buy/' + $('#coord0').text();
    }
  })
  $('#combineBtn').click(function() {
    if (coord0set && coord1set) {
      window.location = '/cmb/' + $('#coord0').text() + '/' + $('#coord1').text();
    }
  })
  $('#moveBtn').click(function() {
    if (coord0set && coord1set) {
      window.location = '/mov/' + $('#coord0').text() + '/' + $('#coord1').text();
    }
  })
  $('#castleBtn').click(function() {
    if (coord0set && !coord1set) {
      window.location = '/plc/' + $('#coord0').text();
    }
  })
  $('#balanceBtn').click(function() {
    if (coord0set && !coord1set) {
      window.location = '/bal/' + $('#coord0').text();
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

});
