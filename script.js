window.addEventListener('load', function()
{
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 500;

    // Will Handle Arrow Keys //
    class InputHandler
    {
        constructor(game)
        {
            this.game = game;
            window.addEventListener('keydown', e =>
            {
                // Check If Keys Pressed 
                if (( (e.key === 'ArrowUp') ||
                      (e.key === 'ArrowDown')

                ) && this.game.keys.indexOf(e.key) === -1)
                {
                    this.game.keys.push(e.key);
                }
                else if (e.key === ' ')
                {
                    this.game.player.shootTop();
                }
            });
            window.addEventListener('keyup', e =>
            {
                // Check If Keys that we are Releasing is Present in the array
                // If it is, it will remove using splice method
                if (this.game.keys.indexOf(e.key) > -1)
                {
                    // Splice to Change Contents of an Array by Removing or Replacing Existing Elements
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    // Will Handle Player Lasers
    class Projectile
    {
        constructor(game, x, y) 
        {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;    
        }
        update()
        {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context)
        {
            context.fillStyle = 'yellow'; 
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Will Handle Falling Screws and Bolts from Damaged Enemies
    class Particle
    {

    }

    // Will Handle Player Character 
    class Player
    {
        constructor(game)
        {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
        }
        // Update Player Movement
        update()
        {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            // Handle Projectiles
            this.projectiles.forEach(projectile =>
            {
                projectile.update();
            });

            // Filter Method creates a new array with all elements that pass the test implemented by the provided function
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }
        draw(context)
        {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile =>
            {
               projectile.draw(context);
            });
        }
        // Laser come from Mouth
        shootTop()
        {
            if (this.game.ammo > 0)
            {
                this.projectiles.push(new Projectile(this.game, this.x +80, this.y +30));
                this.game.ammo--;
            }
            ;
        }
    }

    // Main Blueprint Handling Many Differen Enemy Type
    class Enemy
    {
        constructor(game)
        {   
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5; // Darah Musuh 5x Hit Laser
            this.score = this.lives;
        }

        update()
        {
            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }

        draw(context)
        {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.font = '20px Helvetica'
            context.fillText (this.lives, this.x, this.y);
        }
    }
    class Angler1 extends Enemy
    {
        constructor(game)
        {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height );
        }
    }

    // Will Handle Individual Background Layers Logic in Parallax
    class Layer
    {
        constructor(game, image, speedModifier)
        {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update()
        {
            if (this.x <= -this.width) this.x =0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context)
        {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y); // The Trick
        }
    }
    // Will Pull All Layer Object Together
    class Background
    {
        constructor(game)
        {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');

            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.3);

            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update()
        {
            this.layers.forEach(layer => layer.update());
        }
        draw(context)
        {
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    // Will Draw Score, Timer and Others Information 
    class UI
    {
        constructor(game)
        {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context)
        {
            context.save();

            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            // score
            context.fillText('Score: ' + this.game.score, 20, 40);

            // ammo
            for (let i = 0; i < this.game.ammo; i++)
            {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }

            // timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1); //.toFixed method formats a number using fiexd point notation. use define number of digits we want to appear after the decimal point.
            context.fillText('Timer: ' + formattedTime, 20, 100);

            // game over messages
            if (this.game.gameOver)
            {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore)
                {
                    message1 = 'You Win!';
                    message2 = 'Well done!';
                }
                else
                {
                    message1 = 'You Lose!';
                    message2 = 'Try again next time!';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText (message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText (message2, this.game.width * 0.5, this.game.height * 0.5 + 40);

            }
            context.restore();
        }
    }

    // All Object Will Come Togeher Here !!!
    class Game
    {
        constructor(width, height)
        {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 5000;
            this.speed = 1;
        }
        update(deltaTime)
        {
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update(); // Background will behind the player
            this.player.update();

            if (this.ammoTimer > this.ammoInterval)
            {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            }
            else 
            {
                this.ammoTimer += deltaTime;
            }
            // Check Collision Laser
            this.enemies.forEach(enemy =>
            {
                enemy.update();
                
                // If collision with player, enemy deleted
                if(this.checkCollision(this.player, enemy))
                {
                    enemy.markedForDeletion = true;
                }
                
                // If laser collission with enemy, enemy lives decrease 1
                // If lives <= 0, enemy deleted
                // If score > winning score = gameOver
                this.player.projectiles.forEach(projectile => 
                    {
                        if(this.checkCollision(projectile, enemy))
                        {
                            enemy.lives--;
                            projectile.markedForDeletion = true;
                            if (enemy.lives <= 0)
                            {
                                enemy.markedForDeletion = true;
                                if (!this.gameOver) this.score += enemy.score;
                                if (this.score > this.winningScore) this.gameOver = true;
                            }
                        }
                    })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

            if (this.enemyTimer > this.enemyInterval && !this.gameOver)
            {
                this.addEnemy();
                this.enemyTimer = 0;
            }
            else
            {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context)
        {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy =>
            {
                enemy.draw(context);
            });
            this.background.layer4.draw(context); // Background will behind the players
        }
        addEnemy()
        {
            this.enemies.push(new Angler1(this));
            console.log(this.enemies);
        }
        checkCollision(rect1,rect2)
        {
            return( rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.height + rect1.y > rect2.y )
        }
    }
    
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    // Animation Loop
    function animate(timestamp)
    {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate); 
    }
    animate(0);
});