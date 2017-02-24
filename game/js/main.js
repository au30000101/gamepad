var socket = io();
var ctx;//2d画布
var wallCtx;//地图画布
var grassCtx;//草地画布
var tankCtx;//坦克画布
var overCtx;//结束画布
var menu = null;//菜单
var stage = null;//舞台
var map = null;//地图
var player1 = null;//玩家1
var player2 = null;//玩家2
var player3 = null;//玩家1
var player4 = null;//玩家2
var prop = null;
var enemyArray = [];//敌方坦克
var bulletArray = [];//子弹数组
var keys = {};//记录按下的按键
var crackArray = [];//爆炸数组

var gameState = GAME_STATE_MENU;//默认菜单状态
var level = 1;
var maxEnemy = 40;//敌方坦克总数
var maxAppearEnemy = 10;//屏幕上一起出现的最大数
var appearEnemy = 0; //已出现的敌方坦克
var mainframe = 0;
var isGameOver = false;
var overX = 176;
var overY = 384;
var emenyStopTime = 0;
var homeProtectedTime = -1;
var propTime = 500;
$(document).ready(function(){
	
	initScreen();
	player1 = new PlayTank(tankCtx);
	player2 = new PlayTank(tankCtx);
	player3 = new PlayTank(tankCtx);
	player4 = new PlayTank(tankCtx);
	initObject();
	
	socket.emit('create a game')
	socket.on('select', function(index){
		switch(gameState){
	
		case GAME_STATE_MENU:
			menu.ready(index);
			console.log('player ' + index + ' is ready');
			break;
		case GAME_STATE_START:
			// borrow lives from other players
			var mostLives = 0;
			var mostLivesPlayer;
			var players = [player1,player2, player3, player4];
			for(var i = 0; i < 4; i ++) {
				if(mostLives < players[i].lives) {
					mostLives = players[i].lives
					mostIndex = i;
				}
			}
			if(mostLives > 0){
				players[mostIndex].lives--;
				players[index].lives++;
			}
			break;
		}
	});
	setInterval(gameLoop,17);
});

function initScreen(){
	var canvas = $("#stageCanvas");
	ctx = canvas[0].getContext("2d");
	canvas.attr({"width":SCREEN_WIDTH});
	canvas.attr({"height":SCREEN_HEIGHT});
	wallCtx = $("#wallCanvas")[0].getContext("2d");
	grassCtx = $("#grassCanvas")[0].getContext("2d");
	$("#wallCanvas").attr({"width":SCREEN_WIDTH});
	$("#wallCanvas").attr({"height":SCREEN_HEIGHT});
	$("#grassCanvas").attr({"width":SCREEN_WIDTH});
	$("#grassCanvas").attr({"height":SCREEN_HEIGHT});
	tankCtx = $("#tankCanvas")[0].getContext("2d");
	$("#tankCanvas").attr({"width":SCREEN_WIDTH});
	$("#tankCanvas").attr({"height":SCREEN_HEIGHT});
	overCtx = $("#overCanvas")[0].getContext("2d");
	$("#overCanvas").attr({"width":SCREEN_WIDTH});
	$("#overCanvas").attr({"height":SCREEN_HEIGHT});
	$("#canvasDiv").css({"width":SCREEN_WIDTH});
	$("#canvasDiv").css({"height":SCREEN_HEIGHT});
	$("#canvasDiv").css({"background-color":"#000000"});
	
}

function initObject(){
	menu = new Menu(ctx);
	stage = new Stage(ctx,level);
	map = new Map(wallCtx,grassCtx);
	player1.x = 129 + map.offsetX;
	player1.y = 385 + map.offsetY;
	player2.offsetX = 128; //player2的图片x与图片1相距128
	player2.x = 256 + map.offsetX;
	player2.y = 385 + map.offsetY;
	player3.offsetY = 232;
	player3.x = 0 + map.offsetX;
	player3.y = 385 + map.offsetY;
	player4.offsetX = 128; //player2的图片x与图片1相距128
	player4.offsetY = 232;
	player4.x = 386 + map.offsetX;
	player4.y = 385 + map.offsetY;
	player1.isShooting = false;
	player2.isShooting = false;
	player3.isShooting = false;
	player4.isShooting = false;
	appearEnemy = 0; //已出现的敌方坦克
	enemyArray = [];//敌方坦克
	bulletArray = [];//子弹数组
	keys = [];//记录按下的按键
	crackArray = [];//爆炸数组
	isGameOver = false;
	overX = 176;
	overY = 384;
	overCtx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
	emenyStopTime = 0;
	homeProtectedTime = -1;
	propTime = 300;
}

function gameLoop(){
	switch(gameState){
	
	case GAME_STATE_MENU:
		menu.draw();

		break;
	case GAME_STATE_INIT:
		stage.draw();
		if(stage.isReady == true){
			gameState = GAME_STATE_START;
		}
		break;
	case GAME_STATE_START:
		drawAll();
		if(isGameOver ||(player1.lives <=0 && player2.lives <= 0 && player3.lives <=0 && player4.lives <= 0)){
			gameState = GAME_STATE_OVER;
			map.homeHit();
			PLAYER_DESTROY_AUDIO.play();
		}
		if(appearEnemy == maxEnemy && enemyArray.length == 0){
			gameState  = GAME_STATE_WIN;
		}
		break;
	case GAME_STATE_WIN:
		nextLevel();
		break;
	case GAME_STATE_OVER:
		gameOver();
		break;
	}
}

$(document).keydown(function(e){
	switch(gameState){
	case GAME_STATE_START:
		if(e.keyCode == keyboard.N){
			nextLevel();
		}else if(e.keyCode == keyboard.P){
			preLevel();
		}
		break;
	}
});

socket.on('start', function(){
	gameState = GAME_STATE_INIT;
	console.log('game init!');
	console.log(menu.playNum)
	switch(menu.playNum) {
		case 1:
			player2.lives = 0;
			player3.lives = 0;
			player4.lives = 0;
			break;
		case 2:
			player3.lives = 0;
			player4.lives = 0;
			break;
		case 3:
			player4.lives = 0;
			break;
		case 4:
			break;
	}
})
socket.on('shoot', function(msg){
	if(gameState == GAME_STATE_START){
		switch(msg){
			case 0:
				if(player1.lives > 0){
					player1.shoot(BULLET_TYPE_PLAYER);
				}
				break;
			case 1:
				if(player2.lives > 0){
					player2.shoot(BULLET_TYPE_PLAYER);
				}
			case 2:
				if(player3.lives > 0){
					player3.shoot(BULLET_TYPE_PLAYER);
				}
			case 3:
				if(player4.lives > 0){
					player4.shoot(BULLET_TYPE_PLAYER);
				}
				break;
		}
	}
		

});
socket.on('up', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' up');
		switch(msg){
			case 0:
				if(!keys.contain(87)){
					keys.push(87);
				}
				break;
			case 1:
				if(!keys.contain(38)){
					keys.push(38);
				}
			case 2:
				if(!keys.contain(187)){
					keys.push(187);
				}
				break;
			case 3:
				if(!keys.contain(138)){
					keys.push(138);
				}
				break;
		}
	}
})
socket.on('down', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' down');
		switch(msg){
			case 0:
				if(!keys.contain(83)){
					keys.push(83);
				}
				break;
			case 1:
				if(!keys.contain(40)){
					keys.push(40);
				}
			case 2:
				if(!keys.contain(183)){
					keys.push(183);
				}
				break;
			case 3:
				if(!keys.contain(140)){
					keys.push(140);
				}
				break;
		}
	}
})
socket.on('left', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' left');
		switch(msg){
			case 0:
				if(!keys.contain(65)){
					keys.push(65);
				}
				break;
			case 1:
				if(!keys.contain(37)){
					keys.push(37);
				}
			case 2:
				if(!keys.contain(165)){
					keys.push(165);
				}
				break;
			case 3:
				if(!keys.contain(137)){
					keys.push(137);
				}
				break;
		}
	}
})
socket.on('right', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' right');
		switch(msg){
			case 0:
				if(!keys.contain(68)){
					keys.push(68);
				}
				break;
			case 1:
				if(!keys.contain(39)){
					keys.push(39);
				}
			case 2:
				if(!keys.contain(168)){
					keys.push(168);
				}
				break;
			case 3:
				if(!keys.contain(139)){
					keys.push(139);
				}
				break;
		}
	}
})
socket.on('endUp', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' end up');
		switch(msg){
			case 0:
				keys.remove(87);
				break;
			case 1:
				keys.remove(38);
				break;
			case 2:
				keys.remove(187);
				break;
			case 3:
				keys.remove(138);
				break;
		}
	}
})
socket.on('endDown', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' end down');
		switch(msg){
			case 0:
				keys.remove(83);
				break;
			case 1:
				keys.remove(40);
			case 2:
				keys.remove(183);
				break;
			case 3:
				keys.remove(140);
				break;
		}
	}
})
socket.on('endLeft', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' end left');
		switch(msg){
			case 0:
				keys.remove(65);
				break;
			case 1:
				keys.remove(37);
			case 2:
				keys.remove(165);
				break;
			case 3:
				keys.remove(137);
				break;
		}
	}
})
socket.on('endRight', function(msg){
	if(gameState == GAME_STATE_START){
		console.log('player '+ msg +' end left');
		switch(msg){
			case 0:
				keys.remove(68);
				break;
			case 1:
				keys.remove(39);
			case 2:
				keys.remove(168);
				break;
			case 3:
				keys.remove(139);
				break;
		}
	}
})

function initMap(){
	map.setMapLevel(level);;
	map.draw();
	drawLives();
}

function drawLives(){
	map.drawLives(player1.lives,1);
	map.drawLives(player2.lives,2);
	map.drawLives(player3.lives,3);
	map.drawLives(player4.lives,4);
}

function drawBullet(){
	if(bulletArray != null && bulletArray.length > 0){
		for(var i=0;i<bulletArray.length;i++){
			var bulletObj = bulletArray[i];
			if(bulletObj.isDestroyed){
				bulletObj.owner.isShooting = false;
				bulletArray.removeByIndex(i);
				i--;
			}else{
				bulletObj.draw();
			}
		}
	}
}

function keyEvent(){
	if(keys.contain(keyboard.W)){
		player1.dir = UP;
		player1.hit = false;
		player1.move();
	}else if(keys.contain(keyboard.S)){
		player1.dir = DOWN;
		player1.hit = false;
		player1.move();
	}else if(keys.contain(keyboard.A)){
		player1.dir = LEFT;
		player1.hit = false;
		player1.move();
	}else if(keys.contain(keyboard.D)){
		player1.dir = RIGHT;
		player1.hit = false;
		player1.move();
	}

	if(keys.contain(keyboard.W + 100)){
		player3.dir = UP;
		player3.hit = false;
		player3.move();
	}else if(keys.contain(keyboard.S + 100)){
		player3.dir = DOWN;
		player3.hit = false;
		player3.move();
	}else if(keys.contain(keyboard.A + 100)){
		player3.dir = LEFT;
		player3.hit = false;
		player3.move();
	}else if(keys.contain(keyboard.D + 100)){
		player3.dir = RIGHT;
		player3.hit = false;
		player3.move();
	}
	
	if(keys.contain(keyboard.UP)){
		player2.dir = UP;
		player2.hit = false;
		player2.move();
	}else if(keys.contain(keyboard.DOWN)){
		player2.dir = DOWN;
		player2.hit = false;
		player2.move();
	}else if(keys.contain(keyboard.LEFT)){
		player2.dir = LEFT;
		player2.hit = false;
		player2.move();
	}else if(keys.contain(keyboard.RIGHT)){
		player2.dir = RIGHT;
		player2.hit = false;
		player2.move();
	}

	if(keys.contain(keyboard.UP + 100)){
		player4.dir = UP;
		player4.hit = false;
		player4.move();
	}else if(keys.contain(keyboard.DOWN + 100)){
		player4.dir = DOWN;
		player4.hit = false;
		player4.move();
	}else if(keys.contain(keyboard.LEFT + 100)){
		player4.dir = LEFT;
		player4.hit = false;
		player4.move();
	}else if(keys.contain(keyboard.RIGHT + 100)){
		player4.dir = RIGHT;
		player4.hit = false;
		player4.move();
	}
	
}

function addEnemyTank(){
	if(enemyArray == null || enemyArray.length >= maxAppearEnemy || maxEnemy == 0){
		return ;
	}
	appearEnemy++;
	var rand = parseInt(Math.random()*3);
	var obj = null;
	if(rand == 0){
		obj = new EnemyOne(tankCtx);
	}else if(rand == 1){
		obj = new EnemyTwo(tankCtx);
	}else if(rand == 2){
		obj = new EnemyThree(tankCtx);
	}
	obj.x = ENEMY_LOCATION[parseInt(Math.random()*3)] + map.offsetX;
	obj.y = map.offsetY;	
	obj.dir = DOWN;
	enemyArray[enemyArray.length] = obj;
	//更新地图右侧坦克数
	map.clearEnemyNum(maxEnemy,appearEnemy);
}

function drawEnemyTanks(){
	if(enemyArray != null || enemyArray.length > 0){
		for(var i=0;i<enemyArray.length;i++){
			var enemyObj = enemyArray[i];
			if(enemyObj.isDestroyed){
				enemyArray.removeByIndex(i);
				i--;
			}else{
				enemyObj.draw();
			}
		}
	}
	if(emenyStopTime > 0){
		emenyStopTime --;
	}
}

function drawAll(){
	tankCtx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
	if(player1.lives>0){
		player1.draw();
	}
	if(player2.lives > 0){
		player2.draw();
	}
	if(player3.lives > 0){
		player3.draw();
	}
	if(player4.lives > 0){
		player4.draw();
	}
	drawLives();
	if(appearEnemy<maxEnemy){
		if(mainframe % 100 == 0){
			addEnemyTank();
			mainframe = 0;
		}
		mainframe++;
	}
	drawEnemyTanks();
	drawBullet();
	drawCrack();
	keyEvent();
	if(propTime<=0){
		drawProp();
	}else{
		propTime --;
	}
	if(homeProtectedTime > 0){
		homeProtectedTime --;
	}else if(homeProtectedTime == 0){
		homeProtectedTime = -1;
		var mapChangeIndex = [[23,11],[23,12],[23,13],[23,14],[24,11],[24,14],[25,11],[25,14]];
		map.updateMap(mapChangeIndex,WALL);
		homeNoProtected();
	}
}

function drawCrack(){
	if(crackArray != null && crackArray.length > 0){
		for(var i=0;i<crackArray.length;i++){
			var crackObj = crackArray[i];
			if(crackObj.isOver){
				crackArray.removeByIndex(i);
				i--;
				if(crackObj.owner == player1){
					player1.renascenc(1);
				}else if(crackObj.owner == player2){
					player2.renascenc(2);
				}else if(crackObj.owner == player3){
					player3.renascenc(3);
				}else if(crackObj.owner == player4){
					player4.renascenc(4);
				}
			}else{
				crackObj.draw();
			}
		}
	}
}


function gameOver(){
	overCtx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
	overCtx.drawImage(RESOURCE_IMAGE,POS["over"][0],POS["over"][1],64,32,overX+map.offsetX,overY+map.offsetY,64,32);
	overY -= 2 ;
	if(overY <= parseInt(map.mapHeight/2)){
		player1 = new PlayTank(tankCtx);
		player2 = new PlayTank(tankCtx);
		player3 = new PlayTank(tankCtx);
		player4 = new PlayTank(tankCtx);
		initObject();
		//只有一个玩家
		switch(menu.playNum) {
			case 1:
				player2.lives = 0;
				player3.lives = 0;
				player4.lives = 0;
				break;
			case 2:
				player3.lives = 0;
				player4.lives = 0;
				break;
			case 3:
				player4.lives = 0;
				break;
			case 4:
				break;
		}
		gameState = GAME_STATE_MENU;
	}
}

function nextLevel(){
	level ++;
	if(level == 22){
		level = 1;
	}
	initObject();
	//只有一个玩家
	switch(menu.playNum) {
		case 1:
			player2.lives = 0;
			player3.lives = 0;
			player4.lives = 0;
			break;
		case 2:
			player3.lives = 0;
			player4.lives = 0;
			break;
		case 3:
			player4.lives = 0;
			break;
		case 4:
			break;
	}
	stage.init(level);
	gameState = GAME_STATE_INIT;
}

function preLevel(){
	level --;
	if(level == 0){
		level = 21;
	}
	initObject();
	//只有一个玩家
	switch(menu.playNum) {
		case 1:
			player2.lives = 0;
			player3.lives = 0;
			player4.lives = 0;
			break;
		case 2:
			player3.lives = 0;
			player4.lives = 0;
			break;
		case 3:
			player4.lives = 0;
			break;
		case 4:
			break;
	}
	stage.init(level);
	gameState = GAME_STATE_INIT;
}

function drawProp(){
	var rand = Math.random();
	if(rand < 0.4 && prop == null){
		prop = new Prop(overCtx);
		prop.init();
	}
	if(prop != null){
		prop.draw();
		if(prop.isDestroyed){
			prop = null;
			propTime = 1000;
		}
	}
}

function homeNoProtected(){
	var mapChangeIndex = [[23,11],[23,12],[23,13],[23,14],[24,11],[24,14],[25,11],[25,14]];
	map.vdateMap(mapChangeIndex,WALL);
};
