# AnalyzeData Workflow

## Purpose
Read a CSV file, compute summary statistics, and output a markdown report.

## Triggers
- "analyze data"
- "run analysis"
- "data report"

## Workflow Steps

### Step 1: Identify the CSV File
Determine the CSV file to analyze. If the user has not specified a file path, ask which CSV file they want analyzed. Confirm the file exists and is readable.

### Step 2: Read and Parse the CSV
Read the CSV file contents. Parse the header row to identify column names and detect column types (numeric vs. categorical). Report the number of rows and columns found.

### Step 3: Compute Summary Statistics
For each **numeric** column, compute:
- Count of non-empty values
- Mean
- Median
- Standard deviation
- Min and Max

For each **categorical** column, compute:
- Count of non-empty values
- Number of unique values
- Most frequent value (mode) and its count

### Step 4: Generate Markdown Report
Produce a markdown report with the following structure:

```
# Data Analysis Report

## Overview
- **File:** [filename]
- **Rows:** [count]
- **Columns:** [count]

## Column Summary

### [Column Name] (numeric)
| Statistic | Value |
|-----------|-------|
| Count     | ...   |
| Mean      | ...   |
| Median    | ...   |
| Std Dev   | ...   |
| Min       | ...   |
| Max       | ...   |

### [Column Name] (categorical)
| Statistic       | Value |
|-----------------|-------|
| Count           | ...   |
| Unique Values   | ...   |
| Most Frequent   | ...   |
| Frequency       | ...   |
```

### Step 5: Output the Report
Present the markdown report to the user. If requested, write the report to a file at a specified path.
