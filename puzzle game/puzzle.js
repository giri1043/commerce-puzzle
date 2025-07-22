        // Game State   
                 let gameState = {
            score: 0,
            coins: 100,
            level: 1,
            wordsFound: 0,
            timeLeft: 60,
            multiplier: 1,
            currentLetters: [],
            currentScrambledWord: '',
            usedLetters: [],
            foundWords: new Set(),
            achievements: {
                firstWord: false,
                richPlayer: false,
                speedDemon: false,
                perfectRound: false
            },
            timer: null,
            isSpinning: false
        };

        // Commerce-related words database
        const commerceWords = [
            'MARKET', 'TRADE', 'PROFIT', 'SALES', 'BUYER', 'SELLER', 'PRICE',
            'GOODS', 'STORE', 'SHOP', 'CASH', 'MONEY', 'BANK', 'LOAN',
            'CREDIT', 'DEBIT', 'INVOICE', 'RECEIPT', 'ORDER', 'SUPPLY',
            'DEMAND', 'RETAIL', 'WHOLESALE', 'VENDOR', 'CLIENT', 'CUSTOMER',
            'BUSINESS', 'COMPANY', 'BRAND', 'PRODUCT', 'SERVICE', 'EXPORT',
            'IMPORT', 'BUDGET', 'REVENUE', 'EXPENSE', 'DISCOUNT', 'COUPON',
            'DEAL', 'BARGAIN', 'AUCTION', 'BID', 'STOCK', 'SHARES',
            'INVESTMENT', 'CAPITAL', 'ASSET', 'LIABILITY', 'EQUITY', 'MERGER'
        ];

        // Initialize game
        function initGame() {
            updateDisplay();
            newWord();
            startTimer();
        }

        function updateDisplay() {
            document.getElementById('score').textContent = gameState.score.toLocaleString();
            document.getElementById('coins').textContent = gameState.coins.toLocaleString();
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('wordsFound').textContent = gameState.wordsFound;
            document.getElementById('timer').textContent = gameState.timeLeft;
            
            // Update multiplier display
            const multiplierEl = document.getElementById('multiplier');
            if (gameState.multiplier > 1) {
                multiplierEl.style.display = 'block';
                multiplierEl.textContent = `${gameState.multiplier}x BONUS!`;
            } else {
                multiplierEl.style.display = 'none';
            }
        }

        function newWord() {
            const word = commerceWords[Math.floor(Math.random() * commerceWords.length)];
            gameState.currentScrambledWord = word;
            gameState.currentLetters = word.split('');
            gameState.usedLetters = [];
            
            // Scramble the word
            for (let i = gameState.currentLetters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gameState.currentLetters[i], gameState.currentLetters[j]] = 
                [gameState.currentLetters[j], gameState.currentLetters[i]];
            }
            
            displayWord();
            createLetterGrid();
            document.getElementById('currentWord').value = '';
        }

        function displayWord() {
            document.getElementById('scrambledWord').textContent = gameState.currentLetters.join(' ');
        }

        function createLetterGrid() {
            const grid = document.getElementById('letterGrid');
            grid.innerHTML = '';
            
            gameState.currentLetters.forEach((letter, index) => {
                const btn = document.createElement('button');
                btn.className = 'letter-btn';
                btn.textContent = letter;
                btn.onclick = () => selectLetter(index);
                btn.id = `letter-${index}`;
                grid.appendChild(btn);
            });
        }

        function selectLetter(index) {
            if (gameState.usedLetters.includes(index)) return;
            
            const currentInput = document.getElementById('currentWord');
            currentInput.value += gameState.currentLetters[index];
            gameState.usedLetters.push(index);
            
            document.getElementById(`letter-${index}`).classList.add('used');
        }

        function submitWord() {
            const word = document.getElementById('currentWord').value.toUpperCase();
            if (word.length < 3) {
                showNotification('Word must be at least 3 letters long!', 'error');
                return;
            }

            // Check if it's a valid commerce word or the original word
            let isValid = false;
            let points = 0;

            if (word === gameState.currentScrambledWord) {
                isValid = true;
                points = word.length * 10 * gameState.multiplier;
                showNotification(`Perfect! +${points} points!`, 'success');
            } else if (commerceWords.includes(word)) {
                isValid = true;
                points = word.length * 5 * gameState.multiplier;
                showNotification(`Great word! +${points} points!`, 'success');
            } else if (isValidWord(word)) {
                isValid = true;
                points = word.length * 2 * gameState.multiplier;
                showNotification(`Nice! +${points} points!`, 'success');
            }

            if (isValid && !gameState.foundWords.has(word)) {
                gameState.foundWords.add(word);
                gameState.score += points;
                gameState.coins += Math.floor(points / 10);
                gameState.wordsFound++;
                
                // Add to found words display
                const foundWordsEl = document.getElementById('foundWords');
                const wordSpan = document.createElement('span');
                wordSpan.className = 'found-word';
                wordSpan.textContent = word;
                foundWordsEl.appendChild(wordSpan);
                
                checkAchievements();
                updateDisplay();
                
                // Reset multiplier after use
                if (gameState.multiplier > 1) {
                    gameState.multiplier = 1;
                }
                
                // Level up logic
                if (gameState.wordsFound % 5 === 0) {
                    levelUp();
                }
                
                resetCurrentWord();
            } else if (gameState.foundWords.has(word)) {
                showNotification('Word already found!', 'warning');
            } else {
                showNotification('Invalid word! Try again.', 'error');
                resetCurrentWord();
            }
        }

        function isValidWord(word) {
            // Simple validation - check if word uses only available letters
            const availableLetters = [...gameState.currentLetters];
            for (let char of word) {
                const index = availableLetters.indexOf(char);
                if (index === -1) return false;
                availableLetters.splice(index, 1);
            }
            return true;
        }

        function resetCurrentWord() {
            document.getElementById('currentWord').value = '';
            gameState.usedLetters = [];
            document.querySelectorAll('.letter-btn').forEach(btn => {
                btn.classList.remove('used');
            });
        }

        function shuffleLetters() {
            if (gameState.coins < 10) {
                showNotification('Not enough coins!', 'error');
                return;
            }
            
            gameState.coins -= 10;
            
            // Shuffle unused letters
            const unusedIndices = [];
            gameState.currentLetters.forEach((letter, index) => {
                if (!gameState.usedLetters.includes(index)) {
                    unusedIndices.push(index);
                }
            });
            
            for (let i = unusedIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const indexA = unusedIndices[i];
                const indexB = unusedIndices[j];
                [gameState.currentLetters[indexA], gameState.currentLetters[indexB]] = 
                [gameState.currentLetters[indexB], gameState.currentLetters[indexA]];
            }
            
            displayWord();
            createLetterGrid();
            updateDisplay();
            showNotification('Letters shuffled!', 'info');
        }

        function getHint() {
            if (gameState.coins < 20) {
                showNotification('Not enough coins!', 'error');
                return;
            }
            
            gameState.coins -= 20;
            const word = gameState.currentScrambledWord;
            const currentInput = document.getElementById('currentWord').value;
            
            if (currentInput.length < word.length) {
                const nextLetter = word[currentInput.length];
                showNotification(`Next letter: ${nextLetter}`, 'info');
            } else {
                showNotification('Word is complete!', 'info');
            }
            
            updateDisplay();
        }

        function spinWheel() {
            if (gameState.coins < 50 || gameState.isSpinning) return;
            
            gameState.coins -= 50;
            gameState.isSpinning = true;
            
            const wheel = document.getElementById('spinWheel');
            const spinBtn = document.getElementById('spinBtn');
            
            wheel.classList.add('spinning');
            spinBtn.disabled = true;
            spinBtn.textContent = 'Spinning...';
            
            setTimeout(() => {
                wheel.classList.remove('spinning');
                spinBtn.disabled = false;
                spinBtn.textContent = 'Spin! (50 coins)';
                gameState.isSpinning = false;
                
                // Determine reward
                const rewards = [
                    { type: 'coins', value: 100, message: 'Won 100 coins!' },
                    { type: 'coins', value: 200, message: 'Won 200 coins!' },
                    { type: 'multiplier', value: 2, message: '2x Score Multiplier!' },
                    { type: 'coins', value: 50, message: 'Won 50 coins!' },
                    { type: 'time', value: 15, message: '+15 seconds!' },
                    { type: 'coins', value: 300, message: 'JACKPOT! 300 coins!' }
                ];
                
                const reward = rewards[Math.floor(Math.random() * rewards.length)];
                
                if (reward.type === 'coins') {
                    gameState.coins += reward.value;
                } else if (reward.type === 'multiplier') {
                    gameState.multiplier = reward.value;
                } else if (reward.type === 'time') {
                    gameState.timeLeft += reward.value;
                }
                
                showNotification(reward.message, 'success');
                updateDisplay();
            }, 3000);
            
            updateDisplay();
        }

        function buyPowerUp(type) {
            let cost = 0;
            let canBuy = false;
            
            switch (type) {
                case 'time':
                    cost = 75;
                    if (gameState.coins >= cost) {
                        gameState.coins -= cost;
                        gameState.timeLeft += 30;
                        showNotification('+30 seconds added!', 'success');
                        canBuy = true;
                    }
                    break;
                    
                case 'multiplier':
                    cost = 100;
                    if (gameState.coins >= cost) {
                        gameState.coins -= cost;
                        gameState.multiplier = 2;
                        showNotification('2x score multiplier activated!', 'success');
                        canBuy = true;
                    }
                    break;
                    
                case 'reveal':
                    cost = 60;
                    if (gameState.coins >= cost) {
                        gameState.coins -= cost;
                        revealNextLetter();
                        showNotification('Letter revealed!', 'success');
                        canBuy = true;
                    }
                    break;
                    
                case 'solve':
                    cost = 150;
                    if (gameState.coins >= cost) {
                        gameState.coins -= cost;
                        autoSolveWord();
                        showNotification('Word auto-solved!', 'success');
                        canBuy = true;
                    }
                    break;
            }
            
            if (!canBuy) {
                showNotification('Not enough coins!', 'error');
            } else {
                updateDisplay();
            }
        }

        function revealNextLetter() {
            const word = gameState.currentScrambledWord;
            const currentInput = document.getElementById('currentWord').value;
            
            if (currentInput.length < word.length) {
                const nextLetter = word[currentInput.length];
                
                // Find the letter in available letters
                for (let i = 0; i < gameState.currentLetters.length; i++) {
                    if (gameState.currentLetters[i] === nextLetter && !gameState.usedLetters.includes(i)) {
                        selectLetter(i);
                        break;
                    }
                }
            }
        }

        function autoSolveWord() {
            document.getElementById('currentWord').value = gameState.currentScrambledWord;
            // Mark all letters as used
            gameState.usedLetters = [...Array(gameState.currentLetters.length).keys()];
            document.querySelectorAll('.letter-btn').forEach(btn => {
                btn.classList.add('used');
            });
            
            // Auto-submit after a short delay
            setTimeout(() => {
                submitWord();
            }, 500);
        }

        function startTimer() {
            gameState.timer = setInterval(() => {
                gameState.timeLeft--;
                updateDisplay();
                
                if (gameState.timeLeft <= 0) {
                    endGame();
                }
            }, 1000);
        }

        function endGame() {
            clearInterval(gameState.timer);
            
            const finalScore = gameState.score;
            const wordsFound = gameState.wordsFound;
            
            // Show game over notification
            showNotification(`Game Over! Score: ${finalScore.toLocaleString()}, Words: ${wordsFound}`, 'info');
            
            // Reset game after 3 seconds
            setTimeout(() => {
                resetGame();
            }, 3000);
        }

        function resetGame() {
            gameState.score = 0;
            gameState.wordsFound = 0;
            gameState.timeLeft = 60;
            gameState.multiplier = 1;
            gameState.foundWords = new Set();
            
            document.getElementById('foundWords').innerHTML = '';
            
            updateDisplay();
            newWord();
            startTimer();
        }

        function levelUp() {
            gameState.level++;
            gameState.timeLeft += 30; // Bonus time for leveling up
            gameState.coins += 50;    // Bonus coins
            
            showNotification(`Level Up! Level ${gameState.level} - Bonus: +30s, +50 coins!`, 'success');
        }

        function checkAchievements() {
            // First Word Achievement
            if (!gameState.achievements.firstWord && gameState.wordsFound >= 1) {
                gameState.achievements.firstWord = true;
                document.getElementById('achievement1').classList.add('unlocked');
                showNotification('🥉 Achievement Unlocked: First Word!', 'achievement');
                gameState.coins += 25;
            }
            
            // Rich Player Achievement
            if (!gameState.achievements.richPlayer && gameState.coins >= 500) {
                gameState.achievements.richPlayer = true;
                document.getElementById('achievement2').classList.add('unlocked');
                showNotification('💰 Achievement Unlocked: Rich Player!', 'achievement');
                gameState.coins += 100;
            }
            
            // Speed Demon Achievement
            if (!gameState.achievements.speedDemon && gameState.wordsFound >= 10 && gameState.timeLeft > 0) {
                gameState.achievements.speedDemon = true;
                document.getElementById('achievement3').classList.add('unlocked');
                showNotification('🚀 Achievement Unlocked: Speed Demon!', 'achievement');
                gameState.coins += 150;
            }
        }

        function showNotification(message, type = 'info') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            
            // Set color based on type
            switch (type) {
                case 'success':
                    notification.style.background = 'linear-gradient(145deg, #56cc9d, #6fcf97)';
                    break;
                case 'error':
                    notification.style.background = 'linear-gradient(145deg, #ff6b6b, #ee5a52)';
                    break;
                case 'warning':
                    notification.style.background = 'linear-gradient(145deg, #ffa726, #ff7043)';
                    break;
                case 'achievement':
                    notification.style.background = 'linear-gradient(145deg, #FFD700, #FFA500)';
                    break;
                default:
                    notification.style.background = 'linear-gradient(145deg, #667eea, #764ba2)';
            }
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                submitWord();
            } else if (e.key === 'Escape') {
                resetCurrentWord();
            }
        });

        // Prevent form submission on Enter
        document.getElementById('currentWord').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitWord();
            }
        });

        // Auto-focus input
        document.getElementById('currentWord').focus();

        // Initialize game when page loads
        window.addEventListener('load', initGame);

        // Additional game mechanics
        function addSpecialEffects() {
            // Add particle effects for achievements
            function createParticles(x, y) {
                for (let i = 0; i < 10; i++) {
                    const particle = document.createElement('div');
                    particle.style.position = 'fixed';
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.width = '6px';
                    particle.style.height = '6px';
                    particle.style.backgroundColor = '#FFD700';
                    particle.style.borderRadius = '50%';
                    particle.style.pointerEvents = 'none';
                    particle.style.zIndex = '9999';
                    document.body.appendChild(particle);
                    
                    const angle = (Math.PI * 2 * i) / 10;
                    const velocity = 2 + Math.random() * 2;
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity;
                    
                    let px = x;
                    let py = y;
                    let opacity = 1;
                    
                    function animate() {
                        px += vx;
                        py += vy;
                        opacity -= 0.02;
                        
                        particle.style.left = px + 'px';
                        particle.style.top = py + 'px';
                        particle.style.opacity = opacity;
                        
                        if (opacity > 0) {
                            requestAnimationFrame(animate);
                        } else {
                            document.body.removeChild(particle);
                        }
                    }
                    
                    animate();
                }
            }
            
            // Trigger particles on score increase
            const originalSubmitWord = submitWord;
            submitWord = function() {
                const oldScore = gameState.score;
                originalSubmitWord();
                if (gameState.score > oldScore) {
                    const scoreEl = document.getElementById('score');
                    const rect = scoreEl.getBoundingClientRect();
                    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
            };
        }

        // Daily challenges system
        function getDailyChallenge() {
            const today = new Date().toDateString();
            const challenges = [
                { description: "Find 15 words", target: 15, reward: 200 },
                { description: "Earn 1000 points", target: 1000, reward: 150 },
                { description: "Use 5 power-ups", target: 5, reward: 100 },
                { description: "Reach level 3", target: 3, reward: 250 }
            ];
            
            const challengeIndex = new Date().getDate() % challenges.length;
            return challenges[challengeIndex];
        }

        // Save game state to localStorage (if available)
        function saveGame() {
            try {
                const saveData = {
                    highScore: Math.max(gameState.score, parseInt(localStorage.getItem('commerceWordPuzzle_highScore') || '0')),
                    totalCoins: gameState.coins,
                    achievements: gameState.achievements
                };
                localStorage.setItem('commerceWordPuzzle_save', JSON.stringify(saveData));
            } catch (e) {
                // localStorage not available
            }
        }

        function loadGame() {
            try {
                const saveData = JSON.parse(localStorage.getItem('commerceWordPuzzle_save') || '{}');
                if (saveData.totalCoins) {
                    gameState.coins = Math.max(gameState.coins, saveData.totalCoins);
                }
                if (saveData.achievements) {
                    Object.assign(gameState.achievements, saveData.achievements);
                }
            } catch (e) {
                // localStorage not available or corrupted
            }
        }

        // Initialize special effects
        addSpecialEffects();
        
        // Auto-save every 30 seconds
        setInterval(saveGame, 30000);

        // Load saved data on start
        loadGame();