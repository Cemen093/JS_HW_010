var game = {
    width: 1200,
    height: 700,
    context: undefined,
    background: undefined,
    platform: undefined,
    ball: undefined,
    mouse: undefined,
    isRunning: true,
    isBallReleased: false,
    result: undefined,
    score: 0,
    blocks: undefined,
    init: function (){
        const canvas = document.getElementById("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");

        /*window.addEventListener("keydown", function (e) {
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
        })*/
    },
    load: function () {
        this.background = new Image();
        this.background.src = "img/background.png";
    },
    create: function () {
        this.platform = create_platform(game);
        console.log("platform created");
        this.ball = create_ball(game);
        console.log("ball created");
        this.blocks = create_block(game);
        console.log("blocks created");
        this.mouse = create_mouse(game);
        console.log("mouse created");
    },
    start: function () {
        console.log("**start**")
        console.log("--init--");
        this.init();
        console.log("--load--")
        this.load();
        console.log("--create--");
        this.create();
        console.log("--run--");
        this.run();
    },
    update: function () {
        if (this.blocks.isNewLineCanBeCreated()){
            this.blocks.createNewLine();
        }

        if (this.mouse.onThePlatform()){
            this.platform.stop()
        } else {
            if (this.mouse.onTheLeftSideOfPlatform()){
                this.platform.dx = -this.platform.velocity;
            } else {
                this.platform.dx = this.platform.velocity;
            }
        }

        if (this.isRunning && this.isBallReleased){
            this.blocks.move();
        }

        if (this.platform.dx){
            this.platform.move();
        }

        if (this.ball.dx || this.ball.dy){
            this.ball.move();
        }

        if (this.ball.collide(this.platform)){
            this.ball.bumpPlatform(this.platform);
        }

        this.ball.bumpBlocksIfCollide();

        if (this.score >= this.blocks.getCount()) {
            this.isRunning = false;
            this.result = "You Win";
        }

        this.ball.checkBounds();
        this.platform.checkBounds();
        this.blocks.checkBounds();
    },
    render: function () {
        this.context.clearRect(0,0, this.width, this.height);

        this.context.drawImage(this.background, 0, 0);

        if (this.isRunning){
            this.context.drawImage(this.platform.sprite, this.platform.x, this.platform.y, this.platform.width, this.platform.height);
            this.context.drawImage(this.ball.sprite, this.ball.x, this.ball.y, this.ball.width, this.ball.height);

            let i = 1;
            for (let block of this.blocks.getBlocks()){
                if (block.isAlive){
                    this.context.drawImage(block.sprite, block.x, block.y, block.width, block.height);
                }
            }
        }
    },
    run: function () {
        this.update();
        this.render();

        if (this.isRunning){
            window.requestAnimationFrame(function () {
                game.run();
            });
        } else{
            setTimeout(this.over, 0);
        }
    },
    over: function (){
        alert(game.result + "\nВаш счет - " + game.score);
/*        deleteCookie("topFive");*/

        let topFive = getCookie("topFive", true);
        let topLength = 0;
        if (topFive === undefined){
            let name = prompt("Введите имя: ");
            topFive = {1: {name: name, score: game.score}};
            setCookie("topFive", topFive);
            topLength = 1;
        } else {
            topLength = Object.keys(topFive).length;
            //определим входит ли наш результать в топ 5 и на какое место
            let place = topLength + 1;
            for (let i = topLength; i > 0; i--){
                if (game.score > topFive[i].score){
                    place = i;
                }
            }
            //Если место меньше шестого запишем
            if (place < 6){
                let name = prompt("Введите имя: ");
                if (topLength < 5){
                    topFive[topLength + 1] = topFive[topLength];
                }
                for (let i = topLength; i > place; i--) {
                    topFive[i] = topFive[i-1];
                }
                topFive[place] = {name: name, score: game.score};
                if (topLength < 5){
                    topLength++;
                }
                setCookie("topFive", topFive);
            }
        }

        let message = "Top Five";
        for (let i = 1; i <= topLength; i++) {
            message += "\n" + topFive[i].name + " = " + topFive[i].score
        }
        alert(message);
        window.location.reload();
    }
};

let create_block = function (game) {
    let blocks = [];
    let rows = 3;
    let cols = 4;

    let widthBlock = game.width / 6;
    let heightBlock = game.height / 10;
    let indent_width_one = game.width / 20;
    let indent_width_two = (game.width-indent_width_one * 2 -widthBlock * cols) / (cols - 1);
    let indent_height_one = heightBlock / 2;
    let indent_height_two = game.height / 2;
    let indent_height_three = (game.height - indent_height_one - indent_height_two - heightBlock * rows) / (rows - 1);

    let addNewRow = function (row, randomSprite=false) {
        for (let col = 0; col < cols; col++){

            let sprite = new Image();
            sprite.src = "img/tile/block_" + (randomSprite ? Math.floor(Math.random() * 12 + 1) : (row * rows + col + 1)) + ".png";
            blocks.push({
                x: indent_width_one + widthBlock*col + indent_width_two*col,
                y: indent_height_one + heightBlock*row + indent_height_three*row,
                width: widthBlock,
                height: heightBlock,
                sprite: sprite,
                velocity: 0.3,
                dx: 0,
                dy: 0,
                isAlive: true,
                move: function () {
                    this.x += this.dx;
                    this.y += this.dy;
                },
                setAcceleration: function () {
                    this.dx = 0;
                    this.dy = this.velocity;
                },
                checkBounds: function () {
                    let x = this.x + this.dx;
                    let y = this.y + this.dy;

                    if (this.isAlive && y + this.height > game.height) {
                        game.isRunning = false;
                        game.result = "You Lose";
                    }
                },
            })
        }
    }

    for (let row = rows - 1; row > -1; row--) {
        addNewRow(row);
    }
    return {
        blocks: blocks,
        getBlocks: function () {
            return this.blocks;
        },
        getCount: function () {
            return this.blocks.length;
        },
        move: function () {
            for (let block of this.blocks){
                block.move();
            }
        },
        checkBounds: function () {
            for (let block of this.blocks){
                block.checkBounds();
            }
        },
        setAcceleration: function () {
            for (let block of this.blocks){
                block.setAcceleration();
            }
        },
        isNewLineCanBeCreated: function () {
/*            console.log(this.blocks[rows*cols-1]);
            console.log(this.blocks[rows*cols-1].y);*/
            return this.blocks[rows*cols-1].y > indent_height_one + heightBlock + indent_height_three;
        },
        createNewLine: function () {
            addNewRow(0, true);
            this.setAcceleration();
            rows++;
        }
    };
}

let create_ball = function (game) {
    let sprite = new Image();
    sprite.src = "img/ball.png";
    let ball = {
        x: game.width / 2 - 25,
        y: game.height - 200,
        width: 50,
        height: 50,
        sprite: sprite,
        velocity: 6,
        dx: 0,
        dy: 0,
        jump: function () {
            this.dx = Math.random() > 0.5 ? this.velocity : -this.velocity;
            this.dy = -this.velocity;
        },
        move: function () {
            this.x += this.dx;
            this.y += this.dy;
        },
        collide: function (element) {
            let x = this.x + this.dx;
            let y = this.y + this.dy;

            if (x + this.width > element.x &&
                x < element.x + element.width &&
                y + this.height > element.y &&
                y < element.y + element.height) {
                return true;
            }
            return false;
        },
        isSideCollide: function (element) {
            let x = this.x + this.dx;
            let y = this.y;

            if (x + this.width > element.x &&
                x < element.x + element.width &&
                y + this.height > element.y &&
                y < element.y + element.height) {
                return true;
            }
            return false;
        },
        bumpBlock: function (block) {
            if (this.isSideCollide(block)){
                this.dx *= -1;
            } else {
                this.dy *= -1;
            }

            block.isAlive = false;
            ++game.score;
        },
        bumpBlocksIfCollide: function () {
            for (let block of game.blocks.getBlocks()){
                if (block.isAlive){
                    if (game.ball.collide(block)){
                        game.ball.bumpBlock(block);
                    }
                }
            }
        },
        onTheRightSide: function (platform) {
            return this.x + this.width / 2 > platform.x + (platform.width * 0.7);
        },
        onTheLeftSide: function (platform) {
            return this.x + this.width / 2 < platform.x + (platform.width * 0.3);
        },
        bumpPlatform: function (platform) {
            this.dy = Math.abs(this.dy) * -1;
            if (this.onTheRightSide(platform)){
                this.dx = Math.abs(this.dx);
            } else if (this.onTheLeftSide(platform)){
                this.dx = -Math.abs(this.dx)
            }

            this.dx *= Math.abs(platform.x + platform.width / 2 - this.x + this.width / 2) / (platform.width / 2) / 5 + 0.9;
        },
        checkBounds: function () {
            let x = this.x + this.dx;
            let y = this.y + this.dy;

            if (x < 0) {
                this.x = 0;
                this.dx = Math.abs(this.dx);
            } else if (x + this.width > game.width) {
                this.x = game.width - this.width;
                this.dx = -Math.abs(this.dx);
            } else if (y < 0) {
                this.y = 0;
                this.dy = Math.abs(this.dy);
            } else if (y + this.height > game.height) {
                game.isRunning = false;
                game.result = "You Lose";
            }
        }
    }
    if (game.platform){
        game.platform.ball = ball;
    }
    return ball;
}

let create_platform = function (game) {
    let sprite = new Image();
    sprite.src = "/img/platform.png";
    let platform = {
        x: game.width/2-120,
        y: game.height - game.height/25 - 50,
        width:240,
        height: 50,
        sprite: sprite,
        velocity: 13,
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
        },
        checkBounds: function () {
            let x = this.x + this.dx;

            if (x < 0 || x + this.width > game.width) {
                this.stop();
            }
        }
    }
    return platform;
}

let create_mouse = function (game) {
    let mouse = {
        x: game.width/2,
        y: 0,
        onTheLeftSideOfPlatform: function () {
            return game.mouse.x < game.platform.x + game.platform.width/2;
        },
        onThePlatform: function () {
            return game.mouse.x < game.platform.x + game.platform.width/2+game.platform.velocity &&
                game.mouse.x > game.platform.x + game.platform.width/2-game.platform.velocity;
        },
        mouse_down: function (event) {
            event.preventDefault();
            if (!game.isBallReleased){
                game.platform.releaseBall();
                game.blocks.setAcceleration();
                game.isBallReleased = true;
            }
        },
        mouse_move: function (event){
            event.preventDefault();
            let canvas_offsets = canvas.getBoundingClientRect();
            game.mouse.x = parseInt(event.clientX) - canvas_offsets.left;
            game.mouse.y = parseInt(event.clientY) - canvas_offsets.top;
        }
    }
    canvas.onmousedown = mouse.mouse_down;
    canvas.onmousemove = mouse.mouse_move;
    return mouse;
}

window.addEventListener("load", function () {
    game.start();
})
