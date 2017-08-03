var offsetX = 0;
var offsetY = 0;

var gameGridWidth = 100;
var gameGridHeight = 100;

var sectorsWide = 10;
var sectorsTall = 10;

var sectors = [];
var uiHeight = 76;

var actionButtons = [];
var vomitButton, coughButton, sneezeButton, spitButton, passButton;

var gameGrid;
var selectedSector = null;

function preload(){
    randomSeed(1);
}

function setup() {
    var canvas = createCanvas(400,600);
    canvas.parent('canvasHolder');
    background("#122B40");

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

    gameGrid = new GameGrid(100,10,10);

    drawUI();
}

function draw() {
  background("#122B40");
  gameGrid.draw();
  drawUI();
}

function mouseClicked(){
  // If a UI button catches the mouse click, return.
  for (var i = 0; i < actionButtons.length; i++){
        if (actionButtons[i].catchesClick(mouseX,mouseY)){
            actionButtons[i].triggerAction();
            return;
        }
  }

  // The UI didn't catch it so try to select a sector
  gameGrid.selectSector(mouseX,mouseY);

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
}

function triggerCough(){
    print("Coughing");
}

function triggerSneeze(){
    print("Sneezing");
}

function triggerSpit(){
    print("Spitting");
}

function triggerPass(){
    print("Passing Turn");
}

// Game Grid Class
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

    this.highlightSector = function(){
        xpos = parseInt(mouseX / this.sector_dimension);
        ypos = parseInt(mouseY / this.sector_dimension);
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

    this.selectSector = function(mouseX,mouseY){
        // Don't select a sector if we're hovering over the UI.
        if (mouseY >= height - uiHeight){
            return;
        }
        this.markSectorsNotSelected();
        xpos = parseInt(mouseX / this.sector_dimension);
        ypos = parseInt(mouseY / this.sector_dimension);
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
        this.markSectorsNotHighlighted();
        this.highlightSector();
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
    this.mortality_rate = 15;
    this.percent_pop_immune = 10;

    // Maps to mobility. The more severe,
    // the less somebody can move.
    // The more severe, the fewer people
    // on the board who spin. 
    this.severity = 2;

    // How many 45° increments they turn
    // when they spin
    this.turn_segments = 1;

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

    this.draw = function(){
        if (this.isSelected) {
            noStroke();
            fill("#5C727C");
            rect(this.x,this.y,this.dimension,this.dimension);
            return;
        }
        if (this.isUnderMousePointer && mouseY < height - uiHeight){
            noStroke();
            fill("#334B5B");
            rect(this.x,this.y,this.dimension,this.dimension);
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