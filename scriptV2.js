//board global var's
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler global var's
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = (boardHeight * 7) / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

//initializes the doodler
let doodler = {
  img: null,
  x: doodlerX,
  y: doodlerY,
  width: doodlerWidth,
  height: doodlerHeight,
};

//the physics
let velocityX = 0;
//starting jump velocity 
let velocityY = 0;
 //doodler jump speed
let initialVelocityY = -8; 
let gravity = 0.4;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

//baseline for score
let score = 0;
let maxScore = 0;
let gameOver = false;

//initialises the canvas
window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  //used for drawing on the board
  context = board.getContext("2d");

  //loads the images
  doodlerRightImg = new Image();
  doodlerRightImg.src = "./doodler-right.png";
  doodler.img = doodlerRightImg;
  doodlerRightImg.onload = function () {
    context.drawImage(
      doodler.img,
      doodler.x,
      doodler.y,
      doodler.width,
      doodler.height
    );
  };
  //initializes doodler
  doodlerLeftImg = new Image();
  doodlerLeftImg.src = "./doodler-left.png";

  //initilizes the platforms imgs
  platformImg = new Image();
  platformImg.src = "./platform.png";

  //Sets the startup jumping
  velocityY = initialVelocityY;
  //calls the starting platform functions
  placePlatforms();
  requestAnimationFrame(update);
  //starts the moveDoodler function
  document.addEventListener("keydown", moveDoodler);
};

function update() {
  requestAnimationFrame(update);
  //restarts the game
  if (gameOver) {
    return;
  }
  //clears the stacked trailing images of doodler that would occur without this.
  context.clearRect(0, 0, board.width, board.height);

  //doodler function that inacts the controls e.g if "A" == true then the x is -3
  doodler.x += velocityX;
  if (doodler.x > boardWidth) {
    doodler.x = 0;
  } else if (doodler.x + doodler.width < 0) {
    doodler.x = boardWidth;
  }
  //physic applied to doodler
  velocityY += gravity;
  doodler.y += velocityY;

  //if doodler is under the board he will die and the game will reset
  if (doodler.y > board.height) {
    gameOver = true;
  }

  //spawns the doodler
  context.drawImage(
    doodler.img,
    doodler.x,
    doodler.y,
    doodler.width,
    doodler.height
  );

  //platforms
  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];
    if (velocityY < 0 && doodler.y < (boardHeight * 3) / 4) {
      //slide platform down
      platform.y -= initialVelocityY;
    }
    if (detectCollision(doodler, platform) && velocityY >= 0) {
      //jump
      velocityY = initialVelocityY; 
    }
    //spawns the platforms
    context.drawImage(
      platform.img,
      platform.x,
      platform.y,
      platform.width,
      platform.height
    );
  }

  // clear platforms and add new platform
  while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
    //removes first element from the array
    platformArray.shift(); 
    //replace with new platform on top
    newPlatform(); 
  }

  //score
  updateScore();
  context.fillStyle = "white";
  context.font = "18px tahoma";
  context.fillText(score, 5, 20);
  //gameover
  if (gameOver) {
    context.fillText(
      "Game Over: Press 'Space' to Restart",
      boardWidth / 11,
      (boardHeight * 7) / 8
    );
  }
}

//doodler controls
function moveDoodler(e) {
  if (e.code == "ArrowRight" || e.code == "KeyD") {
    //move right
    velocityX = 3;
    doodler.img = doodlerRightImg;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    //move left
    velocityX = -3;
    doodler.img = doodlerLeftImg;
    //If else the gameover function triggers
  } else if (e.code == "Space" && gameOver) {
    //reset
    //on load setting the doodlers x & y location and image and dimensions of sprite
    doodler = {
      img: doodlerRightImg,
      x: doodlerX,
      y: doodlerY,
      width: doodlerWidth,
      height: doodlerHeight,
    };

    //so the starting is not moving left or right
    velocityX = 0; 
    //inact gravity physics upon doodler set to -8
    velocityY = initialVelocityY; 
    score = 0;
    maxScore = 0;
    gameOver = false;
    //Calls the paltforms for starting screen
    placePlatforms(); 
  }
}

function placePlatforms() {
  platformArray = [];

  //starting platforms
  let platform = {
    img: platformImg,
    //so the new platform spawns in the middle of canvas
    x: boardWidth / 2, 
    //so the platform spawns right under the doodle
    y: boardHeight - 50, 
    width: platformWidth,
    height: platformHeight,
  };

  //pushes the new platfrom into platformArray
  platformArray.push(platform);

  //Rng generator for the platforms on first load
  for (let i = 0; i < 6; i++) {
    //(0-1) * boardWidth*3/4
    let randomX = Math.floor((Math.random() * boardWidth * 3) / 4); 
    let platform = {
      img: platformImg,
      x: randomX,
      y: boardHeight - 75 * i - 150,
      width: platformWidth,
      height: platformHeight,
    };

    platformArray.push(platform);
  }
}

//Rng generator for the platforms as the doodler goes up
function newPlatform() {
  //(0-1) * boardWidth*3/4
  let randomX = Math.floor((Math.random() * boardWidth * 3) / 4); 
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight,
  };

  platformArray.push(platform);
}

function detectCollision(a, b) {
  return (
    //a's top left corner doesn't reach b's top right corner
    a.x < b.x + b.width && 
    //a's top right corner passes b's top left corner
    a.x + a.width > b.x && 
    //a's top left corner doesn't reach b's bottom left corner
    a.y < b.y + b.height &&
    //a's bottom left corner passes b's top left corner
    a.y + a.height > b.y 
  );
}

function updateScore() {
  let points = Math.floor(50 * Math.random()); //(0-1) *50 --> (0-50) points rng from (0-50)
  if (velocityY < 0) {
    //negative velocity score going up to make to make points 
    maxScore += points;
    //if score is greater then max then score increasing on board
    if (score < maxScore) {
      score = maxScore;
    }
    //if velocityY greater then 0 maxScore -= points
  } else if (velocityY >= 0) {
    maxScore -= points;
  }
}
