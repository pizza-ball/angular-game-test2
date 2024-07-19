export class SpawnHelper{
    static spawnTimeGenerator(startSecond: number, groupPerSec: number, separationSec: number, endSecond: number): number[]{
        if(separationSec < 1){
            throw ("Spawn groups must be separated by a second or more.");
        }
        if(startSecond >= endSecond){
            throw ("startSecond must be smaller than endSecond");
        }

        let spawnSubSec = (1/groupPerSec);
        let spawnTimes = []
        for(let i = startSecond; i < endSecond; i += separationSec ){
            for(let j = 0; j < groupPerSec; j++){
                spawnTimes.push(i + (spawnSubSec*j));
            }
        }

        return spawnTimes;
    }
}