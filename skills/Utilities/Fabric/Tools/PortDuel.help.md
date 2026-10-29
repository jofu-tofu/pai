# Port comparison

Generate both prompts on identical held-out inputs using the same model and settings. Blind the outputs and judge both orders using an independent judge or human. Save one `{id,winner}` verdict per case, with winner `port`, `upstream` or `tie`, then run `bun Tools/PortDuel.ts verdicts.json`. Keep prompts, model ids, raw outputs, flipped judgments and failures beside the verdict file. The tool summarizes supplied verdicts; it does not certify their quality.
