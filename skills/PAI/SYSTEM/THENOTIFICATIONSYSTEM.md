# Notification System

How PAI sends notifications across various channels.

---

## Design Principles

1. **Fire and forget** - Notifications never block execution
2. **Fail gracefully** - Missing services don't cause errors
3. **Conservative defaults** - Avoid notification fatigue
4. **Duration-aware** - Escalate for long-running tasks

---

## Notification Channels

### Push (ntfy)

Mobile push notifications via ntfy.sh or self-hosted.

**Configuration:**
```bash
# Environment variables
NTFY_TOPIC=your-topic-name
NTFY_SERVER=https://ntfy.sh  # or self-hosted
```

**Usage:**
```bash
curl -s -X POST "${NTFY_SERVER}/${NTFY_TOPIC}" \
  -H "Title: Task Complete" \
  -d "Your task has finished" \
  > /dev/null 2>&1 &
```

**Best Practices:**
- Use for completed long-running tasks
- Include actionable information
- Set priority levels appropriately

### Desktop

Native OS notifications.

**Usage (macOS):**
```bash
osascript -e 'display notification "Message" with title "PAI"'
```

**Best Practices:**
- Use for focus-requiring updates
- Don't spam - consolidate notifications

### Webhooks (Discord, Slack, etc.)

Team or server alerts via webhooks.

**Configuration:**
```bash
# Environment variables
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Usage (Discord):**
```bash
curl -s -X POST "${DISCORD_WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d '{"content": "Task completed"}' \
  > /dev/null 2>&1 &
```

---

## Event Routing

Route notifications based on event type and priority:

| Event Type | Channels | Priority |
|------------|----------|----------|
| Task complete | Push | Medium |
| Long task (>5min) | Push, Desktop | High |
| Error/Failure | Push, Desktop | Critical |
| Security alert | All channels | Critical |

---

## Notification Library

```typescript
// hooks/core/notifications.ts

export async function notify(message: string, channel: 'push' | 'desktop' = 'push') {
  try {
    switch (channel) {
      case 'push':
        await fetch(`${process.env.NTFY_SERVER}/${process.env.NTFY_TOPIC}`, {
          method: 'POST',
          body: message
        });
        break;
      case 'desktop':
        Bun.spawn(['osascript', '-e', `display notification "${message}" with title "PAI"`]);
        break;
    }
  } catch {
    // Never fail on notification
  }
}
```

---

## Configuration Template

Add to your `.env`:

```bash
# Push (ntfy)
NTFY_SERVER=https://ntfy.sh
NTFY_TOPIC=your-topic-here

# Webhooks
DISCORD_WEBHOOK_URL=your_webhook_url_here
SLACK_WEBHOOK_URL=your_webhook_url_here
```

---

## Related Documentation

- **Hooks:** `THEHOOKSYSTEM.md`
- **Identity:** `USER/DAIDENTITY.md`
- **Agents:** `AGENTS.md`
