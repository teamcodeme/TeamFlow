import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / 'packages/roadmap-data/roadmap.json'
DOCS_COPY = ROOT / 'docs/data/roadmap.json'

r = json.loads(CANONICAL.read_text(encoding='utf-8'))
assert r['schemaVersion'] == '1.0'
assert r.get('currentPhaseId') in {x['id'] for x in r['phases']}, 'currentPhaseId missing'
phases = {x['id'] for x in r['phases']}
nodes = {x['id'] for x in r['nodes']}
assert len(phases) == len(r['phases']), 'Duplicate phase IDs'
assert len(nodes) == len(r['nodes']), 'Duplicate node IDs'
for phase in r['phases']:
    assert 0 <= phase['progress'] <= 100
    assert all(x in nodes for x in phase['children'])
for node in r['nodes']:
    assert node['phaseId'] in phases
    assert all(x in nodes for x in node['dependsOn'] + node['children'])
    if node['status'] == 'blocked':
        assert node.get('blockerReason')

if DOCS_COPY.exists():
    docs = json.loads(DOCS_COPY.read_text(encoding='utf-8'))
    assert docs == r, (
        'docs/data/roadmap.json is out of sync with packages/roadmap-data/roadmap.json. '
        'Run `make sync-roadmap`.'
    )
else:
    print('Note: docs/data/roadmap.json missing — run `make sync-roadmap` before docs-serve/deploy.')

print(f"Valid roadmap: {len(r['phases'])} phases, {len(r['nodes'])} nodes")
