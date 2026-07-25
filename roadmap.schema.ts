export const ROADMAP_SCHEMA_VERSION = '1.0' as const;

export type RoadmapStatus =
  | 'completed'
  | 'in-progress'
  | 'planned'
  | 'blocked'
  | 'deferred'
  | 'cancelled';

export type RoadmapNodeType = 'phase' | 'module' | 'feature' | 'milestone';
export type RoadmapPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RoadmapNode {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  type: RoadmapNodeType;
  status: RoadmapStatus;
  phaseId: string;
  order: number;
  progress?: number;
  priority?: RoadmapPriority;
  owner?: string;
  targetRelease?: string;
  estimatedEffort?: string;
  dependsOn: string[];
  children: string[];
  tags: string[];
  documentationUrl?: string;
  acceptanceCriteria?: string[];
  blockerReason?: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  order: number;
  progress: number;
  children: string[];
  documentationUrl?: string;
}

export interface RoadmapDocument {
  schemaVersion: typeof ROADMAP_SCHEMA_VERSION;
  product: string;
  title: string;
  description: string;
  updatedAt: string;
  currentPhaseId: string;
  phases: RoadmapPhase[];
  nodes: RoadmapNode[];
}

const statuses = new Set<RoadmapStatus>(['completed','in-progress','planned','blocked','deferred','cancelled']);
const nodeTypes = new Set<RoadmapNodeType>(['phase','module','feature','milestone']);

export function validateRoadmap(input: unknown): asserts input is RoadmapDocument {
  if (!input || typeof input !== 'object') throw new Error('Roadmap must be an object.');
  const r = input as Partial<RoadmapDocument>;
  if (r.schemaVersion !== ROADMAP_SCHEMA_VERSION) throw new Error(`Unsupported schemaVersion: ${String(r.schemaVersion)}`);
  if (!Array.isArray(r.phases) || !Array.isArray(r.nodes)) throw new Error('Roadmap phases and nodes must be arrays.');
  const phaseIds = new Set(r.phases.map(p => p.id));
  const nodeIds = new Set(r.nodes.map(n => n.id));
  if (phaseIds.size !== r.phases.length) throw new Error('Duplicate phase IDs found.');
  if (nodeIds.size !== r.nodes.length) throw new Error('Duplicate node IDs found.');
  for (const p of r.phases) {
    if (!statuses.has(p.status)) throw new Error(`Invalid phase status for ${p.id}`);
    if (p.progress < 0 || p.progress > 100) throw new Error(`Invalid phase progress for ${p.id}`);
    for (const id of p.children) if (!nodeIds.has(id)) throw new Error(`Phase ${p.id} references missing child ${id}`);
  }
  for (const n of r.nodes) {
    if (!phaseIds.has(n.phaseId)) throw new Error(`Node ${n.id} references missing phase ${n.phaseId}`);
    if (!statuses.has(n.status)) throw new Error(`Invalid node status for ${n.id}`);
    if (!nodeTypes.has(n.type)) throw new Error(`Invalid node type for ${n.id}`);
    if (n.progress != null && (n.progress < 0 || n.progress > 100)) throw new Error(`Invalid progress for ${n.id}`);
    for (const id of [...n.dependsOn, ...n.children]) if (!nodeIds.has(id)) throw new Error(`Node ${n.id} references missing node ${id}`);
    if (n.status === 'blocked' && !n.blockerReason) throw new Error(`Blocked node ${n.id} requires blockerReason`);
  }
}
