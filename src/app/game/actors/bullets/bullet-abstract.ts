import { leftCoordHitbox } from "../../../helpers/interfaces";

export abstract class BulletAbstract{
    abstract hitbox: leftCoordHitbox;
    abstract color: string;
    abstract spriteData: {
        sprite: string,
        hitbox: leftCoordHitbox
    };
    flagForDeletion = false;
    overlap = 1;

    abstract move(): void;
}