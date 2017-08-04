var offsetX = 0;
var offsetY = 0;

var adjustedMouseX = 0;
var adjustedMouseY = 0;
var mouseJustDragged = false;

var gameGridWidth = 100;
var gameGridHeight = 100;

var sectorsWide = 4;
var sectorsTall = 5;

var sectors = [];
var uiHeight = 76;

var actionButtons = [];
var vomitButton, coughButton, sneezeButton, spitButton, passButton;

var gameGrid;
var selectedSector = null;
var disease;

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

var DIRECTIONS = [];
var DIRECTION_N  = Math.PI * 2;
var DIRECTION_NW = (Math.PI * 2) - Math.PI/4;
var DIRECTION_W  = (Math.PI * 2) - Math.PI/2;
var DIRECTION_SW = (Math.PI * 2) - Math.PI/2 - Math.PI/4;
var DIRECTION_S  = Math.PI;
var DIRECTION_SE = Math.PI - Math.PI/4;
var DIRECTION_E  = Math.PI/2;
var DIRECTION_NE = Math.PI/4;

var STATE_HEALTHY    = 0;
var STATE_INFECTED   = 1;
var STATE_CONTAGIOUS = 2;
var STATE_IMMUNE     = 3;
var STATE_DEAD       = 4;

function preload(){
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

    DIRECTIONS = [
        DIRECTION_E,
        DIRECTION_NE,
        DIRECTION_N, 
        DIRECTION_NW,
        DIRECTION_W, 
        DIRECTION_SW,
        DIRECTION_S, 
        DIRECTION_SE 
    ]
}

function setup() {
    var canvas = createCanvas(400,600);
    canvas.parent('canvasHolder');
    background("#122B40");

    // Generate the disease
    disease = new Disease(123);

    // Create the UI Buttons.
    passButton = new ActionButton(50,height-uiHeight/2,50,100,"Pass",triggerPass);
    coughButton = new ActionButton(125,height-uiHeight/2,50,"#0088CC","Cough",triggerCough);
    sneezeButton = new ActionButton(200,height-uiHeight/2,50,"#56B770","Sneeze",triggerSneeze);
    spitButton = new ActionButton(275,height-uiHeight/2,50,"#7C789D","Spit",triggerSpit);
    vomitButton = new ActionButton(350,height-uiHeight/2,50,"#E51870","Vomit",triggerVomit);
    

    actionButtons.push(passButton);
    actionButtons.push(coughButton);
    actionButtons.push(sneezeButton);
    actionButtons.push(spitButton);
    actionButtons.push(vomitButton);

    gameGrid = new GameGrid(100,sectorsWide,sectorsTall);
    angleMode(RADIANS);
    drawUI();
}

function draw() {
  // If we drag the map around, we need to know the 
  // adjusted mouse position so that we can highlight
  // and select the proper sectors
  calculateAdjustedMousePosition();

  // background("#122B40"); // Dark blue
  background(220);
  
  gameGrid.draw();

  drawUI();
}

function mouseClicked(){
  // If a UI button catches the mouse click, return.
  for (var i = 0; i < actionButtons.length; i++){
      // Don't use adjustedMouseX because the UI doesn't move
      // in the same frame as the game field.
        if (actionButtons[i].catchesClick(mouseX,mouseY)){
            actionButtons[i].triggerAction();
            return;
        }
  }

  // The UI didn't catch it so try to select a sector
  if (!mouseJustDragged) {
        gameGrid.selectSector();
  } else {
      mouseJustDragged = false;
  }

}

function calculateAdjustedMousePosition(){
    adjustedMouseX = mouseX - offsetX;
    adjustedMouseY = mouseY - offsetY;
}

function mouseDragged(){
    offsetX = offsetX + (mouseX - pmouseX);
    offsetY = offsetY + (mouseY - pmouseY);
    mouseJustDragged = true;
    return false;
}

function drawUI(){
    // Box around the canvas
    stroke(128);
    noFill();
    rect(0,0,width-1,height-1);

    // UI bar at the bottom
    fill("#8C969F");
    noStroke();
    rect(1, height - uiHeight - 1, width-2, uiHeight);

    // Draw the action buttons
    for(var i = 0; i < actionButtons.length; i++){
        actionButtons[i].draw();
    }
}

function triggerVomit(){
    print("Vomiting");
    advanceTurn();
}

function triggerCough(){
    print("Coughing");
    advanceTurn();
}

function triggerSneeze(){
    print("Sneezing");
    advanceTurn();
}

function triggerSpit(){
    print("Spitting");
    advanceTurn();
}

function triggerPass(){
    print("Passing Turn");
    advanceTurn();
}

function advanceTurn(){
    gameGrid.advanceTurn();
}


//////////////////
// Game Grid Class
//////////////////
function GameGrid(sector_dimension,sectors_wide,sectors_tall){
    this.sector_dimension = sector_dimension;
    this.sectors_wide = sectors_wide;
    this.sectors_tall = sectors_tall;
    this.sectors = [];

    for (var i = 0; i < this.sectors_tall; i++) {
        this.sectors.push([])
        for (var j = 0; j < this.sectors_wide; j++){
            s = new Sector(j,i,this.sector_dimension);
            this.sectors[i].push(s);
        }
    }

    this.advanceTurn = function(){
        // Tell sectors to advance turn
        for (var i = 0; i < this.sectors_tall; i++) {
            for (var j = 0; j < this.sectors_wide; j++){
                s = this.sectors[i][j].advanceTurn();
            }
        }
    }

    this.highlightSector = function(){
        xpos = parseInt(adjustedMouseX / this.sector_dimension);
        ypos = parseInt(adjustedMouseY / this.sector_dimension);
        if (xpos < 0 || xpos > this.sectors_wide-1 ||
            ypos < 0 || ypos > this.sectors_wide-1){
                return;
            }
        this.sectors[ypos][xpos].isUnderMousePointer = true;
    }

    this.markSectorsNotHighlighted = function(){
        for (var i = 0; i < this.sectors_tall; i++) {
            for (var j = 0; j < this.sectors_wide; j++){
                s = this.sectors[i][j].isUnderMousePointer = false;
            }
        }
    }

    this.markSectorsNotSelected = function(){
        for (var i = 0; i < this.sectors_tall; i++) {
            for (var j = 0; j < this.sectors_wide; j++){
                s = this.sectors[i][j].isSelected = false;
            }
        }
    }

    this.selectSector = function(){
        // Don't select a sector if we're hovering over the UI.
        if (mouseY >= height - uiHeight){
            return;
        }
        this.markSectorsNotSelected();
        xpos = parseInt(adjustedMouseX / this.sector_dimension);
        ypos = parseInt(adjustedMouseY / this.sector_dimension);
        if (xpos < 0 || xpos > this.sectors_wide-1 ||
            ypos < 0 || ypos > this.sectors_wide-1){
                return;
            }
        this.sectors[ypos][xpos].isSelected = true;
        selectedSector = this.sectors[ypos][xpos];
    }

    this.drawGrid = function(){
        for (var i = 0; i < this.sectors_tall; i++) {
            for (var j = 0; j < this.sectors_wide; j++){
                this.sectors[i][j].draw();
            }
        }
    }

    this.draw = function(){
        if(!mouseIsPressed){
            this.markSectorsNotHighlighted();
            this.highlightSector();
        }
        this.drawGrid();
    }
}

////////////////
// Disease Class
////////////////
function Disease(seed){
    this.seed = seed;
    this.days_incubation = 2;
    this.days_contagious = 2;
    this.mortality_rate = 0.15;
    this.percent_pop_immune = 0.1;

    // Maps to mobility. The more severe,
    // the less somebody can move.
    // The more severe, the fewer people
    // on the board who spin. 
    // Another name: this.rotation_rate
    this.severity = 0.6;

    // How max of how many turns until a rotation occurs
    this.turns_until_rotate = 3;

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
    this.unlimited_cough = true;
    this.unlimited_sneeze = false;
    this.unlimited_spit = false;
    this.unlimited_vomit = false;
}


///////////////
// Sector class
// This will handle most of the logic associated with 
// various people infecting others, etc. 
function Sector(xcoord, ycoord, dimension){
    this.isSelected = false;
    this.isUnderMousePointer = false;
    this.dimension = dimension;
    this.xcoord = xcoord;
    this.ycoord = ycoord;
    this.x = this.xcoord * this.dimension;
    this.y = this.ycoord * this.dimension;
    this.centerX = this.x + this.dimension/2;
    this.centerY = this.y + this.dimension/2;
    this.img = img_state_default;
    this.facing = Math.floor(Math.random()*DIRECTIONS.length);

    // Use the current disease to set some parameters for
    // this sector
    this.immune = false;
    this.remaining_coughs = 0;
    this.remaining_sneezes = 0;
    this.remaining_spits = 0;
    this.remaining_vomits = 0;
    this.rotates = false;
    this.segments_to_rotate = 1;
    this.rotation_turn_counter = 0;
    this.rotation_on_turn = Math.floor(Math.random() * disease.turns_until_rotate) + 1;
    this.dies_from_disease = false;
    this.rotation_indicator = (this.rotation_turn_counter+1)/this.rotation_on_turn;

    if (Math.random() < disease.percent_pop_immune){
        this.immune = true;
        this.img = img_state_immune;
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
        if (Math.random() > disease.severity) {
            this.rotates = true;
        } else {
            // Don't show a bar for rotation
            this.rotation_indicator = 0;
        }
        if (Math.random() < disease.mortality_rate) {
            this.dies_from_disease = true;
        }
    }

    this.advanceTurn = function(){
        if (this.rotates){
            this.rotation_turn_counter += 1;
            if (this.rotation_turn_counter == this.rotation_on_turn){
                this.rotation_turn_counter = 0;
                this.facing += this.segments_to_rotate;
                if (this.facing >= DIRECTIONS.length) {
                    this.facing = this.facing - DIRECTIONS.length;
                }
            }
            // Set the turn indicator
            this.rotation_indicator = (this.rotation_turn_counter+1)/this.rotation_on_turn;
        }
    }

    this.draw = function(){
        // Draw the actual grid
        stroke(80);
        //noFill();
        fill(255);
        push();
        translate(offsetX,offsetY);
        rect(this.x,this.y,this.dimension,this.dimension);
        pop();
        noFill();

        if (this.isSelected) {
            noStroke();
            fill("#5C727C");
            push();
            translate(offsetX,offsetY);
            rect(this.x,this.y,this.dimension,this.dimension);
            pop();
        }
        if (this.isUnderMousePointer && mouseY < height - uiHeight){
            noStroke();
            fill("#334B5B");
            push();
            translate(offsetX,offsetY);
            rect(this.x,this.y,this.dimension,this.dimension);
            pop();
        }

        // Draw the person
        picScale = 2.2;
        imageMode(CENTER);
        push();
        translate(offsetX + this.centerX,offsetY + this.centerY);
        rotate(DIRECTIONS[this.facing]);
        image(this.img,0,0,this.img.width/2.2,this.img.height/2.2);
        pop();

        // Draw the rotation turn indicator
        if(this.rotates){
            push();
            translate(offsetX,offsetY);
            noStroke();
            fill(0);
            if (this.rotation_indicator == 1){
                fill("#5BE65D");
            }
            rect(this.x,this.y+dimension - 2,this.dimension*this.rotation_indicator,2);
            pop();
        }
    }
}

//////////////////
// UI Button Class
//////////////////
function ActionButton(x,y,dim,color,label,actionCallback){
    this.x = x;
    this.y = y;
    this.dim = dim;
    this.color = color;
    this.callback = actionCallback;
    this.label = label;

    this.triggerAction = function(){
        this.callback();
    }

    this.test = function(){
        print(this.label);
    }

    this.catchesClick = function(mouse_x,mouse_y){
        if (mouse_x >= this.x - dim/2 &&
            mouse_x <= this.x + dim/2 &&
            mouse_y >= this.y - dim/2 &&
            mouse_y <= this.y + dim/2){
                return true;
            } else{
                return false;
            }
    }

    this.draw = function(){
        fill(this.color);
        ellipseMode(CENTER);
        ellipse(this.x,this.y,this.dim,this.dim);
        fill(255);
        textAlign(CENTER);
        text(this.label,this.x,this.y + 5);
    }
}