type GunAction = {
  id: string;
  name: string;
  description: string;
  sprite: string;
  type: number;
  spawn_level: string;
  spawn_probability: string;
  price: number;
  mana: number;
  max_uses?: number;
  action: (this: void) => void;
};

const actions = (globalThis as any).actions as GunAction[];

const bullet = actions.find((action) => action.id == "LIGHT_BULLET");

if (bullet) bullet.max_uses = 100;
