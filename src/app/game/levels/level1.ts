import { curvePath, curvePathWithPause, linePath, linePathWithPause, point } from "../../helpers/interfaces";
import { ActorList } from "../actors/actorlist";
import { Units } from "../globals";

//spawn times are in seconds, later mapped to ticks for precision
export class EnemySpawn{
    constructor(
        public name: ActorList,
        public start: point,
        public path: (linePath|curvePath|linePathWithPause|curvePathWithPause)[],
        public times: number[]
    ){}
}

// export const spawnMapLevel1 = [
//     {
//         name: ActorList.Boss,
//         start: { x: 0, y: 0 },
//         path: [],
//         times: [1]
//     },
// ];

export const spawnMapLevel1 = [
    {
        name: ActorList.Dongler,
        start: {x: Units.getUnits(-90), y: Units.getUnits(50)},
        path: [
            {
                dest: {x: Units.getPlayfieldWidth() + Units.getUnits(60), y: Units.getUnits(400)},
                speed: Units.getUnits(3),
            } as linePath
        ],
        times: [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
    },
    {
        name: ActorList.Dongler,
        start: {x: Units.getPlayfieldWidth() + 90, y: 50},
        path: [
            {
                dest: {x: Units.getUnits(-60), y: Units.getUnits(400)},
                speed: Units.getUnits(3),
            }
        ],
        times: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5]
    },
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
        times: [10, 10.2, 10.4, 10.6, 10.8]
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
        times: [13, 13.2, 13.4, 13.6, 13.8]
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
        start: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight()*.4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight()*.1 },
                control: { x: Units.getPlayfieldWidth() * .65, y: Units.getUnits(-50)},
                speed: Units.getUnits(5),
            },
        ],
        times: [21, 21.2, 21.4, 21.6, 21.8]
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getPlayfieldWidth() + 30, y: Units.getPlayfieldHeight()*.4 },
        path: [
            {
                dest: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight()*.1 },
                control: { x: Units.getPlayfieldWidth() * .45, y: Units.getUnits(-50)},
                speed: Units.getUnits(5),
            },
        ],
        times: [22, 22.2, 22.4, 22.6, 22.8]
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
        start: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight()*.4 },
        path: [
            {
                dest: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight()*.1 },
                control: { x: Units.getPlayfieldWidth() * .45, y: Units.getUnits(-50)},
                speed: Units.getUnits(5),
            },
        ],
        times: [27, 27.2, 27.4, 27.6, 27.8]
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight()*.4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight()*.1 },
                control: { x: Units.getPlayfieldWidth() * .65, y: Units.getUnits(-50)},
                speed: Units.getUnits(5),
            },
        ],
        times: [28, 28.2, 28.4, 28.6, 28.8]
    },
    {
        name: ActorList.Boss1,
        start: { x: 0, y: 0 },
        path: [],
        times: [32]
    },
    {
        name: ActorList.Shwoop,
        start: { x: Units.getUnits(-30), y: Units.getPlayfieldHeight()*.4 },
        path: [
            {
                dest: { x: Units.getPlayfieldWidth() + Units.getUnits(30), y: Units.getPlayfieldHeight()*.1 },
                control: { x: Units.getPlayfieldWidth() * .65, y: Units.getUnits(-50)},
                speed: Units.getUnits(5),
            },
        ],
        times: [28, 28.2, 28.4, 28.6, 28.8]
    },
];