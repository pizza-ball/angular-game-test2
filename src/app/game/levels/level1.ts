import { range } from "rxjs";
import { curvePath, linePath, point } from "../../helpers/interfaces";
import { ActorList } from "../actors/actorlist";
import { Units } from "../globals";
import { SpawnHelper } from "../../helpers/spawn-helper";

//spawn times are in seconds, later mapped to ticks for precision
export class EnemySpawn {
    constructor(
        public name: ActorList,
        public start: point,
        public path: (linePath | curvePath)[],
        public times: number[]
    ) { }
}

//Test array used for trying new enemies and bosses.
export const spawnMapLevel12 = [
    {
        name: ActorList.Boss1,
        start: { x: 0, y: 0 },
        path: [],
        times: [1]
    },
];

export const spawnMapLevel1 = [
    {
        name: ActorList.Dongler,
        start: { x: Units.getUnits(-90), y: Units.getUnits(50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() + Units.getUnits(60), y: Units.getUnits(400) },
                speed: Units.getUnits(3),
            } as linePath
        ],
        //times: SpawnHelper.spawnTimeGenerator(2, 2, 1, 7)
        times: SpawnHelper.spawnTimeGenerator(2, 1, 1, 2.2)
    },
    // {
    //     name: ActorList.Dongler,
    //     start: { x: Units.getPlayfieldWidth() + Units.getUnits(90), y: Units.getUnits(50) },
    //     path: [
    //         {
    //             dest: { x: Units.getUnits(-60), y: Units.getUnits(400) },
    //             speed: Units.getUnits(3),
    //         }
    //     ],
    //     times: SpawnHelper.spawnTimeGenerator(2.5, 2, 1, 7.5)
    // },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getPlayfieldWidth() * .85, y: Units.getUnits(-50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .85, y: Units.getPlayfieldHeight() * .3 },
                speed: Units.getUnits(5),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .25, y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .65, y: Units.getPlayfieldHeight() * .75 },
                speed: Units.getUnits(5),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .25, y: Units.getUnits(-50) },
                speed: Units.getUnits(5),
            },

        ],
        times: SpawnHelper.spawnTimeGenerator(10, 5, 1, 11)
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getPlayfieldWidth() * .15, y: Units.getUnits(-50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .15, y: Units.getPlayfieldHeight() * .3 },
                speed: Units.getUnits(5),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .75, y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .35, y: Units.getPlayfieldHeight() * .75 },
                speed: Units.getUnits(5),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .75, y: -50 },
                speed: Units.getUnits(5),
            },

        ],
        times: SpawnHelper.spawnTimeGenerator(13, 5, 1, 14)
    },
    {
        name: ActorList.BigBoi,
        start: { x: Units.getPlayfieldWidth() * .50, y: Units.getUnits(-50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .50, y: Units.getPlayfieldHeight() * .2 },
                speed: 5,
                pauseTimeInSec: 3
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .50, y: Units.getPlayfieldHeight() },
                speed: Units.getUnits(2)
            },

        ],
        times: [15]
    },
    {
        name: ActorList.BigBoi,
        start: { x: Units.getPlayfieldWidth() * .25, y: Units.getUnits(-50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .25, y: Units.getPlayfieldHeight() * .2 },
                speed: Units.getUnits(5),
                pauseTimeInSec: 3
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .25, y: Units.getPlayfieldHeight() },
                speed: Units.getUnits(2)
            },

        ],
        times: [18]
    },
    {
        name: ActorList.BigBoi,
        start: { x: Units.getPlayfieldWidth() * .75, y: Units.getUnits(-50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .75, y: Units.getPlayfieldHeight() * .2 },
                speed: Units.getUnits(5),
                pauseTimeInSec: 3
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .75, y: Units.getPlayfieldHeight() },
                speed: Units.getUnits(2)
            },

        ],
        times: [18]
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight() * .4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .65, y: Units.getUnits(-50) },
                speed: Units.getUnits(5),
            },
        ],
        times: SpawnHelper.spawnTimeGenerator(21, 5, 1, 22)
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getPlayfieldWidth() + 30, y: Units.getPlayfieldHeight() * .4 },
        path: [
            {
                dest: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .45, y: Units.getUnits(-50) },
                speed: Units.getUnits(5),
            },
        ],
        times: SpawnHelper.spawnTimeGenerator(22, 5, 1, 23)
    },
    {
        name: ActorList.BigBoi,
        start: { x: Units.getPlayfieldWidth() * .50, y: Units.getUnits(-50) },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .50, y: Units.getPlayfieldHeight() * .3 },
                speed: Units.getUnits(5),
                pauseTimeInSec: 3
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .50, y: Units.getPlayfieldHeight() },
                speed: Units.getUnits(2)
            },

        ],
        times: [26]
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight() * .4 },
        path: [
            {
                dest: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .45, y: Units.getUnits(-50) },
                speed: Units.getUnits(5),
            },
        ],
        times: SpawnHelper.spawnTimeGenerator(27, 5, 1, 28)
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight() * .4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .65, y: Units.getUnits(-50) },
                speed: Units.getUnits(5),
            },
        ],
        times: SpawnHelper.spawnTimeGenerator(28, 5, 1, 29)
    },
    {
        //MidBoss1 takes 43~ seconds to complete at the maximum. fill the time here, to here+63 with filler enemies.
        name: ActorList.MidBoss1,
        start: { x: 0, y: 0 },
        path: [],
        times: [32]
    },
    {   //Filler enemies. Will only spawn if the midboss is killed early.
        name: ActorList.Shwoop,
        start: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight() * .4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .5, y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .2, y: Units.getPlayfieldHeight() * .1 },
                speed: Units.getUnits(5),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .4, y: Units.getPlayfieldHeight() * .4 },
                control: { x: Units.getPlayfieldWidth() * .9, y: Units.getPlayfieldHeight() * .2 },
                speed: Units.getUnits(3),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .25, y: Units.getUnits(-30) },
                control: { x: Units.getPlayfieldWidth() * .15, y: Units.getPlayfieldHeight() * .3 },
                speed: Units.getUnits(6),
            },
        ],
        times: SpawnHelper.spawnTimeGenerator(33, 4, 6, 75)
    },
    {   //Filler enemies.
        name: ActorList.Shwoop,
        start: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight() * .4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() * .5, y: Units.getPlayfieldHeight() * .1 },
                control: { x: Units.getPlayfieldWidth() * .8, y: Units.getPlayfieldHeight() * .1 },
                speed: Units.getUnits(5),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .6, y: Units.getPlayfieldHeight() * .4 },
                control: { x: Units.getPlayfieldWidth() * .1, y: Units.getPlayfieldHeight() * .2 },
                speed: Units.getUnits(3),
            },
            {
                dest: { x: Units.getPlayfieldWidth() * .75, y: Units.getUnits(-30) },
                control: { x: Units.getPlayfieldWidth() * .85, y: Units.getPlayfieldHeight() * .3 },
                speed: Units.getUnits(6),
            },
        ],
        times: SpawnHelper.spawnTimeGenerator(35, 4, 6, 75)
    },
    {
        name: ActorList.Boss1,
        start: { x: 0, y: 0 },
        path: [],
        times: [85]
    },
];