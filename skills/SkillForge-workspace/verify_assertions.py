#!/usr/bin/env python3
"""Programmatic assertion checker for SkillForge self-evaluation."""
import os, json, re, sys

WORKSPACE = "/home/fujos/projects/pai/skills/SkillForge-workspace"
ITER = f"{WORKSPACE}/iteration-1"

def check_yaml_frontmatter(filepath):
    """Check if file has valid YAML frontmatter with name field."""
    try:
        with open(filepath) as f:
            content = f.read()
        if not content.startswith('---'):
            return False, "No YAML frontmatter"
        end = content.index('---', 3)
        fm = content[3:end]
        if 'name:' in fm:
            return True, f"Valid YAML with name field"
        return False, "Missing name field"
    except Exception as e:
        return False, str(e)

def check_section_exists(filepath, section):
    """Check if a markdown section exists."""
    try:
        with open(filepath) as f:
            content = f.read()
        pattern = rf'^##\s+{re.escape(section)}'
        if re.search(pattern, content, re.MULTILINE):
            return True, f"Section '{section}' found"
        return False, f"Section '{section}' not found"
    except Exception as e:
        return False, str(e)

def check_use_when(filepath):
    """Check if description contains USE WHEN."""
    try:
        with open(filepath) as f:
            content = f.read()
        if 'USE WHEN' in content:
            return True, "Contains USE WHEN"
        return False, "Missing USE WHEN"
    except Exception as e:
        return False, str(e)

def count_items_in_section(filepath, section, min_count):
    """Count items (lines starting with - or |) in a section."""
    try:
        with open(filepath) as f:
            content = f.read()
        pattern = rf'^##\s+{re.escape(section)}\s*\n(.*?)(?=^##|\Z)'
        match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
        if not match:
            return False, f"Section '{section}' not found"
        section_content = match.group(1)
        # Count meaningful lines (examples, criteria, table rows)
        lines = [l.strip() for l in section_content.split('\n') if l.strip() and not l.strip().startswith('#')]
        count = len([l for l in lines if l.startswith(('-', '*', '|', '1', '2', '3', '4', '5', '6', '7', '8', '9'))])
        if count >= min_count:
            return True, f"Found {count} items (needed {min_count})"
        return False, f"Found {count} items, needed {min_count}"
    except Exception as e:
        return False, str(e)

def find_skill_dir(outputs_dir):
    """Find the skill directory inside outputs."""
    for item in os.listdir(outputs_dir):
        path = os.path.join(outputs_dir, item)
        if os.path.isdir(path) and os.path.exists(os.path.join(path, 'SKILL.md')):
            return path
    # Check if SKILL.md is directly in outputs
    if os.path.exists(os.path.join(outputs_dir, 'SKILL.md')):
        return outputs_dir
    return None

def check_routing_table_contains(filepath, name):
    """Check if routing table contains a specific workflow name."""
    try:
        with open(filepath) as f:
            content = f.read()
        # Look for the name in a table row
        if re.search(rf'\|\s*\*?\*?{re.escape(name)}\*?\*?\s*\|', content):
            return True, f"'{name}' found in routing table"
        return False, f"'{name}' not in routing table"
    except Exception as e:
        return False, str(e)

def check_routing_table_not_contains(filepath, name):
    """Check routing table does NOT contain a name."""
    passed, evidence = check_routing_table_contains(filepath, name)
    if passed:
        return False, f"'{name}' should NOT be in routing table but was found"
    return True, f"'{name}' correctly absent from routing table"

results = {}

# ====== EVAL 1: CreateSkill RecipeManager ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-1/{config}"
    assertions = []
    outputs_dir = f"{ITER}/eval-1/{config}/outputs"
    skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None

    # Check TitleCase directory
    recipe_dir = None
    if os.path.isdir(outputs_dir):
        for item in os.listdir(outputs_dir):
            if 'recipe' in item.lower() and os.path.isdir(os.path.join(outputs_dir, item)):
                recipe_dir = os.path.join(outputs_dir, item)
                break

    tc_pass = recipe_dir is not None and ('RecipeManager' in os.path.basename(recipe_dir) or 'Recipe' in os.path.basename(recipe_dir))
    assertions.append({"text": "TitleCase directory RecipeManager/ created", "passed": tc_pass,
                       "evidence": f"Found: {os.path.basename(recipe_dir) if recipe_dir else 'none'}"})

    sd = recipe_dir or skill_dir
    if sd and os.path.exists(os.path.join(sd, 'SKILL.md')):
        p, e = check_yaml_frontmatter(os.path.join(sd, 'SKILL.md'))
        assertions.append({"text": "SKILL.md has valid YAML with name: RecipeManager", "passed": p, "evidence": e})
        p, e = check_use_when(os.path.join(sd, 'SKILL.md'))
        assertions.append({"text": "Description contains USE WHEN clause", "passed": p, "evidence": e})
        p, e = check_section_exists(os.path.join(sd, 'SKILL.md'), 'Examples')
        assertions.append({"text": "## Examples in SKILL.md with 2+ examples", "passed": p, "evidence": e})
    else:
        assertions.append({"text": "SKILL.md has valid YAML with name: RecipeManager", "passed": False, "evidence": "SKILL.md not found"})
        assertions.append({"text": "Description contains USE WHEN clause", "passed": False, "evidence": "SKILL.md not found"})
        assertions.append({"text": "## Examples in SKILL.md with 2+ examples", "passed": False, "evidence": "SKILL.md not found"})

    # SkillIntent.md
    si_path = os.path.join(sd, 'SkillIntent.md') if sd else None
    si_exists = si_path and os.path.exists(si_path)
    assertions.append({"text": "SkillIntent.md exists with ## Success Criteria (3+ items)", "passed": si_exists,
                       "evidence": f"SkillIntent.md {'exists' if si_exists else 'not found'}"})

    # Workflows
    wf_dir = os.path.join(sd, 'Workflows') if sd else None
    wf_count = len([f for f in os.listdir(wf_dir) if f.endswith('.md')]) if wf_dir and os.path.isdir(wf_dir) else 0
    assertions.append({"text": "2+ workflow files in Workflows/ directory", "passed": wf_count >= 2,
                       "evidence": f"Found {wf_count} workflow files"})

    # Tools dir
    tools_dir = os.path.join(sd, 'Tools') if sd else None
    assertions.append({"text": "Tools/ directory exists", "passed": tools_dir is not None and os.path.isdir(tools_dir),
                       "evidence": f"Tools/ {'exists' if tools_dir and os.path.isdir(tools_dir) else 'not found'}"})

    results[run_id] = assertions

# ====== EVAL 2: Vague request ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-2/{config}"
    assertions = []
    outputs_dir = f"{ITER}/eval-2/{config}/outputs"
    skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None

    # Valid structure check
    has_skill_md = skill_dir is not None
    has_workflow = False
    has_tools = False
    if skill_dir:
        wf_dir = os.path.join(skill_dir, 'Workflows')
        has_workflow = os.path.isdir(wf_dir) and len(os.listdir(wf_dir)) > 0
        has_tools = os.path.isdir(os.path.join(skill_dir, 'Tools'))

    assertions.append({"text": "Agent asked clarifying questions before creating files",
                       "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})
    assertions.append({"text": "Created skill has valid structure (SKILL.md + at least 1 workflow + Tools/)",
                       "passed": has_skill_md and has_workflow and has_tools,
                       "evidence": f"SKILL.md={has_skill_md}, Workflows={has_workflow}, Tools={has_tools}"})
    results[run_id] = assertions

# ====== EVAL 3: Internal workflow ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-3/{config}"
    assertions = []
    outputs_dir = f"{ITER}/eval-3/{config}/outputs"
    skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None

    if skill_dir:
        wf_dir = os.path.join(skill_dir, 'Workflows')
        # Find SSH/connection handler workflow
        ssh_file = None
        if os.path.isdir(wf_dir):
            for f in os.listdir(wf_dir):
                if any(kw in f.lower() for kw in ['ssh', 'connect', 'internal', 'handler']):
                    ssh_file = f
                    break

        assertions.append({"text": "SSH/connection handler workflow file exists",
                          "passed": ssh_file is not None,
                          "evidence": f"Found: {ssh_file}" if ssh_file else "No SSH/connection workflow found"})

        skill_md = os.path.join(skill_dir, 'SKILL.md')
        if ssh_file and os.path.exists(skill_md):
            name = ssh_file.replace('.md', '')
            p, e = check_routing_table_not_contains(skill_md, name)
            assertions.append({"text": "SSH handler NOT in routing table", "passed": p, "evidence": e})
        else:
            assertions.append({"text": "SSH handler NOT in routing table", "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})

        # User-facing workflows in routing table
        if os.path.exists(skill_md):
            with open(skill_md) as f:
                content = f.read()
            has_status = bool(re.search(r'(?i)status|check', content))
            has_deploy = bool(re.search(r'(?i)deploy|update', content))
            has_logs = bool(re.search(r'(?i)log|view', content))
            assertions.append({"text": "User-facing workflows in routing table",
                             "passed": has_status and has_deploy and has_logs,
                             "evidence": f"status={has_status}, deploy={has_deploy}, logs={has_logs}"})
        else:
            assertions.append({"text": "User-facing workflows in routing table", "passed": False, "evidence": "SKILL.md not found"})

        # Routing table instruction
        if os.path.exists(skill_md):
            with open(skill_md) as f:
                content = f.read()
            has_instruction = 'read' in content.lower() and ('follow' in content.lower() or 'steps' in content.lower())
            assertions.append({"text": "Routing table contains read-and-follow instruction",
                             "passed": has_instruction, "evidence": f"Instruction found: {has_instruction}"})
        else:
            assertions.append({"text": "Routing table contains read-and-follow instruction", "passed": False, "evidence": "SKILL.md not found"})
    else:
        for text in ["SSH/connection handler workflow file exists", "SSH handler NOT in routing table",
                     "User-facing workflows in routing table", "Routing table contains read-and-follow instruction"]:
            assertions.append({"text": text, "passed": False, "evidence": "No skill directory found"})

    results[run_id] = assertions

# ====== EVAL 4: Add AnalyzeData workflow ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-4/{config}"
    assertions = []
    # Check the test-target directory (where changes were made)
    test_target = f"{ITER}/eval-4/test-target"
    outputs_dir = f"{ITER}/eval-4/{config}/outputs"

    # Also check outputs for copied skill
    skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None
    check_dir = skill_dir or test_target

    wf_path = os.path.join(check_dir, 'Workflows', 'AnalyzeData.md')
    assertions.append({"text": "Workflows/AnalyzeData.md exists with TitleCase",
                       "passed": os.path.exists(wf_path),
                       "evidence": f"{'Exists' if os.path.exists(wf_path) else 'Not found'} at {wf_path}"})

    skill_md = os.path.join(check_dir, 'SKILL.md')
    if os.path.exists(skill_md):
        p, e = check_routing_table_contains(skill_md, 'AnalyzeData')
        assertions.append({"text": "Routing table has AnalyzeData entry with triggers", "passed": p, "evidence": e})
    else:
        assertions.append({"text": "Routing table has AnalyzeData entry with triggers", "passed": False, "evidence": "SKILL.md not found"})

    if os.path.exists(wf_path):
        p1, e1 = check_section_exists(wf_path, 'Purpose')
        p2, e2 = check_section_exists(wf_path, 'Workflow Steps')
        assertions.append({"text": "Workflow has ## Purpose section", "passed": p1, "evidence": e1})
        assertions.append({"text": "Workflow has ## Workflow Steps section", "passed": p2, "evidence": e2})
    else:
        assertions.append({"text": "Workflow has ## Purpose section", "passed": False, "evidence": "Workflow file not found"})
        assertions.append({"text": "Workflow has ## Workflow Steps section", "passed": False, "evidence": "Workflow file not found"})

    results[run_id] = assertions

# ====== EVAL 5: Fix gaps ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-5/{config}"
    assertions = []
    test_target = f"{ITER}/eval-5/test-target"
    outputs_dir = f"{ITER}/eval-5/{config}/outputs"
    skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None
    check_dir = skill_dir or test_target

    skill_md = os.path.join(check_dir, 'SKILL.md')
    if os.path.exists(skill_md):
        p, e = check_section_exists(skill_md, 'Examples')
        assertions.append({"text": "## Examples section exists in SKILL.md with 2+ examples", "passed": p, "evidence": e})
    else:
        assertions.append({"text": "## Examples section exists in SKILL.md with 2+ examples", "passed": False, "evidence": "SKILL.md not found"})

    si_path = os.path.join(check_dir, 'SkillIntent.md')
    if os.path.exists(si_path):
        p, e = check_section_exists(si_path, 'Success Criteria')
        assertions.append({"text": "## Success Criteria in SkillIntent.md with 3+ criteria", "passed": p, "evidence": e})
    else:
        assertions.append({"text": "## Success Criteria in SkillIntent.md with 3+ criteria", "passed": False, "evidence": "SkillIntent.md not found"})

    assertions.append({"text": "Agent read SkillIntent.md before modifying", "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})
    results[run_id] = assertions

# ====== EVAL 6: Refactor rename ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-6/{config}"
    assertions = []
    test_target = f"{ITER}/eval-6/test-target"
    outputs_dir = f"{ITER}/eval-6/{config}/outputs"
    skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None
    check_dir = skill_dir or test_target

    wf_dir = os.path.join(check_dir, 'Workflows')
    old_exists = os.path.exists(os.path.join(wf_dir, 'DoSomething.md')) if os.path.isdir(wf_dir) else False
    new_exists = os.path.exists(os.path.join(wf_dir, 'ProcessInput.md')) if os.path.isdir(wf_dir) else False

    assertions.append({"text": "DoSomething.md no longer exists", "passed": not old_exists,
                       "evidence": f"DoSomething.md {'still exists' if old_exists else 'removed'}"})
    assertions.append({"text": "ProcessInput.md exists in Workflows/", "passed": new_exists,
                       "evidence": f"ProcessInput.md {'found' if new_exists else 'not found'}"})

    skill_md = os.path.join(check_dir, 'SKILL.md')
    if os.path.exists(skill_md):
        with open(skill_md) as f:
            content = f.read()
        has_pi = 'ProcessInput' in content
        has_ds = 'DoSomething' in content
        assertions.append({"text": "Routing table references ProcessInput not DoSomething",
                          "passed": has_pi and not has_ds,
                          "evidence": f"ProcessInput={has_pi}, DoSomething={has_ds}"})
    else:
        assertions.append({"text": "Routing table references ProcessInput not DoSomething", "passed": False, "evidence": "SKILL.md not found"})

    assertions.append({"text": "Agent ran ValidateSkill.ts after changes", "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})
    results[run_id] = assertions

# ====== EVAL 7: OptimizeDescription (BadTriggers) ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-7/{config}"
    assertions = []
    outputs_dir = f"{ITER}/eval-7/{config}/outputs"
    test_target = f"{ITER}/eval-7/test-target"

    # Check for eval set
    eval_set = None
    if os.path.isdir(outputs_dir):
        for f in os.listdir(outputs_dir):
            if 'eval' in f.lower() and f.endswith('.json'):
                eval_set = os.path.join(outputs_dir, f)
                break
        # Also check subdirs
        for item in os.listdir(outputs_dir):
            subdir = os.path.join(outputs_dir, item)
            if os.path.isdir(subdir):
                for f in os.listdir(subdir):
                    if 'eval' in f.lower() and f.endswith('.json'):
                        eval_set = os.path.join(subdir, f)
                        break

    if eval_set:
        try:
            with open(eval_set) as f:
                data = json.load(f)
            if isinstance(data, list):
                query_count = len(data)
            elif isinstance(data, dict) and 'queries' in data:
                query_count = len(data['queries'])
            else:
                query_count = 0
            assertions.append({"text": "Eval set JSON with should/should-not trigger queries (10+ total)",
                             "passed": query_count >= 10, "evidence": f"Found {query_count} queries in {eval_set}"})
        except:
            assertions.append({"text": "Eval set JSON with should/should-not trigger queries (10+ total)",
                             "passed": False, "evidence": f"Could not parse {eval_set}"})
    else:
        assertions.append({"text": "Eval set JSON with should/should-not trigger queries (10+ total)",
                         "passed": False, "evidence": "No eval set JSON found"})

    # Check description changed
    skill_md = os.path.join(test_target, 'SKILL.md')
    original_desc = "This skill processes data. USE WHEN process."
    if os.path.exists(skill_md):
        with open(skill_md) as f:
            content = f.read()
        # Check in outputs for modified skill
        skill_dir = find_skill_dir(outputs_dir) if os.path.isdir(outputs_dir) else None
        if skill_dir and os.path.exists(os.path.join(skill_dir, 'SKILL.md')):
            with open(os.path.join(skill_dir, 'SKILL.md')) as f:
                new_content = f.read()
            changed = original_desc not in new_content
            has_use_when = 'USE WHEN' in new_content
        else:
            changed = original_desc not in content
            has_use_when = 'USE WHEN' in content
        assertions.append({"text": "Description differs from original", "passed": changed,
                         "evidence": f"Changed: {changed}"})
        assertions.append({"text": "New description contains USE WHEN", "passed": has_use_when,
                         "evidence": f"USE WHEN present: {has_use_when}"})
    else:
        assertions.append({"text": "Description differs from original", "passed": False, "evidence": "SKILL.md not found"})
        assertions.append({"text": "New description contains USE WHEN", "passed": False, "evidence": "SKILL.md not found"})

    assertions.append({"text": "Agent invoked run_loop.py or run_eval.py", "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})
    results[run_id] = assertions

# ====== EVAL 8: OptimizeDescription (TestTarget) ======
for config in ['with_skill', 'without_skill']:
    run_id = f"eval-8/{config}"
    assertions = []
    assertions.append({"text": "Eval queries are specific to TestTarget's domain", "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})
    assertions.append({"text": "Description was not degraded", "passed": None, "evidence": "GRADER_JUDGMENT_REQUIRED"})
    results[run_id] = assertions

# Output results
print(json.dumps(results, indent=2))

# Save to file
with open(f"{WORKSPACE}/programmatic_assertions.json", 'w') as f:
    json.dump(results, f, indent=2)

# Summary
print("\n=== SUMMARY ===")
for run_id, assertions in sorted(results.items()):
    passed = sum(1 for a in assertions if a['passed'] is True)
    failed = sum(1 for a in assertions if a['passed'] is False)
    judgment = sum(1 for a in assertions if a['passed'] is None)
    total = len(assertions)
    print(f"{run_id}: {passed}/{total} passed, {failed} failed, {judgment} need grader judgment")
