
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

        function fleeAction() {
            const success = Math.random() > 0.4;
            if (success) {
                log("You manage to escape!", "dim");
                separator();
                onLose("flee");
            } else {
                const enemyDmg = rand(enemy.atk, Math.ceil(enemy.atk * 1.5));
                player.hp -= enemyDmg;
                log(`You fail to flee. The ${enemy.name} hits you for ${enemyDmg}. HP: ${player.hp}`, "combat");
                updateStats();
                if (player.hp <= 0) { loseCombat(); return; }
                combatTurn();
            }
        }

        function winCombat() {
            const gold = rand(enemy.gold[0], enemy.gold[1]);
            player.gold += gold;
            log(`You defeated the ${enemy.name}! +${gold} gold.`, "loot");

            if (enemy.loot && Math.random() < enemy.loot.chance) {
                const item = enemy.loot;
                log(`The ${enemy.name} dropped: ${item.name}!`, "loot");
                if (item.atkBonus) { player.atk += item.atkBonus; log(`ATK +${item.atkBonus}`, "loot");}
                if (item.hpBonus) { player.maxHp += item.hpBonus; player.hp += item.hpBonus; log(`Max HP +${item.hpBonus}`, "heal");}
                if (item.healAmount) { heal(item.healAmount); log(`Healed ${item.healAmount} HP.`, "heal");}
                player.inventory.push(item.name);
            }

            updateStats();
            separator();
            onWin();
        }

        function loseCombat() {
            log("Your HP drops to 0.", "combat");
            gameOver();
        }

        combatTurn();

}

//shop

function openShop(onLeave) {
    log("A merchant appears from the shadows. \"Buy something or get out.\"", "scene");

    function showShop() {
        const affordable = shopItems.filter(i => player.gold >= i.cost && !player.inventory.includes(i.name));
        const options = affordable.map(item => ({
            label: `Buy ${item.name} (${item.cost}g)` ,
            action: () => {
                player.gold -= item.cost;
                item.effect();
                player.inventory.push(item.name);
                updateStats();
                showShop();
            }
        }));
        options.push({ label: "Leave shop", action: onLeave });
        renderChoices(options);
    }

    showShop();

}

//game over

function gameOver() {
    separator();
    log("YOU DIED", "death");
    log(`You reached floor ${player.floor} with ${player.gold} gold.`, "dim");
    renderChoices([{ label: "Try Again", action: () => location.reload() }]);
}

function gameWin() {
    separator();
    log("The dragon collapses. Its roar fades to silence.", "scene");
    log("Light pours in through a crack in the ceiling. You see sky for the first time in what feels like forever.", "scene");
    log(`UNDERLOST CLEARED`, "death");
    log(`Floor 5 | ${player.gold} gold | ATK ${player.atk} | HP ${player.hp}/${player.maxHp}`, "dim");
    renderChoices([{ label: "Play Again", action: () => location.reload() }]);
}

//floors

function floor1() {
    separator();
    log("FLOOR 1 - The Entrance", "scene");
    log("You wake up at the bottom of a stone staircase. Your torch flickers. The air smells like rot and old copper.", "scene");
    log("Ahead: a dark corridor. To your left: a wooden door. To your right: sounds of movement.", "scene");


    renderChoices([
        { 
            label: "Go down the corridor",
            action: () => {
                log("The corridor leads to a small chamber. A giant rat guards a chest.", "scene");
                startCombat("rat",
                    () => {
                        log("You pry open the chest. Inside: a dusty health potion.", "loot");
                        player.inventory.push("Health Potion");
                        updateStats();
                        log("You pocket it and move deeper.", "dim");
                        floor1_continue();
                    },
                    (reason) => {
                        if (reason === "flee") log("You retreat to the entrance.", "dim");
                        floor1_continue();
                    }
                );
            }
        },

        {
            label: "Try the wooden door",
            action: () => {
                log("The door opens to a small room. A skeleton sits at a table. On the table: 10 gold and a note.", "scene");
                log("The note reads: 'Don't go to floor 3 without a weapon. I did. This is where I am now.'", "dim");
                player.gold += 10;
                player.flags.add("read_warning");
                updateStats();
                log("+10 gold.", "loot");
                floor1_continue();
            }
        },
        {
            label: "Investigate the sounds",
            action: () => {
                log("Two goblins are arguing over a coin. They notice you.", "scene");
                startCombat("goblin", 
                    () => {
                        log("One goblin fled. You grab the coin they were fighting over.", "loot");
                        player.gold += 8;
                        updateStats();
                        floor1_continue();
                    },
                    () => floor1_continue()
                );
            }
        },
    ]);
}

function floor1_continue() {
    log("At the end of the entrance hall, a staircase leads down.", "scene");
    renderChoices([
        {
            label: "Descend to floor 2",
            action: () => { player.floor = 2; updateStats(); floor2(); }
        },
        {
            label: "Rest here first (+15 HP)",
            action: () => {
                heal(15);
                log("You rest against the wall. HP restored slightly.", "heal");
                updateStats();
                renderChoices([{
                    label: "Descend to floor 2",
                    action: () => { player.floor = 2; updateStats(); floor2(); }
                }]);
            }
        }
    ]);
}


function floor2() {
    separator();
    log("FLOOR 2 - The Barracks", "scene");
    log("Rows of broken bunks line the walls. Whatever army lived here is long gone... mostly.", "scene");
    log("You spot three paths forward.", "scene");

    renderChoices([
        {
            label: "Check the armory",
            action: () => {
                log("The armory is picked clean except for a cracked shielf. It's better than nothing.", "scene");
                player.maxHp += 15;
                player.hp += 15;
                player.inventory.push("Cracked Shield");
                updateStats();
                log("Max HP +15.", "heal");
                floor2_event();
            }
        },

        {
            label: "Search the bunks",
            action: () => {
                const find = Math.random();
                if (find > 0.5) {
                    log("Under a mattress you find a small pouch. 18 gold.", "loot");
                    player.gold += 18;
                    updateStats();
                } else {
                    log("You find nothing but dust and old boot prints.", "dim");
                }
                floor2_event();
            }
        },

        {
            label: "Go straight through",
            action: () => {
                log("You move quickly. No detours.", "dim");
                floor2_event();
            }
        }
    ]);
}

