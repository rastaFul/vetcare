import { Entity } from '@/shared/domain/Entity'

export type Species = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'REPTILE' | 'OTHER'
export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN'
export type AnimalStatus = 'ACTIVE' | 'DECEASED' | 'INACTIVE'

export interface AnimalProps {
  tenantId: string
  tutorId: string
  name: string
  species: Species
  breed?: string
  sex: Sex
  birthDate?: Date
  weightKg?: number
  color?: string
  castrated: boolean
  microchip?: string
  photoUrl?: string
  notes?: string
  status: AnimalStatus
  createdAt: Date
  updatedAt: Date
}

export class Animal extends Entity<AnimalProps> {
  get tenantId() { return this.props.tenantId }
  get tutorId() { return this.props.tutorId }
  get name() { return this.props.name }
  get species() { return this.props.species }
  get breed() { return this.props.breed }
  get sex() { return this.props.sex }
  get birthDate() { return this.props.birthDate }
  get weightKg() { return this.props.weightKg }
  get color() { return this.props.color }
  get castrated() { return this.props.castrated }
  get microchip() { return this.props.microchip }
  get photoUrl() { return this.props.photoUrl }
  get notes() { return this.props.notes }
  get status() { return this.props.status }
  get isActive() { return this.props.status === 'ACTIVE' }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  get ageInYears(): number | undefined {
    if (!this.props.birthDate) return undefined
    const now = new Date()
    const birth = new Date(this.props.birthDate)
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return age
  }

  static create(
    props: Omit<AnimalProps, 'status' | 'createdAt' | 'updatedAt'>,
    id?: string
  ): Animal {
    return new Animal(
      {
        ...props,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    )
  }

  update(
    data: Partial<Omit<AnimalProps, 'tenantId' | 'tutorId' | 'status' | 'createdAt' | 'updatedAt'>>
  ): void {
    Object.assign(this.props, data, { updatedAt: new Date() })
  }

  changeStatus(status: AnimalStatus): void {
    this.props.status = status
    this.props.updatedAt = new Date()
  }

  setPhotoUrl(url: string): void {
    this.props.photoUrl = url
    this.props.updatedAt = new Date()
  }
}
