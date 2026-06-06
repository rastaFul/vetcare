export interface DomainEvent {
  readonly eventType: string
  readonly occurredAt: Date
  readonly aggregateId: string
}

type Handler = (event: DomainEvent) => void | Promise<void>

class DomainEventBus {
  private handlers = new Map<string, Handler[]>()

  on(eventType: string, handler: Handler): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, [...existing, handler])
  }

  async emit(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? []
    await Promise.all(handlers.map((h) => h(event)))
  }
}

export const eventBus = new DomainEventBus()
