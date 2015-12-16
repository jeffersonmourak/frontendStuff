(function() {
	"use strict";

	function pointDistance(x1, x2, y1, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }

	function Cell(scope,x, y) {
		this.scope = scope;
		this.context = scope.context;
		this.age = 0;
		this.x = x;
		this.y = y;
		this.time = 1;
		this.xA = 1;
		this.yA = 1;
		this.died = false;
		this.lifeExpect = Math.floor(Math.random() * (5 - 1) + 1);
		var sickExpect =  Math.floor(Math.random() * (150 - 1) + 1);
		this.sickness = sickExpect < 40 || sickExpect > 140;
		this.sickDown = sickExpect % 6;
		this.color = this.sickness ? "#0A0" : "#0F0";
		this.moving = false;
		this.to = {
			x: 0,
			y: 0
		}
		this.foodTarget = -1;
		this.hungry = 100;
		this.radius = 2;
	}

	Cell.prototype = {
		update: function() {
			if(this.time % 150 === 0){
				this.age++;
			}

			if(this.x <= 0){
				this.x = 0;
			}
			else if(this.x >= this.scope.width){
				this.x = this.scope.width;
			}

			if(this.y <= 0){
				this.y = 0;
			}
			else if(this.y >= this.scope.height){
				this.y = this.scope.height;
			}

			if(this.time % 80 === 0){
				this.hungry -= 5;
			}

			if((this.age > 4 && this.age < 8) && this.time % 100 === 0){
				var n = (Math.random() * (1700 - 1) + 1);
				if(n > 700 && n < 1500){
					//this.scope.cells.push(new Cell(this.scope,this.x,this.y))
				}
			}

			if(this.age > 3 && !this.sickness){
				this.color = "#F00";
			}

			if(this.age > 3 && this.sickness){
				this.color = "#A00";
			}

			if(this.age > 10 && !this.sickness){
				this.color = "#00F";
			}
			if(this.age > 10 && this.sickness){
				this.color = "#00A";
			}
			if(this.age > 13 + this.lifeExpect || (this.sickness && this.age > (13 - this.sickDown))){
				//this.died = true;
			}

			if(this.hungry < 70){				
				if(!this.moving){
					var near = -1,
					nearVal = 100000000000;
					for(var i in this.scope.food){
						var food = this.scope.food[i];
						if(!food.eated){
							var distance = pointDistance(this.x, food.x, this.y, food.y);
							if(distance < nearVal){
								nearVal = distance;
								near = i;
							}
						}
					}

					if(near > -1){	
						this.xA += (this.scope.food[near].x - this.x) / 60;
						this.yA += (this.scope.food[near].y - this.y) / 60;
						this.moving = true;
						this.to = {
							x: this.scope.food[near].x,
							y: this.scope.food[near].y
						}
						this.foodTarget = near;
					}
				}
				else{
					if((this.x >= this.to.x - 2 || this.x <= this.to.x + 2) && (this.y >= this.to.y - 2 || this.y <= this.to.y + 2)){
						this.moving = false;
						this.yA = 0;
						this.xA = 0;
						if((this.x >= this.to.x - (this.radius / 2) && this.x <= this.to.x + (this.radius / 2)) && (this.y >= this.to.y - (this.radius / 2) && this.y <= this.to.y + (this.radius / 2))){
							if(this.scope.food[this.foodTarget] !== undefined){
								this.scope.food[this.foodTarget].eated = true;
								this.moving = false;
								this.hungry += 40;
							}
						}
					}
				}
			}
			else{
				if(this.time % 75 === 0 && !this.moving){
					var angle = (Math.random() * (360 - 1) + 1);
					this.xA = Math.sin(angle);
					this.yA = Math.cos(angle);
				}
			}

			this.x += this.xA;
			this.y += this.yA;

			if(this.hungry <= 0){
				this.died = true;
			}

			this.time++;
		},
		draw: function() {
			var radius = 2;
			if(this.age > 1 && this.age <= 10){
				radius = this.age;
			}
			else if(this.age > 10){
				radius = 10;
			}
			this.radius = radius;
			this.context.beginPath();
            this.context.arc(this.x,this.y, radius, 0, 2 * Math.PI);
            this.context.fillStyle = this.color;
            this.context.fill();
            this.context.closePath();
		}
	}

	function Food(scope,x,y){
		this.scope = scope;
		this.context = this.scope.context;
		this.eated = false;
		this.x = x;
		this.y = y;
	}

	Food.prototype = {
		draw: function() {
			this.context.beginPath();
            this.context.arc(this.x,this.y, 2, 0, 2 * Math.PI);
            this.context.fillStyle = "#ACF";
            this.context.fill();
            this.context.closePath();
		}
	}

	function World() {
		var w = window,
		    d = document,
		    e = d.documentElement,
		    g = d.getElementsByTagName('body')[0];
		this.width = w.innerWidth || e.clientWidth || g.clientWidth,
    	this.height = w.innerHeight|| e.clientHeight|| g.clientHeight;
		this.canvas = document.getElementById('canvas');

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.context = this.canvas.getContext('2d');
		this.FPS = 60;
		this.cells = [new Cell(this,0,0)];
		this.food = [];
		this.time = 1;
		this.init();
		this.status = [];
		this.currentStatus = {
			Young:0,
			Adult:0,
			Old:0,
			Died:0,
			Live:0,
			Sick:0,
			LifeExpectation:0
		};
	}

	World.prototype = {
		init: function() {
			var self = this;
			setInterval(function() {
                self.update();
                self.draw();
                if(self.time % 150 === 0){
                	self.generateData();
                }
                if(self.time % 300 === 0){
                	self.status.push(self.currentStatus);
                }
                self.time++;
            }, 1000 / this.FPS);

			document.addEventListener("click", function(e){
				var x = e.clientX || e.pageX;
				var y = e.clientY || e.pageY;
				self.food.push(new Food(self, x, y));
			});

		},
		update: function() {
			for(var i in this.cells){
				var cell = this.cells[i];
				if(!cell.died){
					cell.update();
				}
			}
		},
		draw: function() {
			this.context.clearRect(0, 0, this.width, this.height);
			this.context.fillStyle = "#000";
			this.context.fillRect(0,0,this.width, this.height);
			for(var i in this.cells){
				var cell = this.cells[i];
				if(!cell.died){
					cell.draw();
				}
			}
			for(var i in this.food){
				var food = this.food[i];
				if(!food.eated){
					food.draw();
				}
			}
		},
		generateData: function() {
			var Young = 0;
			var Adult = 0;
			var Old = 0;
			var Died = 0;
			var Live = 0;
			var Sick = 0;
			var LifeExpectation = 0;
			for(var i in this.cells){
				var cell = this.cells[i];
				if(cell.age <= 3){
					Young++;
				}
				if(cell.age > 3 && cell.age <= 10){
					Adult++;
				}
				if(cell.age > 10 && !cell.died){
					Old++;
				}
				if(!cell.died && cell.sickness){
					Sick++;
				}
				if(cell.died){
					Died++;
					LifeExpectation += cell.age;
				}
				else{
					Live++;
				}
			}
			LifeExpectation = LifeExpectation / Died;

			console.clear();
			console.log("Live Cells: " + Live +"\n");
			console.log("Died Cells: " + Died +"\n######### STATUS #########");
			console.log("Young Cells: " + Young +"\n");
			console.log("Adult Cells: " + Adult +"\n");
			console.log("Old Cells: " + Old +"\n######### LIFE STATUS #########");
			console.log("Sick Cells: " + Sick +"\n");
			console.log("Life Expectation: " + LifeExpectation +"\n");

			this.currentStatus = {
				Young: Young,
				Adult: Adult,
				Old: Old,
				Died: Died,
				Live: Live,
				Sick: Sick,
				LifeExpectation: LifeExpectation
			};

		}
	}

	window['World'] = new World();
}())