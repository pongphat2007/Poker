// คลาสสำหรับการจัดการเกมโป๊กเกอร์ Texas Hold'em ระดับยาก
class TexasHoldemGame {
    constructor() {
        this.players = [
            { 
                id: 'player-user', 
                name: 'คุณ', 
                isAI: false, 
                cards: [], 
                handRank: '', 
                chips: 1500, 
                status: 'waiting', 
                isDealer: false, 
                isSmallBlind: false, 
                isBigBlind: false, 
                isFolded: false, 
                currentBet: 0, 
                isEliminated: false 
            },
            { 
                id: 'player1', 
                name: 'AI 1', 
                isAI: true, 
                cards: [], 
                handRank: '', 
                chips: 1500, 
                status: 'waiting', 
                isDealer: false, 
                isSmallBlind: false, 
                isBigBlind: false, 
                isFolded: false, 
                currentBet: 0, 
                isEliminated: false, 
                personality: 'aggressive' 
            },
            { 
                id: 'player2', 
                name: 'AI 2', 
                isAI: true, 
                cards: [], 
                handRank: '', 
                chips: 1500, 
                status: 'waiting', 
                isDealer: false, 
                isSmallBlind: false, 
                isBigBlind: false, 
                isFolded: false, 
                currentBet: 0, 
                isEliminated: false, 
                personality: 'conservative' 
            },
            { 
                id: 'player3', 
                name: 'AI 3', 
                isAI: true, 
                cards: [], 
                handRank: '', 
                chips: 1500, 
                status: 'waiting', 
                isDealer: false, 
                isSmallBlind: false, 
                isBigBlind: false, 
                isFolded: false, 
                currentBet: 0, 
                isEliminated: false, 
                personality: 'balanced' 
            }
        ];
        this.deck = [];
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.dealerIndex = 0;
        this.currentPlayerIndex = 0;
        this.bettingRoundComplete = false;
        this.gamePhase = 'preflop';
        this.gameStarted = false;
        this.gameOver = false;
        this.roundCompleted = false;
        this.showAICards = false;
        
        // ⭐️ เพิ่ม flag สำหรับป้องกันปัญหาการเบิ้ล
        this.isStartingGame = false;
        this.isProcessingTurn = false;
        this.isDealingCards = false;
        this.aiDecisionTimeout = null;
        
        this.initializeEventListeners();
        this.initializeDeck();
        console.log('Texas Holdem Game initialized - Anti-Bug Mode');
        
        this.checkRequiredElements();
    }
    
    checkRequiredElements() {
        const requiredElements = [
            'community-cards',
            'player-user', 'player1', 'player2', 'player3',
            'pot-amount', 'current-bet', 'dealer-name', 'game-phase',
            'log-entries'
        ];
        
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                console.error('ไม่พบ element ที่ต้องการ:', id);
            }
        });
    }
    
    initializeDeck() {
        const suits = ['♥', '♦', '♣', '♠'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        this.deck = [];
        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({ 
                    value: value, 
                    suit: suit 
                });
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    // ⭐️ แก้ไข: ป้องกันการเบิ้ลในการเริ่มเกม
    startGame() {
        console.log('🔧 startGame called - isStartingGame:', this.isStartingGame);
        
        if (this.isStartingGame) {
            console.log('🚫 Blocked: กำลังเริ่มเกมอยู่แล้ว');
            return;
        }
        
        if (this.gameStarted && !this.roundCompleted) {
            console.log('🚫 Blocked: เกมกำลังดำเนินอยู่');
            return;
        }
        
        this.isStartingGame = true;
        console.log('🎮 Starting game...');
        
        try {
            this.resetRound();
            this.shuffleDeck();
            this.determineDealer();
            
            const gameEnded = this.eliminateBrokePlayers();
            if (gameEnded) {
                console.log('เกมจบแล้ว ไม่เริ่มตาใหม่');
                this.isStartingGame = false;
                return;
            }
            
            this.players.forEach(player => {
                this.updatePlayerCards(player);
            });
            
            const activePlayers = this.players.filter(player => !player.isEliminated);
            if (activePlayers.length < 2) {
                console.log('ผู้เล่นไม่พอ 2 คน ไม่สามารถเริ่มเกมได้');
                this.isStartingGame = false;
                return;
            }
            
            this.postBlinds();
            this.dealHoleCards();
            this.gameStarted = true;
            this.gameOver = false;
            this.roundCompleted = false;
            this.showAICards = false;
            
            this.updateUI();
            
            // ⭐️ ปิดปุ่มชั่วคราวเพื่อป้องกันการคลิกซ้ำ
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.disabled = true;
            
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) continueBtn.style.display = 'none';
            
            this.addLogEntry('เริ่มเกมใหม่! เจ้ามือ: ' + this.players[this.dealerIndex].name);
            
            // ⭐️ ใช้ delay ที่แน่นอน
            setTimeout(() => {
                this.startBettingRound();
                this.isStartingGame = false;
                console.log('✅ Game started successfully');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error in startGame:', error);
            this.isStartingGame = false;
            
            // ⭐️ เปิดปุ่มใหม่ถ้ามี error
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.disabled = false;
        }
    }

    continueGame() {
        if (!this.roundCompleted) return;
        this.startGame();
    }
    
    determineDealer() {
        const activePlayers = this.players.filter(player => !player.isEliminated);
        if (activePlayers.length < 2) return;
        
        let nextDealerIndex = (this.dealerIndex + 1) % 4;
        let attempts = 0;
        
        while (this.players[nextDealerIndex].isEliminated && attempts < 4) {
            nextDealerIndex = (nextDealerIndex + 1) % 4;
            attempts++;
        }
        
        if (this.players[nextDealerIndex].isEliminated) return;
        
        this.dealerIndex = nextDealerIndex;
        
        this.players.forEach((player, index) => {
            player.isDealer = (index === this.dealerIndex);
            player.isSmallBlind = false;
            player.isBigBlind = false;
        });
        
        const smallBlindIndex = this.findNextActivePlayer(this.dealerIndex);
        const bigBlindIndex = this.findNextActivePlayer(smallBlindIndex);
        
        if (!this.players[smallBlindIndex].isEliminated && !this.players[bigBlindIndex].isEliminated) {
            this.players[smallBlindIndex].isSmallBlind = true;
            this.players[bigBlindIndex].isBigBlind = true;
            this.updateDealerIndicators();
        }
    }
    
    findNextActivePlayer(startIndex) {
        let nextIndex = (startIndex + 1) % 4;
        let attempts = 0;
        
        while (this.players[nextIndex].isEliminated && attempts < 4) {
            nextIndex = (nextIndex + 1) % 4;
            attempts++;
        }
        
        return nextIndex;
    }
    
    updateDealerIndicators() {
        document.querySelectorAll('.dealer-indicator').forEach(indicator => {
            indicator.style.display = 'none';
        });
        
        const dealerPlayer = this.players[this.dealerIndex];
        if (!dealerPlayer.isEliminated) {
            const dealerId = dealerPlayer.id === 'player-user' ? '-user' : dealerPlayer.id.slice(-1);
            const dealerElement = document.getElementById(`dealer${dealerId}`);
            if (dealerElement) {
                dealerElement.style.display = 'inline-block';
            }
        }
    }
    
    postBlinds() {
        const smallBlindIndex = this.findNextActivePlayer(this.dealerIndex);
        const bigBlindIndex = this.findNextActivePlayer(smallBlindIndex);
        
        const smallBlindPlayer = this.players[smallBlindIndex];
        const bigBlindPlayer = this.players[bigBlindIndex];
        
        const smallBlindAmount = 10;
        const bigBlindAmount = 20;
        
        if (!smallBlindPlayer.isEliminated) {
            if (smallBlindPlayer.chips >= smallBlindAmount) {
                smallBlindPlayer.chips -= smallBlindAmount;
                smallBlindPlayer.currentBet = smallBlindAmount;
                this.pot += smallBlindAmount;
                this.addLogEntry(smallBlindPlayer.name + ' โพสต์ Small Blind: ' + smallBlindAmount);
            } else {
                const amount = smallBlindPlayer.chips;
                smallBlindPlayer.chips = 0;
                smallBlindPlayer.currentBet = amount;
                this.pot += amount;
                this.addLogEntry(smallBlindPlayer.name + ' โพสต์ Small Blind: ' + amount + ' (All-in!)');
            }
        }
        
        if (!bigBlindPlayer.isEliminated) {
            if (bigBlindPlayer.chips >= bigBlindAmount) {
                bigBlindPlayer.chips -= bigBlindAmount;
                bigBlindPlayer.currentBet = bigBlindAmount;
                this.pot += bigBlindAmount;
                this.currentBet = bigBlindAmount;
                this.addLogEntry(bigBlindPlayer.name + ' โพสต์ Big Blind: ' + bigBlindAmount);
            } else {
                const amount = bigBlindPlayer.chips;
                bigBlindPlayer.chips = 0;
                bigBlindPlayer.currentBet = amount;
                this.pot += amount;
                this.currentBet = amount;
                this.addLogEntry(bigBlindPlayer.name + ' โพสต์ Big Blind: ' + amount + ' (All-in!)');
            }
        }
        
        this.updateUI();
    }
    
    // ⭐️ แก้ไข: ป้องกันการแจกไพ่ซ้ำ
    dealHoleCards() {
        if (this.isDealingCards) {
            console.log('🚫 Blocked: กำลังแจกไพ่อยู่แล้ว');
            return;
        }
        
        this.isDealingCards = true;
        this.addLogEntry('กำลังแจกไพ่ส่วนตัว...');
        
        const activePlayers = this.players.filter(player => !player.isEliminated);
        let playersDealt = 0;
        
        activePlayers.forEach((player, index) => {
            setTimeout(() => {
                if (this.deck.length < 2) {
                    this.initializeDeck();
                    this.shuffleDeck();
                }
                
                player.cards = [this.deck.pop(), this.deck.pop()];
                player.isFolded = false;
                this.updatePlayerCards(player);
                
                playersDealt++;
                if (playersDealt === activePlayers.length) {
                    this.addLogEntry('แจกไพ่ส่วนตัวเรียบร้อยแล้ว');
                    this.isDealingCards = false;
                }
            }, index * 800);
        });
    }
    
    updatePlayerCards(player) {
        const cardsContainer = document.querySelector(`#${player.id} .player-cards`);
        if (!cardsContainer) return;
        
        cardsContainer.innerHTML = '';
        
        if (player.isEliminated) {
            for (let i = 0; i < 2; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'card card-back';
                cardsContainer.appendChild(cardElement);
            }
            return;
        }
        
        if (!player.cards || player.cards.length === 0) {
            for (let i = 0; i < 2; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'card card-back';
                cardsContainer.appendChild(cardElement);
            }
            return;
        }
        
        if (player.isAI && !this.showAICards) {
            for (let i = 0; i < 2; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'card card-back';
                cardsContainer.appendChild(cardElement);
            }
        } else {
            player.cards.forEach((card) => {
                const cardElement = document.createElement('div');
                const isRed = card.suit === '♥' || card.suit === '♦';
                cardElement.className = `card ${isRed ? 'red' : 'black'}`;
                
                cardElement.innerHTML = `
                    <div class="card-top">${card.value}</div>
                    <div class="card-center">${card.suit}</div>
                    <div class="card-bottom">${card.value}</div>
                `;
                
                cardsContainer.appendChild(cardElement);
            });
        }
    }
    
    revealAICards() {
        this.showAICards = true;
        this.players.forEach(player => {
            if (player.isAI && !player.isEliminated && !player.isFolded) {
                this.updatePlayerCards(player);
            }
        });
        this.updateUI();
    }
    
    dealCommunityCards(count) {
        this.addLogEntry('กำลังแจกไพ่กองกลาง...');
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (this.deck.length === 0) {
                    this.initializeDeck();
                    this.shuffleDeck();
                }
                
                const card = this.deck.pop();
                this.communityCards.push(card);
                this.addCommunityCard(card);
                
                if (this.communityCards.length === 3) {
                    this.addLogEntry('แจกไพ่ Flop เรียบร้อยแล้ว');
                    this.gamePhase = 'flop';
                } else if (this.communityCards.length === 4) {
                    this.addLogEntry('แจกไพ่ Turn เรียบร้อยแล้ว');
                    this.gamePhase = 'turn';
                } else if (this.communityCards.length === 5) {
                    this.addLogEntry('แจกไพ่ River เรียบร้อยแล้ว');
                    this.gamePhase = 'river';
                }
                
                this.updateAllPlayerHandRanks();
                this.updateUI();
            }, i * 1500);
        }
        
        setTimeout(() => {
            this.startBettingRound();
        }, count * 1500 + 500);
    }
    
    updateAllPlayerHandRanks() {
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && player.cards.length > 0) {
                const allCards = [...player.cards, ...this.communityCards];
                const handResult = this.evaluateHand(allCards);
                player.handRank = handResult.rank;
            }
        });
    }
    
    addCommunityCard(card) {
        const communityContainer = document.getElementById('community-cards');
        if (!communityContainer) return;
        
        const cardElement = document.createElement('div');
        const isRed = card.suit === '♥' || card.suit === '♦';
        cardElement.className = `card dealing ${isRed ? 'red' : 'black'}`;
        
        cardElement.innerHTML = `
            <div class="card-top">${card.value}</div>
            <div class="card-center">${card.suit}</div>
            <div class="card-bottom">${card.value}</div>
        `;
        
        communityContainer.appendChild(cardElement);
    }
    
    startBettingRound() {
        this.currentPlayerIndex = this.findNextActivePlayer(this.findNextActivePlayer(this.dealerIndex));
        this.bettingRoundComplete = false;
        
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && player.chips > 0) {
                player.currentBet = 0;
            }
        });
        
        this.updateUI();
        this.nextPlayerTurn();
    }
    
    // ⭐️ แก้ไข method nextPlayerTurn ให้สมบูรณ์
nextPlayerTurn() {
    console.log('🔧 nextPlayerTurn called - isProcessingTurn:', this.isProcessingTurn);
    
    if (this.isProcessingTurn) {
        console.log('🚫 Blocked: กำลังประมวลผลเทิร์นอยู่');
        return;
    }
    
    this.isProcessingTurn = true;
    
    // ⭐️ ล้าง timeout ก่อนหน้า (ป้องกัน AI decision ทับกัน)
    if (this.aiDecisionTimeout) {
        clearTimeout(this.aiDecisionTimeout);
        this.aiDecisionTimeout = null;
    }
    
    try {
        const activePlayers = this.players.filter(player => !player.isEliminated && !player.isFolded);
        console.log('👥 Active players:', activePlayers.map(p => p.name));
        
        if (activePlayers.length === 1) {
            console.log('มีผู้เล่นเหลือคนเดียว จบรอบ');
            this.endRound();
            this.isProcessingTurn = false;
            return;
        }
        
        // ตรวจสอบว่า betting round เสร็จสิ้นหรือยัง
        let playersActed = 0;
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && 
                (player.currentBet === this.currentBet || player.chips === 0)) {
                playersActed++;
            }
        });
        
        console.log(`Players acted: ${playersActed}/${activePlayers.length}`);
        
        if (playersActed === activePlayers.length && activePlayers.length > 1) {
            console.log('ทุกคนเดิมพันเสร็จแล้ว ไปเฟสถัดไป');
            this.bettingRoundComplete = true;
            this.nextGamePhase();
            this.isProcessingTurn = false;
            return;
        }
        
        // ⭐️ แก้ไข: หาผู้เล่นคนต่อไปแบบปลอดภัย
        let nextPlayerFound = false;
        let attempts = 0;
        const totalPlayers = this.players.length;
        
        while (!nextPlayerFound && attempts < totalPlayers * 2) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % totalPlayers;
            const currentPlayer = this.players[this.currentPlayerIndex];
            
            console.log(`Checking player: ${currentPlayer.name}, Folded: ${currentPlayer.isFolded}, Eliminated: ${currentPlayer.isEliminated}, Chips: ${currentPlayer.chips}`);
            
            if (!currentPlayer.isFolded && 
                !currentPlayer.isEliminated && 
                currentPlayer.chips > 0) {
                nextPlayerFound = true;
                console.log(`✅ Next player found: ${currentPlayer.name}`);
            }
            
            attempts++;
            
            if (attempts >= totalPlayers * 2) {
                console.error('❌ Cannot find next player after maximum attempts');
                this.isProcessingTurn = false;
                return;
            }
        }
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        console.log('🎯 Turn of player:', currentPlayer.name);
        
        this.updatePlayerStatuses(currentPlayer);
        
        if (currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isEliminated && currentPlayer.chips > 0) {
            console.log('🤖 AI decision for:', currentPlayer.name);
            this.showAIThinking(currentPlayer);
            
            // ⭐️ ใช้ timeout ที่สามารถล้างได้และมี fallback
            this.aiDecisionTimeout = setTimeout(() => {
                console.log(`🤖 Executing AI decision for: ${currentPlayer.name}`);
                this.hideAIThinking(currentPlayer);
                
                try {
                    this.makeAIDecision(currentPlayer);
                } catch (aiError) {
                    console.error(`❌ AI decision error for ${currentPlayer.name}:`, aiError);
                    // ถ้า AI decision error ให้ fold อัตโนมัติ
                    this.playerFold(currentPlayer);
                }
                
                this.isProcessingTurn = false;
                this.aiDecisionTimeout = null;
            }, 1000 + Math.random() * 1000); // ⭐️ เพิ่ม randomness เพื่อป้องกัน timing issues
                
        } else if (!currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isEliminated && currentPlayer.chips > 0) {
            console.log('👤 Human player turn:', currentPlayer.name);
            this.enablePlayerActions();
            this.isProcessingTurn = false;
        } else {
            console.log('⏩ Player cannot play, skipping to next turn:', currentPlayer.name);
            this.isProcessingTurn = false;
            // ⭐️ ใช้ setTimeout เพื่อป้องกัน call stack overflow
            setTimeout(() => this.nextPlayerTurn(), 100);
        }
        
        this.updateUI();
        
    } catch (error) {
        console.error('❌ Critical error in nextPlayerTurn:', error);
        this.isProcessingTurn = false;
        
        // ⭐️ Fallback: พยายามเรียก nextPlayerTurn อีกครั้งหลังจาก delay
        setTimeout(() => {
            if (!this.isProcessingTurn) {
                this.nextPlayerTurn();
            }
        }, 500);
    }
}
    
    showAIThinking(player) {
        const statusId = player.id === 'player-user' ? 'status-user' : `status${player.id.slice(-1)}`;
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.textContent = 'กำลังคิด...';
            statusElement.classList.add('thinking');
        }
    }
    
    hideAIThinking(player) {
        const statusId = player.id === 'player-user' ? 'status-user' : `status${player.id.slice(-1)}`;
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.classList.remove('thinking');
        }
    }
    
    updatePlayerStatuses(currentPlayer) {
        document.querySelectorAll('.player-info').forEach(info => {
            info.classList.remove('active');
        });
        
        this.players.forEach(player => {
            const statusId = player.id === 'player-user' ? 'status-user' : `status${player.id.slice(-1)}`;
            const statusElement = document.getElementById(statusId);
            const playerInfoElement = document.querySelector(`#${player.id} .player-info`);
            
            if (!statusElement || !playerInfoElement) return;
            
            if (player.isEliminated) {
                statusElement.textContent = 'ชิพหมดถูกคัดออก';
            } else if (player.id === currentPlayer.id) {
                player.status = 'playing';
                statusElement.textContent = 'กำลังเล่น';
                playerInfoElement.classList.add('active');
            } else if (player.isFolded) {
                player.status = 'folded';
                statusElement.textContent = 'Fold';
            } else if (player.chips === 0) {
                player.status = 'all-in';
                statusElement.textContent = 'All-in';
            } else {
                player.status = 'waiting';
                statusElement.textContent = 'รอ';
            }
        });
    }
    
   // ⭐️ แก้ไข method makeAIDecision ให้มี fallback
makeAIDecision(player) {
    console.log(`🤖 AI ${player.name} making decision...`);
    
    // ⭐️ ตรวจสอบว่าเกมยังดำเนินอยู่
    if (!this.gameStarted || this.gameOver) {
        console.log('🚫 Game not active, AI cannot make decision');
        return;
    }
    
    try {
        const handStrength = this.calculateHandStrength(player);
        const positionFactor = this.calculatePositionFactor(player);
        const potOdds = this.calculatePotOdds(player);
        const bluffFactor = this.calculateBluffFactor(player);
        
        let decisionScore = handStrength * 0.5 + positionFactor * 0.2 + potOdds * 0.2 + bluffFactor * 0.1;
        
        if (player.personality === 'aggressive') {
            decisionScore *= 1.2;
        } else if (player.personality === 'conservative') {
            decisionScore *= 0.8;
        }
        
        console.log(`🤖 ${player.name} decision score: ${decisionScore.toFixed(2)}`);
        
        const callAmount = this.currentBet - player.currentBet;
        const canCall = player.chips >= callAmount;
        
        if (decisionScore < 0.3) {
            // Weak hand
            if (callAmount > 0 && canCall) {
                // มีเงินพอเรียกแต่มืออ่อน -> Fold
                console.log(`🤖 ${player.name} decision: FOLD (weak hand)`);
                this.playerFold(player);
            } else if (callAmount === 0) {
                // ไม่ต้องเรียก -> Check
                console.log(`🤖 ${player.name} decision: CHECK (weak hand, no bet)`);
                this.playerCheck(player);
            } else {
                // เงินไม่พอเรียก -> Fold
                console.log(`🤖 ${player.name} decision: FOLD (weak hand, cannot call)`);
                this.playerFold(player);
            }
        } else if (decisionScore < 0.6) {
            // Medium hand
            if (callAmount > 0 && canCall) {
                // มีเงินพอเรียก -> Call
                console.log(`🤖 ${player.name} decision: CALL (medium hand)`);
                this.playerCall(player);
            } else if (callAmount === 0) {
                // ไม่ต้องเรียก -> Check หรือ Raise น้อยๆ
                if (Math.random() < 0.3 && player.chips > 0) {
                    const raiseAmount = Math.min(20, Math.floor(player.chips * 0.1));
                    console.log(`🤖 ${player.name} decision: RAISE ${raiseAmount} (medium hand)`);
                    this.playerRaise(player, raiseAmount);
                } else {
                    console.log(`🤖 ${player.name} decision: CHECK (medium hand)`);
                    this.playerCheck(player);
                }
            } else {
                // เงินไม่พอเรียก -> Fold
                console.log(`🤖 ${player.name} decision: FOLD (medium hand, cannot call)`);
                this.playerFold(player);
            }
        } else {
            // Strong hand
            if (callAmount > 0 && canCall) {
                // มีเงินพอเรียก -> Call หรือ Raise
                if (Math.random() < 0.6 && player.chips > callAmount) {
                    const raiseAmount = Math.min(
                        Math.floor(handStrength * player.chips * 0.4),
                        player.chips
                    );
                    console.log(`🤖 ${player.name} decision: RAISE ${raiseAmount} (strong hand)`);
                    this.playerRaise(player, Math.max(raiseAmount, this.currentBet + 10));
                } else {
                    console.log(`🤖 ${player.name} decision: CALL (strong hand)`);
                    this.playerCall(player);
                }
            } else if (callAmount === 0) {
                // ไม่ต้องเรียก -> Raise
                const raiseAmount = Math.min(
                    Math.floor(handStrength * player.chips * 0.5),
                    player.chips
                );
                console.log(`🤖 ${player.name} decision: RAISE ${raiseAmount} (strong hand, no bet)`);
                this.playerRaise(player, Math.max(raiseAmount, 20));
            } else {
                // เงินไม่พอเรียก -> All-in
                console.log(`🤖 ${player.name} decision: CALL (strong hand, all-in)`);
                this.playerCall(player);
            }
        }
        
    } catch (error) {
        console.error(`❌ AI decision error for ${player.name}:`, error);
        // ⭐️ Fallback: ถ้า AI decision error ให้ fold อัตโนมัติ
        this.playerFold(player);
    }
}
    
    calculateHandStrength(player) {
        const allCards = [...player.cards, ...this.communityCards];
        if (allCards.length < 2) return 0.5;
        
        const handResult = this.evaluateHand(allCards);
        
        const baseScores = {
            'High Card': 0.1, 'One Pair': 0.3, 'Two Pair': 0.5, 'Three of a Kind': 0.6,
            'Straight': 0.7, 'Flush': 0.8, 'Full House': 0.9, 'Four of a Kind': 0.95,
            'Straight Flush': 0.99, 'Royal Flush': 1.0
        };
        
        let score = baseScores[handResult.rank] || 0.1;
        
        if (handResult.rank === 'High Card' || handResult.rank === 'One Pair') {
            const highCardBonus = handResult.tiebreaker[0] / 140;
            score += highCardBonus;
        }
        
        return Math.min(score, 1.0);
    }
    
    calculatePositionFactor(player) {
        const playerIndex = this.players.indexOf(player);
        const dealerIndex = this.dealerIndex;
        
        if (playerIndex === (dealerIndex + 1) % 4 || playerIndex === (dealerIndex + 2) % 4) {
            return 0.8;
        } else if (playerIndex === (dealerIndex + 3) % 4) {
            return 0.5;
        } else {
            return 0.3;
        }
    }
    
    calculatePotOdds(player) {
        const callAmount = this.currentBet - player.currentBet;
        if (callAmount <= 0) return 1.0;
        
        const potOdds = callAmount / (this.pot + callAmount);
        return Math.max(0, 1 - potOdds);
    }
    
    calculateBluffFactor(player) {
        return Math.random() < 0.2 ? 0.7 : 0.3;
    }
    
    playerFold(player) {
        console.log('🃏 Player fold:', player.name);
        player.isFolded = true;
        player.status = 'folded';
        this.addLogEntry(player.name + ' Fold');
        this.nextPlayerTurn();
    }
    
    playerCheck(player) {
        console.log('✅ Player check:', player.name);
        player.status = 'checked';
        this.addLogEntry(player.name + ' Check');
        this.nextPlayerTurn();
    }
    
    playerCall(player) {
        console.log('📞 Player call:', player.name);
        const callAmount = this.currentBet - player.currentBet;
        const actualCallAmount = Math.min(callAmount, player.chips);
        
        if (player.chips >= actualCallAmount) {
            player.chips -= actualCallAmount;
            player.currentBet += actualCallAmount;
            this.pot += actualCallAmount;
            
            if (actualCallAmount < callAmount) {
                this.addLogEntry(player.name + ' All-in! เรียก ' + actualCallAmount);
            } else {
                this.addLogEntry(player.name + ' Call ' + actualCallAmount);
            }
            this.nextPlayerTurn();
        } else {
            this.playerFold(player);
        }
    }
    
    playerRaise(player, amount) {
        console.log('⬆️ Player raise:', player.name, amount);
        const actualAmount = Math.min(amount, player.chips);
        const totalBet = player.currentBet + actualAmount;
        
        if (player.chips >= actualAmount) {
            player.chips -= actualAmount;
            player.currentBet = totalBet;
            this.pot += actualAmount;
            this.currentBet = Math.max(this.currentBet, totalBet);
            
            if (actualAmount < amount) {
                this.addLogEntry(player.name + ' All-in! เป็น ' + totalBet);
            } else {
                this.addLogEntry(player.name + ' Raise เป็น ' + totalBet);
            }
            this.nextPlayerTurn();
        } else {
            this.playerCall(player);
        }
    }
    
    enablePlayerActions() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        if (!currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isEliminated && currentPlayer.chips > 0) {
            const foldBtn = document.getElementById('fold-btn');
            const checkBtn = document.getElementById('check-btn');
            const callBtn = document.getElementById('call-btn');
            const raiseBtn = document.getElementById('raise-btn');
            const betSlider = document.getElementById('bet-slider');
            
            if (foldBtn) foldBtn.disabled = false;
            
            if (currentPlayer.currentBet === this.currentBet) {
                if (checkBtn) checkBtn.disabled = false;
                if (callBtn) callBtn.disabled = true;
            } else {
                if (checkBtn) checkBtn.disabled = true;
                if (callBtn) callBtn.disabled = false;
            }
            
            if (currentPlayer.chips > 0) {
                if (raiseBtn) raiseBtn.disabled = false;
                if (betSlider) {
                    betSlider.disabled = false;
                    betSlider.max = currentPlayer.chips;
                    betSlider.value = Math.min(50, currentPlayer.chips);
                    this.updateBetAmount();
                }
            }
        } else {
            this.disablePlayerActions();
        }
    }
    
    disablePlayerActions() {
        const foldBtn = document.getElementById('fold-btn');
        const checkBtn = document.getElementById('check-btn');
        const callBtn = document.getElementById('call-btn');
        const raiseBtn = document.getElementById('raise-btn');
        const betSlider = document.getElementById('bet-slider');
        
        if (foldBtn) foldBtn.disabled = true;
        if (checkBtn) checkBtn.disabled = true;
        if (callBtn) callBtn.disabled = true;
        if (raiseBtn) raiseBtn.disabled = true;
        if (betSlider) betSlider.disabled = true;
    }
    
    updateBetAmount() {
        const slider = document.getElementById('bet-slider');
        const amountDisplay = document.getElementById('bet-amount');
        if (slider && amountDisplay) {
            amountDisplay.textContent = slider.value;
        }
    }
    
    nextGamePhase() {
        console.log('🔄 Next game phase:', this.gamePhase);
        
        if (this.gamePhase === 'preflop') {
            this.gamePhase = 'flop';
            this.dealCommunityCards(3);
        } else if (this.gamePhase === 'flop') {
            this.gamePhase = 'turn';
            this.dealCommunityCards(1);
        } else if (this.gamePhase === 'turn') {
            this.gamePhase = 'river';
            this.dealCommunityCards(1);
        } else if (this.gamePhase === 'river') {
            this.gamePhase = 'showdown';
            this.showdown();
        }
    }
    
    showdown() {
        console.log('🎯 Showdown');
        this.addLogEntry('เปิดไพ่! เปรียบเทียบมือผู้เล่น');
        
        this.revealAICards();
        
        const activePlayers = this.players.filter(player => !player.isEliminated && !player.isFolded);
        
        activePlayers.forEach(player => {
            const allCards = [...player.cards, ...this.communityCards];
            const handResult = this.evaluateHand(allCards);
            player.handRank = handResult.rank;
            this.addLogEntry(player.name + ' มี ' + handResult.rank);
        });
        
        if (activePlayers.length > 0) {
            const winners = this.determineWinners(activePlayers);
            this.distributePot(winners);
        }
        
        this.roundCompleted = true;
        this.updateUI();
        
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) continueBtn.style.display = 'block';
        
        this.checkGameEnd();
    }
    
    determineWinners(players) {
        const playerHands = players.map(player => {
            const allCards = [...player.cards, ...this.communityCards];
            const handResult = this.evaluateHand(allCards);
            return {
                player: player,
                hand: handResult
            };
        });

        playerHands.sort((a, b) => {
            if (b.hand.value !== a.hand.value) {
                return b.hand.value - a.hand.value;
            }
            
            for (let i = 0; i < a.hand.tiebreaker.length; i++) {
                if (b.hand.tiebreaker[i] !== a.hand.tiebreaker[i]) {
                    return b.hand.tiebreaker[i] - a.hand.tiebreaker[i];
                }
            }
            
            return 0;
        });

        const winnerHand = playerHands[0].hand;
        const winners = playerHands.filter(ph => 
            ph.hand.value === winnerHand.value &&
            ph.hand.tiebreaker.every((tb, i) => tb === winnerHand.tiebreaker[i])
        );

        return winners.map(w => w.player);
    }

    distributePot(winners) {
        if (winners.length === 1) {
            winners[0].chips += this.pot;
            this.addLogEntry('<strong>' + winners[0].name + ' ชนะเงินกองกลาง ' + this.pot + ' ด้วย ' + winners[0].handRank + '!</strong>');
        } else {
            const splitAmount = Math.floor(this.pot / winners.length);
            const winnerNames = winners.map(w => w.name).join(' และ ');
            winners.forEach(winner => {
                winner.chips += splitAmount;
            });
            this.addLogEntry(`<strong>เสมอ! ${winnerNames} แบ่งเงินกองกลาง คนละ ${splitAmount}</strong>`);
        }
        this.pot = 0;
    }
    
    endRound() {
        console.log('🏁 End round');
        const winner = this.players.find(player => !player.isEliminated && !player.isFolded);
        if (winner) {
            winner.chips += this.pot;
            this.addLogEntry('<strong>' + winner.name + ' ชนะเงินกองกลาง ' + this.pot + '!</strong>');
            this.pot = 0;
        }
        
        this.revealAICards();
        this.roundCompleted = true;
        this.updateUI();
        
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) continueBtn.style.display = 'block';
        
        this.checkGameEnd();
    }
    
    checkGameEnd() {
        const activePlayers = this.players.filter(player => !player.isEliminated);
        const playersWithChips = this.players.filter(player => player.chips > 0 && !player.isEliminated);
        
        if (playersWithChips.length === 1 && activePlayers.length > 1) {
            this.gameOver = true;
            const winner = playersWithChips[0];
            this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.disabled = false;
            
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) continueBtn.style.display = 'none';
            
            return true;
        }
        
        if (activePlayers.length === 1 && activePlayers[0].chips > 0) {
            this.gameOver = true;
            const winner = activePlayers[0];
            this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.disabled = false;
            
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) continueBtn.style.display = 'none';
            
            return true;
        }
        
        return false;
    }

    eliminateBrokePlayers() {
        let eliminatedCount = 0;
        
        this.players.forEach(player => {
            if (!player.isEliminated && player.chips <= 0) {
                player.isEliminated = true;
                eliminatedCount++;
                
                if (player.id === 'player-user') {
                    this.addLogEntry('<strong style="color: #ff0000;">ชิพหมดแล้ว! คุณไม่สามารถเล่นต่อได้</strong>');
                } else {
                    this.addLogEntry(player.name + ' หมดชิพและถูกคัดออก!');
                }
            }
        });
        
        const activePlayers = this.players.filter(player => !player.isEliminated);
        
        if (activePlayers.length === 1) {
            this.gameOver = true;
            const winner = activePlayers[0];
            this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.disabled = false;
            
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) continueBtn.style.display = 'none';
            
            return true;
        }
        
        if (this.players[0].isEliminated) {
            const remainingAIs = this.players.filter(player => 
                player.isAI && !player.isEliminated && player.chips > 0
            );
            
            if (remainingAIs.length > 1) {
                this.addLogEntry('<strong style="color: #ff0000;">คุณถูกคัดออก! แต่เกมจะดำเนินต่อระหว่าง AI</strong>');
                return false;
            } else if (remainingAIs.length === 1) {
                this.gameOver = true;
                const winner = remainingAIs[0];
                this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
                
                const startBtn = document.getElementById('start-btn');
                if (startBtn) startBtn.disabled = false;
                
                const continueBtn = document.getElementById('continue-btn');
                if (continueBtn) continueBtn.style.display = 'none';
                
                return true;
            }
        }
        
        return false;
    }
    
    evaluateHand(cards) {
        const valueValues = {'2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14};
        const sortedCards = [...cards].sort((a, b) => valueValues[b.value] - valueValues[a.value]);

        const valueCounts = {};
        const suitCounts = {};
        
        sortedCards.forEach(card => {
            valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        });

        const isFlush = Object.values(suitCounts).some(count => count >= 5);
        
        let isStraight = false;
        let straightHighCard = 0;
        const uniqueValues = [...new Set(sortedCards.map(card => valueValues[card.value]))].sort((a, b) => b - a);
        
        for (let i = 0; i <= uniqueValues.length - 5; i++) {
            if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
                isStraight = true;
                straightHighCard = uniqueValues[i];
                break;
            }
        }

        if (!isStraight && uniqueValues.includes(14) && uniqueValues.includes(5) && uniqueValues.includes(4) && 
            uniqueValues.includes(3) && uniqueValues.includes(2)) {
            isStraight = true;
            straightHighCard = 5;
        }

        if (isFlush && isStraight && straightHighCard === 14) {
            return {
                rank: 'Royal Flush',
                value: 10,
                tiebreaker: [14]
            };
        }

        if (isFlush && isStraight) {
            return {
                rank: 'Straight Flush',
                value: 9,
                tiebreaker: [straightHighCard]
            };
        }

        const fourOfKindValue = Object.keys(valueCounts).find(value => valueCounts[value] === 4);
        if (fourOfKindValue) {
            const kicker = Object.keys(valueCounts)
                .filter(value => value !== fourOfKindValue)
                .map(value => valueValues[value])
                .sort((a, b) => b - a)[0];
            
            return {
                rank: 'Four of a Kind',
                value: 8,
                tiebreaker: [valueValues[fourOfKindValue], kicker]
            };
        }

        const threeOfKindValue = Object.keys(valueCounts).find(value => valueCounts[value] === 3);
        const twoPairValues = Object.keys(valueCounts).filter(value => valueCounts[value] === 2);
        
        if (threeOfKindValue && twoPairValues.length >= 1) {
            const pairValue = Math.max(...twoPairValues.map(value => valueValues[value]));
            return {
                rank: 'Full House',
                value: 7,
                tiebreaker: [valueValues[threeOfKindValue], pairValue]
            };
        }

        if (isFlush) {
            const flushCards = sortedCards.filter(card => suitCounts[card.suit] >= 5);
            const flushValues = flushCards.map(card => valueValues[card.value]).slice(0, 5);
            return {
                rank: 'Flush',
                value: 6,
                tiebreaker: flushValues
            };
        }

        if (isStraight) {
            return {
                rank: 'Straight',
                value: 5,
                tiebreaker: [straightHighCard]
            };
        }

        if (threeOfKindValue) {
            const kickers = Object.keys(valueCounts)
                .filter(value => value !== threeOfKindValue)
                .map(value => valueValues[value])
                .sort((a, b) => b - a)
                .slice(0, 2);
            
            return {
                rank: 'Three of a Kind',
                value: 4,
                tiebreaker: [valueValues[threeOfKindValue], ...kickers]
            };
        }

        if (twoPairValues.length >= 2) {
            const pairValues = twoPairValues.map(value => valueValues[value]).sort((a, b) => b - a).slice(0, 2);
            const kicker = Object.keys(valueCounts)
                .filter(value => !twoPairValues.slice(0, 2).includes(value))
                .map(value => valueValues[value])
                .sort((a, b) => b - a)[0];
            
            return {
                rank: 'Two Pair',
                value: 3,
                tiebreaker: [...pairValues, kicker]
            };
        }

        const onePairValue = Object.keys(valueCounts).find(value => valueCounts[value] === 2);
        if (onePairValue) {
            const kickers = Object.keys(valueCounts)
                .filter(value => value !== onePairValue)
                .map(value => valueValues[value])
                .sort((a, b) => b - a)
                .slice(0, 3);
            
            return {
                rank: 'One Pair',
                value: 2,
                tiebreaker: [valueValues[onePairValue], ...kickers]
            };
        }

        const highCards = sortedCards.map(card => valueValues[card.value]).slice(0, 5);
        return {
            rank: 'High Card',
            value: 1,
            tiebreaker: highCards
        };
    }
    
    resetRound() {
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.gamePhase = 'preflop';
        this.bettingRoundComplete = false;
        this.showAICards = false;
        this.isProcessingTurn = false;
        
        // ⭐️ ล้าง timeout เมื่อรีเซ็ต
        if (this.aiDecisionTimeout) {
            clearTimeout(this.aiDecisionTimeout);
            this.aiDecisionTimeout = null;
        }
        
        const communityContainer = document.getElementById('community-cards');
        if (communityContainer) {
            communityContainer.innerHTML = '';
        }
        
        this.players.forEach(player => {
            if (!player.isEliminated) {
                player.cards = [];
                player.handRank = '';
                player.status = 'waiting';
                player.isFolded = false;
                player.currentBet = 0;
            }
        });
        
        this.initializeDeck();
        this.shuffleDeck();
    }
    
    resetGame() {
        this.resetRound();
        this.players.forEach(player => {
            player.chips = 1500;
            player.isEliminated = false;
        });
        this.gameStarted = false;
        this.gameOver = false;
        this.roundCompleted = false;
        this.updateUI();
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.disabled = false;
        
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) continueBtn.style.display = 'none';
        
        this.disablePlayerActions();
        this.addLogEntry('เริ่มเกมใหม่!');
    }
    
    updateUI() {
        this.players.forEach(player => {
            const chipsId = player.id === 'player-user' ? 'chips-user' : `chips${player.id.slice(-1)}`;
            const handId = player.id === 'player-user' ? 'hand-user' : `hand${player.id.slice(-1)}`;
            
            const chipsElement = document.getElementById(chipsId);
            const handElement = document.getElementById(handId);
            const playerArea = document.getElementById(player.id);
            
            if (chipsElement) chipsElement.textContent = player.chips;
            
            if (handElement) {
                if (player.id === 'player-user') {
                    handElement.textContent = player.handRank || '-';
                } else {
                    handElement.textContent = this.showAICards ? (player.handRank || '-') : '-';
                }
            }
            
            if (playerArea) {
                if (player.isEliminated) {
                    playerArea.style.opacity = '0.5';
                    if (chipsElement) chipsElement.textContent = '0';
                    if (handElement) handElement.textContent = 'ชิพหมดถูกคัดออก';
                } else {
                    playerArea.style.opacity = '1';
                }
            }
        });
        
        const potAmount = document.getElementById('pot-amount');
        const currentBet = document.getElementById('current-bet');
        const dealerName = document.getElementById('dealer-name');
        const gamePhase = document.getElementById('game-phase');
        
        if (potAmount) potAmount.textContent = this.pot;
        if (currentBet) currentBet.textContent = this.currentBet;
        if (dealerName) dealerName.textContent = this.players[this.dealerIndex].name;
        if (gamePhase) {
            const phaseNames = {
                'preflop': 'Pre-flop', 'flop': 'Flop', 'turn': 'Turn', 
                'river': 'River', 'showdown': 'Showdown'
            };
            gamePhase.textContent = phaseNames[this.gamePhase] || 'Pre-flop';
        }
    }
    
    addLogEntry(message) {
        const logEntries = document.getElementById('log-entries');
        if (!logEntries) return;
        
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = message;
        logEntries.appendChild(entry);
        
        while (logEntries.children.length > 3) {
            logEntries.removeChild(logEntries.firstChild);
        }
        
        logEntries.scrollTop = logEntries.scrollHeight;
    }
    
    initializeEventListeners() {
        const startBtn = document.getElementById('start-btn');
        const foldBtn = document.getElementById('fold-btn');
        const checkBtn = document.getElementById('check-btn');
        const callBtn = document.getElementById('call-btn');
        const raiseBtn = document.getElementById('raise-btn');
        const continueBtn = document.getElementById('continue-btn');
        const betSlider = document.getElementById('bet-slider');
        const resetBtn = document.getElementById('reset-btn');
        const debugBtn = document.getElementById('debug-btn');
        const forceTurnBtn = document.getElementById('force-turn-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('🎯 Start button clicked');
                this.startGame();
            });
        }
        
        if (foldBtn) {
            foldBtn.addEventListener('click', () => {
                console.log('🎯 Fold button clicked');
                this.playerFold(this.players[this.currentPlayerIndex]);
                this.disablePlayerActions();
            });
        }
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                console.log('🎯 Check button clicked');
                this.playerCheck(this.players[this.currentPlayerIndex]);
                this.disablePlayerActions();
            });
        }
        
        if (callBtn) {
            callBtn.addEventListener('click', () => {
                console.log('🎯 Call button clicked');
                this.playerCall(this.players[this.currentPlayerIndex]);
                this.disablePlayerActions();
            });
        }
        
        if (raiseBtn) {
            raiseBtn.addEventListener('click', () => {
                console.log('🎯 Raise button clicked');
                const raiseAmount = parseInt(document.getElementById('bet-slider').value);
                this.playerRaise(this.players[this.currentPlayerIndex], raiseAmount);
                this.disablePlayerActions();
            });
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                console.log('🎯 Continue button clicked');
                this.continueGame();
            });
        }
        
        if (betSlider) {
            betSlider.addEventListener('input', () => {
                this.updateBetAmount();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('🎯 Reset button clicked');
                this.resetGame();
            });
        }
        if (debugBtn) {
    debugBtn.addEventListener('click', () => {
        this.debugAIState();
    });
}
if (forceTurnBtn) {
    forceTurnBtn.addEventListener('click', () => {
        this.forceNextTurn();
    });
}
        
        console.log('Game event listeners initialized');
    }
}

// ⭐️ คลาสระบบธนาคารแบบไม่กระทบเกม
class BankSystem {
    constructor(pokerGame) {
        this.pokerGame = pokerGame;
        this.bankBalance = 2000;
        this.passiveIncomeInterval = null;
        this.passiveIncomeTimeLeft = 300;
        this.transactions = ['เริ่มต้น: เงิน 2000 ชิป'];
        
        this.initializeBankUI();
        this.startPassiveIncomeTimer();
        this.updateBankDisplay();
        
        console.log('Bank System initialized (No-Interference Mode)');
    }
    
    initializeBankUI() {
        this.updateTableChips();
        
        // Event Listeners เฉพาะธนาคาร
        const depositBtn = document.getElementById('deposit-btn');
        const withdrawBtn = document.getElementById('withdraw-btn');
        const autoRefillBtn = document.getElementById('auto-refill-btn');
        const depositAmount = document.getElementById('deposit-amount');
        const withdrawAmount = document.getElementById('withdraw-amount');
        
        if (depositBtn) {
            depositBtn.addEventListener('click', () => this.deposit());
        }
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => this.withdraw());
        }
        if (autoRefillBtn) {
            autoRefillBtn.addEventListener('click', () => this.autoRefill());
        }
        if (depositAmount) {
            depositAmount.addEventListener('input', () => this.validateInputs());
        }
        if (withdrawAmount) {
            withdrawAmount.addEventListener('input', () => this.validateInputs());
        }
        
        // ⭐️ ไม่แตะต้องปุ่มเริ่มเกมของระบบเกม
    }
    
    updateTableChips() {
        const userPlayer = this.pokerGame.players[0];
        const tableChipsElement = document.getElementById('table-chips');
        if (tableChipsElement) {
            tableChipsElement.textContent = userPlayer.chips;
            
            if (userPlayer.chips <= 0) {
                tableChipsElement.style.color = '#ff6b6b';
                tableChipsElement.style.fontWeight = 'bold';
            } else if (userPlayer.chips < 500) {
                tableChipsElement.style.color = '#ffd700';
            } else {
                tableChipsElement.style.color = '#90EE90';
            }
        }
    }
    
    deposit() {
        const amountInput = document.getElementById('deposit-amount');
        const amount = parseInt(amountInput?.value || 0);
        const userPlayer = this.pokerGame.players[0];
        
        if (isNaN(amount) || amount <= 0) {
            this.showBankMessage('⚠️ กรุณากรอกจำนวนเงินที่ต้องการฝาก', 'error');
            return;
        }
        
        if (amount > userPlayer.chips) {
            this.showBankMessage('❌ ไม่มีชิพบนโต๊ะพอสำหรับฝาก', 'error');
            return;
        }
        
        userPlayer.chips -= amount;
        this.bankBalance += amount;
        
        this.addTransaction(`ฝากเงิน: ${amount} ชิป (โต๊ะ → ธนาคาร)`);
        this.showBankMessage(`✅ ฝากเงิน ${amount} ชิปเรียบร้อย`, 'success');
        
        this.updateBankDisplay();
        setTimeout(() => this.pokerGame.updateUI(), 100);
    }
    
    withdraw() {
        const amountInput = document.getElementById('withdraw-amount');
        const amount = parseInt(amountInput?.value || 0);
        const userPlayer = this.pokerGame.players[0];
        
        if (isNaN(amount) || amount <= 0) {
            this.showBankMessage('⚠️ กรุณากรอกจำนวนเงินที่ต้องการถอน', 'error');
            return;
        }
        
        if (amount > this.bankBalance) {
            this.showBankMessage('❌ ยอดเงินในธนาคารไม่เพียงพอ', 'error');
            return;
        }
        
        this.bankBalance -= amount;
        userPlayer.chips += amount;
        
        this.addTransaction(`ถอนเงิน: ${amount} ชิป (ธนาคาร → โต๊ะ)`);
        this.showBankMessage(`✅ ถอนเงิน ${amount} ชิปเรียบร้อย`, 'success');
        
        this.updateBankDisplay();
        setTimeout(() => this.pokerGame.updateUI(), 100);
    }
    
    autoRefill() {
        const userPlayer = this.pokerGame.players[0];
        const neededChips = 1500 - userPlayer.chips;
        
        if (neededChips <= 0) {
            this.showBankMessage('ℹ️ มีชิพบนโต๊ะเพียงพอแล้ว', 'info');
            return;
        }
        
        if (neededChips > this.bankBalance) {
            this.showBankMessage('❌ ยอดเงินในธนาคารไม่เพียงพอสำหรับเติมชิพ', 'error');
            return;
        }
        
        this.bankBalance -= neededChips;
        userPlayer.chips += neededChips;
        
        this.addTransaction(`เติมชิพอัตโนมัติ: ${neededChips} ชิป`);
        this.showBankMessage(`✅ เติมชิพ ${neededChips} ชิปเรียบร้อย`, 'success');
        
        this.updateBankDisplay();
        setTimeout(() => this.pokerGame.updateUI(), 100);
    }
    
    validateInputs() {
        const depositInput = document.getElementById('deposit-amount');
        const withdrawInput = document.getElementById('withdraw-amount');
        const depositBtn = document.getElementById('deposit-btn');
        const withdrawBtn = document.getElementById('withdraw-btn');
        
        const depositAmount = parseInt(depositInput?.value || 0);
        const withdrawAmount = parseInt(withdrawInput?.value || 0);
        const userPlayer = this.pokerGame.players[0];
        
        if (depositInput) depositInput.max = userPlayer.chips;
        if (withdrawInput) withdrawInput.max = this.bankBalance;
        
        if (depositBtn) {
            depositBtn.disabled = isNaN(depositAmount) || depositAmount <= 0 || depositAmount > userPlayer.chips;
        }
        
        if (withdrawBtn) {
            withdrawBtn.disabled = isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > this.bankBalance;
        }
    }
    
    startPassiveIncomeTimer() {
        this.updatePassiveTimerDisplay();
        
        this.passiveIncomeInterval = setInterval(() => {
            this.passiveIncomeTimeLeft--;
            
            if (this.passiveIncomeTimeLeft <= 0) {
                this.givePassiveIncome();
                this.passiveIncomeTimeLeft = 300;
            }
            
            this.updatePassiveTimerDisplay();
        }, 1000);
    }
    
    givePassiveIncome() {
        this.bankBalance += 500;
        this.addTransaction(`รายได้ passive: +500 ชิป`);
        this.showBankMessage('💰 ได้รับรายได้ passive 500 ชิป!', 'success');
        this.updateBankDisplay();
    }
    
    updatePassiveTimerDisplay() {
        const minutes = Math.floor(this.passiveIncomeTimeLeft / 60);
        const seconds = this.passiveIncomeTimeLeft % 60;
        const timerElement = document.getElementById('passive-timer');
        
        if (timerElement) {
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateBankDisplay() {
        const balanceElement = document.getElementById('bank-balance');
        if (balanceElement) {
            balanceElement.textContent = this.bankBalance;
        }
        
        this.updateTableChips();
        this.updateTransactionList();
        this.validateInputs();
    }
    
    updateTransactionList() {
        const transactionList = document.getElementById('transaction-list');
        if (transactionList) {
            transactionList.innerHTML = '';
            this.transactions.slice(-5).forEach(transaction => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.textContent = transaction;
                transactionList.appendChild(item);
            });
        }
    }
    
    addTransaction(message) {
        const timestamp = new Date().toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.transactions.push(`[${timestamp}] ${message}`);
        
        if (this.transactions.length > 10) {
            this.transactions.shift();
        }
        
        this.updateTransactionList();
    }
    
    showBankMessage(message, type = 'info') {
        setTimeout(() => {
            let styledMessage = message;
            if (type === 'success') styledMessage = `<span style="color: #90EE90">${message}</span>`;
            else if (type === 'error') styledMessage = `<span style="color: #ff6b6b">${message}</span>`;
            else if (type === 'warning') styledMessage = `<span style="color: #ffd700">${message}</span>`;
            else if (type === 'info') styledMessage = `<span style="color: #87CEEB">${message}</span>`;
            
            this.pokerGame.addLogEntry(styledMessage);
        }, 150);
    }
    
    destroy() {
        if (this.passiveIncomeInterval) {
            clearInterval(this.passiveIncomeInterval);
        }
    }
}

// ⭐️ การเริ่มต้นระบบที่ปลอดภัย
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initializing game systems...');
    
    try {
        window.pokerGame = new TexasHoldemGame();
        console.log('✅ Poker game initialized');
        
        setTimeout(() => {
            try {
                window.bankSystem = new BankSystem(window.pokerGame);
                console.log('✅ Bank system initialized');
                console.log('🎯 Both systems running independently');
            } catch (bankError) {
                console.error('❌ Bank system error (game still works):', bankError);
            }
        }, 1000);
        
    } catch (gameError) {
        console.error('❌ Game initialization failed:', gameError);
    }
});
// ⭐️ เพิ่ม method สำหรับ debug AI state
debugAIState() {
    console.log('🐛 AI State Debug:');
    this.players.forEach((player, index) => {
        if (player.isAI) {
            console.log(`AI ${index}: ${player.name}`);
            console.log(`  - Chips: ${player.chips}`);
            console.log(`  - Folded: ${player.isFolded}`);
            console.log(`  - Eliminated: ${player.isEliminated}`);
            console.log(`  - Current Bet: ${player.currentBet}`);
            console.log(`  - Status: ${player.status}`);
        }
    });
    console.log(`Current Bet: ${this.currentBet}`);
    console.log(`Pot: ${this.pot}`);
    console.log(`Game Phase: ${this.gamePhase}`);
    console.log(`Current Player Index: ${this.currentPlayerIndex}`);
}
// ⭐️ เพิ่ม method สำหรับ force next turn (สำหรับ debug)
forceNextTurn() {
    console.log('🔧 Force next turn called');
    if (this.isProcessingTurn) {
        console.log('Resetting processing turn flag');
        this.isProcessingTurn = false;
    }
    if (this.aiDecisionTimeout) {
        console.log('Clearing AI timeout');
        clearTimeout(this.aiDecisionTimeout);
        this.aiDecisionTimeout = null;
    }
    this.nextPlayerTurn();
}


