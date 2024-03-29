var originalSeed = 100;
var seed = 100;

var offsetX = 0;
var offsetY = 0;

var adjustedMouseX = 0;
var adjustedMouseY = 0;
var mouseJustDragged = false;

var gameGridWidth = 100;
var gameGridHeight = 100;

var sectorsWide = 8;
var sectorsTall = 8;
var sectorDim = 100;

var sectors = [];
var uiHeight = 76;
var uiScaleFactor = 1.0;

var actionButtons = [];
var vomitButton, coughButton, sneezeButton, spitButton, passButton;
var chooseInfectedButton;

var gameGrid;
var selectedSector = null;
var disease;
var selected_sector_is_contagious = true;

var img_title;
var img_state_default;
var img_state_infected;
var img_state_infected_vomit;
var img_state_contagious;
var img_state_contagious_vomit;
var img_state_immune;
var img_state_dead;
var img_cough;
var img_sneeze;
var img_spit;
var img_vomit;
var img_blood;

var DIRECTION_N = Math.PI * 2;
var DIRECTION_NW = Math.PI * 2 - Math.PI / 4;
var DIRECTION_W = Math.PI * 2 - Math.PI / 2;
var DIRECTION_SW = Math.PI * 2 - Math.PI / 2 - Math.PI / 4;
var DIRECTION_S = Math.PI;
var DIRECTION_SE = Math.PI - Math.PI / 4;
var DIRECTION_E = Math.PI / 2;
var DIRECTION_NE = Math.PI / 4;

var  DIRECTIONS = [
    DIRECTION_E,
    DIRECTION_NE,
    DIRECTION_N,
    DIRECTION_NW,
    DIRECTION_W,
    DIRECTION_SW,
    DIRECTION_S,
    DIRECTION_SE
  ];

var DIRECTIONS_LOOKUP = {};
DIRECTIONS_LOOKUP[0] = "east";
DIRECTIONS_LOOKUP[1] = "northeast";
DIRECTIONS_LOOKUP[2] = "north";
DIRECTIONS_LOOKUP[3] = "northwest";
DIRECTIONS_LOOKUP[4] = "west";
DIRECTIONS_LOOKUP[5] = "southwest";
DIRECTIONS_LOOKUP[6] = "south";
DIRECTIONS_LOOKUP[7] = "southeast";

var STATE_HEALTHY = 0;
var STATE_INFECTED = 1;
var STATE_CONTAGIOUS = 2;
var STATE_IMMUNE = 3;
var STATE_DEAD = 4;

var infected_chosen = false;

var turn_count = 0;
var score = 0;
var vomit_score_multiplier = 1;
var vomit_on_turn = false;
var vomit_points = 5;
var sneeze_points = 3;
var spit_points = 2;
var cough_points = 1;

var unlimited_moves = false;

var campaign_mode = false;
var splash_panel_displayed = true;
var info_panel_displayed = true;
var game_over_screen_displayed = false;


POSSIBLE_DISEASE_NAMES = [
    "Prion Disease",
    "Transmissible Spongiform Encephalopathies",
    "African Trypanosomiasis",
    "Cryptococcal Meningitis",
    "Septicemic Plague",
    "Pneumonic Plague",
    "Rabies",
    "Viceral Leishmaniasis",
    "Fibrodysplasia Ossificans Progressiva",
    "Primary Amoebic Meningoencephalitis",
    "Septicemic Glanders",
    "Hemorrhagic Variola Major",
    "Granulomatous Amoebic Encephalitis",
    "Ebola: Zaire Variant",
    "Ebola: Sudan Variant",
    "Anthrax",
    "Invasive Pulmonary Aspergillosis",
    "Cryptococcal Meningitis",
    "Influenza A: H5N1",
    "Bubonic Plague",
    "Gastrointestinal Anthrax",
    "Tetanus",
    "Middle Eastern Respiratory Syndrome (MERS)",
    "Hantavirus",
    "Typhoidal Tularemia",
    "Eastern Equine Encephalitis Virus",
    "Ebola: Bundibugyo Variant",
    "Varicella",
    "Dengue Haemorrhagic Fever",
    "Leptospirosis",
    "Legionellosis",
    "Meningococcal Disease",
    "Typhoid Fever",
    "Severe Acute Respiratory Syndrome (SARS)",
    "Intestinal Capillariasis",
    "Botulism",
    "Diphtheria",
    "Pertussis",
    "Spanish Flu",
    "Venezuelan Equine Encephalitis",
    "Typhoid Fever",
    "Malaria",
    "Asian Flu",
    "Hong Kong Flu"
  ];

// This function loads in art assets before
// the setup begins. 
function preload() {
  img_title = loadImage("art/img_title@2x.png");
  img_state_default = loadImage("art/state_default@2x.png");
  img_state_infected = loadImage("art/state_infected@2x.png");
  img_state_infected_vomit = loadImage("art/state_infected_vomit@2x.png");
  img_state_contagious = loadImage("art/state_contagious@2x.png");
  img_state_contagious_vomit = loadImage("art/state_contagious_vomit@2x.png");
  img_state_dead = loadImage("art/state_dead@2x.png");
  img_state_immune = loadImage("art/state_immune@2x.png");
  img_cough = loadImage("art/cough@2x.png");
  img_sneeze = loadImage("art/sneeze@2x.png");
  img_spit = loadImage("art/spit@2x.png");
  img_vomit = loadImage("art/vomit@2x.png");
  img_blood = loadImage("art/blood@2x.png");
}

function setup() {
  //var canvas = createCanvas(600, 600);
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvasHolder");
  uiScaleFactor = windowHeight/600;
  uiHeight = Math.floor(uiScaleFactor * uiHeight);
  sectorDim = sectorDim*uiScaleFactor;
  print("uiHeight: " + uiHeight);

  background("#122B40");

  angleMode(RADIANS);
  drawUI();
}

function establishGame(gameType) {
  if (gameType == "random") {
    seed = Math.floor(Math.random() * 100000);
    print("random Seed: " + seed);
    randomSeed(seed);
    splash_panel_displayed = true;
  } else if (gameType == "new_campaign") {
    seed = originalSeed;
    print("new_campaign Seed: " + seed);
    randomSeed(seed);
  } else if (gameType == "replay") {
    print("replay Seed: " + seed);
    randomSeed(seed);
    splash_panel_displayed = false;
  } else if (gameType == "nextLevel") {
    // For continuing in campaign mode
    seed += 187;
    print("nextLevel Seed: " + seed);
    randomSeed(seed);
    splash_panel_displayed = false;
  }

  // Reinitialize some variables
    offsetX = 0;
    offsetY = 0;
    infected_chosen = false;
    turn_count = 0;
    score = 0;
    info_panel_displayed = true;
    game_over_screen_displayed = false;
    vomit_on_turn = false;
    vomit_score_multiplier = 1;

  // Generate the disease
  // disease = null;
  disease = new Disease();

  // Initialize the actionButton array.
  actionButtons = [];

  passButton = null;
  coughButton = null;
  sneezeButton = null;
  spitButton = null;
  vomitButton = null;

  // Create the UI Buttons.

  // 5 buttons, so determine the layout automatically
  var buttonSpace = width / 5.0;
  var buttonOffset = buttonSpace / 2.0;
  var buttonSize = Math.floor(50 * uiScaleFactor);
  print("buttonSize: " + buttonSize);

  passButton = new ActionButton(
    (buttonOffset + (0*buttonSpace)),
    height - uiHeight / 2,
    buttonSize,
    100,
    "Pass",
    triggerPass
  );
  coughButton = new ActionButton(
    (buttonOffset + (1*buttonSpace)),
    height - uiHeight / 2,
    buttonSize,
    "#0088CC",
    "Cough",
    triggerCough
  );
  sneezeButton = new ActionButton(
    (buttonOffset + (2*buttonSpace)),
    height - uiHeight / 2,
    buttonSize,
    "#56B770",
    "Sneeze",
    triggerSneeze
  );
  spitButton = new ActionButton(
    (buttonOffset + (3*buttonSpace)),
    height - uiHeight / 2,
    buttonSize,
    "#7C789D",
    "Spit",
    triggerSpit
  );
  vomitButton = new ActionButton(
    (buttonOffset + (4*buttonSpace)),
    height - uiHeight / 2,
    buttonSize,
    "#E51870",
    "Vomit",
    triggerVomit
  );



  chooseInfectedButton = new ActionButton(
    width/2,
    height - uiHeight / 2,
    buttonSize,
    "#A61600",
    "Select\nJimmy",
    triggerInfection,
    -8
  );

  // UI indication that a symptom is the most common
  // for the current disease
  if (!unlimited_moves){
    if (disease.unlimited_cough){
        coughButton.highlight = true;
    } else if (disease.unlimited_sneeze) {
        sneezeButton.highlight = true;
    } else if (disease.unlimited_spit) {
        spitButton.highlight = true;
    } else if (disease.unlimited_vomit) {
        vomitButton.highlight = true;
    }
  }

  actionButtons.push(passButton);
  actionButtons.push(coughButton);
  actionButtons.push(sneezeButton);
  actionButtons.push(spitButton);
  actionButtons.push(vomitButton);

  selected_sector_is_contagious = true;
  selectedSector = null;
  gameGrid = null;
  gameGrid = new GameGrid(sectorDim, sectorsWide, sectorsTall);
}

function draw() {
  // If we drag the map around, we need to know the
  // adjusted mouse position so that we can highlight
  // and select the proper sectors
  calculateAdjustedMousePosition();

  // background("#122B40"); // Dark blue
  background(220);

  if (splash_panel_displayed) {
    displaySplashPanel();
  } else if (info_panel_displayed) {
    disease.drawDiseaseInfoPanel();
  } else {
    gameGrid.draw();
    if (game_over_screen_displayed){
        drawGameOverUI();
    } else {
        drawUI();
    }
    
    if (!game_over_screen_displayed && gameGrid.gameIsOver()){
        game_over_screen_displayed = true;
    }
  }
}

function displaySplashPanel() {
  background(255);
  stroke(0);
  fill(255);
  strokeWeight(1);
  rect(0, 0, width - 1, height - 1);

  // Blood
  imageMode(CENTER);
  image(img_blood, width * 0.75, 0,img_blood.width*uiScaleFactor,img_blood.height*uiScaleFactor);

  // Jimmy
  imageMode(CORNER);
  image(
    img_title,
    width - img_title.width*0.4*uiScaleFactor,
    height - img_title.height*0.4*uiScaleFactor,
    img_title.width * 0.4*uiScaleFactor,
    img_title.height * 0.4*uiScaleFactor
  );
  textSize(36*uiScaleFactor);
  textAlign(RIGHT);
  noStroke();
  fill("#fff");
  text("Jimmy is sick", width - (20*uiScaleFactor), 50*uiScaleFactor);

  textSize(14*uiScaleFactor);
  textAlign(LEFT);
  noStroke();
  fill("#000");
  text("Jimmy is waiting at the DMV\nwhen he starts to feel sick.",20,height/1.8);

  fill(0);
  textSize(14*uiScaleFactor);
  // textAlign(LEFT);
  // text("Click to continue.", 10, height - 40);

  // TODO: Add buttons for "campaign" vs. random
  // Loss conditions? Infect at least n people
  // Score as people infected
  // Mark certain people as "must infect" and give
  // the player goals to try to get them.

  // Campaign
  fill(255);
  stroke(0);
  rect(20*uiScaleFactor,height*4/5,100*uiScaleFactor,40*uiScaleFactor);
  fill(0);
  noStroke();
  textAlign(CENTER);
  text("Play Campaign",(20 + 50)*uiScaleFactor,height*4/5 + (25*uiScaleFactor));

    // Random
  fill(255);
  stroke(0);
  rect(20*uiScaleFactor,height*4/5 + (60*uiScaleFactor),100*uiScaleFactor,40*uiScaleFactor);
  fill(0);
  noStroke();
  text("Play Random",(20 + 50)*uiScaleFactor,height*4/5 + (85*uiScaleFactor));

}

function drawGameOverUI() {
    noStroke();
    fill("#7B292C");
    rect(0,height*4/5,width,height*1/5);

    textAlign(LEFT);
    fill(255);
    textSize(13*uiScaleFactor);
    text("Game Over!\nTurns: " + turn_count + "\nScore: " + score,20,height*4/5 + 20);

    // Works for random or campaign
    rect(width*1/2,height*4/5 + (10*uiScaleFactor),100*uiScaleFactor,40*uiScaleFactor);
    fill(0);
    textAlign(CENTER);
    text("Replay Level",width*1/2 + (50*uiScaleFactor),height*4/5 + (35*uiScaleFactor));

    // Works for random or campaign
    fill(255);
    rect(width*1/2,height*4/5 + (70*uiScaleFactor),100*uiScaleFactor,40*uiScaleFactor);
    fill(0);
    textAlign(CENTER);
    text("New Game",width*1/2 + (50*uiScaleFactor),height*4/5 + (95*uiScaleFactor));

    // For campaign only
    if (campaign_mode){
      // Works for random or campaign
      fill(255);
      rect(width*1/2 + (110*uiScaleFactor),height*4/5 + (10*uiScaleFactor),80*uiScaleFactor,100*uiScaleFactor);
      fill(0);
      textAlign(CENTER);
      text("Next\nLevel!",width*1/2 + (150*uiScaleFactor),height*4/5 + (55*uiScaleFactor));
    }
}

function touchEnded() {
  print("mouse: " + mouseX + ", " + mouseY + " -- adjusted: " + adjustedMouseX + ", " + adjustedMouseY);
    // Ignore clicks out side of the play area.
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height){
      return false;
  }

  if (splash_panel_displayed){
    if (mouseX >= 20*uiScaleFactor && mouseX <= 120*uiScaleFactor &&
        mouseY >= height*4/5 && mouseY <= height*4/5 + 40*uiScaleFactor){
            print("Clicked Play Campaign Button");
            establishGame("new_campaign");
            splash_panel_displayed = false;
            campaign_mode = true;
            return false;
        }
    if (mouseX >= 20*uiScaleFactor && mouseX <= 120*uiScaleFactor &&
        mouseY >= height*4/5 + 60*uiScaleFactor && mouseY <= height*4/5 + 100*uiScaleFactor){
            print("Clicked Random Game Button");
            establishGame("random");
            splash_panel_displayed = false;
            campaign_mode = false;
            return false;
        }
    // Click misses but return anyhow.
    return false;
  }

  if (game_over_screen_displayed){

    // Replay button
    if (mouseX >= width*1/2 && mouseX <= width*1/2 + (100*uiScaleFactor) &&
        mouseY >= height*4/5 + (10*uiScaleFactor) && mouseY <= height*4/5 + (50*uiScaleFactor)){
            print("Clicked Replay Button");
            establishGame("replay");
            return false;
        }
    // New Game Button
    if (mouseX >= width*1/2 && mouseX <= width*1/2 + (100*uiScaleFactor) &&
        mouseY >= height*4/5 + (70*uiScaleFactor) && mouseY <= height*4/5 + (110*uiScaleFactor)){
            print("Clicked New Game Button");
            establishGame("random");
            return false;
        }

    // Next Level Button
    if (campaign_mode){
      if (mouseX >= width*1/2 + (110*uiScaleFactor) && mouseX <= width*1/2 + (190*uiScaleFactor) &&
          mouseY >= height*4/5 + (10*uiScaleFactor) && mouseY <= height*4/5 + (110*uiScaleFactor)){
              print("Clicked Next Level Button");
              establishGame("nextLevel");
              return false;
          }
    }
  }

  // Don't perform anything other than closing the
  // info panel if it is displayed
  if (info_panel_displayed) {
    info_panel_displayed = false;
    return false;
  }
  // If a UI button catches the mouse click, return.
  if (intersectsUI(mouseX, mouseY) && !game_over_screen_displayed) {
    if (infected_chosen) {
      if (selected_sector_is_contagious) {
          if (!unlimited_moves){
            if (!selectedSector.limit_symptoms){
                allActionButtonsCatchMouse();
                return false;
            } else {
                // TODO: Refactor into Action Button so that it checks conditions

                // Pass button doesn't have to check conditions.
                if (passButton.catchesClick(mouseX,mouseY)){
                    passButton.triggerAction();
                    return false;
                }

                if (disease.unlimited_cough){
                    if (coughButton.catchesClick(mouseX,mouseY)){
                        coughButton.triggerAction();
                        return false;
                    }
                }
                if (disease.unlimited_sneeze){
                    if (sneezeButton.catchesClick(mouseX,mouseY)){
                        sneezeButton.triggerAction();
                        return false;
                    }
                }
                if (disease.unlimited_spit){
                    if (spitButton.catchesClick(mouseX,mouseY)){
                        spitButton.triggerAction();
                        return false;
                    }
                }
                if (disease.unlimited_vomit){
                    if (vomitButton.catchesClick(mouseX,mouseY)){
                        vomitButton.triggerAction();
                        return false;
                    }
                }
            }
          } else {
            allActionButtonsCatchMouse();
            return false;
          }

      } else {
        if (passButton.catchesClick(mouseX, mouseY)) {
          passButton.triggerAction();
          return false;
        }
      }
    } else {
      if (chooseInfectedButton.catchesClick(mouseX, mouseY)) {
        chooseInfectedButton.triggerAction();
        selected_sector_is_contagious = true;
        return false;
      }
    }
  } else {
    // The UI didn't catch it so try to select a sector
    if (!mouseJustDragged) {
      sector_status = gameGrid.selectSector();
      print("Selected Sector Status: " + sector_status);
      if (sector_status == "contagious") {
        selected_sector_is_contagious = true;
        return false;
      } else {
        selected_sector_is_contagious = false;
        return false;
      }
    } else {
      mouseJustDragged = false;
      return false;
    }
  }
}

function allActionButtonsCatchMouse(){
    for (var i = 0; i < actionButtons.length; i++) {
        if (actionButtons[i].catchesClick(mouseX, mouseY)) {
            actionButtons[i].triggerAction();
            return;
        }
    }
}

function calculateAdjustedMousePosition() {
  adjustedMouseX = mouseX - offsetX;
  adjustedMouseY = mouseY - offsetY;
}

// TODO: Figure out why this causes double clicks on non-mobile devices.
// Extract selection logic to a function and call it specifically from here
// if the selection has not happened. If it has, then defer to mouseClicked()    
// function touchEnded() {
//     print("***** in touchEnded()");
//     print("***** calling mouseClicked() from touchEnded()")
//     //mouseClicked();
//     return false;
// }


function mouseDragged() {
  // Don't start drags on the UI.
  if (intersectsUI(mouseX, mouseY) || mouseX > width || mouseX < 0) {
    return;
  }
  offsetX = offsetX + (mouseX - pmouseX);
  offsetY = offsetY + (mouseY - pmouseY);
  mouseJustDragged = true;
  // print(offsetX + ", " + offsetY);
  return false;
}

function drawUI() {
  if (splash_panel_displayed || info_panel_displayed){
    return;
  }
  // Box around the canvas
  stroke(128);
  noFill();
  rect(0, 0, width - 1, height - 1);

  // UI bar at the bottom
  fill("#8C969F");
  noStroke();
  rect(1, height - uiHeight - 1, width - 2, uiHeight);

  // UI bar at the top for score and turn counters
  rect(1, 1, width - 2, 20*uiScaleFactor);
  textAlign(LEFT);
  noStroke();
  fill(0);
  text("Turn " + turn_count, 10, 15*uiScaleFactor);

  textAlign(RIGHT);
  text("Score " + score, width - 10, 15*uiScaleFactor);

  // Draw the action buttons
  if (infected_chosen) {
    if (!selected_sector_is_contagious) {
      passButton.draw();
    } else {

        if (!unlimited_moves){
            if (!selectedSector.limit_symptoms){
                drawAllSymptomButtoms();
            } else {
                passButton.draw();
                if (disease.unlimited_cough){
                    coughButton.draw();
                } else if (disease.unlimited_sneeze){
                    sneezeButton.draw();
                } else if (disease.unlimited_spit){
                    spitButton.draw();
                } else if (disease.unlimited_vomit){
                    vomitButton.draw();
                }
            }
        } else {
            drawAllSymptomButtoms();
        }

    //   for (var i = 0; i < actionButtons.length; i++) {
    //     actionButtons[i].draw();
    //   }
    }
  } else if (!infected_chosen) {
    // Player needs to choose the infected person
    chooseInfectedButton.draw();
  }
}

function drawAllSymptomButtoms(){
    for (var i = 0; i < actionButtons.length; i++) {
        actionButtons[i].draw();
    }
}

function intersectsUI() {
  // Return boolean if a mouseX and mouseY intersect with the UI
  if (mouseY > height - uiHeight - 1 || mouseY < (20*uiScaleFactor)) {
    return true;
  } else {
    return false;
  }
}

function triggerVomit() {
  if (selectedSector) {
    secStatus = selectedSector.getDiseaseStatus();
    if (secStatus == "contagious") {
      print("Vomiting");
      selectedSector.vomit();
      if (!unlimited_moves && !disease.unlimited_vomit) {
        selectedSector.limit_symptoms = true;
      }
      advanceTurn();
    } else {
      print("Selected person is not contagious.");
    }
  }
}

function triggerCough() {
  if (selectedSector) {
    secStatus = selectedSector.getDiseaseStatus();
    if (secStatus == "contagious") {
      print("Coughing");
      selectedSector.cough();
      if (!unlimited_moves && !disease.unlimited_cough) {
        selectedSector.limit_symptoms = true;
      }
      advanceTurn();
    } else {
      print("Selected person is not contagious.");
    }
  }
}

function triggerSneeze() {
  if (selectedSector) {
    secStatus = selectedSector.getDiseaseStatus();
    if (secStatus == "contagious") {
      print("Sneezing");
      selectedSector.sneeze();
      if (!unlimited_moves && !disease.unlimited_sneeze) {
        selectedSector.limit_symptoms = true;
      }
      advanceTurn();
    } else {
      print("Selected person is not contagious.");
    }
  }
}

function triggerSpit() {
  if (selectedSector) {
    secStatus = selectedSector.getDiseaseStatus();
    if (secStatus == "contagious") {
      print("Spitting");
      selectedSector.spit();
      if (!unlimited_moves && !disease.unlimited_spit) {
        selectedSector.limit_symptoms = true;
      }
      advanceTurn();
    } else {
      print("Selected person is not contagious.");
    }
  }
}

function triggerPass() {
  print("Passing Turn");
  advanceTurn();
}

function triggerInfection() {
  if (selectedSector) {
    print("Initial Infection");
    infected_chosen = true;
    secStatus = selectedSector.getDiseaseStatus();
    print("  secStatus: " + secStatus);
    while (secStatus != "contagious") {
      selectedSector.disease_status += 1;
      secStatus = selectedSector.getDiseaseStatus();
    }
    selectedSector.updateImageUsed();
  } else {
    print("Select a person to infect.");
  }
}

function advanceTurn() {
  turn_count += 1;
  vomit_on_turn = false;
  gameGrid.advanceTurn();

  if (selectedSector.getDiseaseStatus() == "contagious") {
    selected_sector_is_contagious = true;
  } else {
    selected_sector_is_contagious = false;
  }

  // Turn didn't register a vomit so reset the multiplier
  if (!vomit_on_turn) {
    vomit_score_multiplier = 1;
  }
}

//////////////////
// Stickers - coughs, vomit, etc.
//////////////////
function Sticker(sticker_image, x, y, sticker_rotation, sticker_scale, decay) {
  this.x = x;
  this.y = y;
  this.img = sticker_image;
  this.rotation = sticker_rotation;
  this.scale = sticker_scale*uiScaleFactor;

  // Not implemented
  // After how many turns should it disappear?
  this.decay = decay;

  this.draw = function() {
    push();
    translate(offsetX + this.x, offsetY + this.y);
    rotate(this.rotation);
    scale(this.scale);
    image(this.img, 0, 0);
    pop();
  };
}

//////////////////
// Game Grid Class
//////////////////
function GameGrid(sector_dimension, sectors_wide, sectors_tall) {
  this.sector_dimension = sector_dimension;
  this.sectors_wide = sectors_wide;
  this.sectors_tall = sectors_tall;
  this.sectors = [];
  this.stickers_under_people = [];

  for (var i = 0; i < this.sectors_tall; i++) {
    this.sectors.push([]);
    for (var j = 0; j < this.sectors_wide; j++) {
      s = new Sector(j, i, this.sector_dimension);
      this.sectors[i].push(s);
    }
  }

  this.gameIsOver = function(){
      if (!infected_chosen){
          return false;
      } else {
        for (var i = 0; i < this.sectors_tall; i++) {
            for (var j = 0; j < this.sectors_wide; j++) {
                s = this.sectors[i][j];
                // TODO HERE!!!
                secStatus = disease.disease_progression[s.disease_status];
                if (secStatus == "infected" || secStatus == "contagious"){
                    return false;
                }
            }
        }
      }
    return true;
  }

  this.validCoord = function(x, y) {
    if (x >= 0 && x < sectorsWide && y >= 0 && y < sectorsTall) {
      return true;
    } else {
      return false;
    }
  };

  this.sectorForCoords = function(x, y) {
    return this.sectors[y][x];
  };

  this.sectorsAdjacentToCoords = function(xcoord, ycoord) {
    sectors_to_return = [];

    // North
    x = xcoord;
    y = ycoord - 1;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // North West
    x = xcoord - 1;
    y = ycoord - 1;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // West
    x = xcoord - 1;
    y = ycoord;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // South West
    x = xcoord - 1;
    y = ycoord + 1;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // South
    x = xcoord;
    y = ycoord + 1;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // South East
    x = xcoord + 1;
    y = ycoord + 1;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // East
    x = xcoord + 1;
    y = ycoord;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    // North East
    x = xcoord + 1;
    y = ycoord - 1;
    if (this.validCoord(x, y)) {
      sectors_to_return.push(this.sectorForCoords(x, y));
    }

    return sectors_to_return;
  };

  this.advanceTurn = function() {
    // Tell sectors to advance turn
    for (var i = 0; i < this.sectors_tall; i++) {
      for (var j = 0; j < this.sectors_wide; j++) {
        s = this.sectors[i][j].advanceTurn();
      }
    }
  };

  this.highlightSector = function() {
    if (intersectsUI(mouseX, mouseY)) {
      return;
    }
    xpos = parseInt(adjustedMouseX / this.sector_dimension);
    ypos = parseInt(adjustedMouseY / this.sector_dimension);
    if (
      xpos < 0 ||
      xpos > this.sectors_wide - 1 ||
      ypos < 0 ||
      ypos > this.sectors_tall - 1
    ) {
      return;
    }
    this.sectors[ypos][xpos].isUnderMousePointer = true;
  };

  this.markSectorsNotHighlighted = function() {
    for (var i = 0; i < this.sectors_tall; i++) {
      for (var j = 0; j < this.sectors_wide; j++) {
        s = this.sectors[i][j].isUnderMousePointer = false;
      }
    }
  };

  this.markSectorsNotSelected = function() {
    for (var i = 0; i < this.sectors_tall; i++) {
      for (var j = 0; j < this.sectors_wide; j++) {
        s = this.sectors[i][j].isSelected = false;
      }
    }
  };

  this.selectSector = function() {
    // Don't select a sector if we're hovering over the UI.
    if (mouseY >= height - uiHeight) {
      return;
    }
    this.markSectorsNotSelected();
    xpos = parseInt(adjustedMouseX / this.sector_dimension);
    ypos = parseInt(adjustedMouseY / this.sector_dimension);

    if (
      xpos < 0 ||
      xpos > this.sectors_wide - 1 ||
      ypos < 0 ||
      ypos > this.sectors_tall - 1
    ) {
      return;
    }
    this.sectors[ypos][xpos].isSelected = true;
    selectedSector = this.sectors[ypos][xpos];

    return selectedSector.getDiseaseStatus();
  };

  this.drawGrid = function() {
    // Draw the floor
    for (var i = 0; i < this.sectors_tall; i++) {
      for (var j = 0; j < this.sectors_wide; j++) {
        this.sectors[i][j].drawFloor();
      }
    }
    // Draw the stickers
    for (var i = 0; i < this.stickers_under_people.length; i++) {
      this.stickers_under_people[i].draw();
    }
    // Draw the People
    for (var i = 0; i < this.sectors_tall; i++) {
      for (var j = 0; j < this.sectors_wide; j++) {
        this.sectors[i][j].drawPerson();
      }
    }
    // Draw the rotation indicators - Sector UI components
    for (var i = 0; i < this.sectors_tall; i++) {
      for (var j = 0; j < this.sectors_wide; j++) {
        this.sectors[i][j].drawRotationIndicator();
      }
    }
  };

  this.draw = function() {
    if (!mouseIsPressed) {
      this.markSectorsNotHighlighted();
      this.highlightSector();
    }
    this.drawGrid();
  };
}

function getRandomGameName(){
  var n = POSSIBLE_DISEASE_NAMES[Math.floor(random() * POSSIBLE_DISEASE_NAMES.length)];
  return n;
}

////////////////
// Disease Class
////////////////
function Disease() {
  
  this.disease_name = getRandomGameName();
  this.days_incubation = Math.floor(random() * 4) + 2; // 2-5
  this.days_contagious = Math.floor(random() * 4) + 3; // 3-7
  this.mortality_rate = (Math.floor(random() * 30) + 1) / 100; // was 0.15
  this.percent_pop_immune = (Math.floor(random() * 20) + 1) / 100;

  // Maps to mobility. The more severe,
  // the less somebody can move.
  // The more severe, the fewer people
  // on the board who spin.
  // Another name: this.rotation_rate
  this.severity = (Math.floor(random() * 40) + 30) / 100; // was 0.6
  this.exanguination_upon_death = true;

  // How max of how many turns until a rotation occurs
  this.turns_until_rotate = Math.floor(random() * 4) + 2; // was 3

  // Generate values procedurally
  // Global means there's a certain count
  // available to the entire game.
  // When it's not global, then that count
  // is available to each person
  this.global_vomit = true;
  this.vomit_count = 3;

  this.global_cough = false;
  this.cough_count = 2;

  this.global_sneeze = false;
  this.sneeze_count = 1;

  this.global_spit = false;
  this.spit_count = 1;

  // For each disease, one symptom is unlimited
  this.unlimited_cough = false;
  this.unlimited_sneeze = false;
  this.unlimited_spit = false;
  this.unlimited_vomit = false;

  unlimited_number = Math.floor(random() * 4);

  switch (unlimited_number) {
    case 0:
      this.unlimited_cough = true;
      break;
    case 1:
      this.unlimited_sneeze = true;
      break;
    case 2:
      this.unlimited_spit = true;
      break;
    case 3:
      this.unlimited_vomit = true;
      break;
  }

  // TODO: Settting for how long immunity lasts?

  // Store disease progression in an array that we can walk
  // for each person
  this.disease_progression = ["healthy"];
  for (var i = 0; i < this.days_incubation; i++) {
    this.disease_progression.push("infected");
  }
  for (var i = 0; i < this.days_contagious; i++) {
    this.disease_progression.push("contagious");
  }
  this.disease_progression.push("immune_or_dead");

  this.drawDiseaseInfoPanel = function() {
    fill(255);
    noStroke();
    rect(1, 1, width - 2, height - 2);
    fill("#8CDDFF");
    rect(1, 1, width - 2, height / 3 - 1);
    textAlign(LEFT);

    // Header
    fill(0);
    textSize(36*uiScaleFactor);
    text("CDC Report", 10*uiScaleFactor, 50*uiScaleFactor);

    textSize(18*uiScaleFactor);
    text(this.disease_name, 10*uiScaleFactor, 80*uiScaleFactor);

    // Incubation
    // TODO: Fix the issue where the incubation period and contagious period
    // don't seem to align with the reality of what the player experiences.
    // This might mean adding an indicator for disease status for the player.
    base_height = 40;
    textSize(12*uiScaleFactor);
    text(
      "Incubation period: " + (this.days_incubation - 1),
      10*uiScaleFactor,
      (60 + base_height)*uiScaleFactor
    );
    text("Contagious period: " + this.days_contagious, 10*uiScaleFactor, (75 + base_height)*uiScaleFactor);
    text(
      "Mortality Rate: " + parseInt(this.mortality_rate * 100) + "%",
      10*uiScaleFactor,
      (90 + base_height)*uiScaleFactor
    );
    text(
      "Deaths exsanguinate: " + this.exanguination_upon_death,
      10*uiScaleFactor,
      (105 + base_height)*uiScaleFactor
    );
    text(
      "% of population immune: " +
        parseInt(this.percent_pop_immune * 100) +
        "%",
      10*uiScaleFactor,
      (120 + base_height)*uiScaleFactor
    );
    text(
      "Severity of symptoms: " + parseInt(this.severity * 100) + "/100",
      10*uiScaleFactor,
      (135 + base_height)*uiScaleFactor
    );

    if (this.unlimited_cough) {
      text("Most common symptom: coughing", 10*uiScaleFactor, (150 + base_height)*uiScaleFactor);
    } else if (this.unlimited_sneeze) {
      text("Most common symptom: sneezing", 10*uiScaleFactor, (150 + base_height)*uiScaleFactor);
    } else if (this.unlimited_spit) {
      text("Most common symptom: phlegm", 10*uiScaleFactor, (150 + base_height)*uiScaleFactor);
    } else if (this.unlimited_vomit) {
      text("Most common symptom: nausea", 10*uiScaleFactor, (150 + base_height)*uiScaleFactor);
    }

    noFill();
    stroke(0);
    line(0, height / 3, width, height / 3);
    noStroke();
    fill(0);
    textSize(11*uiScaleFactor);

    textAlign(RIGHT);
    text(
      "Drag the mouse to see\nthe entire game board!",
      width - 5,
      height / 2.8
    );
    textAlign(LEFT);
    text(
      "Jimmy is sick!\n" +
        "Help him spread the disease at the DMV!\n\n" +
        "Your tasks are as follows:\n" +
        "1. Point out who Jimmy is by clicking on a person and clicking select.\n" +
        "2. Use the symptom buttons at the bottom to spread the disease. Select\n" +
        "   any person on the board by clicking on them. When you select a person\n" +
        "   that is contagious, the symptom buttons will appear at the bottom.\n" +
        "3. Try to infect as many people as you can as quickly as possible.\n\n" +
        "About the symptoms:\n" +
        "The TARGET is the person that the selected contagious person is facing.\n" +
        " - Cough infects the target.\n" +
        " - Sneeze infects the target AND healthy people adjacent to the target.\n" +
        " - Spit infects the person beyond the target.\n" +
        " - Vomit infects the target and primes them to vomit on the first turn\n" +
        "   they are contagious. Use this to create chain vomit reactions!\n\n" +
        "Depending on the disease, some symptoms are more prevalent than others.",
      10*uiScaleFactor,
      height / 2.8
    );

    textAlign(CENTER);
    fill(0);

    // Show people and explanatory text
    imageMode(CORNER);
    key_width = img_state_default.width * 0.3*uiScaleFactor;
    key_height = img_state_default.height * 0.3*uiScaleFactor;
    key_ypos = height / 1.25;
    key_text_ypos = height / 1.1;

    key_offset = 20*uiScaleFactor;

    image(img_state_default, key_offset, key_ypos, key_width, key_height);
    text("healthy", key_offset + key_width / 2, key_text_ypos);

    image(
      img_state_infected,
      key_offset + 1 * key_width,
      key_ypos,
      key_width,
      key_height
    );
    text("infected", key_offset + key_width * 3 / 2, key_text_ypos);

    image(
      img_state_infected_vomit,
      key_offset + 2 * key_width,
      key_ypos,
      key_width,
      key_height
    );
    text("infected\nwill vomit", key_offset + key_width * 5 / 2, key_text_ypos);

    image(
      img_state_contagious,
      key_offset + 3 * key_width,
      key_ypos,
      key_width,
      key_height
    );
    text("contagious", key_offset + key_width * 7 / 2, key_text_ypos);

    image(
      img_state_contagious_vomit,
      key_offset + 4 * key_width,
      key_ypos,
      key_width,
      key_height
    );
    text(
      "contagious\nwill vomit",
      key_offset + key_width * 9 / 2,
      key_text_ypos
    );

    image(
      img_state_immune,
      key_offset + 5 * key_width,
      key_ypos,
      key_width,
      key_height
    );
    text("immune", key_offset + key_width * 11 / 2, key_text_ypos);

    textSize(14*uiScaleFactor);
    text("Click to continue...", width / 2, height - 15);
  };
}

///////////////
// Sector class
// This will handle most of the logic associated with
// various people infecting others, etc.
function Sector(xcoord, ycoord, dimension) {
  this.isSelected = false;
  this.isUnderMousePointer = false;
  this.dimension = dimension;
  this.xcoord = xcoord;
  this.ycoord = ycoord;
  this.x = this.xcoord * this.dimension;
  this.y = this.ycoord * this.dimension;
  this.centerX = this.x + this.dimension / 2;
  this.centerY = this.y + this.dimension / 2;
  this.img = img_state_default;
  this.facing = Math.floor(random() * DIRECTIONS.length);
  this.limit_symptoms = false;

  // Use the current disease to set some parameters for
  // this sector
  this.immune = false;
  this.disease_status = 0; // Everybody starts healthy. Player picks first infected.
  this.remaining_coughs = 0;
  this.remaining_sneezes = 0;
  this.remaining_spits = 0;
  this.remaining_vomits = 0;
  this.rotates = false;
  this.segments_to_rotate = random();
  if (this.segments_to_rotate > 0.5) {
    this.segments_to_rotate = 1;
  } else {
    this.segments_to_rotate = -1;
  }
  this.rotation_turn_counter = 0;
  this.rotation_on_turn =
    Math.floor(random() * disease.turns_until_rotate) + 1;
  this.dies_from_disease = false;
  this.rotation_indicator =
    (this.rotation_turn_counter + 1) / this.rotation_on_turn;
  this.coveredWithBarf = false;

  // TODO: Use this.coveredWithBarf to trigger vomiting the next turn

  if (random() < disease.percent_pop_immune) {
    this.immune = true;
    this.img = img_state_immune;
    this.disease_status = disease.disease_progression.length - 1;
  } else {
    // This sector is not immune
    if (!disease.global_cough) {
      this.remaining_coughs = disease.cough_count;
    }
    if (!disease.global_sneeze) {
      this.remaining_sneezes = disease.sneeze_count;
    }
    if (!disease.global_spit) {
      this.remaining_spits = disease.spit_count;
    }
    if (!disease.global_vomit) {
      this.remaining_vomits = disease.vomit_count;
    }
    if (random() > disease.severity) {
      this.rotates = true;
    } else {
      // Don't show a bar for rotation
      this.rotation_indicator = 0;
    }
    if (random() < disease.mortality_rate) {
      this.dies_from_disease = true;
    }
  }

  this.infect = function(barfInvolved) {
    current_status = this.getDiseaseStatus();
    if (this.immune || current_status == "immune_or_dead") {
      print("Target is immune or dead.");
      return;
    }

    if (barfInvolved) {
      print("Target status: " + current_status);
      // Infect and change to barf graphic
      this.coveredWithBarf = true;
      score += vomit_points * vomit_score_multiplier;
      if (current_status == "healthy") {
        print("Target was healthy.");
        this.disease_status += 1;
      } else {
        print("Target already infected. Vomiting staged.");
      }
    } else {
      if (current_status == "healthy") {
        print("Target infected. No barf involved.");
        this.disease_status += 1;
      } else {
        print("Target already infected.");
      }
    }
    // Apply new image, if needed
    this.updateImageUsed();
  };

  this.infectWithVomit = function() {
    vomit_on_turn = true;
    vomit_score_multiplier += 1;
    this.infect(true);
  };

  this.coordinatesToAttack = function(attackDirection) {
    // Returns the first sector in the attack direction
    // If an attack affects more than one sector, the method
    // handling the attack should expand the target list
    // Returns [xcoord,ycoord]
    if (attackDirection == "east") {
      return [this.xcoord + 1, this.ycoord];
    } else if (attackDirection == "northeast") {
      return [this.xcoord + 1, this.ycoord - 1];
    } else if (attackDirection == "north") {
      return [this.xcoord, this.ycoord - 1];
    } else if (attackDirection == "northwest") {
      return [this.xcoord - 1, this.ycoord - 1];
    } else if (attackDirection == "west") {
      return [this.xcoord - 1, this.ycoord];
    } else if (attackDirection == "southwest") {
      return [this.xcoord - 1, this.ycoord + 1];
    } else if (attackDirection == "south") {
      return [this.xcoord, this.ycoord + 1];
    } else if (attackDirection == "southeast") {
      return [this.xcoord + 1, this.ycoord + 1];
    }
  };

  this.getStickerOffsetForDirection = function(dir) {
    stickerXOffset = 0;
    stickerYOffset = 0;
    dim = this.dimension;

    if (dir == "east") {
      stickerYOffset = dim / 2;
      stickerXOffset = dim;
    } else if (dir == "northeast") {
      stickerYOffset = 0;
      stickerXOffset = dim;
    } else if (dir == "north") {
      stickerYOffset = 0;
      stickerXOffset = dim / 2;
    } else if (dir == "northwest") {
      stickerYOffset = 0;
      stickerXOffset = 0;
    } else if (dir == "west") {
      stickerYOffset = dim / 2;
      stickerXOffset = 0;
    } else if (dir == "southwest") {
      stickerYOffset = dim;
      stickerXOffset = 0;
    } else if (dir == "south") {
      stickerYOffset = dim;
      stickerXOffset = dim / 2;
    } else if (dir == "southeast") {
      stickerYOffset = dim;
      stickerXOffset = dim;
    }

    return [stickerXOffset, stickerYOffset];
  };

  this.cough = function() {
    if (!unlimited_moves && !disease.unlimited_cough && this.limit_symptoms) {
      print("Sector.cough: This person already used a limited move!");
      return;
    }
    current_direction = DIRECTIONS_LOOKUP[this.facing];
    target = this.coordinatesToAttack(current_direction);
    targetX = target[0];
    targetY = target[1];

    print("Cough target: " + target);

    // Change to use the gameGrid.validCoord method
    if (
      targetX >= 0 &&
      targetX <= sectorsWide - 1 &&
      targetY >= 0 &&
      targetY <= sectorsTall - 1
    ) {
      // There is a sector. Get it from the gamegrid
      print("Target is valid");
      targetSector = gameGrid.sectorForCoords(targetX, targetY);
      score += cough_points;
      targetSector.infect();
    }

    // Place the graphic
    current_direction = DIRECTIONS_LOOKUP[this.facing];
    offsets = this.getStickerOffsetForDirection(current_direction);
    oX = offsets[0];
    oY = offsets[1];

    s = new Sticker(
      img_cough,
      this.x + oX,
      this.y + oY,
      DIRECTIONS[this.facing],
      0.5,
      1
    );
    gameGrid.stickers_under_people.push(s);
  };

  this.sneeze = function() {
    if (!unlimited_moves && !disease.unlimited_sneeze && this.limit_symptoms) {
      print("Sector.sneeze: This person already used a limited move!");
      return;
    }
    current_direction = DIRECTIONS_LOOKUP[this.facing];
    primary_target = this.coordinatesToAttack(current_direction);
    if (gameGrid.validCoord(primary_target[0], primary_target[1])) {
      print("Sneeze target: " + primary_target);
      targetSector = gameGrid.sectorForCoords(
        primary_target[0],
        primary_target[1]
      );
      score += Math.floor(sneeze_points / 3.0);
      targetSector.infect();
    }

    other_target_directions = [];
    if (current_direction == "north") {
      other_target_directions.push("northwest");
      other_target_directions.push("northeast");
    } else if (current_direction == "northwest") {
      other_target_directions.push("west");
      other_target_directions.push("north");
    } else if (current_direction == "west") {
      other_target_directions.push("southwest");
      other_target_directions.push("northwest");
    } else if (current_direction == "southwest") {
      other_target_directions.push("south");
      other_target_directions.push("west");
    } else if (current_direction == "south") {
      other_target_directions.push("southwest");
      other_target_directions.push("southeast");
    } else if (current_direction == "southeast") {
      other_target_directions.push("south");
      other_target_directions.push("east");
    } else if (current_direction == "east") {
      other_target_directions.push("southeast");
      other_target_directions.push("northeast");
    } else if (current_direction == "northeast") {
      other_target_directions.push("east");
      other_target_directions.push("north");
    }

    for (var i = 0; i < other_target_directions.length; i++) {
      thistarget = this.coordinatesToAttack(other_target_directions[i]);
      if (gameGrid.validCoord(thistarget[0], thistarget[1])) {
        print("Sneeze target: " + thistarget);
        targetSector = gameGrid.sectorForCoords(thistarget[0], thistarget[1]);
        score += Math.floor(sneeze_points / 3.0);
        targetSector.infect();
      }
    }

    // Place the sticker - might need to be repositioned a bit
    offsets = this.getStickerOffsetForDirection(current_direction);
    oX = offsets[0];
    oY = offsets[1];

    s = new Sticker(
      img_sneeze,
      this.x + oX,
      this.y + oY,
      DIRECTIONS[this.facing],
      0.55,
      1
    );
    gameGrid.stickers_under_people.push(s);
  };

  this.spit = function() {
    if (!unlimited_moves && !disease.unlimited_spit && this.limit_symptoms) {
      print("Sector.spit: This person already used a limited move!");
      return;
    }
    current_direction = DIRECTIONS_LOOKUP[this.facing];
    skip_sector_coords = this.coordinatesToAttack(current_direction);

    if (gameGrid.validCoord(skip_sector_coords[0], skip_sector_coords[1])) {
      skip_sector = gameGrid.sectorForCoords(
        skip_sector_coords[0],
        skip_sector_coords[1]
      );
      target_sector_coords = skip_sector.coordinatesToAttack(current_direction);
      if (
        gameGrid.validCoord(target_sector_coords[0], target_sector_coords[1])
      ) {
        target_sector = gameGrid.sectorForCoords(
          target_sector_coords[0],
          target_sector_coords[1]
        );
        score += spit_points;
        target_sector.infect();
      }
    }

    spitX = this.centerX;
    spitY = this.centerY;

    if (current_direction == "north") {
      spitY -= this.dimension * 2;
    } else if (current_direction == "northwest") {
      spitX -= this.dimension * 2;
      spitY -= this.dimension * 2;
    } else if (current_direction == "west") {
      spitX -= this.dimension * 2;
    } else if (current_direction == "southwest") {
      spitX -= this.dimension * 2;
      spitY += this.dimension * 2;
    } else if (current_direction == "south") {
      spitY += this.dimension * 2;
    } else if (current_direction == "southeast") {
      spitX += this.dimension * 2;
      spitY += this.dimension * 2;
    } else if (current_direction == "east") {
      spitX += this.dimension * 2;
    } else if (current_direction == "northeast") {
      spitX += this.dimension * 2;
      spitY -= this.dimension * 2;
    }

    s = new Sticker(img_spit, spitX, spitY, DIRECTIONS[this.facing], 1.8, 1);
    gameGrid.stickers_under_people.push(s);
  };

  this.vomit = function() {
    if (!unlimited_moves && !disease.unlimited_vomit && this.limit_symptoms) {
      print("Sector.vomit: This person already used a limited move!");
      return;
    }
    // TODO: Register graphic with the gamegrid
    current_direction = DIRECTIONS_LOOKUP[this.facing];
    target = this.coordinatesToAttack(current_direction);
    targetX = target[0];
    targetY = target[1];

    print("Vomit target: " + target);

    if (
      targetX >= 0 &&
      targetX <= sectorsWide - 1 &&
      targetY >= 0 &&
      targetY <= sectorsTall - 1
    ) {
      // There is a sector. Get it from the gamegrid
      print("Target is valid");
      targetSector = gameGrid.sectorForCoords(targetX, targetY);
      targetSector.infectWithVomit();
    }

    // Place the graphic
    current_direction = DIRECTIONS_LOOKUP[this.facing];
    offsets = this.getStickerOffsetForDirection(current_direction);
    oX = offsets[0];
    oY = offsets[1];

    s = new Sticker(
      img_vomit,
      this.x + oX,
      this.y + oY,
      DIRECTIONS[this.facing],
      0.5,
      1
    );
    gameGrid.stickers_under_people.push(s);
  };

  this.getDiseaseStatus = function() {
    return (current_status = disease.disease_progression[this.disease_status]);
  };

  this.advanceTurn = function() {
    this.advanceDisease();
    this.rotatePerson();
  };

  this.advanceDisease = function() {
    current_status = disease.disease_progression[this.disease_status];
    if (current_status != "healthy" && current_status != "immune_or_dead") {

      // TODO: Remove player's ability to cause barf covered person to perform another action?
      // until after the barf is complete. Or does the barf consume all actions?

      this.disease_status += 1;
      current_status = disease.disease_progression[this.disease_status];
      if (this.coveredWithBarf && current_status == "contagious") {
        this.vomit();
        this.coveredWithBarf = false;
      }
      this.updateImageUsed();
    }
  };

  this.updateImageUsed = function() {
    // Update the image
    current_status = disease.disease_progression[this.disease_status];
    if (current_status == "infected") {
      if (this.coveredWithBarf) {
        this.img = img_state_infected_vomit;
      } else {
        this.img = img_state_infected;
      }
    } else if (current_status == "contagious") {
      if (this.coveredWithBarf) {
        this.img = img_state_contagious_vomit;
      } else {
        this.img = img_state_contagious;
      }
    } else if (current_status == "immune_or_dead") {
      if (this.dies_from_disease) {
        this.img = img_state_dead;
        if (disease.exanguination_upon_death) {
          this.exsanguinate();
        }
      } else {
        this.img = img_state_immune;
      }
      // Stop rotating when dead or immune
      this.rotates = false;
    }
  };




  this.exsanguinate = function() {
    // Add death sticker
    s = new Sticker(
      img_blood,
      this.x + this.dimension / 2,
      this.y + this.dimension / 2,
      DIRECTIONS[this.facing],
      0.4,
      1
    );
    gameGrid.stickers_under_people.push(s);

    // Infect Neighbors
    neighbor_sectors = gameGrid.sectorsAdjacentToCoords(
      this.xcoord,
      this.ycoord
    );
    for (var i = 0; i < neighbor_sectors.length; i++) {
      neighbor_sectors[i].infect();
    }
  };




  // Update for rotating the other direction
  this.rotatePerson = function() {
    if (this.rotates) {
      this.rotation_turn_counter += 1;
      if (this.rotation_turn_counter == this.rotation_on_turn) {
        this.rotation_turn_counter = 0;
        this.facing += this.segments_to_rotate;
        if (this.segments_to_rotate < 0) {
          if (this.facing < 0) {
            this.facing = DIRECTIONS.length + this.facing;
          }
        } else {
          if (this.facing >= DIRECTIONS.length) {
            this.facing = this.facing - DIRECTIONS.length;
          }
        }
      }
      // Set the turn indicator
      this.rotation_indicator =
        (this.rotation_turn_counter + 1) / this.rotation_on_turn;
    }
  };





  this.drawFloor = function() {
    // Draw the actual grid
    strokeWeight(1);
    stroke(220);
    noStroke();
    fill(255);
    push();
    translate(offsetX, offsetY);
    rect(this.x, this.y, this.dimension, this.dimension);
    pop();
    noFill();

    if (this.isSelected) {
      noStroke();
      fill(180); // fill("#5C727C");
      push();
      translate(offsetX, offsetY);
      rect(this.x, this.y, this.dimension, this.dimension);
      pop();
    }
    if (this.isUnderMousePointer && mouseY < height - uiHeight) {
      noStroke();
      fill(220); // fill("#334B5B");
      push();
      translate(offsetX, offsetY);
      rect(this.x, this.y, this.dimension, this.dimension);
      pop();
    }
  };






  this.drawPerson = function() {
    // Draw the person
    picScale = 2.2;
    imageMode(CENTER);
    push();
    translate(offsetX + this.centerX, offsetY + this.centerY);
    rotate(DIRECTIONS[this.facing]);
    image(this.img, 0, 0, this.img.width*uiScaleFactor / 2.2, this.img.height*uiScaleFactor / 2.2);
    pop();
  };

  this.draw = function() {
    this.drawFloor();
    this.drawPerson();
    this.drawRotationIndicator();
  };

  this.drawRotationIndicator = function() {
    // Draw the rotation turn indicator

    if (this.rotates) {
      push();
      translate(offsetX, offsetY);
      stroke(0);
      strokeWeight(1*uiScaleFactor);
      noFill();
      // if (this.rotation_indicator == 1){
      //     stroke("#5BE65D");
      // }

      var shortenAngleBy = 25;
      var arcSize = 15*uiScaleFactor;

      if (this.segments_to_rotate < 0) {
        arrowAngle =
          Math.PI * 2 * this.rotation_indicator - radians(shortenAngleBy);

        arrowTailAngle =
          Math.PI * 2 * this.rotation_indicator - radians(shortenAngleBy * 2);

        

        arc(
          this.x + 10,
          this.y + this.dimension - 10,
          arcSize,
          arcSize,
          0,
          arrowAngle,
          true
        );

        arrowX = this.x + 10 + arcSize / 2.0 * Math.cos(arrowAngle);
        arrowY = this.y + this.dimension - 10 + arcSize / 2.0 * Math.sin(arrowAngle);

        arrowTail1X = this.x + 10 + (9*uiScaleFactor) * Math.cos(arrowTailAngle);
        arrowTail1Y =
          this.y + this.dimension - 10 + (9*uiScaleFactor) * Math.sin(arrowTailAngle);

        line(arrowX, arrowY, arrowTail1X, arrowTail1Y);

        arrowTail2X = this.x + 10 + (6*uiScaleFactor) * Math.cos(arrowTailAngle);
        arrowTail2Y =
          this.y + this.dimension - 10 + (6*uiScaleFactor) * Math.sin(arrowTailAngle);

        line(arrowX, arrowY, arrowTail2X, arrowTail2Y);
      } else {
        arrowAngle =
          -1 * Math.PI * 2 * this.rotation_indicator - radians(shortenAngleBy);

        arrowTailAngle =
          -1 * Math.PI * 2 * this.rotation_indicator +
          radians(shortenAngleBy / 2);

        arc(
          this.x + 10,
          this.y + this.dimension - 10,
          arcSize,
          arcSize,
          -1 * Math.PI * 2 * this.rotation_indicator,
          -radians(shortenAngleBy + 20),
          true
        );

        arrowX = this.x + 10 + (arcSize) / 2.0 * Math.cos(arrowAngle);
        arrowY = this.y + this.dimension - 10 + arcSize / 2.0 * Math.sin(arrowAngle);

        //ellipse(arrowX,arrowY,4,4);
        arrowTail1X = this.x + 10 + (9*uiScaleFactor) * Math.cos(arrowTailAngle);
        arrowTail1Y =
          this.y + this.dimension - 10 + (9*uiScaleFactor) * Math.sin(arrowTailAngle);
        line(arrowX, arrowY, arrowTail1X, arrowTail1Y);

        arrowTail2X = this.x + 10 + (6*uiScaleFactor) * Math.cos(arrowTailAngle);
        arrowTail2Y =
          this.y + this.dimension - 10 + (6*uiScaleFactor) * Math.sin(arrowTailAngle);
        line(arrowX, arrowY, arrowTail2X, arrowTail2Y);
      }
      // Text shows how frequently the person turns
      noStroke();
      fill(0);
      textAlign(CENTER);
      textSize(11*uiScaleFactor);
      text(this.rotation_on_turn, this.x + 10, this.y + this.dimension - (5.5));
      pop();
    }
  };
}

//////////////////
// UI Button Class
//////////////////
function ActionButton(x, y, dim, color, label, actionCallback, textYOffset) {
  if (textYOffset) {
    this.textYOffset = textYOffset;
  } else {
    this.textYOffset = 0;
  }
  this.x = x;
  this.y = y;
  this.dim = dim;
  this.color = color;
  this.callback = actionCallback;
  this.label = label;
  this.highlight = false;

  this.triggerAction = function() {
    this.callback();
  };

  this.test = function() {
    print(this.label);
  };

  this.catchesClick = function(mouse_x, mouse_y) {
    if (
      mouse_x >= this.x - dim / 2 &&
      mouse_x <= this.x + dim / 2 &&
      mouse_y >= this.y - dim / 2 &&
      mouse_y <= this.y + dim / 2
    ) {
      return true;
    } else {
      return false;
    }
  };

  this.draw = function() {
      noStroke();
    if (selectedSector) {
      fill(this.color);
    } else {
      fill(128);
    }

    if (this.highlight){
        stroke("#FFF");
        strokeWeight(3);
    } else {
        noStroke();
        strokeWeight(1);
    }
    ellipseMode(CENTER);
    ellipse(this.x, this.y, this.dim, this.dim);
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(Math.floor(uiScaleFactor*13));
    text(this.label, this.x, this.y + 5 + this.textYOffset);
  };
}
