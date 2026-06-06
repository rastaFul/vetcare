import { Entity } from '../Entity'

class TestEntity extends Entity<{ name: string }> {
  get name() {
    return this.props.name
  }
}

describe('Entity', () => {
  it('should generate id if not provided', () => {
    const entity = new TestEntity({ name: 'test' })
    expect(entity.id).toBeDefined()
    expect(entity.id.length).toBeGreaterThan(0)
  })

  it('should use provided id', () => {
    const entity = new TestEntity({ name: 'test' }, 'custom-id')
    expect(entity.id).toBe('custom-id')
  })

  it('should be equal to entity with same id', () => {
    const e1 = new TestEntity({ name: 'a' }, 'same-id')
    const e2 = new TestEntity({ name: 'b' }, 'same-id')
    expect(e1.equals(e2)).toBe(true)
  })

  it('should not be equal to entity with different id', () => {
    const e1 = new TestEntity({ name: 'a' }, 'id-1')
    const e2 = new TestEntity({ name: 'a' }, 'id-2')
    expect(e1.equals(e2)).toBe(false)
  })
})
