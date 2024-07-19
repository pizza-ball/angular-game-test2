import { leftCoordHitbox, bullet, point } from '../helpers/interfaces';

export class Square {
  //Points are arranged clockwise, starting from the top left
  points: point[] = [];
  //Edges are arranged clockwise, starting from the top
  edges: point[] = [];

  constructor(obj?: leftCoordHitbox) {
    if (obj) {
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

  static checkHitboxOverlap(h1: leftCoordHitbox, h2: leftCoordHitbox) {
    let s1 = new Square(h1);
    let s2 = new Square(h2);
    return this.checkSquareOverlap(s1, s2);
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

  static checkSquareCircleOverlap(square: Square, circleCenter: point, radius: number) {
    //Snagged from https://www.geeksforgeeks.org/check-if-any-point-overlaps-the-given-circle-and-rectangle/

    // Find the nearest point on the 
    // rectangle to the center of 
    // the circle
    let Xn = Math.max(square.points[0].x, Math.min(circleCenter.x, square.points[2].x));
    let Yn = Math.max(square.points[0].y, Math.min(circleCenter.y, square.points[2].y));

    // Find the distance between the 
    // nearest point and the center 
    // of the circle
    // Distance between 2 points, 
    // (x1, y1) & (x2, y2) in 
    // 2D Euclidean space is
    // ((x1-x2)**2 + (y1-y2)**2)**0.5
    let Dx = Xn - circleCenter.x;
    let Dy = Yn - circleCenter.y;
    return (Dx * Dx + Dy * Dy) <= radius * radius;
  }
}