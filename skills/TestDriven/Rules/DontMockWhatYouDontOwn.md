### 5.2 Don't Mock What You Don't Own

**Impact: HIGH (tests that catch real bugs vs false confidence)**

Don't mock third-party libraries or external APIs directly. When the library changes, your mocks become lies. Instead, wrap external dependencies and mock your wrapper.

**Problem: Mocking third-party libraries**

```pseudocode
// Directly mocking a library you don't control
function test_send_notification():
    // Mocking the Twilio library directly
    twilio = mock()
    twilio.messages.create.returns({sid: "123"})

    notifier = Notifier(twilio)
    notifier.send_sms("+1234567890", "Hello")

    assert twilio.messages.create.was_called_with(
        to="+1234567890",
        body="Hello",
        from_="+0987654321"
    )

// Problems:
// 1. If Twilio changes their API, your mock is wrong but tests pass
// 2. You're testing against YOUR UNDERSTANDING of Twilio, not Twilio
// 3. Bugs in how you call Twilio won't be caught
```

**Solution: Wrap external dependencies, mock the wrapper**

```pseudocode
// Create an interface you own
interface SmsGateway:
    function send(to: string, message: string): Result

// Wrap the third-party library
class TwilioGateway implements SmsGateway:
    function send(to: string, message: string):
        // Real Twilio integration
        return twilio.messages.create(
            to=to,
            body=message,
            from_=self.from_number
        )

// In tests, mock YOUR interface
class FakeSmsGateway implements SmsGateway:
    sent_messages = []

    function send(to: string, message: string):
        self.sent_messages.append({to, message})
        return Success()

function test_send_notification():
    gateway = FakeSmsGateway()
    notifier = Notifier(gateway)

    notifier.send_sms("+1234567890", "Hello")

    assert gateway.sent_messages[0].to == "+1234567890"
    assert gateway.sent_messages[0].message == "Hello"
```

**The Test:** "If this library released a new version tomorrow, would my tests catch breaking changes or would they lie?"

**Benefits of wrapping:**
- Tests mock YOUR code, not library internals
- Interface represents YOUR needs, not library's full API
- Easy to swap implementations (Twilio → SendGrid)
- Integration tests with real library catch actual issues
- Mock behavior is under your control

**What to wrap:**
- HTTP clients (axios, fetch, requests)
- Database drivers
- Cloud services (AWS, GCP SDKs)
- Payment processors
- Email/SMS providers
- Any external API

**Testing the wrapper itself:**
Test your wrapper with integration tests against the real service (or sandbox). The wrapper is your translation layer - it must be tested against reality.
