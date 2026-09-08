import { ei } from 'lib';

// ei exports a class per message and a plain object per enum; only the former
// can encode and decode, which is what this explorer does with them.
type MessageNames<T> = {
  [K in keyof T]: T[K] extends { encode: unknown; decode: unknown } ? K : never;
}[keyof T];
export type MessageName = MessageNames<typeof ei>;

function isMessage(name: string): name is MessageName {
  const exported = ei[name as keyof typeof ei] as { decode?: unknown };
  return typeof exported?.decode === 'function';
}

const messages: Record<string, MessageName[]> = {
  commonlyInspected: [
    'EggIncFirstContactRequest',
    'EggIncFirstContactResponse',
    'GetPeriodicalsRequest',
    'PeriodicalsResponse',
    'ConfigRequest',
    'ConfigResponse',
    'MissionRequest',
    'MissionResponse',
    'CompleteMissionResponse',
    'ContractCoopStatusRequest',
    'ContractCoopStatusResponse',
    'Backup',
    'SaveBackupResponse',
  ],
  otherArtifactRequestResponse: [
    'ArtifactsConfigurationRequest',
    'ArtifactsConfigurationResponse',
    'CraftArtifactRequest',
    'CraftArtifactResponse',
    'ConsumeArtifactRequest',
    'ConsumeArtifactResponse',
    'SetArtifactRequest',
    'SetArtifactResponse',
  ],
  otherCoopRequestResponse: [
    'QueryCoopRequest',
    'QueryCoopResponse',
    'CreateCoopRequest',
    'CreateCoopResponse',
    'JoinCoopRequest',
    'JoinCoopResponse',
    'CollectContractArtifactRewardsRequest',
    'AutoJoinCoopRequest',
    'UpdateCoopPermissionsRequest',
    'UpdateCoopPermissionsResponse',
    'LeaveCoopRequest',
    'GiftPlayerCoopRequest',
    'KickPlayerCoopRequest',
    'ContractCoopStatusUpdateRequest',
    'ContractCoopStatusUpdateResponse',
  ],
  other: [],
};

const seen = ([] as MessageName[]).concat(
  messages.commonlyInspected,
  messages.otherArtifactRequestResponse,
  messages.otherCoopRequestResponse
);
for (const name in ei) {
  if (isMessage(name) && !seen.includes(name)) {
    messages.other.push(name);
  }
}
messages.other.sort();

export const messageGroups = [
  {
    label: 'Commonly inspected',
    messages: messages.commonlyInspected,
  },
  {
    label: 'Other artifact-related requests & responses',
    messages: messages.otherArtifactRequestResponse,
  },
  {
    label: 'Other coop-related requests & responses',
    messages: messages.otherCoopRequestResponse,
  },
  {
    label: 'Other',
    messages: messages.other,
  },
];

export const validMessageNames = ([] as MessageName[]).concat(
  messages.commonlyInspected,
  messages.otherArtifactRequestResponse,
  messages.otherCoopRequestResponse,
  messages.other
);
