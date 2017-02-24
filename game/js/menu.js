/**
 * 游戏开始菜单
 **/ 

var Menu = function(context){
	this.ctx = context;
	this.x = 0;
	this.y = SCREEN_HEIGHT;
	this.selectTank = new SelectTank();
	this.playNum = 0;
	this.times = 0;
	this.players = [false,false,false,false];
	
	/**
	 * 画菜单
	 */
	this.draw = function(){
		this.times ++ ;
		var temp = 0;
		if( parseInt(this.times / 6) % 2 == 0){
			temp = 0;
		}else{
			temp = this.selectTank.size;
		}
		if(this.y <= 0){
			this.y = 0;
		}else{
			this.y -= 5;
		}
		this.ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);   
		this.ctx.save(); 
		//画背景
		this.ctx.drawImage(MENU_IMAGE, this.x, this.y);
		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i]){
				this.ctx.drawImage(RESOURCE_IMAGE,POS["selectTank"][0],POS["selectTank"][1] + temp,this.selectTank.size,this.selectTank.size,
				this.selectTank.xs[i],this.y + this.selectTank.ys[i],this.selectTank.size,this.selectTank.size);
			}
		}
		

		this.ctx.restore();
	};
	
	/**
	 * 选择坦克上下移动
	 */
	this.ready = function(n){
		this.players[n] = true;
		this.playNum = 0;
		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i]){
				this.playNum++;
			}
		}
	};
};