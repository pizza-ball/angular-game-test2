import { leftCoordHitbox } from "../../../helpers/interfaces";

export abstract class BulletAbstract{
    abstract hitbox: leftCoordHitbox;
    abstract color: string;
    abstract spriteData: {
        sprite: string,
        hitbox: leftCoordHitbox
    };
    flagForDeletion = false;

    abstract move(): void;
}