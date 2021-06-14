import dayjs, { Dayjs } from 'dayjs';
import { Memoize } from 'typescript-memoize';

import { ArtifactSet } from '../artifacts';
import { earningBonusToFarmerRole, FarmerRole } from '../earning_bonus';
import { ei } from '../proto';
import {
  activeBoostBeacons,
  activeTachyonPrisms,
  BoostInstance,
  internalHatcheryRateBoostMultiplier,
} from './boosts';
import { earningBonus, prophecyEggBonusResearches, soulEggBonusResearches } from './earning_bonus';
import {
  Hab,
  habList,
  habSpaceList,
  habSpaceResearches,
  HabSpaceResearchInstance,
} from './hab_space';
import {
  InternalHatcheryRateResearchInstance,
  internalHatcheryRateResearches,
  internalHatcheryChickensPerMinutePerHab,
} from './internal_hatchery';
import {
  eggLayingRateResearches,
  EggLayingRateResearchInstance,
  layableEggsPerSecond,
} from './laying_rate';
import {
  shippingCapacityResearches,
  ShippingCapacityResearchInstance,
  Vehicle,
  vehicleList,
  vehicleShippableEggsPerSecondList,
} from './shipping_capacity';
import { siloCapacityResearches, siloMinutes } from './silos';

export class Farm {
  backup: ei.IBackup;
  progress: ei.Backup.IGame;
  farm: ei.Backup.ISimulation;
  artifactSet: ArtifactSet;
  tokenIntervalMinutes?: number;

  constructor(
    backup: ei.IBackup,
    farm: ei.Backup.ISimulation,
    opts?: { tokenIntervalMinutes?: number }
  ) {
    this.backup = backup;
    this.progress = backup.game!;
    this.farm = farm;
    this.tokenIntervalMinutes = opts?.tokenIntervalMinutes;
    const isEnlightenment = this.egg === ei.Egg.ENLIGHTENMENT;

    // Fish out the farm index in order to extract artifact loadout. A farm is
    // uniquely identified by farm type (home/contract) and contract ID.
    let farmIndex = -1;
    for (const [i, f] of (backup.farms || []).entries()) {
      if (f.farmType === farm.farmType && f.contractId === farm.contractId) {
        farmIndex = i;
      }
    }
    if (farmIndex < 0) {
      throw new Error(`farm '${farm.contractId}' not found in backup`);
    }

    const activeArtifactSets = backup.artifactsDb?.activeArtifactSets;
    if (activeArtifactSets) {
      const activeSet = activeArtifactSets[farmIndex];
      if (!activeSet) {
        throw new Error(`no artifact info found for farm '${farm.contractId}'`);
      }
      const inventory = backup.artifactsDb!.inventoryItems!;
      const itemIdToArtifact = new Map(inventory.map(item => [item.itemId!, item.artifact!]));
      const artifacts = activeSet
        .slots!.filter(slot => slot.occupied)
        .map(slot => {
          const itemId = slot.itemId!;
          const item = itemIdToArtifact.get(itemId);
          if (!item) {
            throw new Error(`artifact item with id ${itemId} not found in inventory`);
          }
          return item;
        });
      this.artifactSet = new ArtifactSet(artifacts, isEnlightenment);
    } else {
      console.warn('backup has no artifactsDb.activeArtifactSets');
      this.artifactSet = new ArtifactSet([], isEnlightenment);
    }
  }

  researches<R extends Research>(relevantResearches: R[]): (R & { level: number })[] {
    const common = this.farm.commonResearch || [];
    const epic = this.progress.epicResearch || [];
    const researches: (R & { level: number })[] = [];
    for (const r of common.concat(epic)) {
      for (const rr of relevantResearches) {
        if (r.id === rr.id) {
          researches.push({
            ...rr,
            level: r.level!,
          });
        }
      }
    }
    return researches;
  }

  get refreshTimestamp(): number {
    return this.farm.lastStepTime!;
  }

  get refreshTime(): Dayjs {
    return dayjs(this.refreshTimestamp * 1000);
  }

  get egg(): ei.Egg {
    return this.farm.eggType!;
  }

  get numChickens(): number {
    return this.farm.numChickens!;
  }

  get eggsLaid(): number {
    return this.farm.eggsLaid!;
  }

  get tokensInStock(): number {
    // There is also unclaimedBoostTokens for unclaimed tokens from other
    // players, which isn't included in boostTokensReceived. We exclude these
    // unclaimed tokens in order to be consistent with the token number shown on
    // the boosts page.
    return (
      (this.farm.boostTokensReceived || 0) -
      (this.farm.boostTokensGiven || 0) -
      (this.farm.boostTokensSpent || 0)
    );
  }

  get tokensSpent(): number {
    return this.farm.boostTokensSpent || 0;
  }

  get nextTokenTimestampAfterRefresh(): number | null {
    if (this.farm.farmType !== ei.FarmType.CONTRACT) {
      return null;
    }
    return this.refreshTimestamp + (this.farm.gametimeUntilNextBoostToken || 0);
  }

  get nextTokenTimeAfterRefresh(): Dayjs | null {
    const timestamp = this.nextTokenTimestampAfterRefresh;
    return timestamp !== null ? dayjs(timestamp * 1000) : null;
  }

  get tokensInStockByNow(): number {
    if (!this.tokenIntervalMinutes) {
      return this.tokensInStock;
    }
    if (!this.nextTokenTimeAfterRefresh) {
      return this.tokensInStock;
    }
    const lastRecordedTokenTime = this.nextTokenTimeAfterRefresh.subtract(
      this.tokenIntervalMinutes,
      'minutes'
    );
    const minutesSinceLastRecordedToken = Math.max(
      dayjs().diff(lastRecordedTokenTime, 'minute', true),
      0
    );
    return (
      this.tokensInStock + Math.floor(minutesSinceLastRecordedToken / this.tokenIntervalMinutes)
    );
  }

  get minutesFromNowUntilNextToken(): number | null {
    if (!this.tokenIntervalMinutes) {
      return null;
    }
    if (!this.nextTokenTimeAfterRefresh) {
      return null;
    }
    const lastRecordedTokenTime = this.nextTokenTimeAfterRefresh.subtract(
      this.tokenIntervalMinutes,
      'minutes'
    );
    const minutesSinceLastRecordedToken = Math.max(
      dayjs().diff(lastRecordedTokenTime, 'minute', true),
      0
    );
    return this.tokenIntervalMinutes - (minutesSinceLastRecordedToken % this.tokenIntervalMinutes);
  }

  @Memoize()
  get soulEggBonusResearches(): ResearchInstance[] {
    return soulEggBonusResearches(this);
  }

  @Memoize()
  get prophecyEggBonusResearches(): ResearchInstance[] {
    return prophecyEggBonusResearches(this);
  }

  @Memoize()
  get earningBonus(): number {
    return earningBonus(this, this.soulEggBonusResearches, this.prophecyEggBonusResearches);
  }

  @Memoize()
  get earningBonusPercentage(): number {
    return this.earningBonus * 100;
  }

  @Memoize()
  get farmerRole(): FarmerRole {
    return earningBonusToFarmerRole(this.earningBonus);
  }

  @Memoize()
  get eggLayingRateResearches(): EggLayingRateResearchInstance[] {
    return eggLayingRateResearches(this);
  }

  @Memoize()
  get layableEggsPerSecond(): number {
    return layableEggsPerSecond(this, this.eggLayingRateResearches);
  }

  @Memoize()
  get layableEggsPerHour(): number {
    return this.layableEggsPerSecond * 3600;
  }

  @Memoize()
  get vehicles(): Vehicle[] {
    return vehicleList(this);
  }

  @Memoize()
  get shippingCapacityResearches(): ShippingCapacityResearchInstance[] {
    return shippingCapacityResearches(this);
  }

  @Memoize()
  get vehicleShippableEggsPerSecondList(): number[] {
    return vehicleShippableEggsPerSecondList(this, this.vehicles, this.shippingCapacityResearches);
  }

  @Memoize()
  get shippableEggsPerSecond(): number {
    return this.vehicleShippableEggsPerSecondList.reduce((total, rate) => total + rate);
  }

  @Memoize()
  get shippableEggsPerHour(): number {
    return this.shippableEggsPerSecond * 3600;
  }

  @Memoize()
  get eggsPerHour(): number {
    return Math.min(this.layableEggsPerHour, this.shippableEggsPerHour);
  }

  @Memoize()
  get habs(): Hab[] {
    return habList(this);
  }

  @Memoize()
  get habSpaceResearches(): HabSpaceResearchInstance[] {
    return habSpaceResearches(this);
  }

  @Memoize()
  get habSpaceList(): number[] {
    return habSpaceList(this, this.habs, this.habSpaceResearches);
  }

  @Memoize()
  get habSpace(): number {
    return this.habSpaceList.reduce((total, s) => total + s);
  }

  @Memoize()
  get internalHatcheryRateResearches(): InternalHatcheryRateResearchInstance[] {
    return internalHatcheryRateResearches(this);
  }

  @Memoize()
  get internalHatcheryChickensPerMinutePerHab(): { active: number; away: number } {
    return internalHatcheryChickensPerMinutePerHab(this, this.internalHatcheryRateResearches);
  }

  @Memoize()
  get internalHatcheryRateBoostMultiplier(): number {
    return internalHatcheryRateBoostMultiplier(
      this,
      this.activeTachyonPrisms,
      this.activeBoostBeacons
    );
  }

  @Memoize()
  get boostedInternalHatcheryChickensPerMinutePerHab(): { active: number; away: number } {
    const { active, away } = this.internalHatcheryChickensPerMinutePerHab;
    const multiplier = this.internalHatcheryRateBoostMultiplier;
    return {
      active: active * multiplier,
      away: away * multiplier,
    };
  }

  @Memoize()
  get siloCapacityResearches(): ResearchInstance[] {
    return siloCapacityResearches(this);
  }

  @Memoize()
  get siloMinutes(): number {
    return siloMinutes(this, this.siloCapacityResearches);
  }

  @Memoize()
  get activeTachyonPrisms(): BoostInstance[] {
    return activeTachyonPrisms(this);
  }

  @Memoize()
  get activeBoostBeacons(): BoostInstance[] {
    return activeBoostBeacons(this);
  }
}

export interface Research {
  id: string;
  name: string;
  maxLevel: number;
  perLevel: number;
  epic?: boolean;
}

export interface ResearchInstance extends Research {
  level: number;
}