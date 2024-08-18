import { leftCoordHitbox } from "../../../helpers/interfaces";

export abstract class BulletAbstract{
    abstract hitbox: leftCoordHitbox;
    abstract color: string;
    abstract spriteData: {
        sprite: string,
        hitbox: leftCoordHitbox
    };
    protected hitboxToSpriteScale = 2.5;
    flagForDeletion = false;
    overlap = 1;

    abstract move(): void;
    abstract changeHitboxToSpriteScale(scale: number): void;
    spawnMore(): BulletAbstract[] | null{
        return null;
    };
}