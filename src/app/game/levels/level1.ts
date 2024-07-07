import { curvePath, curvePathWithPause, linePath, linePathWithPause, point } from "../../helpers/interfaces";
import { EnemyList } from "../actors/enemies/enemylist";
import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from "../globals";

//spawn times are in seconds, later mapped to ticks for precision
export class EnemySpawn{
    constructor(
        public name: EnemyList,
        public start: point,
        public path: (linePath|curvePath|linePathWithPause|curvePathWithPause)[],
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
                speed: 3,
            } as linePath
        ],
        times: [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
    },
    {
        name: EnemyList.Dongler,
        start: {x: PLAYFIELD_WIDTH + 90, y: 50},
        path: [
            {
                dest: {x: -60, y: 400},
                speed: 3,
            }
        ],
        times: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: PLAYFIELD_WIDTH * .85, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .85, y: PLAYFIELD_HEIGHT * .3 },
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
        times: [10, 10.2, 10.4, 10.6, 10.8]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: PLAYFIELD_WIDTH * .15, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .15, y: PLAYFIELD_HEIGHT * .3 },
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
        times: [13, 13.2, 13.4, 13.6, 13.8]
    },
    {
        name: EnemyList.BigBoi,
        start: { x: PLAYFIELD_WIDTH * .50, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .50, y: PLAYFIELD_HEIGHT * .2 },
                speed: 5,
                pauseTimeInSec: 3
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .50, y: PLAYFIELD_HEIGHT },
                speed: 2
            },

        ],
        times: [15]
    },
    {
        name: EnemyList.BigBoi,
        start: { x: PLAYFIELD_WIDTH * .25, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .25, y: PLAYFIELD_HEIGHT * .2 },
                speed: 5,
                pauseTimeInSec: 3
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .25, y: PLAYFIELD_HEIGHT },
                speed: 2
            },

        ],
        times: [18]
    },
    {
        name: EnemyList.BigBoi,
        start: { x: PLAYFIELD_WIDTH * .75, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .75, y: PLAYFIELD_HEIGHT * .2 },
                speed: 5,
                pauseTimeInSec: 3
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .75, y: PLAYFIELD_HEIGHT },
                speed: 2
            },

        ],
        times: [18]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: -30, y: PLAYFIELD_HEIGHT*.4 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH+30, y: PLAYFIELD_HEIGHT*.1 },
                control: { x: PLAYFIELD_WIDTH * .65, y: -50},
                speed: 5,
            },
        ],
        times: [21, 21.2, 21.4, 21.6, 21.8]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: PLAYFIELD_WIDTH + 30, y: PLAYFIELD_HEIGHT*.4 },
        path: [
            {
                dest: { x: -30, y: PLAYFIELD_HEIGHT*.1 },
                control: { x: PLAYFIELD_WIDTH * .45, y: -50},
                speed: 5,
            },
        ],
        times: [22, 22.2, 22.4, 22.6, 22.8]
    },
    {
        name: EnemyList.BigBoi,
        start: { x: PLAYFIELD_WIDTH * .50, y: -50 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH * .50, y: PLAYFIELD_HEIGHT * .3 },
                speed: 5,
                pauseTimeInSec: 3
            },
            {
                dest: { x: PLAYFIELD_WIDTH * .50, y: PLAYFIELD_HEIGHT },
                speed: 2
            },

        ],
        times: [26]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: PLAYFIELD_WIDTH + 30, y: PLAYFIELD_HEIGHT*.4 },
        path: [
            {
                dest: { x: -30, y: PLAYFIELD_HEIGHT*.1 },
                control: { x: PLAYFIELD_WIDTH * .45, y: -50},
                speed: 5,
            },
        ],
        times: [27, 27.2, 27.4, 27.6, 27.8]
    },
    {
        name: EnemyList.Shwoop,
        start: { x: -30, y: PLAYFIELD_HEIGHT*.4 },
        path: [
            {
                dest: { x: PLAYFIELD_WIDTH+30, y: PLAYFIELD_HEIGHT*.1 },
                control: { x: PLAYFIELD_WIDTH * .65, y: -50},
                speed: 5,
            },
        ],
        times: [28, 28.2, 28.4, 28.6, 28.8]
    },
];