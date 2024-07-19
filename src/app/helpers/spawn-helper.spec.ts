import { TestBed } from '@angular/core/testing';
import { SpawnHelper } from './spawn-helper';
import { AppComponent } from '../app.component';

describe('SpawnHelper', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [AppComponent],
        }).compileComponents();
    });

    it('should build a spawn array to spec', () => {
        let result1 = SpawnHelper.spawnTimeGenerator(31, 2, 1, 33);
        expect(result1).toEqual([31, 31.5, 32, 32.5]);
    });
});