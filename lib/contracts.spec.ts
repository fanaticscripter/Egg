import { describe, expect, it } from '@jest/globals';

import {
  getContractDurationSeconds,
  getContractGoals,
  getLocalContractGoals,
  inferLocalContractGrade,
} from './contracts';
import { ei } from './proto';

import Grade = ei.Contract.PlayerGrade;

const goal = (targetAmount: number) => ({ targetAmount });

// A contract from before leagues: goals, and nothing else.
const ungraded: ei.IContract = {
  identifier: 'ungraded',
  lengthSeconds: 86400,
  goals: [goal(1)],
};

// A contract from the league era: elite goals duplicated into goals, and both
// leagues in goal_sets.
const leagued: ei.IContract = {
  identifier: 'leagued',
  lengthSeconds: 86400,
  goals: [goal(10)],
  goalSets: [{ goals: [goal(10)] }, { goals: [goal(20)] }],
};

// A contract from the grade era. It still carries league goal sets, as most
// graded contracts on the wire do, but their targets are the pre-grade ones
// nobody plays to any more.
const graded: ei.IContract = {
  identifier: 'graded',
  lengthSeconds: 345600,
  goalSets: [{ goals: [goal(10)] }, { goals: [goal(20)] }],
  gradeSpecs: [
    { grade: Grade.GRADE_C, goals: [goal(100)], lengthSeconds: 86400 },
    { grade: Grade.GRADE_AAA, goals: [goal(500)], lengthSeconds: 345600 },
  ],
};

describe('contract goals', () => {
  it('reads goals off a contract that predates leagues', () => {
    expect(getContractGoals(ungraded)).toEqual([goal(1)]);
  });

  it('picks a goal set by league', () => {
    expect(getContractGoals(leagued, { league: 0 })).toEqual([goal(10)]);
    expect(getContractGoals(leagued, { league: 1 })).toEqual([goal(20)]);
  });

  it('picks a grade spec by grade', () => {
    expect(getContractGoals(graded, { grade: Grade.GRADE_C })).toEqual([goal(100)]);
    expect(getContractGoals(graded, { grade: Grade.GRADE_AAA })).toEqual([goal(500)]);
  });

  it('prefers grade specs over the league goal sets graded contracts still carry', () => {
    expect(getContractGoals(graded, { league: 0, grade: Grade.GRADE_C })).toEqual([goal(100)]);
    expect(getContractGoals(graded, { league: 1, grade: Grade.GRADE_AAA })).toEqual([goal(500)]);
  });

  it('falls back to the first grade spec when the grade is unknown', () => {
    expect(getContractGoals(graded)).toEqual([goal(100)]);
    expect(getContractGoals(graded, { grade: Grade.GRADE_A })).toEqual([goal(100)]);
  });

  it('reads the league off a local contract', () => {
    expect(getLocalContractGoals({ contract: leagued, league: 1 })).toEqual([goal(20)]);
  });
});

describe('local contract grade', () => {
  // A save never states the grade, so it has to come back out of how far the
  // player got: the amount that triggered the last reward is one grade's
  // target and no other's.
  it('comes from the target the last rewarded goal was at', () => {
    expect(
      inferLocalContractGrade({
        contract: graded,
        numGoalsAchieved: 1,
        lastAmountWhenRewardGiven: 500,
      })
    ).toEqual(Grade.GRADE_AAA);
    expect(
      getLocalContractGoals({
        contract: graded,
        numGoalsAchieved: 1,
        lastAmountWhenRewardGiven: 500,
      })
    ).toEqual([goal(500)]);
  });

  it('is unknown until a goal has been rewarded', () => {
    expect(inferLocalContractGrade({ contract: graded, numGoalsAchieved: 0 })).toBeUndefined();
  });

  it('is unknown when the amount matches no grade', () => {
    expect(
      inferLocalContractGrade({
        contract: graded,
        numGoalsAchieved: 1,
        lastAmountWhenRewardGiven: 123,
      })
    ).toBeUndefined();
  });

  it('is unknown on a contract that predates grades', () => {
    expect(
      inferLocalContractGrade({
        contract: leagued,
        numGoalsAchieved: 1,
        lastAmountWhenRewardGiven: 10,
      })
    ).toBeUndefined();
  });
});

describe('contract duration', () => {
  it('is the contract length when the contract has no grades', () => {
    expect(getContractDurationSeconds(leagued)).toEqual(86400);
  });

  // A graded contract's own length_seconds is the longest grade's, so reading
  // it directly overstates how long everyone below AAA gets.
  it('is the grade length when the contract has grades', () => {
    expect(getContractDurationSeconds(graded, Grade.GRADE_C)).toEqual(86400);
    expect(getContractDurationSeconds(graded, Grade.GRADE_AAA)).toEqual(345600);
  });
});
