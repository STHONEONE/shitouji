"""Verify the downloaded Git tree and LFS entity without changing the clone."""
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[2]
CLONE=ROOT/'.validation/repository'
def git(cwd,*args):return subprocess.check_output(['git','-C',str(cwd),*args])
local_index=git(ROOT,'ls-files','--stage','-z')
remote_index=git(CLONE,'ls-files','--stage','-z')
entries=remote_index.split(b'\0');paths=[v.split(b'\t',1)[1].decode('utf-8') for v in entries if v]
missing=[p for p in paths if not (CLONE/p).is_file()]
entry='outputs/潇湘馆-庭院与内室-模块03.html'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
game=CLONE/entry
result={'passed':local_index==remote_index and not missing and game.stat().st_size>100_000_000 and digest(game)==digest(ROOT/entry),'tested_commit':git(CLONE,'rev-parse','HEAD').decode().strip(),'tracked_files':len(paths),'git_index_matches':local_index==remote_index,'missing':missing,'lfs_entity_bytes':game.stat().st_size,'lfs_entity_sha256':digest(game),'lfs_matches_local':digest(game)==digest(ROOT/entry)}
(ROOT/'reports/qa/repository-clone.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
if not result['passed']:raise SystemExit(1)
