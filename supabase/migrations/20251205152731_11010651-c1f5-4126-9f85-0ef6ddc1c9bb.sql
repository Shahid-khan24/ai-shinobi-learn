-- Add more rewards for the marketplace
INSERT INTO public.rewards (name, description, icon, rarity, reward_type, reward_value) VALUES
-- Common rewards
('Bronze Shuriken', 'A basic throwing star for beginners', '⭐', 'common', 'badge', '{"type": "badge"}'),
('Ninja Headband', 'Standard village headband', '🎀', 'common', 'cosmetic', '{"type": "accessory"}'),
('Scroll Fragment', 'A torn piece of an ancient scroll', '📜', 'common', 'cosmetic', '{"type": "fragment"}'),
('Training Weights', 'Basic weights for training', '🏋️', 'common', 'xp_boost', '{"xp_bonus": 5}'),
('Smoke Bomb', 'Creates a quick escape diversion', '💨', 'common', 'cosmetic', '{"uses": 3}'),
('Wooden Kunai', 'Practice kunai for training', '🗡️', 'common', 'cosmetic', '{"type": "weapon"}'),
('Rice Ball', 'Simple but filling ninja snack', '🍙', 'common', 'cosmetic', '{"energy": 10}'),
('Bandages', 'Basic medical supplies', '🩹', 'common', 'cosmetic', '{"heal": 5}'),
('Chakra Pill', 'Restores a small amount of chakra', '💊', 'common', 'cosmetic', '{"chakra": 20}'),
('Mission Scroll', 'Contains a secret mission', '📋', 'common', 'cosmetic', '{"mission_type": "D"}'),
('Ninja Sandals', 'Swift movement footwear', '👟', 'common', 'cosmetic', '{"type": "accessory"}'),
('Explosive Tag', 'Dangerous but effective', '💥', 'common', 'cosmetic', '{"damage": 15}'),

-- Rare rewards
('Silver Shuriken', 'A refined throwing star', '✨', 'rare', 'badge', '{"type": "badge"}'),
('Golden Shuriken', 'A masterfully crafted star', '🌟', 'rare', 'badge', '{"type": "badge"}'),
('Summoning Contract', 'Bind with a creature', '📖', 'rare', 'cosmetic', '{"summon": "toad"}'),
('ANBU Mask', 'Elite operative disguise', '🎭', 'rare', 'cosmetic', '{"type": "mask"}'),
('Chakra Crystal', 'Concentrated chakra energy', '💎', 'rare', 'xp_boost', '{"xp_bonus": 25}'),
('Shadow Clone Scroll', 'Learn forbidden technique', '👥', 'rare', 'title', '{"technique": "shadow_clone"}'),
('Poison Vial', 'Deadly assassin tool', '🧪', 'rare', 'cosmetic', '{"effect": "poison"}'),
('Ninja Cloak', 'Enhances stealth abilities', '🧥', 'rare', 'cosmetic', '{"type": "armor"}'),
('Thunder Scroll', 'Contains lightning jutsu', '⚡', 'rare', 'title', '{"element": "lightning"}'),
('Hidden Leaf Symbol', 'Village pride emblem', '🍃', 'rare', 'badge', '{"type": "emblem"}'),
('Medicinal Herbs', 'Rare healing plants', '🌿', 'rare', 'cosmetic', '{"heal": 15}'),
('Steel Kunai', 'Battle-ready throwing knife', '🔪', 'rare', 'cosmetic', '{"type": "weapon"}'),

-- Epic rewards
('Platinum Shuriken', 'Legendary throwing weapon', '💫', 'epic', 'badge', '{"type": "badge"}'),
('Sage Mode Crystal', 'Channel natural energy', '🔮', 'epic', 'xp_boost', '{"xp_bonus": 50}'),
('Akatsuki Ring', 'Symbol of the organization', '💍', 'epic', 'cosmetic', '{"type": "ring"}'),
('Forbidden Scroll', 'Contains secret techniques', '🗞️', 'epic', 'title', '{"techniques": "multi_shadow_clone"}'),
('Phoenix Feather', 'Rare mythical item', '🪶', 'epic', 'cosmetic', '{"creature": "phoenix"}'),
('Dragon Scale Armor', 'Nearly impenetrable', '🐉', 'epic', 'cosmetic', '{"type": "armor"}'),
('Tailed Beast Chakra', 'Immense power source', '🦊', 'epic', 'xp_boost', '{"xp_bonus": 75}'),
('Teleportation Kunai', 'Instant movement marker', '⚔️', 'epic', 'cosmetic', '{"ability": "teleport"}'),

-- Legendary rewards
('Diamond Shuriken', 'The ultimate throwing star', '💠', 'legendary', 'badge', '{"type": "badge"}'),
('Rinnegan Eye', 'The legendary doujutsu', '👁️', 'legendary', 'title', '{"doujutsu": "rinnegan"}'),
('Susanoo Armor', 'Ultimate chakra defense', '🛡️', 'legendary', 'cosmetic', '{"type": "ultimate_armor"}'),
('Sage of Six Paths Staff', 'Mythical weapon', '🪄', 'legendary', 'cosmetic', '{"type": "legendary_weapon"}'),
('Infinite Tsukuyomi Scroll', 'Ultimate genjutsu', '🌙', 'legendary', 'title', '{"genjutsu": "infinite"}'),
('Ten Tails Essence', 'Pure primordial power', '🌀', 'legendary', 'xp_boost', '{"xp_bonus": 100}'),
('Truth-Seeking Orb', 'Nullifies all techniques', '⚫', 'legendary', 'cosmetic', '{"ability": "nullify"}'),
('Hashirama Cells', 'Legendary regeneration', '🧬', 'legendary', 'xp_boost', '{"xp_bonus": 150}');