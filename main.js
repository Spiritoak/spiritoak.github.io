function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/* ========================================================================================================== */
// Background
/* ========================================================================================================== */
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

/* ========================================================================================================== */
// The Ship
/* ========================================================================================================== */
function TheShip(game) {
	this.pWidth = 128;
	this.pHeight = 128;
	this.scale = 1;
    this.idleAnimation = new Animation(AM.getAsset("./img/shipIdle.png"), this.pWidth, this.pHeight, 256, 0.03, 2, true, this.scale);
    this.boostAnimation = new Animation(AM.getAsset("./img/shipBoost.png"), this.pWidth, this.pHeight, 256, 0.03, 2, true, this.scale);
    this.rollAnimation = new Animation(AM.getAsset("./img/shipRoll.png"), this.pWidth, this.pHeight, 256, 0.03, 22, false, this.scale);
    this.boostRollAnimation = new Animation(AM.getAsset("./img/shipBoostRoll.png"), this.pWidth, this.pHeight, 256, 0.03, 22, false, this.scale);
    this.shieldAnimation = new Animation(AM.getAsset("./img/shipShield.png"), 192, 192, 3456, 0.05, 18, true, this.scale);
    this.speed = 0.5;
    this.boosting = false;
    this.cancelBoost = false;
    this.rolling = false;
    this.shielded = false;
    this.x = 300;
    this.y = 300;
    this.xMid = (this.x + (this.pWidth * this.scale / 2)) - 1;
    this.yMid = (this.y + (this.pHeight * this.scale / 2)) - 1;
    this.hitRadius = 31;
    this.game = game;
    this.ctx = game.ctx;
    this.removeFromWorld = false;
    Entity.call(this, game, this.x, this.y);
}

TheShip.prototype = new Entity();
TheShip.prototype.constructor = TheShip;

TheShip.prototype.update = function () {
	// movement
	if (this.game.moveUp) {
		if (this.yMid - this.hitRadius > 0) {
			this.y -= 10 * this.speed;
		}
	}
	if (this.game.moveLeft) {
		if (this.xMid - this.hitRadius > 0) {
			this.x -= 10 * this.speed;
		}
	}
	if (this.game.moveDown) {
		if (this.yMid + this.hitRadius < 800) {
			this.y += 10 * this.speed;
		}
	}
	if (this.game.moveRight) {
		if (this.xMid + this.hitRadius < 800) {
			this.x += 10 * this.speed;
		}
	}

	// update center hitbox
    this.xMid = (this.x + (this.pWidth * this.scale / 2)) - 1;
    this.yMid = (this.y + (this.pHeight * this.scale / 2)) - 1;

    // shield
    if (this.game.shield) {
    	this.shielded = !this.shielded;
    }

	// rolling
	if (this.game.roll) {
		this.rolling = true;
	}
	if (this.rolling) {
		if (this.rollAnimation.isDone()) {
			this.rollAnimation.elapsedTime = 0;
			this.rolling = false;
		}
		else if (this.boostRollAnimation.isDone()) {
			this.boostRollAnimation.elapsedTime = 0;
			this.rolling = false;
			if (this.cancelBoost) {
				this.cancelBoost = false;
				this.boosting = false;
			}
		}
	}

	// boosting
	if (this.game.boost && !this.rolling) {
		this.cancelBoost = false;
		this.boosting = true;
		this.speed = 1;
	}
	if (!this.game.boost && !this.rolling) {
		this.boosting = false;
		this.speed = 0.5;
	}

	// boost input buffer during rolls
	if (this.game.boost && this.rolling) {
		this.cancelBoost = false;
	}
	if (!this.game.boost && this.rolling) {
		this.cancelBoost = true;
	}

    Entity.prototype.update.call(this);
}

TheShip.prototype.draw = function () {
	if (this.rolling) {
		if (this.boosting) {
			this.boostRollAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
		}
		else {
			this.rollAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
		}
	}
	else {
		if (this.boosting) {
			this.boostAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
		}
		else {
			this.idleAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
		}
	}

	if (this.shielded) {
		this.shieldAnimation.drawFrame(this.game.clockTick, this.ctx,
									   this.x - (192 - this.pWidth) / 2, this.y - (192 - this.pHeight) / 2);
	}

    Entity.prototype.draw.call(this);
}

/* ========================================================================================================== */
// Asset Manager
/* ========================================================================================================== */
var AM = new AssetManager();
AM.queueDownload("./img/shipIdle.png");
AM.queueDownload("./img/shipBoost.png");
AM.queueDownload("./img/shipRoll.png");
AM.queueDownload("./img/shipBoostRoll.png");
AM.queueDownload("./img/shipShield.png");

AM.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    // the ship is always loaded last
    gameEngine.addEntity(new TheShip(gameEngine));

    console.log("All Done!");
});
