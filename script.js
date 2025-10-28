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
        this.bettingRoundStarted = false;
        
        this.initializeEventListeners();
        this.initializeDeck();
        console.log('Texas Holdem Game initialized - Ultimate Anti-Bug Mode');
        
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
            this.bettingRoundStarted = false;
            
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
        console.log('💰 Starting betting round, phase:', this.gamePhase);
        this.bettingRoundStarted = true;
        this.bettingRoundComplete = false;
        
        // ⭐️ รีเซ็ตเฉพาะผู้เล่นที่ยังเล่นอยู่และมีชิพ
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && player.chips > 0) {
                player.currentBet = 0;
            }
        });
        
        // ⭐️ เริ่มจากผู้เล่นถัดจาก Big Blind
        this.currentPlayerIndex = this.findNextActivePlayer(this.findNextActivePlayer(this.dealerIndex));
        
        this.updateUI();
        
        // ⭐️ เรียก nextPlayerTurn โดยตรงโดยไม่ใช้ setTimeout
        setTimeout(() => {
            this.nextPlayerTurn();
        }, 1000);
    }
    
   // ⭐️ แก้ไขใหญ่: วิธีที่ปลอดภัยที่สุดสำหรับ nextPlayerTurn
nextPlayerTurn() {
    console.log('🎯 nextPlayerTurn called - Phase:', this.gamePhase, 
                'Processing:', this.isProcessingTurn, 
                'GameStarted:', this.gameStarted);
    
    // ⭐️ เพิ่มตัวนับป้องกัน infinite loop
    if (!this.turnAttempts) this.turnAttempts = 0;
    this.turnAttempts++;
    
    // ⭐️ ตรวจสอบสถานะเกมก่อน
    if (!this.gameStarted || this.gameOver) {
        console.log('🚫 Game not active, cannot proceed');
        this.isProcessingTurn = false;
        this.turnAttempts = 0;
        return;
    }
    
    if (this.isProcessingTurn) {
        console.log('⏳ Already processing turn, waiting...');
        // ⚠️ แก้ไข: ไม่ return แต่รอให้เทิร์นปัจจุบันจบ
        setTimeout(() => {
            if (this.turnAttempts < 5) {
                this.nextPlayerTurn();
            } else {
                console.error('🔴 Too many processing attempts, forcing reset');
                this.isProcessingTurn = false;
                this.turnAttempts = 0;
            }
        }, 500);
        return;
    }
    
    this.isProcessingTurn = true;
    
    // ⭐️ ล้าง timeout ก่อนหน้าเสมอ
    if (this.aiDecisionTimeout) {
        clearTimeout(this.aiDecisionTimeout);
        this.aiDecisionTimeout = null;
    }
    
    try {
        // ⭐️ รับ active players ปัจจุบัน
        const activePlayers = this.players.filter(player => 
            !player.isEliminated && !player.isFolded
        );
        
        console.log('👥 Active players:', activePlayers.length, 
                   'Names:', activePlayers.map(p => p.name));
        
        // ⭐️ ตรวจสอบว่ามีผู้เล่นเหลือคนเดียว
        if (activePlayers.length === 1) {
            console.log('🎉 Only one player left, ending round');
            this.isProcessingTurn = false;
            this.turnAttempts = 0;
            this.endRound();
            return; // ⭐️ เพิ่ม return เพื่อหยุดการทำงาน
        }
        
        // ⭐️ ตรวจสอบ betting round completion แบบใหม่ที่แม่นยำ
        const bettingComplete = this.checkBettingRoundComplete();
        console.log('💰 Betting complete check:', bettingComplete);
        
        if (bettingComplete) {
            console.log('✅ Betting round complete, moving to next phase');
            this.isProcessingTurn = false;
            this.turnAttempts = 0;
            this.bettingRoundComplete = true;
            this.nextGamePhase(); // ⭐️ เรียกครั้งเดียว
            return; // ⭐️ เพิ่ม return สำคัญ!
        }
        
        // ⭐️ หาผู้เล่นคนต่อไปแบบปลอดภัย
        const nextPlayer = this.findNextActivePlayerForBetting();
        if (!nextPlayer) {
            console.log('❌ No next player found, checking round completion again');
            this.isProcessingTurn = false;
            
            // ⭐️ ตรวจสอบอีกครั้งเพื่อความปลอดภัย
            const finalCheck = this.checkBettingRoundComplete();
            if (finalCheck) {
                this.bettingRoundComplete = true;
                this.nextGamePhase();
            } else {
                // ⭐️ Fallback: ส่งเทิร์นให้ผู้เล่นคนต่อไปที่หาได้
                this.forceFindNextPlayer();
            }
            this.turnAttempts = 0;
            return;
        }
        
        this.currentPlayerIndex = this.players.indexOf(nextPlayer);
        console.log('🎯 Current player:', nextPlayer.name, 
                   'Index:', this.currentPlayerIndex);
        
        // ⭐️ รีเซ็ตตัวนับเมื่อพบผู้เล่นใหม่
        this.turnAttempts = 0;
        
        this.updatePlayerStatuses(nextPlayer);
        
        // ⭐️ จัดการเทิร์นของผู้เล่น
        if (nextPlayer.isAI) {
            console.log('🤖 AI turn for:', nextPlayer.name);
            this.handleAITurn(nextPlayer);
        } else {
            console.log('👤 Human turn for:', nextPlayer.name);
            this.handleHumanTurn(nextPlayer);
        }
        
        this.updateUI();
        
    } catch (error) {
        console.error('💥 Critical error in nextPlayerTurn:', error);
        this.isProcessingTurn = false;
        this.turnAttempts = 0;
        
        // ⭐️ Fallback ที่ปลอดภัยที่สุด
        setTimeout(() => {
            if (!this.isProcessingTurn && this.turnAttempts < 3) {
                console.log('🔄 Attempting recovery...');
                this.nextPlayerTurn();
            } else {
                console.error('🔴 Recovery failed, forcing round end');
                this.endRound();
            }
        }, 1000);
    }
}

// ⭐️ เพิ่มเมธอดช่วยเหลือสำหรับกรณีหา next player ไม่เจอ
forceFindNextPlayer() {
    console.log('🔧 Force finding next player...');
    
    const activePlayers = this.players.filter(player => 
        !player.isEliminated && !player.isFolded && player.chips > 0
    );
    
    if (activePlayers.length === 0) {
        console.log('❌ No active players found in force find');
        this.endRound();
        return;
    }
    
    // ⭐️ หาผู้เล่นคนแรกที่ยังเล่นได้
    const firstActive = activePlayers[0];
    this.currentPlayerIndex = this.players.indexOf(firstActive);
    console.log('✅ Force selected:', firstActive.name);
    
    this.updatePlayerStatuses(firstActive);
    
    if (firstActive.isAI) {
        this.handleAITurn(firstActive);
    } else {
        this.handleHumanTurn(firstActive);
    }
}

// ⭐️ วิธีใหม่: ตรวจสอบการจบ betting round อย่างแม่นยำ
checkBettingRoundComplete() {
    const activePlayers = this.players.filter(player => 
        !player.isEliminated && !player.isFolded && player.chips > 0
    );
    
    console.log(`📊 Betting check - Active: ${activePlayers.length}, CurrentBet: ${this.currentBet}`);
    
    if (activePlayers.length <= 1) {
        console.log('✅ Only one active player, betting complete');
        return true;
    }
    
    // ⭐️ ตรวจสอบเงื่อนไขให้ละเอียดยิ่งขึ้น
    let playersCompleted = 0;
    let playersAllIn = 0;
    
    activePlayers.forEach(player => {
        const hasActed = player.currentBet === this.currentBet;
        const isAllIn = player.chips === 0 && player.currentBet > 0;
        const canAct = player.chips > 0 && player.currentBet < this.currentBet;
        
        console.log(`   ${player.name}: Bet=${player.currentBet}, Chips=${player.chips}, HasActed=${hasActed}, AllIn=${isAllIn}, CanAct=${canAct}`);
        
        if (hasActed || isAllIn || !canAct) {
            playersCompleted++;
        }
        
        if (isAllIn) {
            playersAllIn++;
        }
    });
    
    console.log(`📈 Completion: ${playersCompleted}/${activePlayers.length}, All-in: ${playersAllIn}`);
    
    // ⭐️ เงื่อนไขการจบ betting round:
    // 1. ทุกคนเดิมพันเท่ากัน หรือหมดชิพ
    // 2. มีอย่างน้อย 2 คนที่ยังเล่นอยู่
    // 3. ถ้ามีคน All-in มากกว่า 1 คน ให้จบเทิร์น
    const allPlayersActed = playersCompleted === activePlayers.length;
    const multipleAllIn = playersAllIn >= 2;
    const hasBettingOccurred = this.currentBet > 0 || activePlayers.some(p => p.currentBet > 0);
    
    const shouldComplete = (allPlayersActed && hasBettingOccurred) || multipleAllIn;
    
    console.log(`🎯 Should complete: ${shouldComplete} (allActed: ${allPlayersActed}, multipleAllIn: ${multipleAllIn}, hasBetting: ${hasBettingOccurred})`);
    
    return shouldComplete;
}

// ⭐️ วิธีใหม่สำหรับหาผู้เล่นคนต่อไป
findNextActivePlayerForBetting() {
    console.log('🔍 Finding next player for betting...');
    
    const activePlayers = this.players.filter(player => 
        !player.isEliminated && !player.isFolded && player.chips > 0
    );
    
    if (activePlayers.length === 0) {
        console.log('❌ No active players found');
        return null;
    }
    
    // ⭐️ หาผู้เล่นที่ยังต้องดำเนินการ (ยังไม่ได้เดิมพันเท่าคนอื่น)
    const playersToAct = activePlayers.filter(player => 
        player.currentBet < this.currentBet && player.chips > 0
    );
    
    console.log(`🎯 Players to act: ${playersToAct.length}`, 
                playersToAct.map(p => `${p.name} (bet: ${p.currentBet}/${this.currentBet}, chips: ${p.chips})`));
    
    if (playersToAct.length === 0) {
        console.log('✅ All players have acted');
        return null;
    }
    
    // ⭐️ หาผู้เล่นคนต่อไปจากตำแหน่งปัจจุบัน
    let currentIndex = this.currentPlayerIndex;
    let attempts = 0;
    const maxAttempts = this.players.length * 2;
    
    console.log(`🔄 Starting search from index: ${currentIndex}, player: ${this.players[currentIndex]?.name}`);
    
    while (attempts < maxAttempts) {
        currentIndex = (currentIndex + 1) % this.players.length;
        const candidate = this.players[currentIndex];
        
        console.log(`   Checking index ${currentIndex}: ${candidate.name} - Eliminated: ${candidate.isEliminated}, Folded: ${candidate.isFolded}, Chips: ${candidate.chips}, CurrentBet: ${candidate.currentBet}/${this.currentBet}`);
        
        // ⭐️ เงื่อนไข: ไม่ถูกคัดออก, ไม่ fold, มีชิพ, และยังไม่ได้เดิมพันเท่าที่ควร
        if (!candidate.isEliminated && 
            !candidate.isFolded && 
            candidate.chips > 0 && 
            candidate.currentBet < this.currentBet) {
            console.log(`✅ Found next player: ${candidate.name} at index ${currentIndex}`);
            return candidate;
        }
        
        attempts++;
        
        // ⭐️ ตรวจสอบว่าเราหมดวงแล้ว
        if (attempts >= this.players.length && playersToAct.length > 0) {
            console.log('🔄 Looped through all players, taking first available');
            return playersToAct[0];
        }
    }
    
    console.log('❌ Could not find next player after maximum attempts');
    return playersToAct[0] || null;
}

// ⭐️ วิธีใหม่: จัดการเทิร์นของ AI
handleAITurn(player) {
    console.log(`🤖 Handling AI turn for: ${player.name}`);
    this.showAIThinking(player);
    
    // ⭐️ ใช้ Promise และ async/await สำหรับการจัดการที่แม่นยำ
    this.aiDecisionTimeout = setTimeout(async () => {
        try {
            this.hideAIThinking(player);
            await this.executeAIDecision(player);
        } catch (error) {
            console.error(`❌ AI execution error for ${player.name}:`, error);
            this.playerFold(player); // Fallback ที่ปลอดภัย
        } finally {
            // ⭐️ รอสักครู่ก่อนเริ่มเทิร์นถัดไป
            setTimeout(() => {
                this.isProcessingTurn = false;
                this.aiDecisionTimeout = null;
                this.nextPlayerTurn();
            }, 800);
        }
    }, 1500);
}

// ⭐️ วิธีใหม่: จัดการเทิร์นของผู้เล่นจริง
handleHumanTurn(player) {
    console.log(`👤 Handling Human turn for: ${player.name}`);
    this.enablePlayerActions();
    // ⭐️ ไม่รีเซ็ต isProcessingTurn ที่นี่ เพราะรอการดำเนินการจากผู้เล่น
    // isProcessingTurn จะถูกรีเซ็ตเมื่อผู้เล่นดำเนินการ (fold, call, raise, check)
}

// ⭐️ ปรับปรุงเมธอดการดำเนินการของผู้เล่น
playerFold(player) {
    console.log(`🃏 ${player.name} folds`);
    player.isFolded = true;
    player.status = 'folded';
    this.addLogEntry(player.name + ' Fold');
    
    this.isProcessingTurn = false; // ⭐️ รีเซ็ต flag
    this.disablePlayerActions();
    
    // ⭐️ เรียก next turn โดยตรงโดยไม่รอ
    setTimeout(() => {
        this.nextPlayerTurn();
    }, 500);
}

playerCheck(player) {
    console.log(`✅ ${player.name} checks`);
    player.status = 'checked';
    this.addLogEntry(player.name + ' Check');
    
    this.isProcessingTurn = false; // ⭐️ รีเซ็ต flag
    this.disablePlayerActions();
    
    setTimeout(() => {
        this.nextPlayerTurn();
    }, 500);
}

playerCall(player) {
    console.log(`📞 ${player.name} calls`);
    const callAmount = this.currentBet - player.currentBet;
    
    // ⭐️ ตรวจสอบว่า callAmount มากกว่า 0 หรือไม่
    if (callAmount <= 0) {
        console.log('ℹ️ Call amount is 0, converting to check');
        this.playerCheck(player);
        return;
    }
    
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
        
        this.isProcessingTurn = false; // ⭐️ รีเซ็ต flag
        this.disablePlayerActions();
        
        setTimeout(() => {
            this.nextPlayerTurn();
        }, 500);
    } else {
        this.playerFold(player);
    }
}

playerRaise(player, amount) {
    console.log(`⬆️ ${player.name} raises to ${amount}`);
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
        
        this.isProcessingTurn = false; // ⭐️ รีเซ็ต flag
        this.disablePlayerActions();
        
        setTimeout(() => {
            this.nextPlayerTurn();
        }, 500);
    } else {
        this.playerCall(player);
    }
}
    // ⭐️ วิธีใหม่: ตรวจสอบการจบ betting round อย่างแม่นยำ
    checkBettingRoundComplete() {
        const activePlayers = this.players.filter(player => 
            !player.isEliminated && !player.isFolded && player.chips > 0
        );
        
        if (activePlayers.length <= 1) return true;
        
        // ⭐️ นับผู้เล่นที่ทำการเดิมพันเสร็จแล้ว
        let playersCompleted = 0;
        
        activePlayers.forEach(player => {
            // ผู้เล่นที่เดิมพันเท่ากับ currentBet หรือหมดชิพแล้ว
            if (player.currentBet === this.currentBet || player.chips === 0) {
                playersCompleted++;
            }
        });
        
        console.log(`📊 Betting check: ${playersCompleted}/${activePlayers.length} players completed`);
        
        // ⭐️ ทุกคนเดิมพันเสร็จและมีอย่างน้อย 2 คนที่ยังเล่นอยู่
        return playersCompleted === activePlayers.length;
    }
    
    // ⭐️ แก้ไขใหญ่ที่สุด: วิธีใหม่สำหรับหาผู้เล่นคนต่อไป
    findNextActivePlayerForBetting() {
        console.log('🔍 Finding next player for betting...');
        
        const activePlayers = this.players.filter(player => 
            !player.isEliminated && !player.isFolded && player.chips > 0
        );
        
        if (activePlayers.length === 0) {
            console.log('❌ No active players found');
            return null;
        }
        
        // ⭐️ หาผู้เล่นคนต่อไปที่ยังไม่ได้เดิมพันเท่าคนอื่น
        const playersToAct = activePlayers.filter(player => 
            player.currentBet < this.currentBet
        );
        
        console.log(`🎯 Players to act: ${playersToAct.length}`, playersToAct.map(p => p.name));
        
        if (playersToAct.length === 0) {
            console.log('✅ All players have acted');
            return null;
        }
        
        // ⭐️ หาผู้เล่นคนต่อไปจากตำแหน่งปัจจุบัน
        let startIndex = this.currentPlayerIndex;
        let attempts = 0;
        const maxAttempts = this.players.length * 2;
        
        while (attempts < maxAttempts) {
            startIndex = (startIndex + 1) % this.players.length;
            const candidate = this.players[startIndex];
            
            // ⭐️ เงื่อนไข: ไม่ถูกคัดออก, ไม่ fold, มีชิพ, และยังไม่ได้เดิมพันเท่าที่ควร
            if (!candidate.isEliminated && 
                !candidate.isFolded && 
                candidate.chips > 0 && 
                candidate.currentBet < this.currentBet) {
                console.log(`✅ Found next player: ${candidate.name}`);
                return candidate;
            }
            
            attempts++;
        }
        
        console.log('❌ Could not find next player after maximum attempts');
        return playersToAct[0] || null;
    }
    
    // ⭐️ วิธีใหม่: จัดการเทิร์นของ AI
    handleAITurn(player) {
        console.log(`🤖 AI turn: ${player.name}`);
        this.showAIThinking(player);
        
        // ⭐️ ใช้ Promise และ async/await สำหรับการจัดการที่แม่นยำ
        this.aiDecisionTimeout = setTimeout(async () => {
            try {
                this.hideAIThinking(player);
                await this.executeAIDecision(player);
            } catch (error) {
                console.error(`❌ AI execution error for ${player.name}:`, error);
                this.playerFold(player); // Fallback ที่ปลอดภัย
            } finally {
                this.isProcessingTurn = false;
                this.aiDecisionTimeout = null;
            }
        }, 1500);
    }
    
    // ⭐️ วิธีใหม่: จัดการเทิร์นของผู้เล่นจริง
    handleHumanTurn(player) {
        console.log(`👤 Human turn: ${player.name}`);
        this.enablePlayerActions();
        this.isProcessingTurn = false;
    }
    
    // ⭐️ วิธีใหม่: ปฏิบัติการตัดสินใจของ AI ด้วย Promise
    async executeAIDecision(player) {
        return new Promise((resolve) => {
            try {
                const decision = this.makeAIDecision(player);
                resolve(decision);
            } catch (error) {
                console.error(`❌ AI decision failed for ${player.name}:`, error);
                // ⭐️ Fallback ที่ปลอดภัยที่สุด
                this.playerFold(player);
                resolve();
            }
        });
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
    
// 🌟 COSMIC GOD AI - แต่ให้ CALL ในเทิร์นแรกทุกคน
makeAIDecision(player) {
    console.log(`🌠 ${player.name} activating UNIVERSE GOD MODE...`);
    
    if (!this.gameStarted || this.gameOver || player.isFolded || player.isEliminated) {
        return;
    }
    
    try {
        // 🎯 เงื่อนไขพิเศษ: ถ้าเป็นเทิร์นแรกของรอบ ให้ CALL ทุกคน
        if (this.isFirstTurnOfRound(player)) {
            console.log(`🔄 ${player.name} FIRST TURN - FORCING CALL`);
            this.playerCall(player);
            return;
        }
        
        // 🧠 ถ้าไม่ใช่เทิร์นแรก ใช้ AI Cosmic God ตามปกติ
        const universeAnalysis = this.activateUniverseBrain(player);
        const decision = this.universeGodStrategy(player, universeAnalysis);
        this.executeUniverseDecision(player, decision);
        
    } catch (error) {
        console.error(`💥 UNIVERSE GOD AI crash:`, error);
        this.universeFallback(player);
    }
}

// 🎯 ตรวจสอบว่าเป็นเทิร์นแรกของรอบหรือไม่
isFirstTurnOfRound(player) {
    // นับจำนวนผู้เล่นที่ได้เล่นไปแล้วในรอบนี้
    let playersActed = 0;
    this.players.forEach(p => {
        if (p.currentBet > 0 || p.isFolded) {
            playersActed++;
        }
    });
    
    // ถ้ายังไม่มีใครเล่นเลยในรอบนี้ = เทิร์นแรก
    const isFirstTurn = playersActed === 0;
    
    console.log(`🔍 First Turn Check: ${player.name} - playersActed: ${playersActed}, isFirstTurn: ${isFirstTurn}`);
    
    return isFirstTurn;
}

// 🧠 ระบบสมองกลระดับจักรวาล (เดิม)
activateUniverseBrain(player) {
    return {
        cosmicPower: this.analyzeCosmicPower(player),
        multiverseMatrix: this.createMultiverseMatrix(player),
        temporalSight: this.seeAcrossTime(player),
        humanPsychology: this.understandHumanMind(player),
        instantMath: this.calculateInstantly(player)
    };
}

// 🎯 กลยุทธ์เทพแห่งจักรวาล (ปรับให้ CALL บ้างในเทิร์นอื่นๆ)
universeGodStrategy(player, analysis) {
    const {
        cosmicPower,
        multiverseMatrix,
        temporalSight,
        humanPsychology,
        instantMath
    } = analysis;

    const universeScore = this.calculateUniverseScore(analysis);
    
    // 🎯 เพิ่มโอกาส CALL ในเทิร์นที่ไม่ใช่แรก
    const callChance = this.calculateCallChance(analysis);
    
    // ถ้ามีโอกาส CALL สูง และไม่ใช่มือแย่มาก
    if (callChance > 0.7 && universeScore > 0.3) {
        return { action: 'CALL' };
    }
    
    // 🌌 ระดับพลังแห่งจักรวาล (เดิม)
    if (universeScore > 0.98) {
        return this.godOfPokerStrategy(player, analysis);
    }
    else if (universeScore > 0.90) {
        return this.universeDominatorStrategy(player, analysis);
    }
    else if (universeScore > 0.80) {
        return this.cosmicMasterStrategy(player, analysis);
    }
    else if (universeScore > 0.65) {
        return this.quantumGeniusStrategy(player, analysis);
    }
    else {
        return this.multiverseSurvivalStrategy(player, analysis);
    }
}

// 🎯 คำนวณโอกาสที่จะ CALL
calculateCallChance(analysis) {
    const { instantMath, humanPsychology } = analysis;
    
    let callChance = 0.3; // base chance
    
    // เพิ่มโอกาส CALL ถ้า pot odds ดี
    if (instantMath.instantProbabilities.winProbability > 0.4) {
        callChance += 0.3;
    }
    
    // เพิ่มโอกาส CALL ถ้าผู้เล่นจริงกำลังก้าวร้าว
    if (humanPsychology.emotionalState.confidence > 0.7) {
        callChance += 0.2;
    }
    
    // ลดโอกาส CALL ถ้ามือแย่
    if (instantMath.instantProbabilities.handStrength < 0.3) {
        callChance -= 0.4;
    }
    
    return Math.max(0.1, Math.min(callChance, 0.8));
}

// 🏆 กลยุทธ์เทพเจ้าแห่งโป๊กเกอร์ (ปรับให้ CALL บ้าง)
godOfPokerStrategy(player, analysis) {
    const { cosmicPower, humanPsychology } = analysis;
    
    // 30% โอกาสที่จะ CALL แทนที่จะ RAISE ตลอด
    if (Math.random() < 0.3) {
        return { action: 'CALL' };
    }
    
    if (cosmicPower.destinyScore > 0.95) {
        const godRaise = this.calculateGodRaise(player, analysis);
        return { action: 'RAISE', amount: godRaise };
    }
    
    if (humanPsychology.emotionalState.confidence > 0.8) {
        return this.breakConfidenceStrategy(player, analysis);
    }
    
    return { action: 'RAISE', amount: player.chips };
}

// 🌌 กลยุทธ์ผู้ครอบครองจักรวาล (ปรับให้ CALL บ้าง)
universeDominatorStrategy(player, analysis) {
    const { multiverseMatrix, temporalSight } = analysis;
    
    // 40% โอกาส CALL
    if (Math.random() < 0.4) {
        return { action: 'CALL' };
    }
    
    const bestUniverse = multiverseMatrix.optimalUniverse;
    
    if (temporalSight.riskAssessment.low > 0.7) {
        return this.convertUniverseToDecision(bestUniverse);
    }
    
    return this.createVictoryPath(player, analysis);
}

// ⭐ กลยุทธ์ปรมาจารย์จักรวาล (ปรับให้ CALL บ้าง)
cosmicMasterStrategy(player, analysis) {
    const { instantMath, humanPsychology } = analysis;
    
    // 50% โอกาส CALL
    if (Math.random() < 0.5) {
        return { action: 'CALL' };
    }
    
    const optimalAction = instantMath.instantProbabilities.optimalBetSize;
    
    if (humanPsychology.emotionalState.frustration > 0.6) {
        return this.exploitFrustrationStrategy(player, analysis);
    }
    
    return { action: 'RAISE', amount: optimalAction };
}

// ⚛️ กลยุทธ์อัจฉริยะเชิงควอนตัม (ปรับให้ CALL บ้าง)
quantumGeniusStrategy(player, analysis) {
    const { cosmicPower, multiverseMatrix } = analysis;
    
    // 60% โอกาส CALL
    if (Math.random() < 0.6) {
        return { action: 'CALL' };
    }
    
    if (cosmicPower.elementAlignment.favorable) {
        return this.elementalAdvantageStrategy(player, analysis);
    }
    
    const safeUniverse = multiverseMatrix.safestUniverse;
    return this.convertUniverseToDecision(safeUniverse);
}

// 🌍 กลยุทธ์การเอาชีวิตรอดในพหุภพ (ปรับให้ CALL บ้าง)
multiverseSurvivalStrategy(player, analysis) {
    const { multiverseMatrix, temporalSight } = analysis;
    
    // 70% โอกาส CALL ในโหมดเอาชีวิตรอด
    if (Math.random() < 0.7) {
        return { action: 'CALL' };
    }
    
    const survivalUniverse = this.findSurvivalUniverse(multiverseMatrix.universes);
    
    if (temporalSight.riskAssessment.high > 0.5) {
        return { action: 'FOLD' };
    }
    
    return this.convertUniverseToDecision(survivalUniverse);
}

// 🎭 สร้างการเคลื่อนไหวที่สร้างความสับสน (เพิ่ม CALL)
generateConfusionMove(analysis) {
    const moves = [
        { action: 'RAISE', amount: 42 },
        { action: 'RAISE', amount: 77 },
        { action: 'CALL' },  // ✅ เพิ่ม CALL
        { action: 'CALL' },  // ✅ เพิ่ม CALL อีก
        { action: 'FOLD' }
    ];
    
    return moves[Math.floor(Math.random() * moves.length)];
}

// 🚀 ปฏิบัติการระดับจักรวาล (เดิม)
executeUniverseDecision(player, decision) {
    console.log(`🌌 ${player.name} UNIVERSE execution: ${decision.action} ${decision.amount || ''}`);
    
    const cosmicDelay = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
        switch (decision.action) {
            case 'FOLD':
                this.playerFold(player);
                break;
            case 'CHECK':
                this.playerCheck(player);
                break;
            case 'CALL':
                this.playerCall(player);
                break;
            case 'RAISE':
                this.playerRaise(player, decision.amount);
                break;
            default:
                this.universeFallback(player);
        }
    }, cosmicDelay);
}

// 🌠 Fallback ระดับจักรวาล (ปรับให้ CALL มากขึ้น)
universeFallback(player) {
    const callAmount = this.currentBet - player.currentBet;
    
    if (callAmount === 0) {
        this.playerCheck(player);
    } else if (player.chips >= callAmount) {
        // 80% โอกาส CALL ใน fallback
        if (Math.random() < 0.8) {
            this.playerCall(player);
        } else {
            this.playerFold(player);
        }
    } else {
        this.playerFold(player);
    }
}

// 🎯 วิธีช่วยในการ Debug
debugTurnOrder() {
    console.log('🔍 TURN ORDER DEBUG:');
    this.players.forEach((player, index) => {
        console.log(`Player ${index}: ${player.name}, Bet: ${player.currentBet}, Folded: ${player.isFolded}`);
    });
    console.log(`Current Bet: ${this.currentBet}, Game Phase: ${this.gamePhase}`);
}
    calculateHandStrength(player) {
        try {
            const allCards = [...player.cards, ...this.communityCards];
            if (allCards.length < 2) return 0.3;
            
            const handResult = this.evaluateHand(allCards);
            
            const baseScores = {
                'High Card': 0.1, 'One Pair': 0.3, 'Two Pair': 0.5, 
                'Three of a Kind': 0.6, 'Straight': 0.7, 'Flush': 0.8, 
                'Full House': 0.9, 'Four of a Kind': 0.95, 
                'Straight Flush': 0.99, 'Royal Flush': 1.0
            };
            
            let score = baseScores[handResult.rank] || 0.2;
            
            // ⭐️ คำนวณค่าไพ่เริ่มต้นถ้ายังไม่มี community cards
            if (this.communityCards.length === 0) {
                const cardValues = {'2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14};
                const highCard1 = cardValues[player.cards[0].value];
                const highCard2 = cardValues[player.cards[1].value];
                const maxCard = Math.max(highCard1, highCard2);
                const minCard = Math.min(highCard1, highCard2);
                
                // ⭐️ เพิ่มคะแนนสำหรับไพ่สูงและไพ่คู่
                if (highCard1 === highCard2) {
                    score = Math.min(0.8, 0.3 + (maxCard / 50)); // Pocket pairs
                } else if (maxCard >= 12) {
                    score = Math.min(0.6, 0.2 + (maxCard / 40)); // High cards
                } else if (maxCard - minCard === 1 || maxCard - minCard === -1) {
                    score = Math.min(0.5, 0.15 + (maxCard / 45)); // Connected cards
                }
            }
            
            // ⭐️ เพิ่มความน่าจะเป็นเล็กน้อยตาม personality
            if (player.personality === 'aggressive') {
                score = Math.min(1.0, score * 1.15);
            } else if (player.personality === 'conservative') {
                score = Math.max(0.1, score * 0.85);
            }
            
            // ⭐️ เพิ่ม randomness เล็กน้อย
            const randomFactor = 0.9 + Math.random() * 0.2;
            score = score * randomFactor;
            
            return Math.min(Math.max(score, 0.1), 1.0);
            
        } catch (error) {
            console.error('Error calculating hand strength:', error);
            return 0.3; // ค่า default ที่ปลอดภัย
        }
    }
    
    playerFold(player) {
        console.log(`🃏 ${player.name} folds`);
        player.isFolded = true;
        player.status = 'folded';
        this.addLogEntry(player.name + ' Fold');
        
        // ⭐️ เรียก next turn โดยตรงโดยไม่รอ
        setTimeout(() => {
            this.nextPlayerTurn();
        }, 500);
    }
    
    playerCheck(player) {
        console.log(`✅ ${player.name} checks`);
        player.status = 'checked';
        this.addLogEntry(player.name + ' Check');
        
        setTimeout(() => {
            this.nextPlayerTurn();
        }, 500);
    }
    
    playerCall(player) {
        console.log(`📞 ${player.name} calls`);
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
            
            setTimeout(() => {
                this.nextPlayerTurn();
            }, 500);
        } else {
            this.playerFold(player);
        }
    }
    
    playerRaise(player, amount) {
        console.log(`⬆️ ${player.name} raises to ${amount}`);
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
            
            setTimeout(() => {
                this.nextPlayerTurn();
            }, 500);
        } else {
            this.playerCall(player);
        }
    }
    
    // ⭐️ แก้ไข method enablePlayerActions()
enablePlayerActions() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    if (!currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isEliminated) {
        const foldBtn = document.getElementById('fold-btn');
        const checkBtn = document.getElementById('check-btn');
        const callBtn = document.getElementById('call-btn');
        const raiseBtn = document.getElementById('raise-btn');
        const betSlider = document.getElementById('bet-slider');
        
        // ✅ เปิดปุ่ม Fold เสมอ
        if (foldBtn) foldBtn.disabled = false;
        
        // ✅ เงื่อนไขการเปิดปุ่ม Check และ Call ที่ถูกต้อง
        const canCheck = (this.currentBet === 0) || (currentPlayer.currentBet === this.currentBet);
        const canCall = (this.currentBet > 0) && (currentPlayer.currentBet < this.currentBet) && (currentPlayer.chips > 0);
        
        console.log(`🔍 Check Debug: currentBet=${this.currentBet}, playerBet=${currentPlayer.currentBet}, canCheck=${canCheck}, canCall=${canCall}`);
        
        if (checkBtn) {
            checkBtn.disabled = !canCheck;
            console.log(`✅ Check button: ${checkBtn.disabled ? 'DISABLED' : 'ENABLED'}`);
        }
        
        if (callBtn) {
            callBtn.disabled = !canCall;
            if (!callBtn.disabled) {
                const callAmount = Math.min(this.currentBet - currentPlayer.currentBet, currentPlayer.chips);
                callBtn.textContent = `Call ${callAmount}`;
            }
        }
        
        // ✅ เปิดปุ่ม Raise ถ้ามีชิพ
        if (raiseBtn && currentPlayer.chips > 0) {
            raiseBtn.disabled = false;
        }
        
        // ✅ ตั้งค่า Bet Slider
        if (betSlider && currentPlayer.chips > 0) {
            betSlider.disabled = false;
            betSlider.max = currentPlayer.chips;
            betSlider.value = Math.min(100, currentPlayer.chips);
            this.updateBetAmount();
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
        this.bettingRoundStarted = false;
        
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
        
        console.log('Game event listeners initialized');
    }

    // ⭐️ เพิ่ม method สำหรับ debug
    debugGameState() {
        console.log('🐛 GAME STATE DEBUG:');
        console.log('Game Started:', this.gameStarted);
        console.log('Game Over:', this.gameOver);
        console.log('Round Completed:', this.roundCompleted);
        console.log('Game Phase:', this.gamePhase);
        console.log('Current Bet:', this.currentBet);
        console.log('Pot:', this.pot);
        console.log('Processing Turn:', this.isProcessingTurn);
        console.log('Betting Round Complete:', this.bettingRoundComplete);
        
        this.players.forEach((player, index) => {
            console.log(`Player ${index}: ${player.name}`);
            console.log(`  Chips: ${player.chips}, Bet: ${player.currentBet}`);
            console.log(`  Folded: ${player.isFolded}, Eliminated: ${player.isEliminated}`);
            console.log(`  Status: ${player.status}, AI: ${player.isAI}`);
        });
    }

    // ⭐️ เพิ่ม method สำหรับ force next turn
    forceNextTurn() {
        console.log('🔧 FORCE NEXT TURN');
        this.isProcessingTurn = false;
        if (this.aiDecisionTimeout) {
            clearTimeout(this.aiDecisionTimeout);
            this.aiDecisionTimeout = null;
        }
        this.nextPlayerTurn();
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
        this.isCollapsed = false; // สถานะเริ่มต้นเป็นแบบเปิด
        
        this.initializeBankUI();
        this.initializeBankToggle();
        this.startPassiveIncomeTimer();
        this.updateBankDisplay();
        
        console.log('Bank System initialized with toggle feature');
    }
    
    initializeBankToggle() {
        const toggleBtn = document.getElementById('bank-toggle-btn');
        const bankSidebar = document.getElementById('bank-sidebar');
        
        if (toggleBtn && bankSidebar) {
            toggleBtn.addEventListener('click', () => {
                this.toggleBank();
            });
        }
    }
    
    toggleBank() {
        const bankSidebar = document.getElementById('bank-sidebar');
        const bankContainer = document.getElementById('bank-container');
        
        if (bankSidebar) {
            this.isCollapsed = !this.isCollapsed;
            
            if (this.isCollapsed) {
                // โหมดปิด - แสดงแค่ปุ่ม
                bankSidebar.classList.add('collapsed');
                this.addLogEntry('📦 ปิดแผงธนาคารแล้ว');
            } else {
                // โหมดเปิด - แสดงทั้งหมด
                bankSidebar.classList.remove('collapsed');
                this.addLogEntry('🏦 เปิดแผงธนาคารแล้ว');
            }
        }
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
                
                // ⭐️ เพิ่ม debug buttons
                const debugBtn = document.createElement('button');
                debugBtn.textContent = 'Debug Game';
                debugBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; background: #ff6b6b; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;';
                debugBtn.onclick = () => window.pokerGame.debugGameState();
                document.body.appendChild(debugBtn);
                
                const forceTurnBtn = document.createElement('button');
                forceTurnBtn.textContent = 'Force Next Turn';
                forceTurnBtn.style.cssText = 'position: fixed; top: 40px; right: 10px; z-index: 1000; background: #ffa500; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;';
                forceTurnBtn.onclick = () => window.pokerGame.forceNextTurn();
                document.body.appendChild(forceTurnBtn);
                
            } catch (bankError) {
                console.error('❌ Bank system error (game still works):', bankError);
            }
        }, 1000);
        
    } catch (gameError) {
        console.error('❌ Game initialization failed:', gameError);
    }
});
