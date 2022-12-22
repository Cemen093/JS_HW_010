var game = {
    width: 1920,
    height: 960,
    context: undefined,
    platform: undefined,
    ball: undefined,
    mouse: undefined,
    rows: 3,
    cols: 4,
    running: true,
    score: 0,
    blocks: [],
    sprites: {
        background: undefined,
        platform: undefined,
        ball: undefined,
        block_1: undefined,
        block_2: undefined,
        block_3: undefined,
        block_4: undefined,
        block_5: undefined,
        block_6: undefined,
        block_7: undefined,
        block_8: undefined,
        block_9: undefined,
        block_10: undefined,
        block_11: undefined,
        block_12: undefined,
    },
    init: function (){
        var canvas = document.getElementById("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");

        //потом поменять на мышь
        window.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A"){
                game.platform.dx = -game.platform.velocity;
            } else if (e.key === "ArrowRight" || e.key === 'd' || e.key === "D") {
                game.platform.dx = game.platform.velocity;
            } else if (e.key === " "){
                game.platform.releaseBall();
            }
        })

        window.addEventListener("keyup", function (e) {
            game.platform.stop()
        })

        canvas.onmousedown = this.mouse.mouse_down;
        canvas.onmousemove = this.mouse.mouse_move;
    },
    load: function () {
        for (let name in this.sprites){
            this.sprites[name] = new Image();
            this.sprites[name].src = "img/" + (name.includes('block') ? "tile/" : "") + name + ".png";
        }
    },
    create: function () {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++){
                this.blocks.push({
                    x: 70 + 60*col + 400*col,
                    y: 20 + 60*row + 175*row,
                    width: 400,
                    height: 150,
                    isAlive: true,
                })
            }
        }
    },
    start: function () {
        this.init();
        this.load();
        this.create();
        this.run();
    },
    update: function () {
        if (this.platform.dx){
            this.platform.move();
        }
        if (this.ball.collide(this.platform)){
            this.ball.bumpPlatform(this.platform);
        }

        if (this.ball.dx || this.ball.dy){
            this.ball.move();
        }
        for (let block of this.blocks){
            if (block.isAlive){
                if (this.ball.collide(block)){
                    this.ball.bumpBlock(block);
                }
            }
        }

        if (this.ball !== undefined && this.mouse !== undefined){
            if (this.mouse.onThePlatform()){
                game.platform.stop()
            } else if (this.mouse.onTheLeftSideOfPlatform()){
                this.platform.dx = -this.platform.velocity;
            } else {
                this.platform.dx = this.platform.velocity;
            }
        }

        this.ball.checkBounds();
    },
    render: function () {
        this.context.clearRect(0,0, this.width, this.height);

        this.context.drawImage(this.sprites.background, 0, 0);
        this.context.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.context.drawImage(this.sprites.ball, this.ball.x, this.ball.y);

        let i = 1;
        this.blocks.forEach(function (el) {
            if (el.isAlive){
                this.context.drawImage(this.sprites["block_"+i], el.x, el.y);
            }
            i++;
        }, this)
    },
    run: function () {
        this.update();
        this.render();

        if (this.running){
            window.requestAnimationFrame(function () {
                game.run();
            });
        }

    },
    over: function (message){
        alert(message);
        this.running = false;
        window.location.reload();
    }
};

game.ball = {
    x: game.width/2-25,
    y: game.height-200,
    width: 50,
    height: 50,
    velocity: 6,
    dx: 0,
    dy: 0,
    jump: function () {
        this.dx = Math.random() > 0.5 ? this.velocity : -this.velocity;
        this.dy = -this.velocity;
    },
    move: function () {
        this.x+=this.dx;
        this.y+=this.dy;
    },collide: function (element) {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        if (x + this.width > element.x &&
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height){
            return true;
        }
        return false;
    },
    bumpBlock: function (block) {
        //а если сбоку?
        this.dy *= -1;

        block.isAlive = false;
        ++game.score;

        if (game.score >= game.blocks.length){
            game.over("Tou Win");
        }
    },
    onTheLeftSide: function (platform){
        return this.x + this.width/2 < platform.x + platform.width/2;
    },
    bumpPlatform: function (platform) {
        this.dy = -this.velocity;
        this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
    },
    checkBounds: function () {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        if (x < 0){
            this.x=0;
            this.dx=this.velocity;
        } else if (x + this.width > game.width){
            this.x=game.width-this.width;
            this.dx=-this.velocity;
        }else if (y < 0){
            this.y=0;
            this.dy=this.velocity;
        }else if (y + this.height > game.height){
            game.over("Game Over");
        }
    }
}

game.platform = {
    x: game.width/2-150,
    y: game.height-65-50,
    width:300,
    height: 65,
    velocity: 10,
    dx: 0,
    ball: game.ball,
    move: function (){

        this.x+=this.dx;

        if (this.ball){
            this.ball.x += this.dx;
        }
    },
    releaseBall: function () {
        if (this.ball){
            this.ball.jump();
            this.ball = false;
        }
    },
    stop: function () {
        this.dx=0;
    }
}

game.mouse = {
    x: 0,
    y: 0,
    onTheLeftSideOfPlatform: function () {
        return game.mouse.x < game.platform.x + game.platform.width/2;
    },
    onThePlatform: function () {
        return game.mouse.x < game.platform.x + game.platform.width/2+6 &&
            game.mouse.x > game.platform.x + game.platform.width/2-6;
    },
    mouse_down: function (event) {
        event.preventDefault();
        game.platform.releaseBall();
    },
    mouse_move: function (event){
        event.preventDefault();
        let canvas_offsets = canvas.getBoundingClientRect();
        let offset_x = canvas_offsets.left;
        game.mouse.x = parseInt(event.clientX);
        console.log(game.mouse.x)
        console.log(game.platform.x + game.platform.width/2)
    }
}

window.addEventListener("load", function () {
    game.start();
})
