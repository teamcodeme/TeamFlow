import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'packages/roadmap-data/roadmap.json'
r = json.loads(p.read_text(encoding='utf-8'))
assert r['schemaVersion'] == '1.0'
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
print(f"Valid roadmap: {len(r['phases'])} phases, {len(r['nodes'])} nodes")
