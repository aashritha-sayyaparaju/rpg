
//player

const player = {
    hp: 100,
    maxHp: 100,
    atk: 8,
    gold: 0,
    floor: 1,
    inventory: [],
    flags: new Set(),
};

//enemies

const enemies = {
    rat: {
        name: "Giant Rat",
        hp: 18,
        atk: 4,
        gold: [2,5],
        loot: null,
    },

    goblin: {
        name: "Goblin Scout",
        hp: 30,
        atk: 7,
        gold: [5,12],
        loot: { name: "Rusty Dagger", atkBonus: 3, chance: 0.3},
    },
    skeleton: {
        name: "Skeleton Warrior",
        hp: 45,
        atk: 11,
        gold: [8,18],
        loot: { name: "Bone Shield", hpBonus: 20, chance: 0.25},
    },

    troll: {
        name: "Cave Troll",
        hp: 80,
        atk: 16,
        gold: [20,35],
        loot: {name: "Troll Heart", healAmount: 40, chance: 0.4},
    },

    witch: {
        name: "Dungeon Witch",
        hp: 60,
        atk: 14,
        gold: [25,40],
        loot: { name: "Spell Shard", atkBonus: 6, chance: 0.5},
    },
    
    dragon: {
        name: "THE UNDERLOST DRAGON",
        hp: 200,
        atk: 28,
        gold: [100,100],
        loot: null,
        boss: true,
    },
};

// Items

const shopItems = [
    { name: "Health Potion", cost: 15, effect: () => { heal(40); log("You drink the potion. +40 HP.", "heal");}},
    { name: "Iron Sword", cost: 25, effect: () => { player.atk += 5; log("You equip the Iron Sword. ATK +5.", "loot");}},
    { name: "Reinforced Armor," cost: 30, effect: () => { player.maxHp += 30; player.hp += 30; log("You put on the armor. Max HP + 30.", "heal");}},
    { name: "Lucky Charm", cost: 20, effect: () => { player.flags.add("lucky"); log("The charm hums. You feel luckier.", "loot");}},
];

// floors

const floors = [
    floor1,
    floor2,
    floor3,
    floor4,
    floor5,
];


//main functions

function log(text, type = "") {
    const entry = document.createElement("div");
    entry.className = "log-entry" + (type ? " " + type : "");
    entry.textContent = text;
    document.getElementById("log").appendChild(entry);
    entry.scrollIntoView({ behavior: "smooth", block: "nearest"});
}

function separator() {
    const hr = document.createElement("hr");
    hr.className = "log-separator";
    document.getElementById("log").appendChild(hr);
}

function updateStats() {
    document.getElementsById("stat-hp").textContent = player.hp;
    document.getElementById("stat-maxhp").textContent = player.maxHp;
    document.getElementById("stat-atk").textContent = player.atk;
    document.getElementById("stat-gold").textContent = player.gold;
    document.getElementById("stat-floor").textContent = player.inventory.length > 0 ? player.inventory.join(", ") : "empty";


    const hpEl = document.getElementById("stat-hp");
    hpEl.style.color = player.hp <= 25
    ? "var(--danger)"
    : player.hp <= 50
    ? "var(--gold)"
    : "var(--success)";

    const pct = Math.max(0, (player.hp / player.maxHp) * 100);
    const bar = document.getElementById("hp-bar");
    if (bar) {
        bar.style.width = pct + "%";
        bar.style.background = player.hp <= 25
        ? "var(--danger)"
        : player.hp <= 50
        ? "var(--gold)"
        : "var(--success)";
    }
}

function renderChoices(options) {
    const el = document.getElementById("choices");
    el.innerHTML = "";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt.label;
        if (opt.danger) btn.classList.add("danger");
        btn.onclick = () => {
            el.innerHTML = "";
            log(`> ${opt.label}`, "dim");
            opt.action();
        };
        el.appendChild(btn);
    });
}

function heal(amount) {
    player.hp = Math.min(player.maxHp, player.hp + amount);
    updateStats();
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//fighting (in combat)

function startCombat(enemyKey, onWin, onLose) {
    const template = enemies[enemyKey];
    const enemy = { ...template, currentHp: template.hp};

    separator();
    if (enemy.boss) {
        log(`⚠ BOSS ENCOUNTER: ${enemy.name}`, "death");
    } else {
        log(`A ${enemy.name} appears! (HP: ${enemy.hp} | ATK: ${enemy.atk} )`, "combat");
    }

    function combatTurn() {
        renderChoices([
            { label: "Attack", action: attackAction },
            { label: "Use Potion", action: potionAction },
            { label: "Flee", action: fleeAction, danger: true },
        ]);
    }

    function attackAction() {
        const lucky = player.flags.has("lucky") && Math.random() < 0.2;
        const playerDmg = lucky
        ? player.atk * 2
        : rand(Math.floor(player.atk * 0.8), Math.ceil(player.atk * 1.2));

        enemy.currentHp -= playerDmg;
        log(`You hit the ${enemy.name} for ${playerDmg}${lucky ? " (CRITICAL!)" : ""} damage. Enemy HP: ${Math.max(0, enemy.currentHp)}`, "combat");

        if (enemy.currentHp <= 0) {
            winCombat();
            return;
        }


        //enemy fights back

        const enemyDmg = rand(Math.floor(enemy.atk * 0.8), Math.ceil(enemy.atk * 1.2));
        player.hp -= enemy.Dmg;
        log(`The ${enemy.name} hits you for ${enemyDmg} damage. Your HP: ${player.hp}`, "combat");
        updateStats();

        if (player.hp <= 0) {
            loseCombat();
            return;
        }

        combatTurn();

    }

    function potionAction() {
        const hasPotion = player.inventory.includes("Health Potion");
        if (!hasPotion) {
            log("You have no potions.", "dim");
            combatTurn();
            return();
        }

        player.inventory.splice(player.inventory.indexOf("Health Potion"), 1);
        heal(40);
        log("You drink a Health Potion. +40 HP.", "heal");
        updateStats();

        const enemyDmg = rand(Math.floor(enemy.atk * 0.8), Math.ceil(enemy.atk * 1.2));
        player.hp -= enemyDmg;
        log(`The ${enemy.name} hits you for ${enemyDmg} while you drink. Your HP: ${player.hp}`, "combat");
        updateStats();

        if (player.hp <= 0) { loseCombat(); return; }
        combatTurn();
    }

        





}

