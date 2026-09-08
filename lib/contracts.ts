import { ei } from './proto';

export type ContractGrade = ei.Contract.PlayerGrade;

// A contract's goals have been stored three different ways over the years, and
// all three are still in circulation through players' contract archives:
//
//   - a single `goals` list, before leagues existed;
//   - `goals` (elite) alongside a two-entry `goal_sets` (elite, standard);
//   - one `grade_specs` entry per grade.
//
// The vintages overlap on the wire: a graded contract usually still carries
// the league goal sets it would have had, holding pre-grade targets that no
// player is playing to, so grade specs have to win wherever both are present.
//
// Which vintage a contract is, is a property of the contract rather than of
// the player, so callers pass whichever of league and grade they happen to
// know and let this decide what to read.
export interface ContractGoalSelector {
  league?: number;
  grade?: ContractGrade;
}

/**
 * Returns the grade spec a graded contract was played at, or undefined for a
 * contract that predates grades.
 *
 * An unrecognized or absent grade falls back to the first spec. Callers that
 * only care about a contract's rewards can rely on that: within a contract,
 * every grade offers the same rewards for the same goal indices, and differs
 * only in targets, length, and modifiers.
 */
export function getContractGradeSpec(
  contract: ei.IContract,
  grade?: ContractGrade
): ei.Contract.IGradeSpec | undefined {
  const specs = contract.gradeSpecs;
  if (!specs || specs.length === 0) {
    return undefined;
  }
  return specs.find(spec => spec.grade === grade) ?? specs[0];
}

/**
 * Returns the goals a player was working toward, in ascending target order.
 */
export function getContractGoals(
  contract: ei.IContract,
  selector: ContractGoalSelector = {}
): ei.Contract.IGoal[] {
  const spec = getContractGradeSpec(contract, selector.grade);
  if (spec) {
    return spec.goals ?? [];
  }
  const goalSet = contract.goalSets?.[selector.league ?? 0];
  if (goalSet?.goals?.length) {
    return goalSet.goals;
  }
  return contract.goals ?? [];
}

/**
 * Recovers which grade a player is playing a contract at.
 *
 * A save records the league a contract was played in but not the grade, so the
 * grade has to be read back out of progress: the amount at which the last goal
 * reward was handed out is the target of that goal, and a contract's grades
 * disagree on every target. Returns undefined before the first goal is
 * reached, and for the rare contract whose grades share a target.
 */
export function inferLocalContractGrade(
  contract: ei.ILocalContract
): ContractGrade | undefined {
  const specs = contract.contract?.gradeSpecs;
  const goalIndex = (contract.numGoalsAchieved ?? 0) - 1;
  const reachedTarget = contract.lastAmountWhenRewardGiven;
  if (!specs?.length || goalIndex < 0 || !reachedTarget) {
    return undefined;
  }
  const candidates = specs.filter(spec => spec.goals?.[goalIndex]?.targetAmount === reachedTarget);
  return candidates.length === 1 ? candidates[0].grade ?? undefined : undefined;
}

/**
 * Returns the goals of a local (player-owned) contract, at the league or grade
 * the player played it at.
 */
export function getLocalContractGoals(contract: ei.ILocalContract): ei.Contract.IGoal[] {
  return getContractGoals(contract.contract!, {
    league: contract.league ?? 0,
    grade: inferLocalContractGrade(contract),
  });
}

/**
 * Returns how long a graded contract runs, which varies by grade.
 */
export function getContractDurationSeconds(
  contract: ei.IContract,
  grade?: ContractGrade
): number {
  return getContractGradeSpec(contract, grade)?.lengthSeconds ?? contract.lengthSeconds ?? 0;
}
