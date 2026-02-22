# Architecture — React

> Component architecture determines how well a codebase scales in complexity, team size, and feature velocity — get the composition model right and everything else becomes easier.

## Mental Model

React's component model is fundamentally about composition. The 8 rules in this dimension exist because the most common source of accidental complexity in React codebases is not performance or rendering — it is poor component design that compounds over time. Boolean props create exponential conditional branches. Monolithic components resist reuse. Tight coupling between state shape and consumer code makes refactors dangerous. These are architectural debts that slow every future change.

The underlying design principle is the Open-Closed Principle adapted for components: a component should be open for composition but closed for modification. Compound components let consumers assemble exactly what they need without touching internal logic. Explicit variants replace hidden boolean logic with named, self-documenting alternatives. Context interfaces decouple consumers from specific state implementations, enabling dependency injection at the React level.

React 19 further reinforces this direction by removing the need for `forwardRef` (refs are now regular props) and by making `use()` the canonical way to consume context. These API changes are not cosmetic — they reduce the ceremony around composition patterns, which means there is less excuse for shortcuts like prop drilling or boolean flag accumulation.

When these 8 rules are applied together, they produce components that are independently testable, composable without coordination, and resistant to the kind of cascading changes that plague monolithic component trees. The key insight is that architecture rules are force multipliers: a well-composed component tree makes performance optimization, server component adoption, and bundle splitting dramatically easier because the boundaries are already clean.

## Consumer Guide

### When Reviewing Code

Scan for these violations in severity order:

1. **Boolean prop accumulation** — Any component with 3+ boolean props is a strong signal. Look for `isX`, `showY`, `hasZ` patterns in prop interfaces. This is the single most common architecture violation and the hardest to unwind later.
2. **Render prop sprawl** — Components accepting `renderHeader`, `renderFooter`, `renderActions` callbacks instead of using children composition. These create implicit contracts that are hard to type and impossible to compose.
3. **Direct state coupling** — Components that import specific store shapes, specific context values, or specific hook return types rather than accepting data through props or a generic context interface.
4. **Missing compound component pattern** — Complex UI (modals, forms, toolbars, composers) implemented as a single component with 10+ props instead of a provider + composable subcomponents.
5. **forwardRef in React 19** — Any use of `React.forwardRef` in a React 19+ codebase. Refs are regular props now; forwardRef adds unnecessary wrapper complexity.

### When Designing / Planning

Before writing a new component, ask:

- **Will this component need variants?** If yes, design explicit named variants (e.g., `ThreadComposer`, `ChannelComposer`) rather than a single component with boolean switches.
- **Will consumers need to customize the layout?** If yes, use compound components with a shared context provider. If no, a simple props interface is sufficient.
- **Does this component need to work with different state sources?** If yes, define a context interface (generic provider pattern) so the component is decoupled from any specific state management library.
- **Is there a ref forwarding need?** In React 19+, just accept `ref` as a prop. In older versions, use `forwardRef` but plan to remove it during migration.

The decision tree: simple display component (just props) -> configurable component (explicit variants) -> complex interactive component (compound components with context).

### When Implementing

Apply rules in this order:

1. **Start with the interface** — Define the props/context shape before writing JSX. Use `StateContextInterface` to ensure the interface is generic enough for dependency injection.
2. **Choose composition strategy** — `PatternsChildrenOverRenderProps` for simple slot-based composition; `ArchitectureCompoundComponents` for complex multi-part UI.
3. **Eliminate boolean props** — For each boolean prop, ask: "Could this be a named variant or a composed subcomponent instead?" Apply `ArchitectureAvoidBooleanProps` and `PatternsExplicitVariants`.
4. **Lift state to the right level** — Use `StateLiftState` to find the lowest common ancestor. Use `StateDecoupleImplementation` to keep implementation details out of the interface.
5. **Modernize API surface** — Apply `React19NoForwardref` if on React 19+.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ArchitectureAvoidBooleanProps](../../Rules/React/ArchitectureAvoidBooleanProps.md) | HIGH | Replace boolean prop flags with explicit named variants or composed subcomponents |
| [ArchitectureCompoundComponents](../../Rules/React/ArchitectureCompoundComponents.md) | HIGH | Structure complex UI as provider + composable subcomponents with shared context |
| [StateDecoupleImplementation](../../Rules/React/StateDecoupleImplementation.md) | MEDIUM | Keep state implementation details behind stable interfaces |
| [StateContextInterface](../../Rules/React/StateContextInterface.md) | HIGH | Define generic context interfaces for dependency injection across component trees |
| [StateLiftState](../../Rules/React/StateLiftState.md) | MEDIUM | Move shared state to the lowest common ancestor to avoid prop drilling |
| [PatternsExplicitVariants](../../Rules/React/PatternsExplicitVariants.md) | HIGH | Use named variant components instead of conditional logic inside a single component |
| [PatternsChildrenOverRenderProps](../../Rules/React/PatternsChildrenOverRenderProps.md) | MEDIUM | Prefer children composition over render prop callbacks for layout customization |
| [React19NoForwardref](../../Rules/React/React19NoForwardref.md) | MEDIUM | Remove forwardRef wrappers in React 19+ where ref is a regular prop |

## Rule Interactions

The architecture rules form a coherent design system where each rule reinforces the others:

- **AvoidBooleanProps + ExplicitVariants** work as a pair. The first identifies the problem (boolean flags); the second provides the solution (named variants). Applying AvoidBooleanProps without ExplicitVariants leaves developers without a clear alternative.
- **CompoundComponents + ChildrenOverRenderProps** are complementary composition strategies. Compound components handle complex multi-part UI; children composition handles simpler slot-based layouts. Using render props when either pattern would work creates unnecessary complexity.
- **ContextInterface + DecoupleImplementation + LiftState** form the state management triad. LiftState determines where state lives; DecoupleImplementation keeps implementation details hidden; ContextInterface provides the generic access pattern. Applying LiftState alone without decoupling produces components tightly coupled to a specific state shape.
- **React19NoForwardref** simplifies all composition patterns by removing wrapper overhead, making compound components and context providers cleaner.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Boolean prop explosion**: A component with 5+ boolean props where the interaction between flags creates untested state combinations. Example: `<Editor isThread isEditing showAttachments showFormatting isCompact />` — this is 2^5 = 32 possible states, most of which are never tested.
- **God component**: A single component file exceeding 500 lines with 15+ props, mixing layout, business logic, and state management. This resists all forms of reuse and optimization.

### HIGH
- **Render prop for layout**: Using `renderHeader={() => <Header />}` when `<Composer.Header>` compound pattern or simple `children` would suffice. Render props create implicit contracts that are hard to discover and type.
- **Prop drilling through 3+ levels**: Passing a prop through intermediate components that do not use it, instead of using context or composition.

### MEDIUM
- **forwardRef in React 19+**: Unnecessary wrapper that adds a level of indirection. Not a correctness issue but creates confusion about the component's API surface.
- **Inline state shape in context**: Defining context value types inline rather than as a reusable interface, making it impossible to swap state implementations.

## Examples

### Example 1: Boolean Props to Compound Components (AvoidBooleanProps + CompoundComponents + ExplicitVariants)

```tsx
// BEFORE: Boolean props create 16 untested combinations
<Composer
  isThread={true}
  isEditing={false}
  showAttachments={true}
  showFormatting={false}
  channelId="abc"
/>

// AFTER: Named variant + compound composition
<Composer.Provider state={threadState} actions={threadActions} meta={meta}>
  <Composer.Frame>
    <Composer.Input />
    <Composer.Attachments />
    <Composer.Footer>
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

Each variant (thread, channel, DM) gets its own state factory. Consumers compose only the subcomponents they need. Zero boolean flags, zero untested combinations.

### Example 2: Context Interface + Decoupled State (ContextInterface + DecoupleImplementation + LiftState)

```tsx
// BEFORE: Component coupled to specific Zustand store
function ChatList() {
  const messages = useChatStore(s => s.messages)
  const sendMessage = useChatStore(s => s.sendMessage)
  return <MessageList messages={messages} onSend={sendMessage} />
}

// AFTER: Generic context interface — works with any state source
interface ChatContext {
  messages: Message[]
  sendMessage: (text: string) => void
}

const ChatCtx = createContext<ChatContext | null>(null)

// Provider can wrap Zustand, Redux, server state, or test mocks
function ZustandChatProvider({ children }: { children: ReactNode }) {
  const messages = useChatStore(s => s.messages)
  const sendMessage = useChatStore(s => s.sendMessage)
  return (
    <ChatCtx value={{ messages, sendMessage }}>
      {children}
    </ChatCtx>
  )
}

function ChatList() {
  const { messages, sendMessage } = use(ChatCtx)
  return <MessageList messages={messages} onSend={sendMessage} />
}
```

ChatList is now testable with a simple mock provider. State implementation can be swapped without touching any consumer code.

### Example 3: Children Over Render Props + React 19 Ref (ChildrenOverRenderProps + React19NoForwardref)

```tsx
// BEFORE: render props + forwardRef
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ renderHeader, renderBody, renderFooter, ...props }, ref) => (
    <div ref={ref} {...props}>
      {renderHeader()}
      {renderBody()}
      {renderFooter?.()}
    </div>
  )
)

// AFTER: children composition + ref as prop (React 19)
function Modal({ children, ref, ...props }: ModalProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props}>{children}</div>
}

// Usage — composable, discoverable, typed
<Modal ref={modalRef}>
  <Modal.Header title="Confirm" />
  <Modal.Body>{content}</Modal.Body>
  <Modal.Footer>
    <Button onClick={onCancel}>Cancel</Button>
    <Button onClick={onConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

## Does Not Cover

- **Performance optimization** — See RenderingPerf (R4) for re-render, memoization, and hydration concerns.
- **Data fetching patterns** — See DataFetching (R2) for async waterfalls, Suspense boundaries, and caching.
- **Server/client boundary decisions** — See ServerComponents (R3) for RSC-specific architecture.
- **Bundle size implications of component design** — See BundleSize (R5) for import and code-splitting patterns.

## Sources

- Vercel Engineering — React Composition Patterns (January 2026), MIT
- React Documentation — Compound Components, Context API, React 19 Release Notes
