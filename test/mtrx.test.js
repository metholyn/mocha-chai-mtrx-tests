const { expect } = require('chai');
const Mtrx = require('mtrx');

// note: callbacks for mapMtrx/everyMtrx/someMtrx/reduceMtrx are actually
// called as (value, i, j), not (i, j, value) like the README shows

describe('Mtrx library', function () {

  describe('Creation', function () {
    it('should create a matrix from a 2D array', function () {
      const m = new Mtrx([[1, 2, 3], [4, 5, 6]]);
      expect(m.rows).to.equal(2);
      expect(m.cols).to.equal(3);
      expect(m[0]).to.deep.equal([1, 2, 3]);
    });

    it('should create a diagonal matrix from a 1D array', function () {
      const m = new Mtrx([2, 4, 6]);
      expect(m.toString()).to.equal(new Mtrx([[2, 0, 0], [0, 4, 0], [0, 0, 6]]).toString());
    });

    it('should create a filled matrix using (rows, cols, value)', function () {
      const m = new Mtrx(3, 4, 9);
      expect(m.rows).to.equal(3);
      expect(m.cols).to.equal(4);
      expect(m.everyMtrx((v) => v === 9)).to.be.true;
    });

    it('should create a matrix from a generator function (i, j) => value', function () {
      const m = new Mtrx(2, 3, (i, j) => i + j);
      expect(m.toString()).to.equal(new Mtrx([[0, 1, 2], [1, 2, 3]]).toString());
    });

    it('should build static factory matrices correctly', function () {
      expect(Mtrx.zeros(2, 2).toString()).to.equal(new Mtrx([[0, 0], [0, 0]]).toString());
      expect(Mtrx.ones(2, 2).toString()).to.equal(new Mtrx([[1, 1], [1, 1]]).toString());
      expect(Mtrx.eye(3).toString()).to.equal(new Mtrx([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).toString());
      expect(Mtrx.diag([2, 4, 6]).toString()).to.equal(new Mtrx([[2, 0, 0], [0, 4, 0], [0, 0, 6]]).toString());
    });

    it('Mtrx.rand should create a matrix with values in [0, 1)', function () {
      const m = Mtrx.rand(3, 3);
      expect(m.rows).to.equal(3);
      expect(m.everyMtrx((v) => v >= 0 && v < 1)).to.be.true;
    });
  });

  describe('Properties: rows, cols, rank, det', function () {
    let square, nonSquare, singular;

    beforeEach(function () {
      // fresh matrices before every test in this suite, so no test can
      // accidentally leak mutated state into another one
      square = new Mtrx([[1, 2, 0], [3, 4, 4], [5, 6, 3]]);
      nonSquare = new Mtrx([[1, 2, 3], [4, 5, 6]]);
      singular = new Mtrx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it('rows/cols should reflect the shape', function () {
      expect(nonSquare.rows).to.equal(2);
      expect(nonSquare.cols).to.equal(3);
    });

    it('det should be computed for a square matrix', function () {
      expect(square.det).to.equal(10);
    });

    it('det should be NaN for a non-square matrix', function () {
      expect(nonSquare.det).to.be.NaN;
    });

    it('det should be 0 for a singular matrix', function () {
      expect(singular.det).to.equal(0);
    });

    it('rank should equal 3 for a full-rank 3x3 matrix', function () {
      expect(square.rank).to.equal(3);
    });

    it('rank should drop when rows become linearly dependent', function () {
      expect(singular.rank).to.be.lessThan(3);
    });
  });

  describe('Static predicates', function () {
    const m = new Mtrx([[1, 0], [0, 1]]);

    it('isMtrx should distinguish Mtrx instances from plain arrays', function () {
      expect(Mtrx.isMtrx(m)).to.be.true;
      expect(Mtrx.isMtrx([[1, 0], [0, 1]])).to.be.false;
    });

    it('isMtrxLike should accept any well-formed 2D numeric array', function () {
      expect(Mtrx.isMtrxLike([[1, 2], [3, 4]])).to.be.true;
      expect(Mtrx.isMtrxLike([1, 2, 3])).to.be.false;
    });

    it('isDiag should recognise diagonal matrices only', function () {
      expect(Mtrx.isDiag(Mtrx.eye(3))).to.be.true;
      expect(Mtrx.isDiag(new Mtrx([[1, 2], [3, 4]]))).to.be.false;
    });

    it('isSingular should detect matrices with zero determinant', function () {
      expect(Mtrx.isSingular(Mtrx.zeros(2, 2))).to.be.true;
      expect(Mtrx.isSingular(Mtrx.eye(2))).to.be.false;
    });

    it('isSameShape should compare dimensions, not values', function () {
      const a = new Mtrx([[1, 2], [3, 4]]);
      const b = new Mtrx([[9, 9], [9, 9]]);
      const c = new Mtrx([[1, 2, 3]]);
      expect(Mtrx.isSameShape(a, b)).to.be.true;
      expect(Mtrx.isSameShape(a, c)).to.be.false;
    });

    it('equalAll/equalAny should compare matrices element-wise', function () {
      const a = new Mtrx([[1, 2], [3, 4]]);
      const b = new Mtrx([[1, 2], [3, 5]]);
      expect(Mtrx.equalAll(a, Mtrx.clone(a))).to.be.true;
      expect(Mtrx.equalAll(a, b)).to.be.false;
      expect(Mtrx.equalAny(a, b)).to.be.true;
    });
  });

  describe('Arithmetic: add, mul, div', function () {
    const identity = new Mtrx([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    const values = new Mtrx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    it('add should sum matrices element-wise', function () {
      expect(Mtrx.add(identity, values).toString())
        .to.equal(new Mtrx([[2, 2, 3], [4, 6, 6], [7, 8, 10]]).toString());
    });

    it('mul by a scalar should scale every element', function () {
      expect(Mtrx.mul(identity, 3).toString())
        .to.equal(new Mtrx([[3, 0, 0], [0, 3, 0], [0, 0, 3]]).toString());
    });

    it('mul by the identity matrix should return the original matrix', function () {
      expect(Mtrx.mul(identity, values).toString()).to.equal(values.toString());
    });

    it('add should throw when matrix shapes do not match', function () {
      expect(() => Mtrx.add(new Mtrx(2, 2, 1), new Mtrx(3, 3, 1))).to.throw();
    });

    it('mul should throw when matrix dimensions are not compatible', function () {
      expect(() => Mtrx.mul(new Mtrx(2, 3, 1), new Mtrx(2, 3, 1))).to.throw();
    });
  });

  describe('Instance methods', function () {
    it('get/set should read and write individual cells', function () {
      const m = new Mtrx([[1, 2], [3, 4]]);
      expect(m.get(1, 0)).to.equal(3);
      m.set(1, 0, 99);
      expect(m.get(1, 0)).to.equal(99);
    });

    it('T() should transpose the matrix and be its own inverse', function () {
      const m = new Mtrx([[1, 2, 3], [4, 5, 6]]);
      expect(m.T().toString()).to.equal(new Mtrx([[1, 4], [2, 5], [3, 6]]).toString());
      expect(m.T().T().toString()).to.equal(m.toString());
    });

    it('Mtrx.clone should produce an independent copy', function () {
      const original = new Mtrx([[1, 2], [3, 4]]);
      const copy = Mtrx.clone(original);
      copy.set(0, 0, 100);
      expect(original.get(0, 0)).to.equal(1);
      expect(copy.get(0, 0)).to.equal(100);
    });

    it('cof(i, j) should return the cofactor submatrix', function () {
      const n = new Mtrx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      expect(n.cof(1, 1).toString()).to.equal(new Mtrx([[1, 3], [7, 9]]).toString());
    });

    it('inv() should return a matrix that multiplies back to (approximately) the identity', function () {
      const n = new Mtrx([[1, 2, 0], [3, 4, 4], [5, 6, 3]]);
      const product = Mtrx.mul(n, n.inv());
      expect(product.everyMtrx((v, i, j) => Math.abs(v - (i === j ? 1 : 0)) < 1e-9)).to.be.true;
    });

    it('inv() should throw for a non-square matrix', function () {
      const nonSquare = new Mtrx([[1, 2, 3], [4, 5, 6]]);
      expect(() => nonSquare.inv()).to.throw();
    });

    it('LUP() should decompose a matrix into L, U and P such that P*A = L*U', function () {
      const n = new Mtrx([[1, 2, 0], [3, 4, 4], [5, 6, 3]]);
      const { L, U, P } = n.LUP();
      const left = Mtrx.mul(P, n);
      const right = Mtrx.mul(L, U);
      expect(left.everyMtrx((v, i, j) => Math.abs(v - right.get(i, j)) < 1e-9)).to.be.true;
    });

    it('leftMul/rightMul should match Mtrx.mul with matching argument order', function () {
      const a = new Mtrx([[1, 2], [3, 4]]);
      const b = new Mtrx([[5, 6], [7, 8]]);
      expect(a.leftMul(b).toString()).to.equal(Mtrx.mul(b, a).toString());
      expect(a.rightMul(b).toString()).to.equal(Mtrx.mul(a, b).toString());
    });

    it('mapMtrx should build a new matrix from (value, i, j) => value', function () {
      const m = new Mtrx([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      const mapped = m.mapMtrx((v, i, j) => i + j + v);
      expect(mapped.toString()).to.equal(new Mtrx([[1, 1, 2], [1, 3, 3], [2, 3, 5]]).toString());
    });

    it('everyMtrx/someMtrx should behave like Array.prototype.every/some over all cells', function () {
      const m = Mtrx.eye(2);
      expect(m.everyMtrx((v) => v >= 0)).to.be.true;
      expect(m.everyMtrx((v) => v > 0)).to.be.false;
      expect(m.someMtrx((v) => v === 1)).to.be.true;
      expect(m.someMtrx((v) => v === 5)).to.be.false;
    });

    it('reduceMtrx should accumulate a value across all cells', function () {
      const sum = Mtrx.eye(3).reduceMtrx((acc, v) => acc + v, 0);
      expect(sum).to.equal(3);
    });
  });

  describe('Resizing: changeRows / changeCols', function () {
    it('changeRows(n > 0) should append n new rows filled with the given value', function () {
      const m = new Mtrx([[1, 2], [3, 4]]);
      m.changeRows(1, 9);
      expect(m.rows).to.equal(3);
      expect(m[2]).to.deep.equal([9, 9]);
    });

    it('changeRows(n < 0) should remove the last |n| rows', function () {
      const m = new Mtrx([[1, 2], [3, 4], [5, 6]]);
      m.changeRows(-1);
      expect(m.rows).to.equal(2);
      expect(m.toString()).to.equal(new Mtrx([[1, 2], [3, 4]]).toString());
    });

    it('changeCols(n > 0) should append n new columns filled with the given value', function () {
      const m = new Mtrx([[1, 2], [3, 4]]);
      m.changeCols(1, 5);
      expect(m.cols).to.equal(3);
      expect(m[0]).to.deep.equal([1, 2, 5]);
    });

    it('changeCols(n < 0) should remove the last |n| columns', function () {
      const m = new Mtrx([[1, 2, 5], [3, 4, 5]]);
      m.changeCols(-1);
      expect(m.cols).to.equal(2);
    });
  });

  describe('resetLike', function () {
    it('should reset a matrix in place to look like another matrix-like value', function () {
      const m = new Mtrx(2, 2, 1);
      m.resetLike(Mtrx.zeros(2, 2));
      expect(m.toString()).to.equal(new Mtrx([[0, 0], [0, 0]]).toString());
    });
  });

});
