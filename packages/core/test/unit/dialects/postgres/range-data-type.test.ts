import { expect } from 'chai';
import type { Rangable } from '@sequelize/core';
import { DataTypes } from '@sequelize/core';
import { createSequelizeInstance, getTestDialect } from '../../../support';

describe('[POSTGRES Specific] RANGE DataType', () => {
  if (getTestDialect() !== 'postgres') {
    return;
  }

  const { dialect } = createSequelizeInstance({
    timezone: '+02:00',
  });

  const integerRangeType = DataTypes.RANGE(DataTypes.INTEGER).toDialectDataType(dialect);
  const bigintRangeType = DataTypes.RANGE(DataTypes.BIGINT).toDialectDataType(dialect);
  const decimalRangeType = DataTypes.RANGE(DataTypes.DECIMAL).toDialectDataType(dialect);
  const dateRangeType = DataTypes.RANGE(DataTypes.DATE).toDialectDataType(dialect);
  const dateOnlyRangeType = DataTypes.RANGE(DataTypes.DATEONLY).toDialectDataType(dialect);

  describe('escape', () => {
    it('should handle empty objects correctly', () => {
      expect(integerRangeType.escape([])).to.equal(`'empty'`);
    });

    it('should handle null as empty bound', () => {
      expect(integerRangeType.escape([null, 1])).to.equal(`'[,1)'`);
      expect(integerRangeType.escape([1, null])).to.equal(`'[1,)'`);
      expect(integerRangeType.escape([null, null])).to.equal(`'[,)'`);
    });

    it('should handle Infinity/-Infinity as infinity/-infinity bounds', () => {
      expect(integerRangeType.escape([Number.POSITIVE_INFINITY, 1])).to.equal(`'[infinity,1)'`);
      expect(integerRangeType.escape([1, Number.POSITIVE_INFINITY])).to.equal(`'[1,infinity)'`);
      expect(integerRangeType.escape([Number.NEGATIVE_INFINITY, 1])).to.equal(`'[-infinity,1)'`);
      expect(integerRangeType.escape([1, Number.NEGATIVE_INFINITY])).to.equal(`'[1,-infinity)'`);
      expect(integerRangeType.escape([Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY])).to.equal(`'[-infinity,infinity)'`);
    });

    it('should throw error when array length is not 0 or 2', () => {
      expect(() => {
        // @ts-expect-error -- testing that invalid input throws
        integerRangeType.escape([1], stringifyOptions);
      }).to.throw();
      expect(() => {
        // @ts-expect-error -- testing that invalid input throws
        integerRangeType.escape([1, 2, 3], stringifyOptions);
      }).to.throw();
    });

    it('should throw error when non-array parameter is passed', () => {
      expect(() => {
        // @ts-expect-error -- testing that invalid input throws
        integerRangeType.escape({}, stringifyOptions);
      }).to.throw();
      expect(() => {
        integerRangeType.escape('test');
      }).to.throw();
      expect(() => {
        // @ts-expect-error -- testing that invalid input throws
        integerRangeType.escape(undefined, stringifyOptions);
      }).to.throw();
    });

    it('should handle array of objects with `inclusive` and `value` properties', () => {
      expect(integerRangeType.escape([{ inclusive: true, value: 0 }, { value: 1 }])).to.equal(`'[0,1)'`);
      expect(integerRangeType.escape([{ inclusive: true, value: 0 }, { inclusive: true, value: 1 }])).to.equal(`'[0,1]'`);
      expect(integerRangeType.escape([{ inclusive: false, value: 0 }, 1])).to.equal(`'(0,1)'`);
      expect(integerRangeType.escape([0, { inclusive: true, value: 1 }])).to.equal(`'[0,1]'`);
    });

    it('should handle date values', () => {

      expect(dateRangeType.escape([
        new Date(Date.UTC(2000, 1, 1)),
        new Date(Date.UTC(2000, 1, 2)),
      ])).to.equal(`'[2000-02-01 02:00:00.000 +02:00,2000-02-02 02:00:00.000 +02:00)'`);
    });
  });

  describe('stringify value', () => {
    describe('with null range bounds', () => {
      const infiniteRange: Rangable<any> = [null, null];
      const infiniteRangeSQL = `'[,)'`;

      it('should stringify integer range to infinite range', () => {
        expect(integerRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify bigint range to infinite range', () => {
        expect(bigintRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify numeric range to infinite range', () => {
        expect(decimalRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify dateonly ranges to infinite range', () => {
        expect(dateOnlyRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify date ranges to infinite range', () => {
        expect(dateRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });
    });

    describe('with infinite range bounds', () => {
      const infiniteRange: Rangable<any> = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
      const infiniteRangeSQL = '\'[-infinity,infinity)\'';

      it('should stringify integer range to infinite range', () => {
        expect(integerRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify bigint range to infinite range', () => {
        expect(bigintRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify numeric range to infinite range', () => {
        expect(decimalRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify dateonly ranges to infinite range', () => {
        expect(dateOnlyRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });

      it('should stringify date ranges to infinite range', () => {
        expect(dateRangeType.escape(infiniteRange)).to.equal(infiniteRangeSQL);
      });
    });
  });
});
