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
        
        this.initializeEventListeners();
        this.initializeDeck();
        console.log('Texas Holdem Game initialized');
        
        // เพิ่มการตรวจสอบ element ที่สำคัญ
        this.checkRequiredElements();
    }
    
    // เพิ่ม method ตรวจสอบ element
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
    
    // สร้างสำรับไพ่
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
        console.log('สร้างสำรับไพ่เรียบร้อย:', this.deck.length, 'ใบ');
    }
    
    // สับไพ่
    shuffleDeck() {
        console.log('กำลังสับไพ่...');
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        console.log('สับไพ่เรียบร้อย');
    }
    
    // เริ่มเกมใหม่ (แก้ไขแล้ว - อัพเดทไพ่ผู้เล่นที่ถูกคัดออก)
    startGame() {
        console.log('เริ่มเกมใหม่');
        if (this.gameStarted && !this.roundCompleted) return;
        
        this.resetRound();
        this.shuffleDeck();
        this.determineDealer();
        
        // ตรวจสอบและคัดออกผู้เล่นที่เงินหมด (ก่อนโพสต์บลัฟ)
        const gameEnded = this.eliminateBrokePlayers();
        if (gameEnded) {
            console.log('เกมจบแล้ว ไม่เริ่มตาใหม่');
            return; // ถ้าเกมจบแล้ว就不再ดำเนินต่อ
        }
        
        // ⭐️ อัพเดทการแสดงไพ่ให้ผู้เล่นทุกคน (ทำให้ผู้เล่นที่ถูกคัดออกแสดงไพ่คว่ำ)
        this.players.forEach(player => {
            this.updatePlayerCards(player);
        });
        
        // ตรวจสอบว่ายังมีผู้เล่นพอที่จะเล่นต่อหรือไม่
        const activePlayers = this.players.filter(player => !player.isEliminated);
        if (activePlayers.length < 2) {
            console.log('ผู้เล่นไม่พอ 2 คน ไม่สามารถเริ่มเกมได้');
            if (activePlayers.length === 1) {
                const winner = activePlayers[0];
                this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            }
            document.getElementById('start-btn').disabled = false;
            document.getElementById('continue-btn').style.display = 'none';
            return;
        }
        
        this.postBlinds();
        this.dealHoleCards();
        this.gameStarted = true;
        this.gameOver = false;
        this.roundCompleted = false;
        this.showAICards = false;
        
        this.updateUI();
        
        document.getElementById('start-btn').disabled = true;
        document.getElementById('continue-btn').style.display = 'none';
        
        this.addLogEntry('เริ่มเกมใหม่! เจ้ามือ: ' + this.players[this.dealerIndex].name);
        console.log('เริ่มตาใหม่กับผู้เล่น:', activePlayers.map(p => p.name));
        
        // เริ่มรอบการเดิมพัน preflop
        setTimeout(() => {
            this.startBettingRound();
        }, 2000);
    }

    // เล่นต่อหลังจากจบรอบ
    continueGame() {
        if (!this.roundCompleted) return;
        this.startGame();
    }
    
    // กำหนดเจ้ามือ (แก้ไขแล้ว)
    determineDealer() {
        const activePlayers = this.players.filter(player => !player.isEliminated);
        
        if (activePlayers.length < 2) {
            console.log('ผู้เล่นไม่พอสำหรับกำหนดเจ้ามือ');
            return;
        }
        
        let nextDealerIndex = (this.dealerIndex + 1) % 4;
        
        // หาเจ้ามือคนต่อไปที่ยังไม่ถูกคัดออก
        let attempts = 0;
        while (this.players[nextDealerIndex].isEliminated && attempts < 4) {
            nextDealerIndex = (nextDealerIndex + 1) % 4;
            attempts++;
        }
        
        // ถ้าหาเจ้ามือไม่ได้ (ทุกคนถูกคัดออก) ให้เริ่มเกมใหม่
        if (this.players[nextDealerIndex].isEliminated) {
            console.log('ไม่พบเจ้ามือที่เหมาะสม');
            return;
        }
        
        this.dealerIndex = nextDealerIndex;
        
        this.players.forEach((player, index) => {
            player.isDealer = (index === this.dealerIndex);
            player.isSmallBlind = false;
            player.isBigBlind = false;
        });
        
        const smallBlindIndex = this.findNextActivePlayer(this.dealerIndex);
        const bigBlindIndex = this.findNextActivePlayer(smallBlindIndex);
        
        // ตรวจสอบว่าเจ้ามือ, small blind, big blind ยังไม่ถูกคัดออก
        if (!this.players[smallBlindIndex].isEliminated && !this.players[bigBlindIndex].isEliminated) {
            this.players[smallBlindIndex].isSmallBlind = true;
            this.players[bigBlindIndex].isBigBlind = true;
            
            this.updateDealerIndicators();
        } else {
            console.log('ไม่สามารถตั้ง Small Blind/Big Blind ได้');
        }
    }
    
    // หาผู้เล่นที่ยังเล่นอยู่คนถัดไป
    findNextActivePlayer(startIndex) {
        let nextIndex = (startIndex + 1) % 4;
        let attempts = 0;
        
        while (this.players[nextIndex].isEliminated && attempts < 4) {
            nextIndex = (nextIndex + 1) % 4;
            attempts++;
        }
        
        return nextIndex;
    }
    
    // อัพเดทตัวบ่งชี้เจ้ามือ
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
    
    // โพสต์ Small Blind และ Big Blind (แก้ไขแล้ว)
    postBlinds() {
        const smallBlindIndex = this.findNextActivePlayer(this.dealerIndex);
        const bigBlindIndex = this.findNextActivePlayer(smallBlindIndex);
        
        const smallBlindPlayer = this.players[smallBlindIndex];
        const bigBlindPlayer = this.players[bigBlindIndex];
        
        const smallBlindAmount = 10;
        const bigBlindAmount = 20;
        
        // Small Blind (เฉพาะถ้ายังไม่ถูกคัดออก)
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
        
        // Big Blind (เฉพาะถ้ายังไม่ถูกคัดออก)
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
    
    // แจกไพ่ส่วนตัว (แก้ไขแล้ว)
    dealHoleCards() {
        this.addLogEntry('กำลังแจกไพ่ส่วนตัว...');
        console.log('เริ่มแจกไพ่ส่วนตัว');
        
        let playerIndex = 0;
        const activePlayers = this.players.filter(player => !player.isEliminated);
        
        activePlayers.forEach((player) => {
            setTimeout(() => {
                // ตรวจสอบว่า deck มีไพ่พอ
                if (this.deck.length < 2) {
                    console.error('ไพ่ใน deck ไม่พอสำหรับแจก');
                    this.initializeDeck();
                    this.shuffleDeck();
                }
                
                // แจกไพ่ 2 ใบให้ผู้เล่น
                player.cards = [this.deck.pop(), this.deck.pop()];
                player.isFolded = false;
                
                console.log('แจกไพ่ให้ผู้เล่น:', player.name, 'ไพ่:', player.cards);
                
                // อัพเดทการแสดงไพ่
                this.updatePlayerCards(player);
                
                playerIndex++;
                if (playerIndex === activePlayers.length) {
                    this.addLogEntry('แจกไพ่ส่วนตัวเรียบร้อยแล้ว');
                    console.log('แจกไพ่ส่วนตัวเสร็จสิ้น');
                }
            }, playerIndex * 800);
        });
    }
    
    // อัพเดทการ์ดผู้เล่น (แก้ไขแล้ว - แสดงไพ่คว่ำเมื่อถูกคัดออก)
    updatePlayerCards(player) {
        // ใช้ selector ที่ถูกต้อง
        const cardsContainer = document.querySelector(`#${player.id} .player-cards`);
        
        if (!cardsContainer) {
            console.error('ไม่พบ container สำหรับไพ่ของผู้เล่น:', player.id);
            return;
        }
        
        // ล้างการ์ดเดิม
        cardsContainer.innerHTML = '';
        
        // ⭐️ ถ้าผู้เล่นถูกคัดออก ให้แสดงไพ่คว่ำเสมอ
        if (player.isEliminated) {
            for (let i = 0; i < 2; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'card card-back';
                cardsContainer.appendChild(cardElement);
            }
            return;
        }
        
        // ตรวจสอบว่าผู้เล่นมีไพ่หรือไม่
        if (!player.cards || player.cards.length === 0) {
            console.log('ผู้เล่น', player.name, 'ยังไม่มีไพ่');
            // แสดงการ์ดหงายหลังถ้ายังไม่มีไพ่
            for (let i = 0; i < 2; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'card card-back';
                cardsContainer.appendChild(cardElement);
            }
            return;
        }
        
        console.log('อัพเดทไพ่สำหรับผู้เล่น:', player.name, 'จำนวนไพ่:', player.cards.length);
        
        if (player.isAI && !this.showAICards) {
            // สำหรับ AI ให้แสดงการ์ดหงายหลัง
            for (let i = 0; i < 2; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'card card-back';
                cardsContainer.appendChild(cardElement);
            }
        } else {
            // แสดงไพ่จริง
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
    
    // แสดงไพ่ของ AI ทั้งหมด (เมื่อจบตา)
    revealAICards() {
        this.showAICards = true;
        this.players.forEach(player => {
            if (player.isAI && !player.isEliminated && !player.isFolded) {
                this.updatePlayerCards(player);
            }
        });
        this.updateUI();
    }
    
    // แจกไพ่กองกลาง
    dealCommunityCards(count) {
        this.addLogEntry('กำลังแจกไพ่กองกลาง...');
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (this.deck.length === 0) {
                    console.error('ไพ่ใน deck หมดแล้ว');
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
                
                // อัพเดทแต้มมือผู้เล่น
                this.updateAllPlayerHandRanks();
                
                this.updateUI();
            }, i * 1500);
        }
        
        setTimeout(() => {
            this.startBettingRound();
        }, count * 1500 + 500);
    }
    
    // อัพเดทแต้มมือผู้เล่นทั้งหมด
    updateAllPlayerHandRanks() {
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && player.cards.length > 0) {
                const allCards = [...player.cards, ...this.communityCards];
                const handResult = this.evaluateHand(allCards);
                player.handRank = handResult.rank;
            }
        });
    }
    
    // เพิ่มการ์ดกองกลาง
    addCommunityCard(card) {
        const communityContainer = document.getElementById('community-cards');
        if (!communityContainer) {
            console.error('ไม่พบ community-cards container');
            return;
        }
        
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
    
    // เริ่มรอบการเดิมพัน
    startBettingRound() {
        this.currentPlayerIndex = this.findNextActivePlayer(this.findNextActivePlayer(this.dealerIndex));
        this.bettingRoundComplete = false;
        
        // รีเซ็ต currentBet ของผู้เล่นสำหรับรอบใหม่ (เฉพาะผู้ที่ยังมีชิพ)
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && player.chips > 0) {
                player.currentBet = 0;
            }
        });
        
        this.updateUI();
        this.nextPlayerTurn();
    }
    
    // เทิร์นผู้เล่นถัดไป (แก้ไขแล้ว)
    nextPlayerTurn() {
        const activePlayers = this.players.filter(player => !player.isEliminated && !player.isFolded);
        
        if (activePlayers.length === 1) {
            this.endRound();
            return;
        }
        
        let playersActed = 0;
        this.players.forEach(player => {
            if (!player.isEliminated && !player.isFolded && 
                (player.currentBet === this.currentBet || player.chips === 0 || player.isFolded)) {
                playersActed++;
            }
        });
        
        if (playersActed === activePlayers.length && activePlayers.length > 1) {
            this.bettingRoundComplete = true;
            this.nextGamePhase();
            return;
        }
        
        // หาผู้เล่นคนต่อไปที่ยังไม่ถูกคัดออกและยังไม่ Fold
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
        } while ((this.players[this.currentPlayerIndex].isFolded || 
                 this.players[this.currentPlayerIndex].isEliminated || 
                 this.players[this.currentPlayerIndex].chips === 0) && 
                 activePlayers.length > 1);
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        this.updatePlayerStatuses(currentPlayer);
        
        if (currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isEliminated && currentPlayer.chips > 0) {
            this.showAIThinking(currentPlayer);
            setTimeout(() => {
                this.hideAIThinking(currentPlayer);
                this.makeAIDecision(currentPlayer);
            }, 1500);
        } else if (!currentPlayer.isFolded && !currentPlayer.isEliminated && currentPlayer.chips > 0) {
            this.enablePlayerActions();
        } else if (currentPlayer.chips === 0 && !currentPlayer.isFolded && !currentPlayer.isEliminated) {
            // ผู้เล่นที่หมดชิพแต่ยังไม่ Fold และยังไม่ถูกคัดออก ให้ Check อัตโนมัติ
            this.addLogEntry(currentPlayer.name + ' All-in แล้ว!');
            this.nextPlayerTurn();
        }
        
        this.updateUI();
    }
    
    // แสดงสถานะการคิดของ AI (แก้ไขแล้ว)
    showAIThinking(player) {
        const statusId = player.id === 'player-user' ? 'status-user' : `status${player.id.slice(-1)}`;
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.textContent = 'กำลังคิด...';
            statusElement.classList.add('thinking');
        }
    }
    
    // ซ่อนสถานะการคิดของ AI (แก้ไขแล้ว)
    hideAIThinking(player) {
        const statusId = player.id === 'player-user' ? 'status-user' : `status${player.id.slice(-1)}`;
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            statusElement.classList.remove('thinking');
        }
    }
    
    // อัพเดทสถานะผู้เล่นทั้งหมด (แก้ไขแล้ว)
    updatePlayerStatuses(currentPlayer) {
        // ลบ active class ออกจากทุกคนก่อน
        document.querySelectorAll('.player-info').forEach(info => {
            info.classList.remove('active');
        });
        
        this.players.forEach(player => {
            const statusId = player.id === 'player-user' ? 'status-user' : `status${player.id.slice(-1)}`;
            const statusElement = document.getElementById(statusId);
            const playerInfoElement = document.querySelector(`#${player.id} .player-info`);
            
            if (!statusElement || !playerInfoElement) {
                console.error('ไม่พบ element สำหรับผู้เล่น:', player.id);
                return;
            }
            
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
    
    // นับจำนวนผู้เล่นที่ยังเล่นอยู่
    getActivePlayersCount() {
        return this.players.filter(player => !player.isEliminated).length;
    }
    
    // AI ตัดสินใจ
    makeAIDecision(player) {
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
        
        if (decisionScore < 0.3) {
            if (player.currentBet < this.currentBet) {
                this.playerFold(player);
            } else {
                this.playerCheck(player);
            }
        } else if (decisionScore < 0.6) {
            if (player.currentBet < this.currentBet) {
                this.playerCall(player);
            } else {
                this.playerCheck(player);
            }
        } else {
            if (player.currentBet < this.currentBet) {
                if (Math.random() < 0.7) {
                    this.playerCall(player);
                } else {
                    const raiseAmount = Math.min(
                        Math.floor(handStrength * player.chips * 0.3),
                        player.chips
                    );
                    this.playerRaise(player, Math.max(raiseAmount, this.currentBet + 10));
                }
            } else {
                if (Math.random() < 0.8) {
                    const raiseAmount = Math.min(
                        Math.floor(handStrength * player.chips * 0.4),
                        player.chips
                    );
                    this.playerRaise(player, Math.max(raiseAmount, 20));
                } else {
                    this.playerCheck(player);
                }
            }
        }
    }
    
    // คำนวณความแข็งแกร่งของมือ
    calculateHandStrength(player) {
        const allCards = [...player.cards, ...this.communityCards];
        if (allCards.length < 2) return 0.5;
        
        const handResult = this.evaluateHand(allCards);
        
        const baseScores = {
            'High Card': 0.1,
            'One Pair': 0.3,
            'Two Pair': 0.5,
            'Three of a Kind': 0.6,
            'Straight': 0.7,
            'Flush': 0.8,
            'Full House': 0.9,
            'Four of a Kind': 0.95,
            'Straight Flush': 0.99,
            'Royal Flush': 1.0
        };
        
        let score = baseScores[handResult.rank] || 0.1;
        
        if (handResult.rank === 'High Card' || handResult.rank === 'One Pair') {
            const highCardBonus = handResult.tiebreaker[0] / 140;
            score += highCardBonus;
        }
        
        return Math.min(score, 1.0);
    }
    
    // คำนวณปัจจัยตำแหน่ง
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
    
    // คำนวณอัตราส่วนเงินกองกลาง
    calculatePotOdds(player) {
        const callAmount = this.currentBet - player.currentBet;
        if (callAmount <= 0) return 1.0;
        
        const potOdds = callAmount / (this.pot + callAmount);
        return Math.max(0, 1 - potOdds);
    }
    
    // คำนวณปัจจัยการบลัฟ
    calculateBluffFactor(player) {
        return Math.random() < 0.2 ? 0.7 : 0.3;
    }
    
    // ผู้เล่น Fold
    playerFold(player) {
        player.isFolded = true;
        player.status = 'folded';
        this.addLogEntry(player.name + ' Fold');
        this.nextPlayerTurn();
    }
    
    // ผู้เล่น Check
    playerCheck(player) {
        player.status = 'checked';
        this.addLogEntry(player.name + ' Check');
        this.nextPlayerTurn();
    }
    
    // ผู้เล่น Call
    playerCall(player) {
        const callAmount = this.currentBet - player.currentBet;
        const actualCallAmount = Math.min(callAmount, player.chips); // เรียกเท่าที่มี
        
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
    
    // ผู้เล่น Raise
    playerRaise(player, amount) {
        const actualAmount = Math.min(amount, player.chips); // เดิมพันเท่าที่มี
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
    
    // เปิดใช้งานการควบคุมสำหรับผู้เล่นจริง
    enablePlayerActions() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        if (!currentPlayer.isAI && !currentPlayer.isFolded && !currentPlayer.isEliminated && currentPlayer.chips > 0) {
            document.getElementById('fold-btn').disabled = false;
            
            if (currentPlayer.currentBet === this.currentBet) {
                document.getElementById('check-btn').disabled = false;
                document.getElementById('call-btn').disabled = true;
            } else {
                document.getElementById('check-btn').disabled = true;
                document.getElementById('call-btn').disabled = false;
            }
            
            if (currentPlayer.chips > 0) {
                document.getElementById('raise-btn').disabled = false;
                document.getElementById('bet-slider').disabled = false;
                document.getElementById('bet-slider').max = currentPlayer.chips;
                document.getElementById('bet-slider').value = Math.min(50, currentPlayer.chips);
                this.updateBetAmount();
            }
        } else {
            this.disablePlayerActions();
        }
    }
    
    // ปิดการใช้งานการควบคุม
    disablePlayerActions() {
        document.getElementById('fold-btn').disabled = true;
        document.getElementById('check-btn').disabled = true;
        document.getElementById('call-btn').disabled = true;
        document.getElementById('raise-btn').disabled = true;
        document.getElementById('bet-slider').disabled = true;
    }
    
    // อัพเดทจำนวนเงินที่ต้องการเดิมพัน
    updateBetAmount() {
        const slider = document.getElementById('bet-slider');
        const amountDisplay = document.getElementById('bet-amount');
        if (slider && amountDisplay) {
            amountDisplay.textContent = slider.value;
        }
    }
    
    // ต่อไปยังเฟสถัดไปของเกม
    nextGamePhase() {
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
    
    // เปรียบเทียบมือและหาผู้ชนะ
    showdown() {
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
            
            // แบ่งเงินกองกลางให้ผู้ชนะ
            this.distributePot(winners);
        }
        
        this.roundCompleted = true;
        this.updateUI();
        
        document.getElementById('continue-btn').style.display = 'block';
        
        this.checkGameEnd();
    }
    
    // เปรียบเทียบมือและหาผู้ชนะ
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

    // แบ่งเงินกองกลาง
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
    
    // สิ้นสุดรอบ (เมื่อมีผู้เล่นเหลือคนเดียว)
    endRound() {
        const winner = this.players.find(player => !player.isEliminated && !player.isFolded);
        if (winner) {
            winner.chips += this.pot;
            this.addLogEntry('<strong>' + winner.name + ' ชนะเงินกองกลาง ' + this.pot + '!</strong>');
            this.pot = 0;
        }
        
        this.revealAICards();
        
        this.roundCompleted = true;
        this.updateUI();
        
        document.getElementById('continue-btn').style.display = 'block';
        
        this.checkGameEnd();
    }
    
    // ตรวจสอบการจบเกม (แก้ไขแล้ว)
    checkGameEnd() {
        const activePlayers = this.players.filter(player => !player.isEliminated);
        
        // ตรวจสอบเฉพาะกรณีที่เกมจบจริงๆ (เหลือผู้เล่นคนเดียวที่ยังมีชิพ)
        const playersWithChips = this.players.filter(player => player.chips > 0 && !player.isEliminated);
        
        console.log('ตรวจสอบการจบเกม - ผู้เล่นที่เหลือ:', activePlayers.length, 'ผู้เล่นที่มีชิพ:', playersWithChips.length);
        
        if (playersWithChips.length === 1 && activePlayers.length > 1) {
            this.gameOver = true;
            const winner = playersWithChips[0];
            this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            document.getElementById('start-btn').disabled = false;
            document.getElementById('continue-btn').style.display = 'none';
            return true;
        }
        
        // ถ้ามีผู้เล่นแค่คนเดียวและคนนั้นมีชิพ
        if (activePlayers.length === 1 && activePlayers[0].chips > 0) {
            this.gameOver = true;
            const winner = activePlayers[0];
            this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            document.getElementById('start-btn').disabled = false;
            document.getElementById('continue-btn').style.display = 'none';
            return true;
        }
        
        // ผู้เล่นจริงหมดชิพ (จะถูกคัดออกในตาเริ่มใหม่)
        if (this.players[0].chips <= 0 && !this.players[0].isEliminated) {
            return false;
        }
        
        return false;
    }

    // คัดออกผู้เล่นที่เงินหมด (แก้ไขแล้ว)
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
        
        // ตรวจสอบว่าเกมจบหรือไม่ (เหลือผู้เล่นคนเดียว)
        const activePlayers = this.players.filter(player => !player.isEliminated);
        console.log('คัดออกผู้เล่นแล้ว - ผู้เล่นที่เหลือ:', activePlayers.length);
        
        if (activePlayers.length === 1) {
            this.gameOver = true;
            const winner = activePlayers[0];
            this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
            document.getElementById('start-btn').disabled = false;
            document.getElementById('continue-btn').style.display = 'none';
            return true; // เกมจบแล้ว
        }
        
        // ตรวจสอบว่าผู้เล่นจริงถูกคัดออกหรือไม่
        if (this.players[0].isEliminated) {
            // แต่ถ้ายังมี AI อื่นๆ ที่ยังมีชิพ ให้เกมดำเนินต่อ
            const remainingAIs = this.players.filter(player => 
                player.isAI && !player.isEliminated && player.chips > 0
            );
            
            if (remainingAIs.length > 1) {
                this.addLogEntry('<strong style="color: #ff0000;">คุณถูกคัดออก! แต่เกมจะดำเนินต่อระหว่าง AI</strong>');
                return false; // เกมยังไม่จบ ให้ AI เล่นต่อ
            } else if (remainingAIs.length === 1) {
                this.gameOver = true;
                const winner = remainingAIs[0];
                this.addLogEntry('<strong style="color: #ffd700; font-size: 1.2em;">' + winner.name + ' ชนะเกม!</strong>');
                document.getElementById('start-btn').disabled = false;
                document.getElementById('continue-btn').style.display = 'none';
                return true; // เกมจบแล้ว
            } else {
                this.gameOver = true;
                this.addLogEntry('<strong style="color: #ff0000; font-size: 1.2em;">คุณถูกคัดออก! เกมจบ</strong>');
                document.getElementById('start-btn').disabled = false;
                document.getElementById('continue-btn').style.display = 'none';
                return true; // เกมจบแล้ว
            }
        }
        
        console.log('คัดออกผู้เล่นที่เงินหมด:', eliminatedCount, 'คน');
        return false; // เกมยังไม่จบ
    }
    
    // คำนวณแต้มของมือไพ่
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
    
    // รีเซ็ตรอบ
    resetRound() {
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.gamePhase = 'preflop';
        this.bettingRoundComplete = false;
        this.showAICards = false;
        
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
    
    // รีเซ็ตเกม
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
        document.getElementById('start-btn').disabled = false;
        document.getElementById('continue-btn').style.display = 'none';
        this.disablePlayerActions();
        this.addLogEntry('เริ่มเกมใหม่!');
    }
    
    // อัพเดท UI (แก้ไขแล้ว)
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
        
        // อัพเดทข้อมูลเกม
        const potAmount = document.getElementById('pot-amount');
        const currentBet = document.getElementById('current-bet');
        const dealerName = document.getElementById('dealer-name');
        const gamePhase = document.getElementById('game-phase');
        
        if (potAmount) potAmount.textContent = this.pot;
        if (currentBet) currentBet.textContent = this.currentBet;
        if (dealerName) dealerName.textContent = this.players[this.dealerIndex].name;
        if (gamePhase) {
            const phaseNames = {
                'preflop': 'Pre-flop',
                'flop': 'Flop',
                'turn': 'Turn', 
                'river': 'River',
                'showdown': 'Showdown'
            };
            gamePhase.textContent = phaseNames[this.gamePhase] || 'Pre-flop';
        }
    }
    
    // เพิ่มบันทึกในประวัติเกม
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
    
    // ตั้งค่า event listeners
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
                this.startGame();
            });
        }
        
        if (foldBtn) {
            foldBtn.addEventListener('click', () => {
                this.playerFold(this.players[this.currentPlayerIndex]);
                this.disablePlayerActions();
            });
        }
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.playerCheck(this.players[this.currentPlayerIndex]);
                this.disablePlayerActions();
            });
        }
        
        if (callBtn) {
            callBtn.addEventListener('click', () => {
                this.playerCall(this.players[this.currentPlayerIndex]);
                this.disablePlayerActions();
            });
        }
        
        if (raiseBtn) {
            raiseBtn.addEventListener('click', () => {
                const raiseAmount = parseInt(document.getElementById('bet-slider').value);
                this.playerRaise(this.players[this.currentPlayerIndex], raiseAmount);
                this.disablePlayerActions();
            });
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
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
                this.resetGame();
            });
        }
        
        console.log('Event listeners initialized');
    }
    // ในคลาส TexasHoldemGame เพิ่ม method ต่อไปนี้:

// แสดง overlay ผู้ชนะ
showWinnerOverlay(winnerName, chipsWon) {
    const overlay = document.getElementById('winner-overlay');
    const winnerNameElement = document.getElementById('winner-name');
    const chipsWonElement = document.getElementById('chips-won-amount');
    
    if (overlay && winnerNameElement && chipsWonElement) {
        winnerNameElement.textContent = winnerName;
        chipsWonElement.textContent = chipsWon;
        overlay.style.display = 'flex';
        
        // เพิ่ม event listener สำหรับคลิกเพื่อปิด overlay
        const clickHandler = () => {
            this.hideWinnerOverlay();
            overlay.removeEventListener('click', clickHandler);
        };
        overlay.addEventListener('click', clickHandler);
    }
}

// ซ่อน overlay ผู้ชนะ
hideWinnerOverlay() {
    const overlay = document.getElementById('winner-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ใน method distributePot แก้ไขให้เรียกแสดง overlay
distributePot(winners) {
    if (winners.length === 1) {
        winners[0].chips += this.pot;
        const winMessage = winners[0].name + ' ชนะเงินกองกลาง ' + this.pot + ' ด้วย ' + winners[0].handRank + '!';
        this.addLogEntry('<strong>' + winMessage + '</strong>');
        
        // แสดง overlay ผู้ชนะ
        this.showWinnerOverlay(winners[0].name, this.pot);
    } else {
        const splitAmount = Math.floor(this.pot / winners.length);
        const winnerNames = winners.map(w => w.name).join(' และ ');
        winners.forEach(winner => {
            winner.chips += splitAmount;
        });
        this.addLogEntry(`<strong>เสมอ! ${winnerNames} แบ่งเงินกองกลาง คนละ ${splitAmount}</strong>`);
        
        // สำหรับกรณีเสมอ อาจจะไม่แสดง overlay หรือแสดงแบบพิเศษ
        if (winners.some(winner => winner.id === 'player-user')) {
            this.showWinnerOverlay('คุณ (เสมอ)', splitAmount);
        }
    }
    this.pot = 0;
}

// ใน method endRound แก้ไขให้เรียกแสดง overlay
endRound() {
    const winner = this.players.find(player => !player.isEliminated && !player.isFolded);
    if (winner) {
        winner.chips += this.pot;
        const winMessage = winner.name + ' ชนะเงินกองกลาง ' + this.pot + '!';
        this.addLogEntry('<strong>' + winMessage + '</strong>');
        
        // แสดง overlay ผู้ชนะ
        this.showWinnerOverlay(winner.name, this.pot);
        this.pot = 0;
    }
    
    this.revealAICards();
    
    this.roundCompleted = true;
    this.updateUI();
    
    document.getElementById('continue-btn').style.display = 'block';
    
    this.checkGameEnd();
}
}

// เริ่มเกมเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    window.pokerGame = new TexasHoldemGame();

});
// คลาสระบบธานาคาร
class BankSystem {
    constructor(pokerGame) {
        this.pokerGame = pokerGame;
        this.bankBalance = 2000; // เงินเริ่มต้นในธนาคาร
        this.passiveIncomeInterval = null;
        this.passiveIncomeTimeLeft = 300; // 5 นาทีในวินาที (300 วินาที)
        this.transactions = ['เริ่มต้น: เงิน 2000 ชิป'];
        
        this.initializeBankUI();
        this.startPassiveIncomeTimer();
        this.updateBankDisplay();
    }
    
    // เริ่มต้น UI ธนาคาร
    initializeBankUI() {
        // อัพเดทจำนวนชิพบนโต๊ะ
        this.updateTableChips();
        
        // Event Listeners
        document.getElementById('deposit-btn').addEventListener('click', () => this.deposit());
        document.getElementById('withdraw-btn').addEventListener('click', () => this.withdraw());
        document.getElementById('auto-refill-btn').addEventListener('click', () => this.autoRefill());
        document.getElementById('deposit-amount').addEventListener('input', () => this.validateInputs());
        document.getElementById('withdraw-amount').addEventListener('input', () => this.validateInputs());
        
        // ตรวจสอบชิพบนโต๊ะก่อนเริ่มเกม
        const originalStartGame = this.pokerGame.startGame.bind(this.pokerGame);
        this.pokerGame.startGame = () => {
            if (this.checkTableChips()) {
                originalStartGame();
            }
        };
    }
    
    // ตรวจสอบชิพบนโต๊ะก่อนเริ่มเกม
    checkTableChips() {
        const userPlayer = this.pokerGame.players[0];
        const tableChips = userPlayer.chips;
        
        if (tableChips <= 0) {
            this.addTransaction('❌ ไม่สามารถเริ่มเกมได้: ไม่มีชิพบนโต๊ะ');
            this.showBankMessage('⚠️ กรุณาเติมชิพก่อนเริ่มเกม!', 'warning');
            return false;
        }
        
        return true;
    }
    
    // อัพเดทจำนวนชิพบนโต๊ะ
    updateTableChips() {
        const userPlayer = this.pokerGame.players[0];
        const tableChipsElement = document.getElementById('table-chips');
        if (tableChipsElement) {
            tableChipsElement.textContent = userPlayer.chips;
        }
    }
    
    // ฝากเงิน
    deposit() {
        const amount = parseInt(document.getElementById('deposit-amount').value);
        const userPlayer = this.pokerGame.players[0];
        
        if (isNaN(amount) || amount <= 0) {
            this.showBankMessage('⚠️ กรุณากรอกจำนวนเงินที่ต้องการฝาก', 'error');
            return;
        }
        
        if (amount > userPlayer.chips) {
            this.showBankMessage('❌ ไม่มีชิพบนโต๊ะพอสำหรับฝาก', 'error');
            return;
        }
        
        // โอนเงินจากโต๊ะไปธนาคาร
        userPlayer.chips -= amount;
        this.bankBalance += amount;
        
        this.addTransaction(`ฝากเงิน: ${amount} ชิป (โต๊ะ → ธนาคาร)`);
        this.showBankMessage(`✅ ฝากเงิน ${amount} ชิปเรียบร้อย`, 'success');
        
        this.updateBankDisplay();
        this.pokerGame.updateUI();
    }
    
    // ถอนเงิน
    withdraw() {
        const amount = parseInt(document.getElementById('withdraw-amount').value);
        const userPlayer = this.pokerGame.players[0];
        
        if (isNaN(amount) || amount <= 0) {
            this.showBankMessage('⚠️ กรุณากรอกจำนวนเงินที่ต้องการถอน', 'error');
            return;
        }
        
        if (amount > this.bankBalance) {
            this.showBankMessage('❌ ยอดเงินในธนาคารไม่เพียงพอ', 'error');
            return;
        }
        
        // โอนเงินจากธนาคารไปโต๊ะ
        this.bankBalance -= amount;
        userPlayer.chips += amount;
        
        this.addTransaction(`ถอนเงิน: ${amount} ชิป (ธนาคาร → โต๊ะ)`);
        this.showBankMessage(`✅ ถอนเงิน ${amount} ชิปเรียบร้อย`, 'success');
        
        this.updateBankDisplay();
        this.pokerGame.updateUI();
    }
    
    // เติมชิพอัตโนมัติ
    autoRefill() {
        const userPlayer = this.pokerGame.players[0];
        const neededChips = 1500 - userPlayer.chips; // เติมให้เต็ม 1500
        
        if (neededChips <= 0) {
            this.showBankMessage('ℹ️ มีชิพบนโต๊ะเพียงพอแล้ว', 'info');
            return;
        }
        
        if (neededChips > this.bankBalance) {
            this.showBankMessage('❌ ยอดเงินในธนาคารไม่เพียงพอสำหรับเติมชิพ', 'error');
            return;
        }
        
        // เติมชิพอัตโนมัติ
        this.bankBalance -= neededChips;
        userPlayer.chips += neededChips;
        
        this.addTransaction(`เติมชิพอัตโนมัติ: ${neededChips} ชิป`);
        this.showBankMessage(`✅ เติมชิพ ${neededChips} ชิปเรียบร้อย`, 'success');
        
        this.updateBankDisplay();
        this.pokerGame.updateUI();
    }
    
    // ตรวจสอบความถูกต้องของ input
    validateInputs() {
        const depositAmount = parseInt(document.getElementById('deposit-amount').value);
        const withdrawAmount = parseInt(document.getElementById('withdraw-amount').value);
        const userPlayer = this.pokerGame.players[0];
        
        // กำหนดค่าสูงสุดสำหรับ input
        document.getElementById('deposit-amount').max = userPlayer.chips;
        document.getElementById('withdraw-amount').max = this.bankBalance;
        
        // ปิดปุ่มถ้ามีค่าไม่ถูกต้อง
        document.getElementById('deposit-btn').disabled = 
            isNaN(depositAmount) || depositAmount <= 0 || depositAmount > userPlayer.chips;
        
        document.getElementById('withdraw-btn').disabled = 
            isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > this.bankBalance;
    }
    
    // เริ่มนาฬิการายได้ passive
    startPassiveIncomeTimer() {
        this.updatePassiveTimerDisplay();
        
        this.passiveIncomeInterval = setInterval(() => {
            this.passiveIncomeTimeLeft--;
            
            if (this.passiveIncomeTimeLeft <= 0) {
                this.givePassiveIncome();
                this.passiveIncomeTimeLeft = 300; // รีเซ็ตเป็น 5 นาที
            }
            
            this.updatePassiveTimerDisplay();
        }, 1000);
    }
    
    // ให้รายได้ passive
    givePassiveIncome() {
        this.bankBalance += 500;
        this.addTransaction(`รายได้ passive: +500 ชิป`);
        this.showBankMessage('💰 ได้รับรายได้ passive 500 ชิป!', 'success');
        this.updateBankDisplay();
    }
    
    // อัพเดทการแสดงผลนาฬิกา
    updatePassiveTimerDisplay() {
        const minutes = Math.floor(this.passiveIncomeTimeLeft / 60);
        const seconds = this.passiveIncomeTimeLeft % 60;
        const timerElement = document.getElementById('passive-timer');
        
        if (timerElement) {
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // อัพเดทการแสดงผลทั้งหมด
    updateBankDisplay() {
        // อัพเดทยอดเงินธนาคาร
        const balanceElement = document.getElementById('bank-balance');
        if (balanceElement) {
            balanceElement.textContent = this.bankBalance;
        }
        
        // อัพเดทชิพบนโต๊ะ
        this.updateTableChips();
        
        // อัพเดทประวัติธุรกรรม
        this.updateTransactionList();
        
        // ตรวจสอบ input
        this.validateInputs();
    }
    
    // อัพเดทรายการธุรกรรม
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
    
    // เพิ่มธุรกรรมใหม่
    addTransaction(message) {
        const timestamp = new Date().toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.transactions.push(`[${timestamp}] ${message}`);
        
        if (this.transactions.length > 10) {
            this.transactions.shift(); // จำกัดจำนวนรายการ
        }
        
        this.updateTransactionList();
    }
    
    // แสดงข้อความธนาคาร
    showBankMessage(message, type = 'info') {
        // ใช้ระบบ log ของเกมเดิม
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        let styledMessage = message;
        if (type === 'success') {
            styledMessage = `<span style="color: #90EE90">${message}</span>`;
        } else if (type === 'error') {
            styledMessage = `<span style="color: #ff6b6b">${message}</span>`;
        } else if (type === 'warning') {
            styledMessage = `<span style="color: #ffd700">${message}</span>`;
        }
        
        this.pokerGame.addLogEntry(styledMessage);
    }
    
    // ทำลายระบบ (สำหรับ cleanup)
    destroy() {
        if (this.passiveIncomeInterval) {
            clearInterval(this.passiveIncomeInterval);
        }
    }
}

// แก้ไขการเริ่มต้นเกมเพื่อเพิ่มระบบธนาคาร
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    window.pokerGame = new TexasHoldemGame();
    
    // เพิ่มระบบธนาคารหลังจากเกมโหลดเสร็จ
    setTimeout(() => {
        window.bankSystem = new BankSystem(window.pokerGame);
        console.log('Bank system initialized');
    }, 1000);
});
