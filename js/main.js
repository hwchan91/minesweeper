$(function(){
  var grid, row, col, total_mines, mines_array, flags_array, game_end, time, timer, win;
  $.when(newGame()).then(activateRestart());

  function newGame() {
    console.log("init")
    gameEnd();
    $('.gameover').hide();
    $('.win').hide();
    $('.timer').text("000").css("color", "red");
    $('.flags_left').text("099").css("color", "red");
    grid = [];
    row = 18;
    col = 30;
    total_mines = 99;
    mines_array = [];
    flags_array = [];
    game_end = false;
    win = false;
    time = -1;
    initGrid();
    $('.pixel').on('click', start_timer)
    clickListener();
  }

  function activateRestart() {
    $('.restart').on('click', newGame);
  }

  function start_timer() {
    $('.pixel').off('click', start_timer)
    if (!game_end) {count_time()}
  }

  function initGrid() {
    newGrid();
    newMines();
    calcMines();
    makeGrid();
    $('.flags_left').text(numerize(mines_array.length - flags_array.length))
  }

  function newGrid() {
    for(var i = 0; i < row; i++) {
     var new_row = [];
      for(var j = 0; j < col; j++) {
      new_row[j] = "";
      }
      grid[i] = new_row;
    }
  }

  function makeGrid() {
    $('.box').html("");
    for(var i = 0; i < row; i++) {
      $('.box').append($('<div class="rows row_' + i + '"></div>'));
      for(var j = 0; j < col; j++) {
        $('.row_' + i).last().append($('<div class="pixel col_' +  j + '" data-row="' + i + '" data-col="' + j + '"></div>'));
      }
    }
  }

  function newMines(){
//    var no_of_mines = row * col * 0.15
    var no_of_mines = total_mines
    for(var i = 0; i < row; i++) {
      for(var j = 0; j < col; j++) {
        var cells_left = (row - i) * col - j;
        var probability = no_of_mines / cells_left;
        if (Math.random() <= probability) {
          mines_array.push([i,j]);
          grid[i][j] = "9";
          if (no_of_mines > 0) {no_of_mines -= 1}
        }
      }
    }
  }

  function calcMines(){
    for(var i = 0; i < row; i++) {
      for(var j = 0; j < col; j++) {
        mines = calcSurrMines(i,j);
        if (grid[i][j] != 9) { grid[i][j] = mines.toString(); }
      }
    }
  }

  function calcSurrMines(i,j) {
    var valid_surr = gen_valid_surr(i,j),
        mines = 0;
    valid_surr.forEach(function(pixel){
      if (grid[pixel[0]][pixel[1]] == "9") {
          mines += 1
      }
    })
    return mines
  }

  function gen_valid_surr(i,j) {
    var surrounding = [[i-1,j-1], [i-1,j], [i-1,j+1], [i,j-1], [i, j+1], [i+1, j-1], [i+1,j], [i+1,j+1]];
    var valid_surr = surrounding.filter(function(pixel) {return pixel[0] >= 0 && pixel[0] <= row-1 && pixel[1] >= 0 && pixel[1] <= col-1 });
    return valid_surr;
  }

  function flipUntilMine(i, j, flipped = [[i,j]], queue = [], checked = [] ) {
    var valid_surr = gen_valid_surr(i,j);

    checked.push([i,j]);
    //console.log("pixel", i,j, "checked", checked, "flipped", flipped, "queue", queue)

    if ( grid[i][j] == "0" ) {
      valid_surr.forEach(function(pixel){
        flipped.push(pixel);
        //console.log("added", pixel, "to flip")
        if (!isArrayInArray(checked, pixel)) { //if pixel not included in checked
          //flipped.push(pixel);
          queue.push(pixel);
          //console.log("added", pixel, "to queue")
        }
      })
    }

    if (queue.length == 0) {
      return flipped
    }

    flipped = flipped.unique();
    queue = queue.unique();
    var new_check = queue.shift();
    return flipUntilMine(new_check[0], new_check[1], flipped, queue, checked)
  }

  Array.prototype.unique = function()
  {
      var tmp = {}, out = [];
      for(var i = 0, n = this.length; i < n; ++i)
      {
          if(!tmp[this[i]]) { tmp[this[i]] = true; out.push(this[i]); }
      }
      return out;
  }

  Array.prototype.removeArray = function(value) {
    var out, hash = {}
    hash[value] = true
    out = this.filter(function(elem) {
        return !(elem in hash)
    })
    return out
  }

  function isArrayInArray(source, search) {
    var searchLen = search.length;
    for (var i = 0, len = source.length; i < len; i++) {
        // skip not same length
        if (source[i].length != searchLen) continue;
        // compare each element
        for (var j = 0; j < searchLen; j++) {
            if (source[i][j] !== search[j]) {
             // if a pair doesn't match skip forwards
               break;
            } else if (j == searchLen -1) {return true}  //every element matches
        }
    }
    return false;
  }

//----------for testing purposes-----------
//  function surr(i,j) {
//    var surrounding = [[i-1,j-1], [i-1,j], [i-1,j+1], [i,j-1], [i, j+1], [i+1, j-1], [i+1,j], [i+1,j+1]];
//    var valid_surr = surrounding.filter(function(pixel) {return pixel[0] >= 0 && pixel[0] <= row-1 && pixel[1] >= 0 && pixel[1] <= col-1 })
//    return valid_surr
//  }
//console.log("surr", surr(5,5));
//console.log("nonearemines", [[4, 4], [4, 5], [4, 6], [5, 4], [5, 6], [6, 4], [6, 5], [6, 6]].every(noneAreMines))


  function clickListener() {
    $('.pixel').on('mousedown', pixelListener);

  }

  function pixelListener(e) {
    var row = $(this).data('row'),
        col = $(this).data('col');
    if (!game_end && $(this).attr('class').indexOf('active') == -1) { //tile is not already open
      if (e.which == 1 && $(this).attr('class').indexOf('flag') == -1) { //left click and not flagged
        if (grid[row][col] == "9") {
          gameOver(row, col);
        } else {
          displayNum(row, col)
        }
      } else if (e.which == 3) { //right click
        toggleFlag(row, col);
      }
    }
    checkWin();
  }

  function displayNum(i,j) {
    displayPixels = flipUntilMine(i, j);
    displayPixels.forEach(function(pixel) {
      showNum(pixel);
    })
  }

  function showNum(pixel) {
    var num = grid[pixel[0]][pixel[1]]
    var active_pixel = $('.row_' + pixel[0] + ' .col_' + pixel[1])
    //remove flag from flag_array and pixel css
    if (isArrayInArray(flags_array, pixel)) {
      active_pixel.html("").removeClass('flag')
      flags_array = flags_array.removeArray(pixel)
      $('.flags_left').text(flags_left())
    }
    active_pixel.addClass('active num' + num );
     if (num != 0) { active_pixel.text(num) }
  }

  function gameOver(row, col) {
    mines_array.forEach(function(pixel) {
      var mine_pixel = $('.row_' + pixel[0] + ' .col_' + pixel[1])
      mine_pixel.html($('<span class="glyphicon glyphicon-certificate"></span>')).addClass("active");
      if (pixel[0] == row && pixel[1] == col) {mine_pixel.addClass("mine_clicked");}
    })
    flags_array.forEach(function(pixel) {
      if (!isArrayInArray(mines_array, pixel)) {
        $('.row_' + pixel[0] + ' .col_' + pixel[1]).addClass('cross')
      }
    })
    $('.gameover').toggle();
    gameEnd();
  }

  function gameEnd() {
    console.log("running game end")
    game_end = true
    clearTimeout(timer);
    $('.pixel').off('mousedown', pixelListener);
    if (win == true) {
      $('.flags_left').text("you").css("color", "#2ad641");
      $('.timer').text("win").css("color", "#2ad641");
    }
  }

  function flags_left() {
    return mines_array.length - flags_array.length
  }

  function toggleFlag(row, col) {
    var pixel = $('.row_' + row + ' .col_' + col)
    //console.log(pixel.attr('class').indexOf('flag'))
    if (pixel.attr('class').indexOf('flag') == -1 ) { //does not contain flag class
      if (flags_left()) {
        pixel.html($('<img src="http://minesweeperonline.com/flag.png" class="flag">')).addClass('flag');
        flags_array.push([row,col])
      }
    } else {
      pixel.html("").removeClass('flag');
      flags_array = flags_array.removeArray([row,col]);
    }
    $('.flags_left').text(numerize(flags_left()))
  }

  function checkWin() {
    if (row * col - $('.active').length == mines_array.length && !game_end ) { //no. of opened tiles == no of mines
      win = true;
      gameEnd();
    }
  }

  function count_time() {
    time += 1
    $('.timer').text(numerize(time))
    timer = setTimeout(function() {
              count_time()
            }, 1000);

  }

  function numerize(num) {
    var num_length = num.toString().length
    if (num_length == 1) {
      return "00" + num.toString()
    } else if (num_length == 2) {
      return "0" + num.toString()
    } else if (num_length == 3) {
      return num.toString()
    } else {
      return "999"
    }

  }


});
