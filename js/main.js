$(function(){
  var grid, row, col;
  grid = [];
  row = 10;
  col = 15;
  initGrid();

  function initGrid() {
    newGrid();
    newMines();
    calcMines();
    makeGrid();
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
        $('.row_' + i).last().append($('<div class="pixel col_' +  j +'">' +  grid[i][j] + '</div>'));
      }
    }
  }

  function newMines(){
    var no_of_mines = row * col * 0.15
    for(var i = 0; i < row; i++) {
      for(var j = 0; j < col; j++) {
        var cells_left = (row - i) * col - j;
        var probability = no_of_mines / cells_left;
        if (Math.random() <= probability) {
          grid[i][j] = "9";
          if (no_of_mines > 0) {no_of_mines -= 1}
        }
      }
    }
  }

  function calcMines(){
    for(var i = 0; i < row; i++) {
      for(var j = 0; j < col; j++) {
        var mines = 0
        mines = for_surrounding(i, j, mines, calcSurrMines);
        if (grid[i][j] != 9) { grid[i][j] = mines.toString(); }
      }
    }
  }

  function for_surrounding(i,j,mines, cb){
    var surrounding = [[i-1,j-1], [i-1,j], [i-1,j+1], [i,j-1], [i, j+1], [i+1, j-1], [i+1,j], [i+1,j+1]];
    var valid_surr = surrounding.filter(function(pixel) {return pixel[0] >= 0 && pixel[0] <= row-1 && pixel[1] >= 0 && pixel[1] <= col-1 })
    return cb(valid_surr, mines);
  }

  function calcSurrMines(valid_surr, mines){
    valid_surr.forEach(function(pixel){
      if (grid[pixel[0]][pixel[1]] == "9") {
          mines += 1
      }
    })
    return mines
  }

  //For older JS versions
  Array.prototype.select = function(closure){
      for(var n = 0; n < this.length; n++) {
          if(closure(this[n])){
              return this[n];
          }
      }

      return null;
  };

  function determineFlip(i, j) {
    var flipped = [[i,j]],
        queue = flipped;
    return flipUntilMine(i, j, flipped, queue, []);
  }

    function flipUntilMine(i, j, flipped, queue, checked) {
      if (queue.length == 0) {
      //console.log("queue = 0", flipped)
      return flipped
      }
      //console.log("flipped", flipped, "queue", queue, "checked", checked)
      checked.push([i,j]);
      var surrounding = [[i-1,j-1], [i-1,j], [i-1,j+1], [i,j-1], [i, j+1], [i+1, j-1], [i+1,j], [i+1,j+1]];
      var valid_surr = surrounding.filter(function(pixel) {return pixel[0] >= 0 && pixel[0] <= row-1 && pixel[1] >= 0 && pixel[1] <= col-1 })
      if (valid_surr.every(noneAreMines)) {
        //console.log("running")
        valid_surr.forEach(function(pixel){
          if (!isArrayInArray(checked, pixel)) { //if pixel not included in checked
            flipped.push(pixel);
            queue.push(pixel)
          }
        })
      }
      flipped = flipped.filter(unique());
      queue = queue.filter(unique());
      var new_check = queue.shift();
      return flipUntilMine(new_check[0], new_check[1], flipped, queue, checked)
  }

  function noneAreMines(pixel) {
    return grid[pixel[0]][pixel[1]] != 9
  }

  function unique() {
    var seen = {};
    return function(element, index, array) {
      return !(element in seen) && (seen[element] = 1);
    };
  }

  function isArrayInArray(source, search) {
    var searchLen = search.length;
    for (var i = 0, len = source.length; i < len; i++) {
        // skip not same length
        if (source[i].length != searchLen) continue;
        // compare each element
        for (var j = 0; j < searchLen; j++) {
            // if a pair doesn't match skip forwards
            if (source[i][j] !== search[j]) {
                break;
            }
            return true;
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


  function displayNum(i,j) {
    displayPixels = determineFlip(i, j);
    displayPixels.forEach(function(pixel) {
      $('.row_' + pixel[0] + ' .col_' + pixel[1]).addClass('active')
    })
  }

});
