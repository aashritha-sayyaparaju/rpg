
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

