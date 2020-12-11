;(function() {
  let competition = {};
  competition.scores = {
    yellow: 0,
    blue: 0
  };

  competition.tempScores = {
    yellow: 0,
    blue: 0
  };

  let blueScore = document.getElementById("blue-score");
  let yellowScore = document.getElementById("yellow-score");

  competition.updateMainUIScores = function() {
    blueScore.textContent = competition.scores.blue;
    yellowScore.textContent = competition.scores.yellow;
  };
  
  let blueModalScore = document.getElementById("blue-modal-score");
  let yellowModalScore = document.getElementById("yellow-modal-score");

  let scoringSetup = document.getElementById('scoring-setup');
  scoringSetup.addEventListener('click', function() {
    competition.tempScores.blue = competition.scores.blue;
    competition.tempScores.yellow = competition.scores.yellow;

    updateMainUIScores();
    blueModalScore.textContent = competition.scores.blue;
    yellowModalScore.textContent = competition.scores.yellow;
  });
  
  let blueReset = document.getElementById("blue-reset");
  blueReset.addEventListener('click', function() {
    competition.tempScores.blue = 0;
    blueModalScore.textContent = competition.tempScores.blue;
  });

  let yellowReset = document.getElementById("yellow-reset");
  yellowReset.addEventListener('click', function() {
    competition.tempScores.yellow = 0;
    yellowModalScore.textContent = competition.tempScores.yellow;
  });

  let bluePlus = document.getElementById("blue-plus");
  bluePlus.addEventListener('click', function() {
    competition.tempScores.blue++;
    blueModalScore.textContent = competition.tempScores.blue;
  });

  let yellowPlus = document.getElementById("yellow-plus");
  yellowPlus.addEventListener('click', function() {
    competition.tempScores.yellow++;
    yellowModalScore.textContent = competition.tempScores.yellow;
  });

  let blueMinus = document.getElementById("blue-minus");
  blueMinus.addEventListener('click', function() {
    competition.tempScores.blue--;
    blueModalScore.textContent = competition.tempScores.blue;
  });

  let yellowMinus = document.getElementById("yellow-minus");
  yellowMinus.addEventListener('click', function() {
    competition.tempScores.yellow--;
    yellowModalScore.textContent = competition.tempScores.yellow;
  });

  let scoringSave = document.getElementById('scoring-save');
  scoringSave.addEventListener('click', function() {
    competition.scores.blue = competition.tempScores.blue;
    competition.scores.yellow = competition.tempScores.yellow;

    updateMainUIScores();
  });

  competition.updateBlueTeamDetails = function() {
    let newBlueTeamName = document.getElementById('blue-team-name').value;
    document.getElementById('blue-team').textContent = newBlueTeamName;
    document.getElementById('blue-team-name-modal').textContent = newBlueTeamName;
  };

  let blueName= document.getElementById('blue-set-team-name');
  blueName.addEventListener('click', function() {
    competition.updateBlueTeamDetails();
  });

  competition.updateYellowTeamDetails = function() {
    let newYellowTeamName = document.getElementById('yellow-team-name').value;
    document.getElementById('yellow-team').textContent = newYellowTeamName;
    document.getElementById('yellow-team-name-modal').textContent = newYellowTeamName;
  };

  let yellowName= document.getElementById('yellow-set-team-name');
  yellowName.addEventListener('click', function() {
    competition.updateYellowTeamDetails();
  });

})();
