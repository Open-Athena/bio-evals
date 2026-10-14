#!/usr/bin/env python3
"""Run a bounded local worker under the shared VM resource policy."""
import argparse
import datetime
import fcntl
import json
import os
from pathlib import Path
import signal
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--estimate-mib', required=True, type=int)
parser.add_argument('command', nargs=argparse.REMAINDER)
args = parser.parse_args()
command = args.command[1:] if args.command[:1] == ['--'] else args.command
if not command or not 0 < args.estimate_mib <= 500:
    parser.error('Supply a command and a peak working-set estimate of 1–500 MiB')

def resources():
    available = int(next(x.split()[1] for x in Path('/proc/meminfo').read_text().splitlines()
                         if x.startswith('MemAvailable:'))) / 1024
    return available, os.getloadavg()[0]

lock = open('/tmp/exe-codex-local-heavy.lock', 'a')
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    raise SystemExit('Shared heavy-work lock is held; aborting without waiting.')
available, load = resources()
if available < 2560 or available - args.estimate_mib < 2048 or load >= 1.5:
    raise SystemExit(f'Node contention: MemAvailable={available:.0f} MiB, load={load:.2f}')
env = dict(os.environ)
for key in ['POLARS_MAX_THREADS', 'RAYON_NUM_THREADS', 'OMP_NUM_THREADS',
            'MKL_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'NUMEXPR_NUM_THREADS']:
    env[key] = '1'
env.update(NODE_OPTIONS='--max-old-space-size=256')
folder = Path('artifacts/local-checks')
folder.mkdir(parents=True, exist_ok=True)
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
record = {'start': stamp, 'command': command, 'estimated_mib': args.estimate_mib}
time_log = folder / f'{stamp}.time.txt'
process = subprocess.Popen(['nice', '-n', '10', 'ionice', '-c', '2', '-n', '7',
                            '/usr/bin/time', '-v', '-o', str(time_log), *command],
                           env=env, start_new_session=True)
peak = 0
known = {}

def owned_rss():
    records = {}
    for entry in Path('/proc').iterdir():
        if not entry.name.isdigit():
            continue
        try:
            fields = (entry / 'stat').read_text().rsplit(')', 1)[1].split()
            if fields[0] != 'Z':
                records[int(entry.name)] = (int(fields[1]), fields[19], int(fields[21]))
        except (OSError, ValueError, IndexError):
            pass
    owned = {pid for pid, value in records.items()
             if pid == process.pid or known.get(pid) == value[1]}
    while True:
        children = {pid for pid, value in records.items() if value[0] in owned}
        expanded = owned | children
        if expanded == owned:
            break
        owned = expanded
    for pid in owned:
        known[pid] = records[pid][1]
    total = sum(records[pid][2] for pid in owned) * os.sysconf('SC_PAGE_SIZE')
    return total / 1024**2, sorted(owned, reverse=True)

def stop(*_):
    _, owned = owned_rss()
    for pid in owned:
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=3)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    _, owned = owned_rss()
    for pid in owned:
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    process.wait()

signal.signal(signal.SIGTERM, lambda *_: (stop(), (_ for _ in ()).throw(KeyboardInterrupt())))
try:
    while process.poll() is None:
        available, load = resources()
        rss, _ = owned_rss()
        peak = max(peak, rss)
        if available < 2048 or load > 2.5 or rss > 500:
            record['stopped_for_resources'] = {'available_mib': available, 'load': load, 'rss_mib': rss}
            stop()
            break
        # Active resource monitoring of this worker, not a background polling job.
        try:
            process.wait(timeout=0.2)
        except subprocess.TimeoutExpired:
            pass
except KeyboardInterrupt:
    stop()
finally:
    _, survivors = owned_rss()
    if survivors:
        stop()
    _, survivors = owned_rss()
    record.update(end=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  exit_status=process.wait(), peak_tree_rss_mib=round(peak, 2),
                  remaining_owned_pids=survivors, time_log=str(time_log))
    if time_log.exists():
        for line in time_log.read_text().splitlines():
            if 'Maximum resident set size (kbytes):' in line:
                record['peak_process_rss_kib'] = int(line.rsplit(':', 1)[1])
    (folder / f'{stamp}.json').write_text(json.dumps(record, indent=2) + '\n')
    print(json.dumps(record), flush=True)
raise SystemExit(record['exit_status'] or (1 if survivors or 'stopped_for_resources' in record else 0))
