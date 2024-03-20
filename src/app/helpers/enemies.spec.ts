import { Enemy, enemySprites } from './enemies';
import { bulletBehavior, bulletPattern } from './interfaces';

describe('Enemy', () => {
  let testEnemy: Enemy;

  beforeEach(async () => {
    testEnemy = new Enemy(enemySprites.ratBall, [1], 0, bulletBehavior.atPlayer, bulletPattern.single, undefined, 1, 1, undefined);
  });

  it('should fire if on the right tick', () => {
    expect(testEnemy.checkToFire(60)).toBeTrue();
  });
});
