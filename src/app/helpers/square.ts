import { leftCoordHitbox, bullet, point } from '../helpers/interfaces';

export class Square {
    //Points are arranged clockwise, starting from the top left
    points: point[] = [];
    //Edges are arranged clockwise, starting from the top
    edges: point[] = [];

    constructor(obj?: leftCoordHitbox){
        if(obj){
            (this.points[0] = obj.pos),
            (this.points[1] = { x: obj.pos.x + obj.width, y: obj.pos.y }),
            (this.points[2] = { x: obj.pos.x + obj.width, y: obj.pos.y + obj.height }),
            (this.points[3] = { x: obj.pos.x, y: obj.pos.y + obj.height }),
            (this.edges[0] = this.calcVector(this.points[0], this.points[1]));
          this.edges[1] = this.calcVector(this.points[1], this.points[2]);
          this.edges[2] = this.calcVector(this.points[2], this.points[3]);
          this.edges[3] = this.calcVector(this.points[3], this.points[0]);
        }
    }
  
    translateTopLeftCoordHitboxToPoints(obj: leftCoordHitbox) {
      (this.points[0] = obj.pos),
        (this.points[1] = { x: obj.pos.x + obj.width, y: obj.pos.y }),
        (this.points[2] = { x: obj.pos.x + obj.width, y: obj.pos.y + obj.height }),
        (this.points[3] = { x: obj.pos.x, y: obj.pos.y + obj.height }),
        (this.edges[0] = this.calcVector(this.points[0], this.points[1]));
      this.edges[1] = this.calcVector(this.points[1], this.points[2]);
      this.edges[2] = this.calcVector(this.points[2], this.points[3]);
      this.edges[3] = this.calcVector(this.points[3], this.points[0]);
    }
  
    calcVector(point1: point, point2: point): point {
      return {
        x: point1.x - point2.x,
        y: point1.y - point2.y,
      };
    }

    static checkSquareOverlap(square1: Square, square2: Square) {
        var perpendicularLine: point;
        var dot = 0;
        var perpendicularStack = [];
    
        for (var i = 0; i < square1.edges.length; i++) {
          perpendicularLine = { x: -square1.edges[i].y, y: square1.edges[i].x };
          perpendicularStack.push(perpendicularLine);
        }
    
        for (var i = 0; i < square2.edges.length; i++) {
          perpendicularLine = { x: -square2.edges[i].y, y: square2.edges[i].x };
          perpendicularStack.push(perpendicularLine);
        }
    
        for (var i = 0; i < perpendicularStack.length; i++) {
          let amin = null;
          let amax = null;
          let bmin = null;
          let bmax = null;
          for (var j = 0; j < square1.points.length; j++) {
            dot =
              square1.points[j].x * perpendicularStack[i].x +
              square1.points[j].y * perpendicularStack[i].y;
            if (amax === null || dot > amax) {
              amax = dot;
            }
            if (amin === null || dot < amin) {
              amin = dot;
            }
          }
    
          for (var j = 0; j < square2.points.length; j++) {
            dot =
              square2.points[j].x * perpendicularStack[i].x +
              square2.points[j].y * perpendicularStack[i].y;
            if (bmax === null || dot > bmax) {
              bmax = dot;
            }
            if (bmin === null || dot < bmin) {
              bmin = dot;
            }
          }

          // stupid typescript hack
          if (amin === null) {
            amin = 10000;
          }
          if (amax === null) {
            amax = 10000;
          }
          if (bmin === null) {
            bmin = 10000;
          }
          if (bmax === null) {
            bmax = 10000;
          }
          if ((amin < bmax && amin > bmin) || (bmin < amax && bmin > amin)) {
            continue;
          } else {
            return false;
          }
        }
        return true;
      }
  }