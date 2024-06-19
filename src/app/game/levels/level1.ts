import { curvePath, linePath, point } from "../../helpers/interfaces";
import { EnemyList } from "../actors/enemies/enemylist";
import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from "../globals";

//spawn times are in seconds, later mapped to ticks for precision
export class EnemySpawn{
    constructor(
        public name: EnemyList,
        public start: point,
        public path: (linePath|curvePath)[],
        public times: number[]
    ){}
}

export const spawnMapLevel1 = [
    {
        name: EnemyList.Dongler,
        start: {x: -90, y: 50},
        path: [
            {
                dest: {x: PLAYFIELD_WIDTH + 60, y: 400},
                speed: 2,
            } as linePath
        ],
        times: [2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    {
        name: EnemyList.Dongler,
        start: {x: PLAYFIELD_WIDTH + 90, y: 50},
        path: [
            {
                dest: {x: -60, y: 400},
                speed: 2,
            }
        ],
        times: [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: PLAYFIELD_WIDTH * .75, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .75, y: PLAYFIELD_HEIGHT * .3 },
                speed: 5,
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .25, y: PLAYFIELD_HEIGHT * .1 },
                control: { x: PLAYFIELD_WIDTH * .65, y: PLAYFIELD_HEIGHT * .75 },
                speed: 5,
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .25, y: -50 },
                speed: 5,
            },

        ],
        times: [10, 10.2, 10.4]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: PLAYFIELD_WIDTH * .25, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .25, y: PLAYFIELD_HEIGHT * .3 },
                speed: 5,
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .75, y: PLAYFIELD_HEIGHT * .1 },
                control: { x: PLAYFIELD_WIDTH * .35, y: PLAYFIELD_HEIGHT * .75 },
                speed: 5,
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .75, y: -50 },
                speed: 5,
            },

        ],
        times: [13, 13.2, 13.4]
    },
];