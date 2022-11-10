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

    // Will Handle Individual Background Layers in Parallax
    class Layer
    {

    }
    // Will Pull All Layer Object Together
    class Background
    {

    }

    // Will Draw Score, Timer and Others Information 
    class UI
    {
        constructor(game)
        {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'yellow';
        }
        draw(context)
        {
            // ammo
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++)
            {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
        }
    }

    // All Object Will Come Togeher Here !!!
    class Game
    {
        constructor(width, height)
        {
            this.width = width;
            this.height = height;
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
        }
        update(deltaTime)
        {
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
            this.enemies.forEach(enemy =>
            {
                enemy.update();
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
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy =>
            {
                enemy.draw(context);
            });
        }
        addEnemy()
        {
            this.enemies.push(new Angler1(this));
            console.log(this.enemies);
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