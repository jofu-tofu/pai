# Interview Questions for ReadingList Skill

## Q1: What does this skill do?
Questions I would ask:
1. What types of items do you want to track? (books, articles, papers, all of these?)
2. Where should the reading list data be stored? (markdown file, JSON, database?)
3. Do you want to track reading progress (pages, percentage) or just status (to-read, reading, done)?
4. Do you want to capture notes or reviews when finishing a book?
5. Do you want categorization (genre, topic, priority)?

## Q2: What should trigger it?
Questions I would ask:
1. What phrases do you naturally use when managing your reading? ("add a book", "what should I read next", "mark as finished"?)
2. Should it trigger on general book discussion or only explicit list management?

## Q3: What workflows does it need?
Questions I would ask:
1. Do you want recommendations based on your reading history?
2. Do you want statistics (books read per month, genre breakdown)?
3. Do you need import/export from Goodreads or other services?

## Assumptions Made (proceeding without answers)

- **Items tracked:** Books primarily, but flexible enough for articles and papers
- **Storage:** A markdown file at a known location (ReadingList.md in a data directory)
- **Status tracking:** Three states: to-read, reading, finished
- **Metadata captured:** Title, author, date added, status, rating (1-5), optional notes
- **Workflows designed:**
  - AddBook: Add a new item to the reading list
  - UpdateStatus: Change status, add rating/notes, mark as finished
  - ViewList: View/filter the reading list by status, author, rating, etc.
- **All workflows are user-facing** (appear in routing table)
- **No external service integration** (keeping it simple and self-contained)
