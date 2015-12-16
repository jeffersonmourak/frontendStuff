(function() {
	"use strict";

	function Cell(scope,x, y) {
		this.scope = scope;
		this.context = scope.context;
		this.color = "#0F0";
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
	}

	Cell.prototype = {
		update: function() {
			if(this.time % 150 === 0){
				this.age++;
			}
			if(this.time % 75 === 0){
				var angle = (Math.random() * (360 - 1) + 1);
				this.xA = Math.sin(angle);
				this.yA = Math.cos(angle);

			}
			this.x += this.xA;
			this.y += this.yA;


			if(this.x <= 0){
				this.x = 0;
			}
			else if(this.x >= 800){
				this.x = 800;
			}

			if(this.y <= 0){
				this.y = 0;
			}
			else if(this.y >= 400){
				this.y = 400;
			}


			if((this.age > 4 && this.age < 8) && this.time % 100 === 0){
				var n = (Math.random() * (1700 - 1) + 1);
				if(n > 700 && n < 1500){
					this.scope.cells.push(new Cell(this.scope,this.x,this.y))
				}
			}

			if(this.age > 3){
				this.color = "#F00";
			}
			if(this.age > 10){
				this.color = "#00F";
			}
			if(this.age > 13 + this.lifeExpect || (this.sickness && this.age > (13 - this.sickDown))){
				this.died = true;
			}

			this.time++;
		},
		draw: function() {
			this.context.beginPath();
            this.context.arc(this.x,this.y, 10, 0, 2 * Math.PI);
            this.context.fillStyle = this.color;
            this.context.fill();
            this.context.closePath();
		}
	}

	function World() {
		this.canvas = document.getElementById('canvas');
		this.context = this.canvas.getContext('2d');
		this.FPS = 60;
		this.cells = [new Cell(this,0,0)];
		this.time = 1;
		this.init();
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
                self.time++;
            }, 1000 / this.FPS);
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
			this.context.clearRect(0, 0, 800, 600);
			for(var i in this.cells){
				var cell = this.cells[i];
				if(!cell.died){
					cell.draw();
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

		}
	}
	window['World'] = new World();
}())