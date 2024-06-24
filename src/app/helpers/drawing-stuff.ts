import { point } from "./interfaces";
import { v4 } from 'uuid';

export class DrawingStuff {
    //saves a record of each function call for faster re-draw potential
    static callRecord: any[] = [];

    static requestLineDraw(id: string, ctx: CanvasRenderingContext2D, sX: number, sY: number, eX: number, eY: number){
        this.callRecord.push({
            id: id,
            func: this.drawLine,
            params: [ctx, sX, sY, eX, eY]
        });
        this.drawLine(ctx, sX, sY, eX, eY);
    }

    static requestCurveDraw(id: string, ctx: CanvasRenderingContext2D, sX: number, sY: number, eX: number, eY: number, cX: number, cY: number){
        this.callRecord.push({
            id: id,
            func: this.drawCurve,
            params: [ctx, sX, sY, eX, eY, cX, cY]
        });
        this.drawCurve(ctx, sX, sY, eX, eY, cX, cY);
    }

    static drawLine(ctx: CanvasRenderingContext2D, sX: number, sY: number, eX: number, eY: number) {
        if (!ctx) {
            console.error("2D CANVAS IS NULL");
            return;
        }

        ctx.beginPath();
        ctx.arc(sX, sY, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
      
        ctx.beginPath();
        ctx.arc(eX, eY, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.moveTo(sX, sY);
        ctx.lineTo(eX, eY);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        //console.log("Drew a line from " + sX + ", " + sY + "to " + eX + ", " + eY);
    }

    static drawCurve(ctx: CanvasRenderingContext2D, sX: number, sY: number, eX: number, eY: number, cX: number, cY: number) {
        if (!ctx) {
            console.error("2D CANVAS IS NULL");
            return;
        }

        ctx.beginPath();
        ctx.arc(sX, sY, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
      
        ctx.beginPath();
        ctx.arc(eX, eY, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cX, cY, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.moveTo(sX, sY);
        ctx.quadraticCurveTo(cX, cY, eX, eY);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        //console.log("Drew a curve from " + sX + ", " + sY + "to " + eX + ", " + eY);
    }

    static deleteElementsAndRedraw(ctx: CanvasRenderingContext2D, uuid: string){
        if (!ctx) {
            console.error("CANNOT CLEAN CANVAS, 2D CANVAS IS NULL");
            return;
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let i = 0; i < this.callRecord.length; i++) {
            if(this.callRecord[i].id === uuid){
                this.callRecord.splice(i, 1);
                i--;
            }
        }
        
        this.callRecord.forEach((drawCall, i) => {
            drawCall.func(...drawCall.params);
        });
    }
}