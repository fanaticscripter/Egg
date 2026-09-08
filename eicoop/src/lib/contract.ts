import { ContractGrade, ei, inferLocalContractGrade, requestFirstContact } from 'lib';

export type ContractType = 'Original' | 'Leggacy';

export enum ContractLeague {
  Elite = 0,
  Standard = 1,
}

/**
 * One rung of a contract's difficulty ladder: a league on contracts old enough
 * to have them, a grade on everything since.
 */
export interface ContractTier {
  name: string;
  goals: ei.Contract.IGoal[];
  durationSeconds: number;
}

export function gradeName(grade: ContractGrade): string {
  return ei.Contract.PlayerGrade[grade]?.replace(/^GRADE_/, '') ?? '?';
}

/**
 * Lists a contract's tiers, easiest first, or a single unnamed tier for
 * contracts that offer everyone the same goals.
 */
export function contractTiers(contract: ei.IContract): ContractTier[] {
  if (contract.gradeSpecs?.length) {
    return contract.gradeSpecs.map(spec => ({
      name: gradeName(spec.grade!),
      goals: spec.goals ?? [],
      durationSeconds: spec.lengthSeconds ?? contract.lengthSeconds!,
    }));
  }
  if (contract.goalSets?.some(set => set.goals?.length)) {
    // Elite first, matching how the game itself ordered the two leagues.
    return [ContractLeague.Elite, ContractLeague.Standard].map(league => ({
      name: league === ContractLeague.Elite ? 'Elite' : 'Standard',
      goals: contract.goalSets![league]?.goals ?? [],
      durationSeconds: contract.lengthSeconds!,
    }));
  }
  return [
    {
      name: '',
      goals: contract.goals ?? [],
      durationSeconds: contract.lengthSeconds!,
    },
  ];
}

/**
 * The final target of the hardest tier on offer, which is what a contract is
 * usually shorthanded by.
 */
export function contractFinalTarget(contract: ei.IContract): number {
  return Math.max(
    0,
    ...contractTiers(contract).map(tier => tier.goals[tier.goals.length - 1]?.targetAmount ?? 0)
  );
}

export enum ContractCompletionStatus {
  HasCompleted,
  HasNoTimeLeft,
  IsOnTrackToFinish,
  IsNotOnTrackToFinish,
}

export async function getContractFromPlayerSave(
  userId: string,
  contractId: string
): Promise<{ contract: ei.IContract; league: ContractLeague; grade?: ContractGrade } | null> {
  const firstContact = await requestFirstContact(userId);
  if (!firstContact.backup) {
    throw new Error(`No backup found in /ei/first_contact response for ${userId}.`);
  }
  const backup = firstContact.backup!;
  if (!backup.contracts) {
    throw new Error(`No contracts found in ${userId}'s backup.`);
  }
  const localContracts = ([] as ei.ILocalContract[]).concat(
    backup.contracts!.contracts || [],
    backup.contracts!.archive || []
  );
  for (const contract of localContracts) {
    if (contractId === contract.contract!.identifier) {
      return {
        contract: contract.contract!,
        league: contract.league! as ContractLeague,
        grade: inferLocalContractGrade(contract),
      };
    }
  }
  return null;
}

export class ContractLeagueStatus {
  eggsLaid: number;
  eggsPerHour: number;
  secondsRemaining: number;
  completionStatus: ContractCompletionStatus;
  goals: ei.Contract.IGoal[];
  finalTarget: number;
  expectedTimeToComplete: number;
  // requiredEggsPerHour is null if already failed.
  requiredEggsPerHour: number | null;

  constructor(
    eggsLaid: number,
    eggsPerHour: number,
    secondsRemaining: number,
    goals: ei.Contract.IGoal[]
  ) {
    this.eggsLaid = eggsLaid;
    this.eggsPerHour = eggsPerHour;
    this.secondsRemaining = secondsRemaining;
    this.goals = goals;
    this.finalTarget = goals[goals.length - 1].targetAmount!;
    if (eggsLaid >= this.finalTarget) {
      this.completionStatus = ContractCompletionStatus.HasCompleted;
      this.expectedTimeToComplete = 0;
      this.requiredEggsPerHour = 0;
      return;
    }
    this.expectedTimeToComplete = ((this.finalTarget - eggsLaid) / eggsPerHour) * 3600;
    if (secondsRemaining <= 0) {
      this.completionStatus = ContractCompletionStatus.HasNoTimeLeft;
      this.requiredEggsPerHour = null;
      return;
    }
    this.requiredEggsPerHour = ((this.finalTarget - eggsLaid) / secondsRemaining) * 3600;
    this.completionStatus =
      eggsPerHour >= this.requiredEggsPerHour
        ? ContractCompletionStatus.IsOnTrackToFinish
        : ContractCompletionStatus.IsNotOnTrackToFinish;
  }

  get hasEnded(): boolean {
    return (
      this.completionStatus === ContractCompletionStatus.HasCompleted ||
      this.completionStatus === ContractCompletionStatus.HasNoTimeLeft
    );
  }

  expectedTimeToCompleteGoal(goal: ei.Contract.IGoal): number {
    const target = goal.targetAmount!;
    if (this.eggsLaid >= target) {
      return 0;
    }
    return ((target - this.eggsLaid) / this.eggsPerHour) * 3600;
  }
}
