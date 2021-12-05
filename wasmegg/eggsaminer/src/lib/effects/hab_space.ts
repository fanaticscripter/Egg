import { ei } from 'lib';
import { Artifact } from '../types';
import { multiplicativeEffect } from './common';

export function habSpaceMultiplier(artifacts: Artifact[]): number {
  return multiplicativeEffect(artifacts, [ei.ArtifactSpec.Name.ORNATE_GUSSET]);
}
