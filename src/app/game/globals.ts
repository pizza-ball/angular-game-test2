export const INTERNAL_RES_X = 800;
export const INTERNAL_RES_Y = 600;
export const FPS_TARGET = 60;
//Same playspace ratio as Touhou, translated to 800x600
export const PF_WIDTH = 480;
export const PF_HEIGHT = 560;
export const DEBUG_MODE = false;
export const SCALING_FACTOR = 1;

// SCALING_FACTOR values for different resolutions
// 640x480 = .8
// 800x600 = 1
// 960x720 = 1.2
// 1120x840 = 1.4
// 1280x960 = 1.6
// 1440x1080 = 1.8

//Should be used in all pixel values going to HTML. Allows consistent sizing at multiple resolutions.
//SCALING_FACTOR should be 1 when resolution is 800x600. Base level unit size.
export class Units {

    static getGameWidth() {
        return INTERNAL_RES_X * SCALING_FACTOR;
    }

    static getGameHeight() {
        return INTERNAL_RES_Y * SCALING_FACTOR;
    }

    static getPlayfieldWidth() {
        return PF_WIDTH * SCALING_FACTOR;
    }

    static getPlayfieldHeight() {
        return PF_HEIGHT * SCALING_FACTOR;
    }

    static getPixels(units: number) {
        return units / SCALING_FACTOR;
    }

    static getUnits(pixels: number) {
        return pixels * SCALING_FACTOR;
    }

    //percent should be an integer from -200 to 200
    static xFromPct(percent: number) {
        if (percent < -200 || percent > 200) {
            throw "xFromPct: OUTSIDE ALLOWED PERCENTAGE RANGE";
        }
        return this.getPlayfieldWidth() * (percent / 100);
    }

    //percent should be an integer from -200 to 200
    static yFromPct(percent: number) {
        if (percent < -200 || percent > 200) {
            throw "yFromPct: OUTSIDE ALLOWED PERCENTAGE RANGE";
        }
        return this.getPlayfieldHeight() * (percent / 100);
    }

    static secToTick(sec: number){
        return Math.round(sec*FPS_TARGET) //Rounds incase we're converting to a fraction of a tick.
    }
}