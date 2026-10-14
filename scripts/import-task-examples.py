"""Refresh the small, explicitly curated public example pilot. Requires pyarrow.

Only metadata/prompts are fetched, never input archives or model calls.
Each fetched source is pinned, capped at 8 MiB, and recorded by SHA-256.
"""
import csv
import hashlib
import io
import json
from pathlib import Path
from urllib.request import urlopen, Request
import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/task-examples'
OUT.mkdir(parents=True, exist_ok=True)
RECEIPTS = {}
DATE = '2026-10-14'


def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'bio-evals-example-import/1.0'}), timeout=30) as response:
        data = response.read(8 * 1024 * 1024 + 1)
    if len(data) > 8 * 1024 * 1024:
        raise ValueError('Source exceeds metadata-only download limit')
    RECEIPTS[url] = {'url': url, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    return data


def hf(repo, revision, path):
    return f'https://huggingface.co/datasets/{repo}/resolve/{revision}/{path}'


def gh(repo, revision, path):
    return f'https://raw.githubusercontent.com/{repo}/{revision}/{path}'


def save(benchmark, version, attribution, license, selection, examples):
    data = dict(benchmark=benchmark, version=version, attribution=attribution,
                license=license, selection=selection, checked_at=DATE, examples=examples)
    (OUT / f'{benchmark}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


# One public test question per subject in the tracked three-subject configuration.
rev = 'c30699e8356da336a370243923dbaf21066bb9fe'
examples = []
for subject in ['college_biology', 'high_school_biology', 'medical_genetics']:
    url = hf('cais/mmlu', rev, f'{subject}/test-00000-of-00001.parquet')
    row = pq.read_table(io.BytesIO(fetch(url))).slice(0, 1).to_pylist()[0]
    examples.append(dict(id=f'{subject}:test:0', title=subject.replace('_', ' ').title(),
        kind='Multiple choice', prompt=row['question'], choices=row['choices'],
        inputs=[], output='Choose one answer: A, B, C, or D.',
        grading='The tracked five-shot Evalchemy configuration scores answer-choice likelihood and compares the selected choice with the reference letter. This preview shows one question, without the five-shot context.',
        reference=f"{chr(65 + row['answer'])}. {row['choices'][row['answer']]}",
        source=url, source_label=f'MMLU {subject}, test row 0', revision=rev))
save('mmlu', 'mmlu-biology-biomedical-subjects', 'Dan Hendrycks and MMLU collaborators; cais/mmlu public distribution.',
     'MIT', 'Curated: the first test question from each of the three tracked biology subjects; not a random or representative performance sample.', examples)

# SciCode public source tasks; the Harbor adapter adds execution instructions.
rev = '4510f6a6aa27c43fad7b43da2c59602a86e88480'
url = hf('SciCode1/SciCode', rev, 'problems_test.jsonl')
rows = [json.loads(line) for line in fetch(url).decode().splitlines()]
examples = []
for task_id, title in [('76', 'Protein–DNA binding'), ('25', 'Resources and species in a chemostat'), ('53', 'Stochastic population dynamics')]:
    row = next(r for r in rows if str(r['problem_id']) == task_id)
    examples.append(dict(id=task_id, title=title, kind='Scientific coding',
        prompt=row['problem_description_main'], inputs=[],
        code=row['required_dependencies'], code_language='python',
        output=row['problem_io'], output_language='text',
        steps=[dict(title=s['step_number'], prompt=s['step_description_prompt'], code=s['function_header']) for s in row['sub_steps']],
        grading='Harbor executes the submitted Python functions against the published task tests and reference numeric results. The recorded parity metric is mean per-problem sub-step accuracy. These are source task statements; Harbor adds runner and file-path instructions.',
        grading_details='\n\n'.join('```python\n'+t+'\n```' for t in row.get('general_tests', []) if isinstance(t,str)),
        reference_note='The source does not publish a reference solution here. Test assertions use separate reference numeric data; no solution or numeric target has been invented for this preview.',
        source=url, source_label=f'SciCode test problem {task_id}', revision=rev))
save('scicode', 'scicode-biology-harbor-variant', 'Yuhang Tian and the SciCode authors; SciCode1/SciCode public release.',
     'Apache-2.0', 'Curated biology problems 76, 25, and 53 to show sequence analysis and ecological modeling. Source task text, not a verbatim complete Harbor runner prompt.', examples)

# Exact question and reference from pinned Harbor CLI task packages.
rev = '711ff277ae6b9e3950d19b40bc3e5aeb96e62b73'
examples = []
for task_id in ['bix-1-q1', 'bix-2-q1', 'bix-20-q1']:
    base=f'datasets/bixbench-cli/{task_id}'
    instruction_url=gh('harbor-framework/harbor-datasets', rev, base+'/instruction.md')
    instruction=fetch(instruction_url).decode()
    truth_url=gh('harbor-framework/harbor-datasets',rev,base+'/tests/ground_truth.json')
    truth=json.loads(fetch(truth_url))
    examples.append(dict(id=task_id,title=task_id,kind='Data analysis',prompt=truth['question'],
        inputs=[dict(name='/workspace/',description='Task-specific capsule inputs are staged here by Harbor. This preview does not bundle the capsule data.')],
        output='Analyze the provided files, write /workspace/notebook.py, and submit a short answer in /workspace/answer.txt wrapped in <answer> tags.',
        grading='The tracked CLI protocol compares the submitted answer to a reference using an LLM judge with an explicit JSON schema. Numerical precision and known source defects remain protocol caveats; this preview is not a new run or a corrected reference.',
        reference=truth['ideal_answer'],runner_instructions=instruction,
        source=instruction_url,source_label=f'Harbor CLI v1.5 · {task_id}',revision=rev,
        extra_sources=[dict(label='Published reference',url=truth_url)]))
save('bixbench','bixbench-v1-5-harbor-cli','FutureHouse and ScienceMachine, BixBench; Harbor CLI task packaging by the Harbor contributors.',
     'Apache-2.0', 'Curated task IDs bix-1-q1, bix-2-q1 and bix-20-q1 from the pinned 205-question CLI release.',examples)

# Source annotation inputs, explicitly the original split used by Harbor.
rev='9c6e96c9e74572e979b0930ee735041cef528cb7'
url=hf('osunlp/ScienceAgentBench',rev,'ScienceAgentBench.csv')
rows=list(csv.DictReader(io.StringIO(fetch(url).decode())))
examples=[]
for task_id,title in [('11','Count cells in microscopy images'),('69','Visualize a heart cell atlas'),('85','Summarize saliva measurements')]:
    row=next(r for r in rows if r['instance_id']==task_id)
    examples.append(dict(id=task_id,title=title,kind='Scientific workflow',prompt=row['task_inst'],
        context=row['domain_knowledge'].replace('\\n','\n'),
        input_tree=row['dataset_folder_tree'].replace('\\n','\n'),
        inputs=[dict(name='benchmark/datasets/',description='External source datasets are staged by the benchmark; file tree below is from the task annotation.')],
        output=f"Produce `{row['output_fname']}` relative to `/testbed/`.",
        grading=('The Harbor visual verifier compares the produced plot with the reference figure using a vision-capable judge.' if row['output_fname'].endswith('.png') else 'The task-specific evaluation script checks the produced artifact against reference outputs. A file merely existing does not establish success.'),
        grading_details=f"Source evaluation script: `{row['eval_script_name']}`. This preview does not bundle the external gold artifacts or claim a numerical tolerance not verified here.",
        reference_note='Gold outputs are separate benchmark artifacts and are not included in this metadata-only preview.',
        source=url,source_label=f'ScienceAgentBench original annotation · instance {task_id}',revision=rev,
        extra_sources=[dict(label='Underlying scientific software',url='https://github.com/'+row['github_name'])]))
save('scienceagentbench','scienceagentbench-bioinformatics','Xiang Deng and the ScienceAgentBench authors (OSU NLP Group); underlying scientific software credited per task.',
     'CC-BY-4.0', 'Curated bioinformatics instances 11, 69, and 85 from the original annotation CSV used by the Harbor path, not the later verified split.',examples)

# Public, ungated case studies with an MIT license; only small config files.
rev='eb75a3c0996b3cedcc9af685bad02fd166848fa2'
examples=[]
for task_id,title in [('wf_selection','Estimate selection from allele frequencies'),('hic_sv_masked_loop_strength','Analyze a chromatin interaction'),('crispri_casrx_transcript_vs_locus','Separate transcript and locus effects')]:
    url=hf('openai/genebench-pro-public-package',rev,f'problems/{task_id}/eval_config.json')
    row=json.loads(fetch(url))
    examples.append(dict(id=task_id,title=title,kind='Quantitative genomics',prompt=row['task'],
        inputs=[dict(name=name,description='Input file supplied in the public case package.',url=f'https://huggingface.co/datasets/openai/genebench-pro-public-package/blob/{rev}/problems/{task_id}/{name}') for name in row['data_files']],
        output='Submit the answer fields requested in the task. The grader contract below defines required keys, types, and checks.',
        grading='The public deterministic composite grader checks numeric values, integer fields, or exact matches according to the per-case contract.',
        grading_details='```json\n'+json.dumps(row['grader'],indent=2)+'\n```',
        reference=json.dumps(row['ground_truth'],indent=2),reference_language='json',
        source=url,source_label=f'GeneBench-Pro public-10 · {task_id}',revision=rev))
save('genebench','genebench-pro','OpenAI, GeneBench-Pro public case-study package.',
     'MIT', 'Curated public cases spanning population genetics, 3D genomics, and functional genomics; not the private full benchmark.',examples)
(OUT/'source-receipts.json').write_text(json.dumps(dict(checked_at=DATE,sources=list(RECEIPTS.values())),indent=2)+'\n')
print('Imported 15 public examples across 5 benchmarks; no input archives downloaded.')
