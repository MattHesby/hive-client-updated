const key = Math.random().toString(36).substr(2, 35); //"Render" the key immediately so it can't be modified through console.


    let savedGameInd;
    var stringArr;
    var rerunObj;
    var lastCoords;
    var barricades = [];
    var socket = io.connect();
    let winText = document.getElementById("winner");
    var btn = document.getElementById("create");
    var username = document.getElementById("username");
    var after = document.getElementById("after");
    var watchlive = document.getElementById("watchlive");
    var eCanvas = document.getElementById("energyDisplay");
    var saveGame = document.getElementById("saveGame");
    var replayNames = document.getElementById("names");
    let resetAllButton = document.getElementById("resetAllButton")
    var gLeaderBoard;
    var eCtx = eCanvas.getContext("2d");
    var mapSize;

    socket.on("reconnect", function() {
      location.reload();
    })

    socket.on("disconnect", function() {
      // alert("Server has disconnected. If it's being restarted, wait until the connection is re-established.");
    })

    btn.onclick = function() {
      if (username.value.length <= 30) {
        btn.style.display = "none";
        username.style.display = "none";
        after.innerHTML = "Note: If another player has the username you entered, your bot will not work.<br>Username: " + username.value + "<br>Bot Key: " + key + "<br><br>";
        socket.emit("newPlayer", { "key": key, "username": username.value })
      }
      else {
        username.value = "Too long, try again!";
      }
    }

    resetAllButton.onclick = function(){
      console.log("resetting everything");
      // socket.emit("resetAll");
    }

    let img = document.getElementById("img");

    let dirs = ["east", "west", "east", "west"];
    let flap = [0, 1, 0, 1];
    let map = [];
    for (let i = 0; i < 400; i++) {
      map.push(i % 2);
    }




    function drawPlayer(dir, id, energyLvl, x, y, w, h, pollen) {
      //energyLvl can be 0,1,or 2
      if (dir == "east") {
        energyLvl += 3;
      }
      if (flap[id] == 0) {
        if (dir == "right") {
          ctx.drawImage(img, 2 * 128, 4 * 128, 128, 128, x, y, w, h);

        }
        else {
          ctx.drawImage(img, 4 * 128, 4 * 128, 128, 128, x, y, w, h);
        }
        flap[id] = 1;
      }
      else {


        if (dir == "right") {
          ctx.drawImage(img, 3 * 128, 4 * 128, 128, 128, x, y, w, h);

        }
        else {
          ctx.drawImage(img, 5 * 128, 4 * 128, 128, 128, x, y, w, h);
        }
        flap[id] = 0;
      }
      ctx.drawImage(img, energyLvl * 128, id * 128, 128, 128, x, y, w, h);
      ctx.drawImage(img, 128, 4 * 128, 128, 128, x, y, w, h)
      
      //Draw pollen bar
      var maxBar;
      var color;
      
      if(pollen > 800){
        maxBar = 1600;
        color = "#db00b6";
      }
      else if(pollen > 400){
        maxBar = 800;
        color = "#ff0000";
      }
      else if(pollen > 200){
        maxBar = 400;
        color = "#ff8f00";
      }
      else if(pollen > 100){
        maxBar = 200;
        color = "#deff26";
      }
      else {
        maxBar = 100;
        color = "#26ff31";
      }
      var barWidth = pollen/maxBar * 32;
      
      ctx.strokeStyle = "white"
      ctx.strokeRect(x, y-10, 32, 8);
      ctx.fillStyle = color;
      ctx.fillRect(x, y-10, barWidth, 8);
    }


    socket.emit("display");

    if (localStorage.getItem("savedGame1") !== null) {
      let gameInd = 1;
      while (localStorage.getItem("savedGame" + gameInd) !== null) {
        addSavedGame(JSON.parse(localStorage.getItem("savedGame" + gameInd)).players, gameInd);
        gameInd++;
      }
    }
    var game;
    var rollbacking = false;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d")
    // Needs to be mapSize
    var size = 20;
    var xSize = canvas.width / size;
    var ySize = canvas.height / size;

    ctx.fillStyle = "black";



    grass();

    function show(gameToDraw) {

      for (var i = 0; i < gameToDraw.barricades.length; i++) {

        ctx.drawImage(img, 2 * 128, 5 * 128, 128, 128, gameToDraw.barricades[i][0] * xSize, gameToDraw.barricades[i][1] * ySize, xSize, ySize)
        // ctx.fillStyle = "pink";
        // ctx.fillRect(gameToDraw.barricades[i][0] * xSize, gameToDraw.barricades[i][1] * ySize, xSize, ySize)
      }

      for (let i = 0; i < gameToDraw.players.length; i++) {
        if (!(gameToDraw.players[i].dir == "south" || gameToDraw.players[i].dir == "north" || gameToDraw.players[i].dir == "east" || gameToDraw.players[i].dir == "west")) {
          gameToDraw.players[i].dir = "south";
        }
        // ctx.drawImage(playerImgs[gameToDraw.players[i].color + gameToDraw.players[i].dir], gameToDraw.players[i].pos[0] * xSize, gameToDraw.players[i].pos[1] * ySize, xSize, ySize);
        drawPlayer(dirs[i], i, 0, gameToDraw.players[i].pos[0] * xSize, gameToDraw.players[i].pos[1] * ySize, xSize, ySize, gameToDraw.players[i].pollen)
        // drawPlayer(dir, id, energyLvl : number, x, y, w, h)
      }
    }

    function bases(game) {
      for (var i = 0; i < game.bases.length; i++) {
        let EL = 0;
        if (game.bases[i].pollen >= 300) {
          EL += 3;
        }
        else if (game.bases[i].pollen >= 50) {
          EL += 2;
        }
        else if (game.bases[i].pollen >= 1) {
          EL += 1;
        }
        ctx.drawImage(img, EL * 128, (6 + i) * 128, 128, 128, game.bases[i].pos[0] * xSize, game.bases[i].pos[1] * ySize, xSize, ySize)
        // ctx.font = "20px Arial";
        // ctx.fillStyle = "white"
        // ctx.textAlign = "center";
        // ctx.fillText(game.bases[i].pollen, game.bases[i].pos[0] * xSize + 15, (game.bases[i].pos[1] * ySize) + ySize - 20);
      }
    }

    function nodes(loopArr) {
      console.log(loopArr[0])
      let EL;
      for (var i = 0; i < loopArr.length; i++) {
        EL = 3;
        if (loopArr[i].pollen >= 50) {
          EL += 2;
        }
        else if (loopArr[i].pollen >= 10) {
          EL += 1;
        }

        ctx.drawImage(img, EL * 128, 5 * 128, 128, 128, loopArr[i].pos[0] * xSize, loopArr[i].pos[1] * ySize, xSize, ySize)
      }
    }
    var games;
    let rerunLoop;
    let ind = 0;
    var time = document.getElementById("time");
    document.getElementById("speed").oninput = function() {
      clearInterval(rerunLoop);
      rerunLoop = setInterval(loop, 304 - document.getElementById("speed").value);
    }


    time.oninput = function() { changeTime(time.value); };

    function changeTime(newTime, intTime) { //In order to not have to save energy states in the replay.JSON database, for rollbacks I have to start from turn 0 and simulate the game up to where the user wants to rollback to.
      if (newTime < rerunObj.turns.length - 1) {
        winText.style.display = "none";
        winText.innerHTML = "";
      }
      clearInterval(rerunLoop);
      //time.value = tempNum;
      for (var k = 0; k < rerunObj.players.length; k++) {
        try {
          rerunObj.players[k].pollen = 0;
        }
        catch (err) {}
      }
      //Setting ind to 0 and setting all bases, node, and player energy to 0 to initiate the simulation.
      ind = 0;
      for (var i = 0; i < rerunObj.flowers.length; i++) {
        rerunObj.flowers[i].pollen = 0;
      }
      for (var j = 0; j < rerunObj.bases.length; j++) {
        rerunObj.bases[j].pollen = 0;
      }
      for (let i = 0; i < newTime; i++) {
        loop(true);
      }
      ind = newTime;
      rerunLoop = setInterval(function() { loop(false); }, 304 - document.getElementById("speed").value);
    }
    saveGame.onclick = function() {
      let gameInd = 1;
      while (localStorage.getItem("savedGame" + gameInd) !== null) {
        gameInd++;
      }
      localStorage.setItem("savedGame" + gameInd, JSON.stringify(rerunObj));
      addSavedGame(rerunObj.players, gameInd);
    }

    watchlive.onclick = function() {
      clearInterval(rerunLoop);
      document.getElementById("unsaveGame").style.display = "none";
      ind = 0;
      grass();
      eCtx.fillStyle = "white";
      eCtx.fillRect(0, 0, eCanvas.width, eCanvas.height);
      rollbacking = false;
      winText.style.display = "none";
      watchlive.style.display = "none";
      saveGame.style.display = "none";
      time.style.display = "none";
      selectGame.style.display = "block";
      document.getElementById("speed").style.display = "none";
      document.documentElement.scrollTop = 83;
    }
    document.getElementById("unsaveGame").onclick = function() {
      document.getElementById("saved").innerHTML = '<b>Saved Games</b><br><button onclick = "clearSavedGames();">Clear</button>';
      let i = savedGameInd;
      while (localStorage.getItem("savedGame" + (i + 1)) !== null) {
        localStorage.setItem("savedGame" + (i), localStorage.getItem("savedGame" + (i + 1)));
        i++;
      }
      localStorage.removeItem("savedGame" + i);
      let gameInd = 1;
      while (localStorage.getItem("savedGame" + gameInd) !== null) {
        addSavedGame(JSON.parse(localStorage.getItem("savedGame" + gameInd)).players, gameInd);
        gameInd++;
      }
    }

    socket.on("rerunGameData", function(data) {
      replayGame(data);
      document.getElementById("unsaveGame").style.display = "none";
      document.getElementById("saveGame").style.display = "block";
    });

    function replayGame(data) {
      document.documentElement.scrollTop = 83;
      winText.style.display = "none";
      winText.innerHTML = "";
      selectGame.style.display = "none";
      rollbacking = true;
      watchlive.style.display = "block";
      saveGame.style.display = "block";
      time.style.display = "block";
      document.getElementById("speed").style.display = "block";
      clearInterval(rerunLoop); //Stops reruns that are currently running to initiate this one.
      rerunObj = data; //Global variable.
      ind = 0; //On top of resetting any other games running, we need to set the ind to 0.
      grass();
      time.max = rerunObj.turns.length - 1; //for rollbacking, set the max value of the time slider to the number of turns.

      rerunLoop = setInterval(loop, 304 - document.getElementById("speed").value); //initiates game rollback.
    }

    function loop(isRerunning) {
      if (rerunObj.turns[ind][0] < rerunObj.players[ind % rerunObj.players.length].pos[0]) {
        dirs[ind % rerunObj.players.length] = "west";
      }
      if (rerunObj.turns[ind][0] > rerunObj.players[ind % rerunObj.players.length].pos[0]) {
        dirs[ind % rerunObj.players.length] = "east";
      }



      rerunObj.players[ind % rerunObj.players.length].pos = rerunObj.turns[ind];

      // for(let i=0;i<rerunObj.nodes.length;i++){
      // rerunObj.nodes
      // }
      for (let i = 0; i < rerunObj.bases.length; i++) {
        rerunObj.bases[i].pollen = rerunObj.pollen[ind].bases[i];
      }

      for (let i = 0; i < rerunObj.players.length; i++) {
        rerunObj.players[i].pollen = rerunObj.pollen[ind].players[i];
      }




      if (!isRerunning) {
        time.value = ind;
      }



      let tempTurn = 0;
      if (ind > rerunObj.turns.length - rerunObj.players.length) {
        tempTurn = rerunObj.turns.length - rerunObj.players.length;
      }
      else {
        tempTurn = ind;
      }
      if (!isRerunning) {
        grass();
        scoreboard(rerunObj.players, rerunObj.bases, (tempTurn) + "/" + (rerunObj.turns.length - rerunObj.players.length))
        energyCanvas(rerunObj.players, rerunObj.bases)
      }

      nodes(rerunObj.flowers)
      if (!isRerunning) {
        for (var i = 0; i < rerunObj.barricades.length; i++) {
          ctx.drawImage(img, 2 * 128, 5 * 128, 128, 128, rerunObj.barricades[i][0] * xSize, rerunObj.barricades[i][1] * ySize, xSize, ySize)
        }
      }
      if (ind > rerunObj.players.length) {
        bases(rerunObj)
        if (rerunObj.players[ind % rerunObj.players.length].dir == "" || rerunObj.players[ind % rerunObj.players.length].dir == null) {
          rerunObj.players[ind % rerunObj.players.length].dir = "south"
        }
        if (ind > rerunObj.players.length) {
          for (let i = 0; i < rerunObj.players.length; i++) {
            drawPlayer(dirs[i], i, 0, rerunObj.players[i].pos[0] * xSize, rerunObj.players[i].pos[1] * ySize, xSize, ySize, rerunObj.players[i].pollen)
          }
        }
      }
      ind++;
      if (ind >= rerunObj.turns.length) {
        if (rerunObj.winnerId == "tie") {
          winText.style.display = "inline-block";
          winText.innerHTML = "Tie!<br>Better luck next time!";
        }
        else {
          displayWinner(rerunObj.players[rerunObj.winnerId].color, rerunObj.players[rerunObj.winnerId].name, rerunObj.bases[rerunObj.winnerId].pollen, rerunObj.winnerId);
          clearInterval(rerunLoop);
        }
      }
    }

    socket.on("replayNames", function(obj) {
      stringArr = obj.rerunStr;
      leaderBoard(JSON.parse(obj.scoreArray));
      replaySelect(stringArr);
    })
    socket.on("queue", function(data) {
      games = data;
      if (!rollbacking) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].running) {
            grass();
            game = data[i];
            break;
          }
        }
      }
    })
    socket.on("endGame", function(obj) {
      for (let i = 0; i < gLeaderBoard.length; i++) {
        if (gLeaderBoard[i][0] == obj.winner.name) {
          gLeaderBoard[i][1] += 15;
          break;
        }
      }
      console.log("Game Players: " + games[obj.gameId].players);
      for (let player of games[obj.gameId].players) {
        if (player.name != obj.winner.name) {
          console.log("loser " + player.name);
          for (let i = 0; i < gLeaderBoard.length; i++) {
            if (player.name == gLeaderBoard[i][0]) {
              console.log("match " + player.name, gLeaderBoard[i][0])
              gLeaderBoard[i][1] -= 5;
              if (gLeaderBoard[i][1] < 0) {
                gLeaderBoard[i][1] = 0;
              }
            }
          }
        }
      }

      gLeaderBoard.sort(function(a, b) {
        return b[1] - a[1];
      });


      console.log("sorterd " + gLeaderBoard)

      leaderBoard(gLeaderBoard);
      if (!rollbacking) {
        if (games[parseInt(selectGame.options[selectGame.selectedIndex].value)].gameId == obj.gameId) {
          if (obj.winner == "tie") {
            winText.style.display = "inline-block";
            winText.innerHTML = "Tie!<br>Better luck next time!";
          }
          else {
            displayWinner(obj.winner.color, obj.winner.name, obj.base.pollen, obj.winner.id);
            // console.log("is")
            // console.log(stringArr);
            stringArr[stringArr.length - 1] += "| Winner: " + obj.winner.name
            replaySelect(stringArr);
          }

          for (let i = 0; i < games.length; i++) {
            if (games[i].running) {

              break;
            }
          }
        }
      }


      //




    })
    socket.on("draw", function(data) {
      for (let game of data) {
        if (game.turn >= game.totalTurns + game.players.length) {
          while (stringArr.length > 19) {
            stringArr.shift();
          }
          let tempStr = "";
          for (let i = 0; i < game.players.length; i++) {
            tempStr += games[ind].players[i].name + " ";
          }
          stringArr.push(tempStr);

        }
      }
      if (!rollbacking) {
        winText.style.display = "none";
        winText.innerHTML = "";
        let gameToDraw = data[parseInt(selectGame.options[selectGame.selectedIndex].value)];
        if (gameToDraw.running) {
          if (lastCoords != null) {

          }
          if (gameToDraw.players[gameToDraw.idTurn].dir == "east" || gameToDraw.players[gameToDraw.idTurn].dir == "west") {
            dirs[gameToDraw.idTurn] = gameToDraw.players[gameToDraw.idTurn].dir;
          }

          lastCoords = gameToDraw;

          time.style.display = "none";
          grass();
          scoreboard(gameToDraw.players, gameToDraw.bases, (gameToDraw.turn - gameToDraw.players.length) + "/" + (gameToDraw.totalTurns))
          nodes(gameToDraw.flowers);
          bases(gameToDraw);
          show(gameToDraw)
          energyCanvas(gameToDraw.players, gameToDraw.bases)
        }


      }
    })

    var selectGame = document.getElementById("selectGame");
    selectGame.onchange = function() {

      dirs = ["east", "west", "east", "west"];

      flap = [0, 1, 0, 1];


      grass();
    }

    function scoreboard(players, bases, turnStr) {
      document.getElementById("turnStr").innerHTML = "Turn: <b>" + turnStr + "</b>";
      for (var i = 0; i < players.length; i++) {
        document.getElementById("player" + i).innerHTML = "";
        document.getElementById("player" + i).innerHTML += "Name: " + players[i].name + "<br>ELO: " + players[i].elo + "<br>base honey: " + bases[i].pollen + "<br>pollen: " + players[i].pollen;
        //        document.getElementById("player" + i).innerHTML += "Player" + (i + 1) + ": <br>name: " + players[i].name + "<br>ELO: " + players[i].elo + "<br>base pollen: " + bases[i].pollen + "<br>energy: " + players[i].pollen;

      }
    }

    function displayWinner(color, name, baseEnergy, id) {
      winText.style.display = "inline-block";
      winText.innerHTML = "Winner: <span style = 'color: " + color + ";'>" + name + "</span>" + " (Player " + (id + 1) + ")<br>" + name + " won with an astounding base honey score of " + baseEnergy + "!"
    }

    function addGame(str) { //Adds games to the replay selection when they end.
      let htmlCommand = 'socket.emit("rerunGame", parseInt(this.innerHTML.substring(0,this.innerHTML.indexOf(".")))-1); console.log(parseInt(this.innerHTML.substring(0,this.innerHTML.indexOf(".")))-1)'

      let html = "<p style='cursor:pointer; color:blue; text-decoration:underline;' onclick = '" + htmlCommand + "'>" + str + "</p>";
      replayNames.innerHTML = '<b>Recent Games (Last 20)</b>' + html + replayNames.innerHTML.substring(replayNames.innerHTML.indexOf("</b>") + 4, replayNames.innerHTML.length);
    }


    function energyCanvas(players, bases) {
      let energySum = 0;
      for (let i = 0; i < players.length; i++) {
        energySum += players[i].pollen;
        energySum += bases[i].pollen
      }
      let drawY = 0;
      for (let player of players) {
        eCtx.fillStyle = player.color;
        eCtx.fillRect(0, drawY, eCanvas.width, ((player.pollen + bases[player.id].pollen) / energySum) * 600);
        drawY += ((player.pollen + bases[player.id].pollen) / energySum) * 600;
      }
    }

    function addSavedGame(players, gameInd) {
      let str = gameInd + ". ";
      for (let i = 0; i < players.length; i++) {
        str += players[i].name + " ";
      }

      var htmlCommand = 'savedGameInd = parseInt(this.innerHTML.substring(0,this.innerHTML.indexOf(".")));replayGame(JSON.parse(localStorage.getItem("savedGame" + savedGameInd)));document.getElementById("unsaveGame").style.display = "block";document.getElementById("saveGame").style.display = "none";';
      let html = "<p style='cursor:pointer; color:blue; text-decoration:underline;' onclick = '" + htmlCommand + "'>" + str + "</p>";
      document.getElementById("saved").innerHTML = document.getElementById("saved").innerHTML + html;
    }

    function clearSavedGames() {
      if (localStorage.getItem("savedGame1") !== null) {
        let gameInd = 1;
        while (localStorage.getItem("savedGame" + gameInd) !== null) {
          localStorage.removeItem("savedGame" + gameInd);
          gameInd++;
        }
        document.getElementById("saved").innerHTML = '<b>Saved Games</b><br><button onclick = "clearSavedGames();">Clear</button>';
      }

    }

    function leaderBoard(mostWins) {
      gLeaderBoard = mostWins;
      let leaderBoardStr = "<br>";
      for (let i = 0; i < mostWins.length; i++) {
        leaderBoardStr += (i + 1) + ". " + mostWins[i][0] + " (" + mostWins[i][1] + ")<br>";
      }
      document.getElementById("leaderboard").innerHTML = '<b>Leaderboard</b>' + leaderBoardStr;
    }

    function replaySelect(arr) {

      replayNames.innerHTML = '<b>Recent Games (Last 20)<b><br>'

      let p = "";
      for (var i = arr.length - 1; i >= 0; i--) {
        p = i + 1 + ". " + arr[i];
        let htmlCommand = 'console.log(parseInt(this.innerHTML.substring(0,this.innerHTML.indexOf(".")))-1); socket.emit("rerunGame", parseInt(this.innerHTML.substring(0,this.innerHTML.indexOf(".")))-1);'
        replayNames.innerHTML = replayNames.innerHTML + "<p style='cursor:pointer; color:blue; text-decoration:underline;' onclick = '" + htmlCommand + "'>" + p + "</p>";
      }
    }



    function grass() {
      for (let i = 0; i < 400; i++) {
        let add = 0;
        if (Math.floor(i / 20) % 2 == 0) {
          add = xSize
        }
        else {
          add = 0;
        }
        if (map[i] == 0) {



          ctx.drawImage(img, 0, 5 * 128, 128, 128, i % 20 * xSize + add, Math.floor(i / 20) * ySize, xSize, ySize)


        }
        else {
          ctx.drawImage(img, 128, 5 * 128, 128, 128, i % 20 * xSize + add, Math.floor(i / 20) * ySize, xSize, ySize)
        }
      }

      for (let i = 0; i < 22; i += 2) {
        ctx.drawImage(img, 128, 5 * 128, 128, 128, 0, i * ySize, xSize, ySize);
      }
    }